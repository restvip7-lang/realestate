// Синхронизация объектов из Stay Portfolio Service (docs/stay-import.md).
// Работает короткими шагами (каждый < 60 с на Vercel): шаг = одна страница списка Stay (до 50 объектов).
// Объект перезагружается, только если в Stay изменилась дата правки (post_modified) — повторный запуск быстрый.
// STAY_SYNC_LIMIT=50 — тестовый режим: берём только столько самых свежих объектов и ничего не снимаем с сайта.
import type { Payload } from 'payload'

import { slugify } from './slug'
import { StayClient } from './stay'
import { mapStayObject, type StayDistrict } from './stay-map'
import { textHash, translateToTurkish, translationEnabled } from './stay-translate'

export type StaySyncCursor = { page: number; startedAt: string; added: number; updated: number; skipped: number; hidden: number; problems: string[] }
export type StaySyncResult = { next: StaySyncCursor | null; cursor: StaySyncCursor; message: string }

const PER_PAGE = 50
const BUDGET_MS = 45_000

export const syncLimit = () => {
  const n = Number(process.env.STAY_SYNC_LIMIT)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null
}

export const newCursor = (): StaySyncCursor => ({ page: 1, startedAt: new Date().toISOString(), added: 0, updated: 0, skipped: 0, hidden: 0, problems: [] })

/** Предупреждения, сгруппированные по виду: «район «…» не сопоставлен — 23 (ID 4254, 4256, 4301…)». */
function groupProblems(problems: string[]) {
  const groups = new Map<string, string[]>()
  for (const p of problems) {
    const m = /^ID (\d+): (.*)$/.exec(p)
    const kind = (m?.[2] ?? p).replace(/\(\/objects[^)]*\)/g, '').replace(/планировка .* не из/, 'планировка … не из').trim()
    groups.set(kind, [...(groups.get(kind) ?? []), m?.[1] ?? ''])
  }
  return [...groups].map(([kind, ids]) => `${kind} — ${ids.length}${ids[0] ? ` (ID ${ids.slice(0, 3).join(', ')}${ids.length > 3 ? '…' : ''})` : ''}`).join('; ')
}

const summary = (c: StaySyncCursor) =>
  `добавлено ${c.added}, обновлено ${c.updated}, без изменений ${c.skipped}${c.hidden ? `, снято с сайта ${c.hidden}` : ''}` +
  (c.problems.length ? `. Внимание: ${groupProblems(c.problems)}` : '')

/** Один шаг синхронизации. Вызывать, пока next не станет null (кнопка в админке или cron). budgetMs — сколько можно работать. */
export async function runStaySync(payload: Payload, cursor: StaySyncCursor = newCursor(), budgetMs = BUDGET_MS): Promise<StaySyncResult> {
  const started = Date.now()
  const c: StaySyncCursor = { ...cursor, problems: [...cursor.problems] }
  const limit = syncLimit()
  const perPage = limit ? Math.min(PER_PAGE, limit) : PER_PAGE

  const stay = new StayClient()
  await stay.login()
  const list = await stay.list(c.page, perPage)
  const offset = (c.page - 1) * perPage
  const items = limit ? list.objects.slice(0, Math.max(0, limit - offset)) : list.objects

  // наши районы и уже загруженные объекты этой страницы
  const { docs: dDocs } = await payload.find({ collection: 'districts', limit: 100, depth: 0, pagination: false, overrideAccess: true })
  const districts = new Map<string, StayDistrict>(dDocs.map((d) => [d.slug, { id: d.id, slug: d.slug, lat: d.lat, lng: d.lng, inland: d.inland }]))
  const ids = items.map((x) => x.ID)
  const { docs: have } = ids.length
    ? await payload.find({
        collection: 'properties', where: { 'stay.objectId': { in: ids } }, limit: ids.length, depth: 0, pagination: false, overrideAccess: true,
        select: { stay: true, status: true },
      })
    : { docs: [] }
  const byStayId = new Map(have.map((d) => [d.stay?.objectId, d]))

  let processed = 0
  const seenIds: number[] = []
  for (const item of items) {
    if (Date.now() - started > budgetMs) break // остальное — следующим шагом с той же страницы (обработанные уже не изменятся)
    processed++
    seenIds.push(Number(item.ID))
    const existing = byStayId.get(item.ID)
    if (existing && existing.stay?.modified === item.post_modified && existing.status !== 'hidden') {
      c.skipped++
      continue
    }
    try {
      const o = await stay.get(item.ID)
      const mapped = mapStayObject(o, districts)
      for (const p of mapped.problems) c.problems.push(`ID ${o.ID}: ${p}`)
      if (!mapped.data.district || !mapped.data.title) continue // без района или заголовка объект не сохранить

      const now = new Date().toISOString()
      const common = {
        ...mapped.data,
        slug: slugify(String(mapped.data.title)),
        remotePhotos: mapped.photos,
        remoteCover: mapped.photos[0] ?? null,
        stay: { objectId: o.ID, refNo: String(o.post_meta.refno || ''), modified: item.post_modified, syncedAt: now, trHash: existing?.stay?.trHash ?? null },
      }
      const doc = existing
        ? await payload.update({ collection: 'properties', id: existing.id, locale: 'ru', data: common as never, overrideAccess: true })
        : await payload.create({ collection: 'properties', locale: 'ru', data: common as never, overrideAccess: true })
      if (existing) c.updated++
      else c.added++

      // английский — из Stay; турецкий — автопереводом с английского (или английский, пока перевода нет)
      if (mapped.en) {
        await payload.update({ collection: 'properties', id: doc.id, locale: 'en', data: { ...mapped.en, slug: common.slug } as never, overrideAccess: true })
        const hash = textHash(mapped.en)
        if (doc.stay?.trHash !== hash) {
          let tr = null
          if (translationEnabled()) {
            try {
              tr = await translateToTurkish(mapped.en)
            } catch (err) {
              c.problems.push(`ID ${o.ID}: перевод на турецкий не удался (${err instanceof Error ? err.message : err})`)
            }
          }
          await payload.update({
            collection: 'properties', id: doc.id, locale: 'tr', overrideAccess: true,
            data: { ...(tr ?? mapped.en), slug: common.slug, stay: { ...common.stay, trHash: tr ? hash : null } } as never,
          })
        }
      }
    } catch (err) {
      c.problems.push(`ID ${item.ID}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  // все объекты страницы есть в Stay: отмечаем, чтобы в конце полного импорта не снять их как пропавшие
  const seenSafe = seenIds.filter((n) => Number.isInteger(n) && n > 0)
  if (seenSafe.length) {
    await payload.db.drizzle.execute(`UPDATE properties SET stay_synced_at = now() WHERE stay_object_id IN (${seenSafe.join(',')})`)
  }

  if (processed < items.length) {
    return { next: c, cursor: c, message: `Stay, страница ${c.page}: ${summary(c)}. Продолжаю…` }
  }

  const seen = offset + items.length
  const more = limit ? seen < Math.min(limit, list.total_results) : c.page < list.total_pages
  if (more) {
    const next = { ...c, page: c.page + 1 }
    return { next, cursor: next, message: `Stay: обработано ${seen} из ${limit ? Math.min(limit, list.total_results) : list.total_results}. ${summary(c)}` }
  }

  // полный импорт закончен: объекты, которых больше нет в Stay, снимаем с сайта (не удаляем). В тестовом режиме — нет.
  if (!limit) {
    const { docs: gone } = await payload.find({
      collection: 'properties', overrideAccess: true, depth: 0, pagination: false, limit: 5000, select: { status: true },
      where: { and: [{ 'stay.objectId': { exists: true } }, { 'stay.syncedAt': { less_than: c.startedAt } }, { status: { equals: 'published' } }] },
    })
    for (const d of gone) {
      await payload.update({ collection: 'properties', id: d.id, data: { status: 'hidden' }, overrideAccess: true })
      c.hidden++
    }
  }
  return { next: null, cursor: c, message: `Готово: ${summary(c)}` }
}
