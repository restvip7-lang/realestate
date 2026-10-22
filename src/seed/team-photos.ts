// Фото команды в едином стиле (владелец 22.10.2026): цветные портреты Unsplash, кадр 4:5 по плечи,
// голова одного размера. Готовые файлы — src/seed/team/<slug>.jpg (обрезаны заранее, docs/demo-data.md).
// Меняем фото, только если у сотрудника ещё демо-фото из прототипа (или фото нет): своё фото из админки не трогаем.
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

import type { Payload, PayloadRequest } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/** slug сотрудника → [имя, прежний id фото Unsplash в прототипе, новый id] */
export const TEAM_PHOTOS: Record<string, [string, string, string]> = {
  'emre-yyldyz': ['Эмре Йылдыз', '1590735627513-59a186ed0984', '1472099645785-5658abf4ff4e'],
  'anna-sokolova': ['Анна Соколова', '1573496359142-b8d87734a5a2', '1580489944761-15a19d654956'],
  'murat-kaya': ['Мурат Кая', '1589386417686-0d34b5903d23', '1600878459138-e1123b37cb30'],
  'elena-demir': ['Елена Демир', '1573497019940-1c28c88b4f3e', '1594744803329-e58b31de8bf5'],
  'daniel-marten': ['Даниэль Мартен', '1614023342667-6f060e9d1e04', '1614023342667-6f060e9d1e04'],
  'amina-arslan': ['Амина Арслан', '1573497491765-dccce02b29df', '1611432579699-484f7990b127'],
}

type Member = { id: number; slug?: string | null; name: string; photo?: number | { id: number; filename?: string | null } | null }

export async function applyTeamPhotos(payload: Payload, req?: Partial<PayloadRequest>) {
  const { docs } = (await payload.find({ collection: 'team', limit: 100, depth: 1, pagination: false, overrideAccess: true, req })) as unknown as { docs: Member[] }
  let updated = 0
  for (const [slug, [name, oldId, newId]] of Object.entries(TEAM_PHOTOS)) {
    const m = docs.find((d) => d.slug === slug) ?? docs.find((d) => d.name === name)
    if (!m) continue
    const filename = m.photo && typeof m.photo === 'object' ? m.photo.filename || '' : ''
    // уже новое фото или своё, загруженное в админке, — не трогаем
    if (m.photo && !filename.startsWith(`demo-${oldId}`)) continue
    try {
      const data = await fs.readFile(path.join(dirname, 'team', `${slug}.jpg`))
      const media = await payload.create({
        collection: 'media', overrideAccess: true, req,
        data: { alt: name, credit: `Unsplash, демо (photo-${newId})` } as never,
        file: { data, mimetype: 'image/jpeg', name: `team-${slug}.jpg`, size: data.length },
      })
      await payload.update({ collection: 'team', id: m.id, data: { photo: media.id } as never, overrideAccess: true, req })
      updated++
    } catch (err) {
      payload.logger.warn({ err, msg: `Фото сотрудника ${name} не заменено` })
    }
  }
  return updated
}
