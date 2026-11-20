// Директор компании — реальный человек (владелец 20.11.2026): Григорий Лазарев встаёт на место вымышленного
// основателя Эмре Йылдыза (та же карточка: его объекты, статьи и заявки сохраняются).
// Факты только от владельца: 20 лет в бизнесе, родом из Татарстана, служил в МЧС. Ничего сверх этого не придумываем.
// Фото — src/seed/team/grigoriy-lazarev.jpg (кадр 4:5, как у остальных). Вызывают сид и миграция 20261120_200000_director.
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

import type { Payload, PayloadRequest } from 'payload'

import { hasRows } from './team-photos'

const dirname = path.dirname(fileURLToPath(import.meta.url))

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

  let photo: number | undefined
  try {
    const data = await fs.readFile(path.join(dirname, 'team', `${DIRECTOR.slug}.jpg`))
    const media = await payload.create({
      collection: 'media', locale: 'ru', ...opts(req),
      data: { alt: DIRECTOR.ru.name, credit: 'Фото предоставлено владельцем сайта' } as never,
      file: { data, mimetype: 'image/jpeg', name: `team-${DIRECTOR.slug}.jpg`, size: data.length },
    })
    await payload.update({ collection: 'media', id: media.id, locale: 'en', data: { alt: DIRECTOR.en.name } as never, ...opts(req) })
    photo = media.id
  } catch (err) {
    payload.logger.warn({ err, msg: 'Фото директора не загружено, оставлено прежнее' })
  }

  const help = (list: string[]) => list.map((text) => ({ text }))
  await payload.update({
    collection: 'team', id: m.id, locale: 'ru', ...opts(req),
    // районы были у вымышленного основателя — у директора их не указываем
    data: { ...DIRECTOR.ru, help: help(DIRECTOR.ru.help), slug: DIRECTOR.slug, langs: DIRECTOR.langs, exp: DIRECTOR.exp, areas: [], ...(photo ? { photo } : {}) },
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
