// Синхронизация новостей, отзывов и услуг из Stay Property (docs/content-import.md).
// Только чтение из сервиса. Запись создаётся у нас один раз и дальше обновляется, только если в сервисе
// изменилась дата правки (updated_at). Тексты, обложку и даты берём оттуда; публикацию, рубрику, порядок,
// сотрудника и SEO не трогаем — их ведёт наш менеджер. Пропавшую из сервиса запись скрываем (не удаляем).
import type { Payload } from 'payload'

import { CONTENT_KINDS, type ContentItem, type ContentKind, type ContentText, listContent } from './content-api'
import { blocksToLexical, blocksToText, clip, shortText, textBlocks } from './content-text'
import { slugify } from './slug'

const LOCALES = ['ru', 'en', 'tr'] as const
type Loc = (typeof LOCALES)[number]
const BUDGET_MS = 45_000

const COLLECTION = { news: 'posts', reviews: 'reviews', services: 'services' } as const
const LABEL = { news: 'Новости', reviews: 'Отзывы', services: 'Услуги' } as const

type Counts = { added: number; updated: number; skipped: number; hidden: number }
export type ContentSyncResult = { done: boolean; message: string; problems: string[] }

type Doc = { id: number; slug?: string | null; _status?: string | null; published?: boolean | null; external?: { sourceId?: string | null; modified?: string | null } | null }

/** Тексты записи по нашим языкам: только заполненные блоки (с заголовком). */
function textsOf(item: ContentItem): Partial<Record<Loc, ContentText>> {
  const out: Partial<Record<Loc, ContentText>> = {}
  for (const l of LOCALES) {
    const t = item.translations?.[l]
    if (t?.title?.trim()) out[l] = t
  }
  // старые записи без translations: базовые поля (язык неизвестен — кладём в основной русский)
  if (!Object.keys(out).length && item.title?.trim()) out.ru = item
  return out
}

/** Дата публикации: published_at, если это полная дата, иначе дата создания записи в сервисе ("2026" — только год). */
function dateOf(item: ContentItem) {
  const pick = /^\d{4}-\d{2}-\d{2}/.test(item.published_at || '') ? item.published_at : item.created_at
  const d = new Date(/^\d{4}-\d{2}-\d{2} /.test(pick) ? `${pick.replace(' ', 'T')}Z` : pick)
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
}

/** Данные одного языка для коллекции. */
function localized(kind: ContentKind, t: ContentText): Record<string, unknown> {
  const title = (t.title || '').trim()
  if (kind === 'news') {
    return { title: clip(title, 140), lead: shortText(t.excerpt, title, 320) || null, body: blocksToLexical(textBlocks(t.body, title)) }
  }
  if (kind === 'services') {
    return { title: clip(title, 140), excerpt: shortText(t.excerpt, title, 400) || null, body: blocksToLexical(textBlocks(t.body, title)) }
  }
  // отзыв: имя, страна и текст (короткая выдержка + сам отзыв). Поля отзыва не переводятся — берём один язык.
  const excerpt = blocksToText(textBlocks(t.excerpt))
  const body = blocksToText(textBlocks(t.body))
  const same = excerpt && body.toLowerCase().includes(excerpt.replace(/…$/, '').toLowerCase())
  return { who: clip(title, 60), country: (t.location || '').trim() || null, text: [same ? '' : excerpt, body].filter(Boolean).join(' ') }
}

async function uniqueSlug(payload: Payload, collection: 'posts' | 'services', base: string, sourceId: string) {
  const slug = base || sourceId
  const { totalDocs } = await payload.count({ collection, where: { slug: { equals: slug } }, overrideAccess: true })
  return totalDocs ? `${slug}-${sourceId.replace(/^.*-/, '').slice(-6)}` : slug
}

async function syncKind(payload: Payload, kind: ContentKind, started: number, problems: string[]) {
  const collection = COLLECTION[kind]
  const c: Counts = { added: 0, updated: 0, skipped: 0, hidden: 0 }
  const items = await listContent(kind)
  const select = kind === 'news' ? { external: true, slug: true, _status: true } : { external: true, slug: true, published: true }
  const { docs } = (await payload.find({
    collection, where: { 'external.sourceId': { exists: true } }, limit: 2000, depth: 0, pagination: false, overrideAccess: true, select: select as never,
  })) as unknown as { docs: Doc[] }
  const bySource = new Map(docs.map((d) => [d.external?.sourceId, d]))
  const now = new Date().toISOString()
  let complete = true

  for (const item of items) {
    if (Date.now() - started > BUDGET_MS) {
      complete = false // остальное — при следующем запуске (обработанные уже пропустятся)
      break
    }
    const existing = bySource.get(item.id)
    if (existing && existing.external?.modified === item.updated_at) {
      c.skipped++
      continue
    }
    const texts = textsOf(item)
    const main = texts.ru ?? texts.en ?? texts.tr
    if (!main) {
      problems.push(`${LABEL[kind]}: ${item.id} — нет текста`)
      continue
    }
    try {
      const external = { sourceId: item.id, modified: item.updated_at, syncedAt: now }
      const remoteCover = /^https:\/\//.test(item.image || '') ? item.image : null
      const base = localized(kind, main)
      let data: Record<string, unknown>
      if (kind === 'news') {
        // дата: при создании — из сервиса; потом обновляем, только если там указана полная дата (сейчас там только год)
        const fullDate = /^\d{4}-\d{2}-\d{2}/.test(item.published_at || '') ? { publishedAt: dateOf(item) } : {}
        data = existing
          ? { ...base, ...fullDate, remoteCover, external, _status: existing._status }
          : { ...base, remoteCover, external, kind: 'news', category: 'market', publishedAt: dateOf(item), _status: 'published' }
      } else if (kind === 'reviews') {
        data = existing ? { ...base, date: dateOf(item), external } : { ...base, date: dateOf(item), rating: null, service: null, published: true, external }
      } else {
        const cats = Object.values(item.translations ?? {}).map((x) => x?.category || '').concat(item.category || '')
        const group = cats.some((x) => /free|бесплат|ücretsiz/i.test(x)) ? 'free' : 'page'
        // без русского и английского текста на русской и английской версии была бы турецкая — не показываем
        const visible = !!(texts.ru || texts.en)
        if (!existing && !visible) problems.push(`Услуги: «${main.title}» — есть только турецкий текст, на сайте скрыта`)
        data = existing ? { ...base, group, remoteCover, external } : { ...base, group, remoteCover, published: visible, external }
      }
      if (!existing && kind !== 'reviews') {
        data.slug = await uniqueSlug(payload, collection as 'posts' | 'services', slugify(String((texts.ru ?? texts.en ?? main).title)), item.id)
      }

      const doc = existing
        ? await payload.update({ collection, id: existing.id, locale: 'ru', data: data as never, overrideAccess: true })
        : await payload.create({ collection, locale: 'ru', data: data as never, overrideAccess: true })
      if (existing) c.updated++
      else c.added++

      // остальные языки (у отзыва поля не переводятся)
      if (kind !== 'reviews') {
        for (const l of ['en', 'tr'] as const) {
          const t = texts[l]
          if (!t) continue
          const extra = kind === 'news' ? { _status: (doc as Doc)._status } : {}
          await payload.update({ collection, id: doc.id, locale: l, data: { ...localized(kind, t), ...extra } as never, overrideAccess: true })
        }
      }
    } catch (err) {
      problems.push(`${LABEL[kind]}: ${item.id} — ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  // записи, которых больше нет в сервисе (удалены или выключены там): скрываем с сайта, не удаляем
  if (complete) {
    const seen = new Set(items.map((x) => x.id))
    for (const d of docs) {
      if (seen.has(d.external?.sourceId ?? '')) continue
      const visible = kind === 'news' ? d._status === 'published' : d.published !== false
      if (!visible) continue
      const data = kind === 'news' ? { _status: 'draft' } : { published: false }
      await payload.update({ collection, id: d.id, data: data as never, overrideAccess: true })
      c.hidden++
    }
  }
  return { counts: c, complete }
}

const summary = (kind: ContentKind, c: Counts) =>
  `${LABEL[kind]}: добавлено ${c.added}, обновлено ${c.updated}, без изменений ${c.skipped}${c.hidden ? `, скрыто ${c.hidden}` : ''}`

/** Полная синхронизация всех трёх видов. Если не уложилась по времени — done: false, повторный запуск продолжит. */
export async function runContentSync(payload: Payload): Promise<ContentSyncResult> {
  const started = Date.now()
  const problems: string[] = []
  const parts: string[] = []
  let done = true
  for (const kind of CONTENT_KINDS) {
    if (Date.now() - started > BUDGET_MS) {
      done = false
      break
    }
    try {
      const { counts, complete } = await syncKind(payload, kind, started, problems)
      parts.push(summary(kind, counts))
      if (!complete) done = false
    } catch (err) {
      // сервис недоступен или ответил ошибкой: этот вид пропускаем, остальные синхронизируем
      problems.push(`${LABEL[kind]}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
  const tail = problems.length ? `. Внимание: ${problems.slice(0, 5).join('; ')}${problems.length > 5 ? '…' : ''}` : ''
  const head = parts.length ? `${done ? 'Готово' : 'Не всё успел, продолжу'}: ${parts.join('. ')}` : 'Stay Property не ответил, данные не получены'
  return { done, message: `${head}${tail}`, problems }
}
