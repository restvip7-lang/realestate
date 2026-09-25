// Загрузка демо-данных прототипа в базу: районы, команда, отзывы, объекты, статьи и новости, настройки.
// Запускается из админки (кнопка на главной странице админки → POST /next/seed) или командой npm run seed.
import type { Payload } from 'payload'
import sharp from 'sharp'

import { POST_CATEGORIES } from '@/lib/catalog'
import { htmlToLexical } from '@/lib/lexical'
import { slugify } from '@/lib/slug'

import data from './prototype-data.json'

type Log = (msg: string) => void
export type SeedResult = { ok: boolean; skipped?: boolean; counts?: Record<string, number>; images?: { downloaded: number; placeholders: number } }

const DEFAULT_FEATURES = ['Открытый бассейн', 'Фитнес-зал', 'Финская сауна', 'Охрана 24/7', 'Видеонаблюдение', 'Генератор', 'Крытая парковка', 'Детская площадка', 'Зелёная территория']
const CONTENT = ['posts', 'reviews', 'properties', 'team', 'districts', 'media'] as const

const ruDate = (s: string) => {
  // «24.09.2026» или «07.2026» → ISO
  const p = String(s || '').split('.').map(Number)
  const [d, m, y] = p.length === 3 ? p : [1, p[0], p[1]]
  return y ? new Date(Date.UTC(y, m - 1, d, 9)).toISOString() : undefined
}

/** Фото с Unsplash; если сеть недоступна — заглушка с подписью (чтобы seed работал и без интернета). */
async function imageBuffer(id: string, label: string, stats: { downloaded: number; placeholders: number }) {
  try {
    const res = await fetch(`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1800&q=80&fm=jpg`, {
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) throw new Error(String(res.status))
    const buf = Buffer.from(await res.arrayBuffer())
    stats.downloaded++
    return { buf, mimetype: 'image/jpeg', ext: 'jpg' }
  } catch {
    const hue = [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1066"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},45%,62%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360},50%,32%)"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="50%" fill="#fff" font-family="sans-serif" font-size="56" text-anchor="middle">${label.replace(/[<&]/g, '')}</text></svg>`
    stats.placeholders++
    return { buf: await sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toBuffer(), mimetype: 'image/jpeg', ext: 'jpg' }
  }
}

export async function seed(payload: Payload, { reset = false, log = console.log as Log } = {}): Promise<SeedResult> {
  const { totalDocs } = await payload.count({ collection: 'properties' })
  if (totalDocs && !reset) {
    log(`В базе уже есть объекты (${totalDocs}). Чтобы заменить их демо-данными, запустите с reset.`)
    return { ok: false, skipped: true }
  }

  if (reset) {
    for (const collection of CONTENT) {
      log(`Удаляю: ${collection}`)
      await payload.delete({ collection, where: { id: { exists: true } }, overrideAccess: true })
    }
  }

  // ---------- фото: каждое фото Unsplash загружается один раз ----------
  const stats = { downloaded: 0, placeholders: 0 }
  const media = new Map<string, number>()
  const mediaFor = async (id: string, alt: string) => {
    if (media.has(id)) return media.get(id)!
    const img = await imageBuffer(id, alt.slice(0, 40), stats)
    const doc = await payload.create({
      collection: 'media',
      data: { alt, credit: `Unsplash, photo-${id} (демо)` },
      file: { data: img.buf, mimetype: img.mimetype, name: `demo-${id}.${img.ext}`, size: img.buf.length },
    })
    media.set(id, doc.id)
    return doc.id
  }
  // заранее и параллельно (по 4), чтобы не упереться в лимит времени функции
  const photoIds = new Map<string, string>()
  data.districts.forEach((d) => photoIds.set(d.img, `Аланья, ${d.name}`))
  data.team.forEach((t) => photoIds.set(t.img, t.name))
  data.properties.forEach((p) => !photoIds.has(p.img) && photoIds.set(p.img, p.title))
  data.galleryExtra.forEach((id) => !photoIds.has(id) && photoIds.set(id, 'Интерьер квартиры'))
  data.posts.forEach((p) => !photoIds.has(p.img) && photoIds.set(p.img, p.title))
  const queue = [...photoIds.entries()]
  log(`Фото: ${queue.length}`)
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      for (let job = queue.shift(); job; job = queue.shift()) await mediaFor(job[0], job[1])
    }),
  )

  // ---------- районы ----------
  const district = new Map<string, number>()
  for (const d of data.districts) {
    const doc = await payload.create({
      collection: 'districts',
      locale: 'ru',
      data: {
        name: d.name, nameIn: d.nameIn, slug: d.slug, order: d.order, inland: d.inland, about: d.about, lead: d.lead,
        pros: d.pros.map((text) => ({ text })), cons: d.cons.map((text) => ({ text })), infra: d.infra.map((text) => ({ text })),
        image: media.get(d.img), pricePerM2: d.pricePerM2, pricePerM2Date: ruDate('24.09.2026'), coastKm: d.coastKm,
        scores: d.scores, lat: d.lat, lng: d.lng, schema: { x: d.x, y: d.y },
      },
    })
    district.set(d.slug, doc.id)
  }
  log(`Районы: ${district.size}`)

  // ---------- команда ----------
  const member = new Map<string, { id: number; slug: string }>()
  const memberByName = new Map<string, number>()
  for (const t of data.team) {
    const doc = await payload.create({
      collection: 'team',
      locale: 'ru',
      data: {
        name: t.name, role: t.role, kind: t.kind as 'founder' | 'expert' | 'lawyer', langs: t.langs, exp: t.exp,
        photo: media.get(t.img), areas: t.areas.map((s) => district.get(s)!).filter(Boolean), spec: t.spec, bio: t.bio,
        help: t.help.map((text) => ({ text })), order: t.order,
      },
    })
    member.set(t.key, { id: doc.id, slug: doc.slug || slugify(t.name) })
    memberByName.set(t.name, doc.id)
  }
  log(`Команда: ${member.size}`)

  // ---------- отзывы ----------
  for (const r of data.reviews) {
    await payload.create({
      collection: 'reviews',
      data: {
        who: r.who, country: r.country, date: ruDate(r.date)!, rating: r.rating, service: r.service as 'buy',
        expert: r.expert ? member.get(r.expert)?.id : null, text: r.text, published: true,
      },
    })
  }
  log(`Отзывы: ${data.reviews.length}`)

  // ---------- объекты (с прежними номерами) ----------
  for (const p of data.properties) {
    const gallery = [p.img, ...data.galleryExtra.filter((x) => x !== p.img)].map((x) => media.get(x)!).filter(Boolean)
    await payload.create({
      collection: 'properties',
      locale: 'ru',
      data: {
        id: p.id, deal: p.deal as 'sale' | 'rent', status: p.status as 'published', title: p.title, type: p.type as 'apartment',
        district: district.get(p.district)!, rooms: p.rooms as '1+1', area: p.area, floor: p.floor, floors: p.floors, sea: p.sea,
        view: p.view as 'sea', furnished: p.furnished as 'yes', condition: p.condition as 'new', source: p.source as 'owner',
        ...(p.deal === 'rent'
          ? {
              price: p.price,
              rent: {
                period: (p.rent?.period || 'long') as 'long', deposit: p.rent?.deposit, minTerm: p.rent?.minTerm,
                availableFrom: ruDate(p.rent?.from || ''), utilities: !!p.rent?.utilities, pets: !!p.rent?.pets,
              },
            }
          : { priceOriginal: p.price, currency: 'EUR' as const, priceCheckedAt: ruDate(p.checked) }),
        photos: gallery, features: DEFAULT_FEATURES as never, description: p.description, lat: p.lat, lng: p.lng,
      },
    })
  }
  // счётчик ID продолжает нумерацию после импортированных объектов
  await payload.db.drizzle.execute(
    `SELECT setval(pg_get_serial_sequence('properties', 'id'), (SELECT COALESCE(MAX(id), 1) FROM properties))`,
  )
  log(`Объекты: ${data.properties.length}`)

  // ---------- статьи и новости ----------
  const postSlug = new Map(data.posts.map((p) => [p.id, slugify(p.title)]))
  const postKind = new Map(data.posts.map((p) => [p.id, p.kind]))
  const href = (h: string) => {
    const q = new URLSearchParams(h.split('?')[1] || '')
    if (h.startsWith('#')) return h
    if (h.startsWith('districts.html')) return '/ru/districts'
    if (h.startsWith('district.html')) return `/ru/districts/${q.get('d')}`
    if (h.startsWith('member.html')) return `/ru/team/${member.get(q.get('id') || '')?.slug || ''}`
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
    await payload.create({
      collection: 'posts',
      locale: 'ru',
      data: {
        _status: 'published', title: p.title, slug: postSlug.get(p.id), kind: p.kind as 'article', category: category(p.category),
        lead: p.lead, cover: media.get(p.img), body: htmlToLexical(p.body, href) as never, source: p.source,
        reviewedAt: p.reviewed ? new Date(p.reviewed).toISOString() : undefined, tags: p.tags,
        relatedDistricts: p.relatedDistricts.map((s) => district.get(s)!).filter(Boolean),
        relatedProperties: p.relatedProperties.filter((id) => data.properties.some((x) => x.id === id)),
        publishedAt: new Date(`${p.date}T09:00:00Z`).toISOString(), author: memberByName.get(p.author) ?? null, pinned: p.pinned,
      },
    })
  }
  log(`Публикации: ${data.posts.length}`)

  // ---------- настройки ----------
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
  log('Настройки: контакты, курсы, страница «Команда»')

  const counts = { districts: district.size, team: member.size, reviews: data.reviews.length, properties: data.properties.length, posts: data.posts.length, media: media.size }
  log(`Готово. Фото скачано: ${stats.downloaded}, заглушек: ${stats.placeholders}`)
  return { ok: true, counts, images: stats }
}
