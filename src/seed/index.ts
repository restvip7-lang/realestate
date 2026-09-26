// Загрузка демо-данных прототипа в базу: фото, районы, команда, отзывы, объекты, статьи и новости, настройки.
// Идёт короткими шагами (runSeedStep): на Vercel у функции ограничено время, поэтому админка вызывает
// POST /next/seed много раз подряд. Каждый шаг можно повторить: найденные записи обновляются, а не создаются снова
// (фото — по номеру Unsplash в «Источнике», районы и статьи — по slug, команда — по имени, объекты — по номеру).
// Запуск: кнопка на главной странице админки или npm run seed.
import type { Payload } from 'payload'
import sharp from 'sharp'

import { POST_CATEGORIES } from '@/lib/catalog'
import { htmlToLexical } from '@/lib/lexical'
import { slugify } from '@/lib/slug'

import data from './prototype-data.json'

type Log = (msg: string) => void

const DEFAULT_FEATURES = ['Открытый бассейн', 'Фитнес-зал', 'Финская сауна', 'Охрана 24/7', 'Видеонаблюдение', 'Генератор', 'Крытая парковка', 'Детская площадка', 'Зелёная территория']
const CONTENT = ['posts', 'reviews', 'properties', 'team', 'districts', 'media'] as const

const ruDate = (s: string) => {
  // «24.09.2026» или «07.2026» → ISO
  const p = String(s || '').split('.').map(Number)
  const [d, m, y] = p.length === 3 ? p : [1, p[0], p[1]]
  return y ? new Date(Date.UTC(y, m - 1, d, 9)).toISOString() : undefined
}

/** Фото с Unsplash; если сеть недоступна — заглушка с подписью (чтобы seed работал и без интернета). */
async function imageBuffer(id: string, label: string) {
  try {
    const res = await fetch(`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1800&q=80&fm=jpg`, {
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) throw new Error(String(res.status))
    const buf = Buffer.from(await res.arrayBuffer())
    return { buf, mimetype: 'image/jpeg', ext: 'jpg' }
  } catch {
    const hue = [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1066"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},45%,62%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360},50%,32%)"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="50%" fill="#fff" font-family="sans-serif" font-size="56" text-anchor="middle">${label.replace(/[<&]/g, '')}</text></svg>`
    return { buf: await sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toBuffer(), mimetype: 'image/jpeg', ext: 'jpg' }
  }
}

export const SEED_STEPS = ['reset', 'media', 'districts', 'team', 'reviews', 'properties', 'posts', 'globals'] as const
export type SeedStep = (typeof SEED_STEPS)[number]
export type SeedStepResult = { next: { step: SeedStep; offset: number } | null; message: string }

const MEDIA_BATCH = 6
const PROPERTY_BATCH = 25

// все фото демо-данных: номер Unsplash → подпись
function photoList(): [string, string][] {
  const m = new Map<string, string>()
  data.districts.forEach((d) => m.set(d.img, `Аланья, ${d.name}`))
  data.team.forEach((t) => !m.has(t.img) && m.set(t.img, t.name))
  data.properties.forEach((p) => !m.has(p.img) && m.set(p.img, p.title))
  data.galleryExtra.forEach((id) => !m.has(id) && m.set(id, 'Интерьер квартиры'))
  data.posts.forEach((p) => !m.has(p.img) && m.set(p.img, p.title))
  return [...m.entries()]
}

const CREDIT = (id: string) => `Unsplash, photo-${id} (демо)`

async function mediaMap(payload: Payload) {
  const { docs } = await payload.find({ collection: 'media', where: { credit: { like: 'Unsplash, photo-' } }, limit: 1000, pagination: false, depth: 0 })
  const out = new Map<string, number>()
  docs.forEach((d) => {
    const id = /photo-(\S+) \(/.exec(d.credit || '')?.[1]
    if (id) out.set(id, d.id)
  })
  return out
}
async function bySlug(payload: Payload, collection: 'districts' | 'posts') {
  const { docs } = await payload.find({ collection, limit: 1000, pagination: false, depth: 0, draft: true } as never)
  return new Map((docs as { slug?: string | null; id: number }[]).map((d) => [d.slug || '', d.id]))
}
async function teamByName(payload: Payload) {
  const { docs } = await payload.find({ collection: 'team', limit: 1000, pagination: false, depth: 0 })
  return new Map(docs.map((d) => [d.name, { id: d.id, slug: d.slug || slugify(d.name) }]))
}

/** Создать или обновить: если `existing` есть — update, иначе create. */
async function upsert<T extends 'districts' | 'team' | 'properties' | 'posts'>(payload: Payload, collection: T, existing: number | undefined, data: Record<string, unknown>) {
  const args = { collection, locale: 'ru' as const, data: data as never }
  return existing ? payload.update({ ...args, id: existing }) : payload.create(args)
}

/** Один короткий шаг загрузки. Вызывать, пока `next` не станет null. */
export async function runSeedStep(payload: Payload, step: SeedStep, offset = 0): Promise<SeedStepResult> {
  const after = (s: SeedStep) => ({ step: SEED_STEPS[SEED_STEPS.indexOf(s) + 1], offset: 0 })

  if (step === 'reset') {
    for (const collection of ['posts', 'reviews', 'properties', 'team', 'districts', 'media'] as const) {
      await payload.delete({ collection, where: { id: { exists: true } }, overrideAccess: true })
    }
    return { next: after('reset'), message: 'Старые данные удалены' }
  }

  if (step === 'media') {
    const list = photoList()
    const have = await mediaMap(payload)
    const batch = list.slice(offset, offset + MEDIA_BATCH)
    await Promise.all(
      batch.map(async ([id, alt]) => {
        if (have.has(id)) return
        const img = await imageBuffer(id, alt.slice(0, 40))
        await payload.create({
          collection: 'media',
          data: { alt, credit: CREDIT(id) },
          file: { data: img.buf, mimetype: img.mimetype, name: `demo-${id}.${img.ext}`, size: img.buf.length },
        })
      }),
    )
    const done = Math.min(offset + MEDIA_BATCH, list.length)
    return { next: done < list.length ? { step: 'media', offset: done } : after('media'), message: `Фото ${done} из ${list.length}` }
  }

  const media = await mediaMap(payload)

  if (step === 'districts') {
    const have = await bySlug(payload, 'districts')
    for (const d of data.districts) {
      await upsert(payload, 'districts', have.get(d.slug), {
        name: d.name, nameIn: d.nameIn, slug: d.slug, order: d.order, inland: d.inland, about: d.about, lead: d.lead,
        pros: d.pros.map((text) => ({ text })), cons: d.cons.map((text) => ({ text })), infra: d.infra.map((text) => ({ text })),
        image: media.get(d.img), pricePerM2: d.pricePerM2, pricePerM2Date: ruDate('24.09.2026'), coastKm: d.coastKm,
        scores: d.scores, lat: d.lat, lng: d.lng, schema: { x: d.x, y: d.y },
      })
    }
    return { next: after('districts'), message: `Районы: ${data.districts.length}` }
  }

  const district = await bySlug(payload, 'districts')

  if (step === 'team') {
    const have = await teamByName(payload)
    for (const t of data.team) {
      await upsert(payload, 'team', have.get(t.name)?.id, {
        name: t.name, role: t.role, kind: t.kind, langs: t.langs, exp: t.exp,
        photo: media.get(t.img), areas: t.areas.map((s) => district.get(s)!).filter(Boolean), spec: t.spec, bio: t.bio,
        help: t.help.map((text) => ({ text })), order: t.order,
      })
    }
    return { next: after('team'), message: `Команда: ${data.team.length}` }
  }

  const team = await teamByName(payload)
  const memberKey = new Map(data.team.map((t) => [t.key, team.get(t.name)]))

  if (step === 'reviews') {
    const { docs } = await payload.find({ collection: 'reviews', limit: 1000, pagination: false, depth: 0 })
    const have = new Set(docs.map((r) => `${r.who}|${r.date?.slice(0, 7)}`))
    for (const r of data.reviews) {
      const date = ruDate(r.date)!
      if (have.has(`${r.who}|${date.slice(0, 7)}`)) continue
      await payload.create({
        collection: 'reviews',
        data: {
          who: r.who, country: r.country, date, rating: r.rating, service: r.service as 'buy',
          expert: r.expert ? memberKey.get(r.expert)?.id : null, text: r.text, published: true,
        },
      })
    }
    return { next: after('reviews'), message: `Отзывы: ${data.reviews.length}` }
  }

  if (step === 'properties') {
    const batch = data.properties.slice(offset, offset + PROPERTY_BATCH)
    const { docs } = await payload.find({
      collection: 'properties', where: { id: { in: batch.map((p) => p.id) } }, limit: 1000, pagination: false, depth: 0,
    })
    const have = new Set(docs.map((d) => d.id))
    for (const p of batch) {
      const gallery = [p.img, ...data.galleryExtra.filter((x) => x !== p.img)].map((x) => media.get(x)!).filter(Boolean)
      await upsert(payload, 'properties', have.has(p.id) ? p.id : undefined, {
        ...(have.has(p.id) ? {} : { id: p.id }),
        deal: p.deal, status: p.status, title: p.title, type: p.type,
        district: district.get(p.district), rooms: p.rooms, area: p.area, floor: p.floor, floors: p.floors, sea: p.sea,
        view: p.view, furnished: p.furnished, condition: p.condition, source: p.source,
        ...(p.deal === 'rent'
          ? {
              price: p.price,
              rent: {
                period: p.rent?.period || 'long', deposit: p.rent?.deposit, minTerm: p.rent?.minTerm,
                availableFrom: ruDate(p.rent?.from || ''), utilities: !!p.rent?.utilities, pets: !!p.rent?.pets,
              },
            }
          : { priceOriginal: p.price, currency: 'EUR', priceCheckedAt: ruDate(p.checked) }),
        photos: gallery, features: DEFAULT_FEATURES, description: p.description, lat: p.lat, lng: p.lng,
      })
    }
    const done = Math.min(offset + PROPERTY_BATCH, data.properties.length)
    if (done < data.properties.length) return { next: { step: 'properties', offset: done }, message: `Объекты ${done} из ${data.properties.length}` }
    // счётчик ID продолжает нумерацию после импортированных объектов
    await payload.db.drizzle.execute(
      `SELECT setval(pg_get_serial_sequence('properties', 'id'), (SELECT COALESCE(MAX(id), 1) FROM properties))`,
    )
    return { next: after('properties'), message: `Объекты: ${data.properties.length}` }
  }

  if (step === 'posts') {
    const have = await bySlug(payload, 'posts')
    const postSlug = new Map(data.posts.map((p) => [p.id, slugify(p.title)]))
    const postKind = new Map(data.posts.map((p) => [p.id, p.kind]))
    const href = (h: string) => {
      const q = new URLSearchParams(h.split('?')[1] || '')
      if (h.startsWith('#')) return h
      if (h.startsWith('districts.html')) return '/ru/districts'
      if (h.startsWith('district.html')) return `/ru/districts/${q.get('d')}`
      if (h.startsWith('member.html')) return `/ru/team/${memberKey.get(q.get('id') || '')?.slug || ''}`
      if (h.startsWith('post.html')) {
        const id = Number(q.get('id'))
        return `/ru/${postKind.get(id) === 'news' ? 'news' : 'blog'}/${postSlug.get(id) || ''}`
      }
      if (h.startsWith('news.html')) return '/ru/news'
      if (h.startsWith('blog.html')) return '/ru/blog'
      if (h.startsWith('citizenship.html')) return '/ru/citizenship'
      if (h.startsWith('residence.html')) return '/ru/residence-permit'
      if (h.startsWith('property.html')) return `/ru/property/${q.get('id')}`
      return h
    }
    const category = (label: string) => POST_CATEGORIES.find((c) => c.label === label)?.value ?? 'agency'
    for (const p of data.posts) {
      const slug = postSlug.get(p.id)!
      await upsert(payload, 'posts', have.get(slug), {
        _status: 'published', title: p.title, slug, kind: p.kind, category: category(p.category),
        lead: p.lead, cover: media.get(p.img), body: htmlToLexical(p.body, href), source: p.source,
        reviewedAt: p.reviewed ? new Date(p.reviewed).toISOString() : undefined, tags: p.tags,
        relatedDistricts: p.relatedDistricts.map((s) => district.get(s)!).filter(Boolean),
        relatedProperties: p.relatedProperties.filter((id) => data.properties.some((x) => x.id === id)),
        publishedAt: new Date(`${p.date}T09:00:00Z`).toISOString(), author: team.get(p.author)?.id ?? null, pinned: p.pinned,
      })
    }
    return { next: after('posts'), message: `Статьи и новости: ${data.posts.length}` }
  }

  // globals
  const c = data.company
  await payload.updateGlobal({
    slug: 'company',
    locale: 'ru',
    data: {
      phone: c.phone, whatsapp: c.wa, telegram: c.tg, email: c.email, address: c.address, showroom: c.showroom, hours: c.hours,
      lat: 36.5436, lng: 31.9992,
      legal: { name: c.legal, license: c.license, verbis: c.verbis, taxOffice: c.taxOffice, taxNo: c.taxNo },
      isDemo: true,
    },
  })
  const { EUR: _eur, ...rates } = data.rates
  await payload.updateGlobal({ slug: 'rates', data: { ...rates, checkedAt: ruDate('25.09.2026') } })
  await payload.updateGlobal({
    slug: 'team-page',
    locale: 'ru',
    data: {
      title: data.teamPage.title, lead: data.teamPage.lead, quote: data.teamPage.quote,
      stats: data.teamPage.stats.map(([value, label]) => ({ value, label })),
    },
  })
  return { next: null, message: `Готово: объектов ${data.properties.length}, статей и новостей ${data.posts.length}, районов ${data.districts.length}, сотрудников ${data.team.length}, отзывов ${data.reviews.length}, фото ${photoList().length}` }
}

/** Все шаги подряд (для npm run seed). */
export async function seedAll(payload: Payload, { reset = false, log = console.log as Log } = {}) {
  let cur: SeedStepResult['next'] = { step: reset ? 'reset' : 'media', offset: 0 }
  while (cur) {
    const r = await runSeedStep(payload, cur.step, cur.offset)
    log(r.message)
    cur = r.next
  }
}
