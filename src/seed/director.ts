// Директор компании — реальный человек (владелец 20.11.2026): Григорий Лазарев встаёт на место вымышленного
// основателя Эмре Йылдыза (та же карточка: его объекты, статьи и заявки сохраняются).
// Факты только от владельца: 20 лет в бизнесе, родом из Татарстана, служил в МЧС. Ничего сверх этого не придумываем.
// Фото — прежнее фото основателя (владелец попросил вернуть его). Вызывают сид и миграции director, director_old_photo.
import type { Payload, PayloadRequest } from 'payload'

import { hasRows } from './team-photos'

export const DIRECTOR = {
  oldSlug: 'emre-yyldyz',
  oldName: 'Эмре Йылдыз',
  slug: 'grigoriy-lazarev',
  langs: 'RU · TT · EN · TR',
  exp: 20,
  ru: {
    name: 'Григорий Лазарев',
    role: 'Директор',
    spec: 'Руководство компанией, переговоры, сложные сделки',
    bio: 'Родом из Татарстана, 20 лет в бизнесе. Служил в МЧС. Руководит Kleo Homes и лично подключается к сложным сделкам.',
    help: ['Переговоры о цене с застройщиками и собственниками', 'Покупка нескольких объектов под гражданство', 'Сложные случаи: наследство, доли, перепланировки', 'Вопросы к работе агентства — напрямую директору'],
  },
  en: {
    name: 'Grigory Lazarev',
    role: 'Director',
    spec: 'Company management, negotiations, complex deals',
    bio: 'Originally from Tatarstan, 20 years in business. He served in the Russian Emergencies Ministry (EMERCOM). He runs Kleo Homes and personally steps in on complex deals.',
    help: ['Price negotiations with developers and owners', 'Buying several properties for citizenship', 'Complex cases: inheritance, shared ownership, alterations', 'Questions about the agency’s work go straight to the director'],
  },
}

// Отзывы о вымышленном основателе не приписываем реальному человеку — отдаём их вымышленным экспертам.
// [имя клиента в русской версии, slug эксперта, новый текст (ru), (en)]
const REVIEWS: [string, string, string, string][] = [
  ['Олег и Марина', 'anna-sokolova',
    'Анна вела покупку виллы в Тепе: договорилась о скидке 18 000 € и нашла проблему с разрешением на бассейн до сделки.',
    'Anna handled our villa purchase in Tepe: she negotiated an €18,000 discount and found a problem with the pool permit before the deal.'],
  ['Stefan', 'murat-kaya',
    'Professional and honest. Murat explained every risk before we paid the deposit.',
    'Professional and honest. Murat explained every risk before we paid the deposit.'],
]

const opts = (req?: Partial<PayloadRequest>) => ({ req, overrideAccess: true, depth: 0 }) as const

/** Поставить директора на место демо-основателя. Если карточку уже поменяли в админке — ничего не делаем. */
export async function applyDirector(payload: Payload, req?: Partial<PayloadRequest>) {
  if (!(await hasRows(payload, 'team'))) return false
  const { docs } = await payload.find({ collection: 'team', where: { slug: { equals: DIRECTOR.oldSlug } }, locale: 'ru', limit: 1, ...opts(req) })
  const m = docs[0]
  if (!m || m.name !== DIRECTOR.oldName) return false

  // фото остаётся прежним (владелец 20.11.2026: «фото верни старое»), меняем только его описание
  const photoId = typeof m.photo === 'object' && m.photo ? m.photo.id : m.photo
  if (photoId) await nameDirectorPhoto(payload, photoId, req)

  const help = (list: string[]) => list.map((text) => ({ text }))
  await payload.update({
    collection: 'team', id: m.id, locale: 'ru', ...opts(req),
    // районы были у вымышленного основателя — у директора их не указываем
    data: { ...DIRECTOR.ru, help: help(DIRECTOR.ru.help), slug: DIRECTOR.slug, langs: DIRECTOR.langs, exp: DIRECTOR.exp, areas: [] },
  })
  await payload.update({ collection: 'team', id: m.id, locale: 'en', ...opts(req), data: { ...DIRECTOR.en, help: help(DIRECTOR.en.help) } })

  const { docs: team } = await payload.find({ collection: 'team', limit: 100, pagination: false, locale: 'ru', ...opts(req) })
  const { docs: reviews } = await payload.find({ collection: 'reviews', where: { expert: { equals: m.id } }, limit: 100, pagination: false, locale: 'ru', ...opts(req) })
  for (const r of reviews) {
    const fix = REVIEWS.find(([who]) => who === r.who)
    if (!fix) continue
    const [, slug, ru, en] = fix
    const expert = team.find((t) => t.slug === slug)?.id
    await payload.update({ collection: 'reviews', id: r.id, locale: 'ru', ...opts(req), data: { text: ru, ...(expert ? { expert } : {}) } })
    const cur = await payload.findByID({ collection: 'reviews', id: r.id, locale: 'en', fallbackLocale: false, ...opts(req) })
    await payload.update({ collection: 'reviews', id: r.id, locale: 'en', ...opts(req), data: { who: cur.who || r.who, text: en } })
  }
  return true
}

/** Описание фото (alt) — имя директора на обоих языках. */
async function nameDirectorPhoto(payload: Payload, id: number, req?: Partial<PayloadRequest>) {
  await payload.update({ collection: 'media', id, locale: 'ru', data: { alt: DIRECTOR.ru.name } as never, ...opts(req) })
  await payload.update({ collection: 'media', id, locale: 'en', data: { alt: DIRECTOR.en.name } as never, ...opts(req) })
}

/**
 * Вернуть директору прежнее фото основателя вместо присланного (владелец 20.11.2026).
 * Меняем, только если стоит присланное фото (team-grigoriy-lazarev…): фото, выбранное в админке, не трогаем.
 * Присланное фото остаётся в «Медиа».
 */
export async function restoreDirectorPhoto(payload: Payload, req?: Partial<PayloadRequest>) {
  if (!(await hasRows(payload, 'team'))) return false
  const { docs } = await payload.find({ collection: 'team', where: { slug: { equals: DIRECTOR.slug } }, locale: 'ru', limit: 1, ...opts(req), depth: 1 })
  const m = docs[0]
  const current = m && typeof m.photo === 'object' && m.photo ? m.photo.filename || '' : ''
  if (!m || !current.startsWith(`team-${DIRECTOR.slug}`)) return false
  const { docs: old } = await payload.find({
    collection: 'media', where: { filename: { like: `team-${DIRECTOR.oldSlug}` } }, sort: '-createdAt', limit: 1, ...opts(req),
  })
  if (!old[0]) return false
  await payload.update({ collection: 'team', id: m.id, locale: 'ru', data: { photo: old[0].id }, ...opts(req) })
  await nameDirectorPhoto(payload, old[0].id, req)
  return true
}
