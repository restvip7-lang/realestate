import 'server-only'

import type { Where } from 'payload'

import type { Locale } from '@/i18n/locales'
import type { Company, District, Media, Post, Property, Rate, Review, Team, TeamPage } from '@/payload-types'

import { PUBLIC_STATUSES } from './catalog'
import { payloadClient } from './payload'

// Все запросы — с правами анонимного посетителя (overrideAccess: false):
// черновики, снятые объекты, скрытые сотрудники и служебные поля на сайт не попадают.
const pub = { overrideAccess: false, fallbackLocale: 'ru' as const }

export async function getCompany(locale: Locale): Promise<Company> {
  const c = await (await payloadClient()).findGlobal({ slug: 'company', locale, ...pub })
  // до первого заполнения (новая база) обязательные поля пустые — страницы не должны падать
  return { ...c, phone: c.phone ?? '', whatsapp: c.whatsapp ?? '', email: c.email ?? '', address: c.address ?? '' }
}

export async function getRates(): Promise<Record<string, number>> {
  const r: Rate = await (await payloadClient()).findGlobal({ slug: 'rates', ...pub })
  const rates: Record<string, number> = { EUR: 1 }
  for (const k of ['USD', 'TRY', 'RUB', 'KZT', 'GBP'] as const) if (r[k]) rates[k] = r[k]
  return rates
}

export async function getTeamPage(locale: Locale): Promise<TeamPage> {
  return (await payloadClient()).findGlobal({ slug: 'team-page', locale, ...pub })
}

export async function listDistricts(locale: Locale): Promise<District[]> {
  const { docs } = await (await payloadClient()).find({ collection: 'districts', locale, limit: 100, sort: 'order', depth: 1, ...pub })
  return docs
}

export async function listTeam(locale: Locale): Promise<Team[]> {
  const { docs } = await (await payloadClient()).find({ collection: 'team', locale, limit: 100, sort: 'order', depth: 1, ...pub })
  return docs
}

/** Кто ведёт объект: выбранный в админке сотрудник или эксперт по кругу (как в прототипе). */
export function agentFor(p: Property, team: Team[]): Team | null {
  if (p.agent && typeof p.agent === 'object') return p.agent
  const experts = team.filter((t) => t.kind === 'expert')
  return experts.length ? experts[p.id % experts.length] : (team[0] ?? null)
}

export type CatalogQuery = {
  deal?: 'sale' | 'rent'
  district?: string
  type?: string
  rooms?: string
  min?: number
  max?: number
  sea?: number
  area?: number
  seaView?: boolean
  furnished?: boolean
  newBuild?: boolean
  citizenship?: boolean
  sort?: 'new' | 'cheap' | 'expensive' | 'sea'
  page?: number
  limit?: number
}

export async function listProperties(locale: Locale, q: CatalogQuery, districts?: District[]) {
  const and: Where[] = [{ status: { equals: 'published' } }, { deal: { equals: q.deal || 'sale' } }]
  if (q.district) {
    const d = (districts ?? (await listDistricts(locale))).find((x) => x.slug === q.district)
    and.push({ district: { equals: d?.id ?? -1 } })
  }
  if (q.type) and.push({ type: { equals: q.type } })
  if (q.rooms === '4+') and.push({ rooms: { in: ['4+1', '4+2', '5+1', '6+1'] } })
  else if (q.rooms) and.push({ rooms: { equals: q.rooms } })
  if (q.min) and.push({ price: { greater_than_equal: q.min } })
  if (q.max) and.push({ price: { less_than_equal: q.max } })
  if (q.sea) and.push({ sea: { less_than_equal: q.sea } })
  if (q.area) and.push({ area: { greater_than_equal: q.area } })
  if (q.seaView) and.push({ view: { equals: 'sea' } })
  if (q.furnished) and.push({ furnished: { in: ['yes', 'partial'] } })
  if (q.newBuild) and.push({ condition: { in: ['new', 'construction'] } })
  if (q.citizenship) and.push({ citizenship: { equals: true } })
  const sort = { new: '-id', cheap: 'price', expensive: '-price', sea: 'sea' }[q.sort || 'new']
  return (await payloadClient()).find({
    collection: 'properties',
    locale,
    where: { and },
    sort,
    limit: q.limit ?? 24,
    page: q.page ?? 1,
    depth: 1,
    ...pub,
  })
}

export async function getProperty(id: number, locale: Locale): Promise<Property | null> {
  const { docs } = await (await payloadClient()).find({
    collection: 'properties',
    locale,
    where: { and: [{ id: { equals: id } }, { status: { in: [...PUBLIC_STATUSES] } }] },
    limit: 1,
    depth: 2,
    ...pub,
  })
  return docs[0] ?? null
}

export async function similarProperties(p: Property, locale: Locale, limit = 3): Promise<Property[]> {
  const districtId = typeof p.district === 'object' ? p.district.id : p.district
  const { docs } = await (await payloadClient()).find({
    collection: 'properties',
    locale,
    where: { and: [{ status: { equals: 'published' } }, { deal: { equals: p.deal } }, { id: { not_equals: p.id } }] },
    limit: 200,
    depth: 1,
    ...pub,
  })
  const price = p.price ?? 0
  return docs
    .sort((a, b) => {
      const da = (typeof a.district === 'object' ? a.district.id : a.district) === districtId ? 0 : 1
      const db = (typeof b.district === 'object' ? b.district.id : b.district) === districtId ? 0 : 1
      return da - db || Math.abs((a.price ?? 0) - price) - Math.abs((b.price ?? 0) - price)
    })
    .slice(0, limit)
}

export async function latestPosts(locale: Locale, kind: 'article' | 'news', limit = 3): Promise<Post[]> {
  const { docs } = await (await payloadClient()).find({
    collection: 'posts',
    locale,
    where: { kind: { equals: kind } },
    sort: ['-pinned', '-publishedAt'],
    limit,
    depth: 1,
    ...pub,
  })
  return docs
}

export async function latestReviews(limit = 3): Promise<Review[]> {
  const { docs } = await (await payloadClient()).find({ collection: 'reviews', sort: '-date', limit, depth: 0, ...pub })
  return docs
}

/** URL картинки нужного размера из Media (или null). */
export function mediaUrl(m: number | Media | null | undefined, size: 'thumb' | 'card' | 'large' = 'card'): string | null {
  if (!m || typeof m !== 'object') return null
  return m.sizes?.[size]?.url || m.url || null
}

export const districtOf = (p: Property) => (typeof p.district === 'object' ? p.district : null)

/** Сколько опубликованных объектов в каждом районе (для карточек районов). */
export async function districtCounts(deal: 'sale' | 'rent' = 'sale'): Promise<Record<number, number>> {
  const { docs } = await (await payloadClient()).find({
    collection: 'properties',
    where: { and: [{ status: { equals: 'published' } }, { deal: { equals: deal } }] },
    select: { district: true },
    limit: 5000,
    depth: 0,
    pagination: false,
    ...pub,
  })
  const out: Record<number, number> = {}
  docs.forEach((p) => {
    const id = typeof p.district === 'object' ? p.district?.id : p.district
    if (id) out[id] = (out[id] || 0) + 1
  })
  return out
}

export async function getDistrict(slug: string, locale: Locale): Promise<District | null> {
  const { docs } = await (await payloadClient()).find({ collection: 'districts', locale, where: { slug: { equals: slug } }, limit: 1, depth: 1, ...pub })
  return docs[0] ?? null
}

/** Опубликованные объекты района (продажа и аренда) — для страницы района. */
export async function districtProperties(districtId: number, locale: Locale): Promise<Property[]> {
  const { docs } = await (await payloadClient()).find({
    collection: 'properties',
    locale,
    where: { and: [{ status: { equals: 'published' } }, { district: { equals: districtId } }] },
    sort: '-id',
    limit: 500,
    depth: 1,
    pagination: false,
    ...pub,
  })
  return docs
}

export type DistrictStat = { sale: number; rent: number; minSea: number | null }
/** Для каждого района: сколько объектов в продаже и аренде, ближайший к морю. */
export async function districtStats(): Promise<Record<number, DistrictStat>> {
  const { docs } = await (await payloadClient()).find({
    collection: 'properties',
    where: { status: { equals: 'published' } },
    select: { district: true, deal: true, sea: true },
    limit: 5000,
    depth: 0,
    pagination: false,
    ...pub,
  })
  const out: Record<number, DistrictStat> = {}
  docs.forEach((p) => {
    const id = typeof p.district === 'object' ? p.district?.id : p.district
    if (!id) return
    const s = (out[id] ??= { sale: 0, rent: 0, minSea: null })
    s[p.deal === 'rent' ? 'rent' : 'sale']++
    if (p.sea != null) s.minSea = s.minSea == null ? p.sea : Math.min(s.minSea, p.sea)
  })
  return out
}

export async function getMember(slug: string, locale: Locale): Promise<Team | null> {
  const { docs } = await (await payloadClient()).find({ collection: 'team', locale, where: { slug: { equals: slug } }, limit: 1, depth: 1, ...pub })
  return docs[0] ?? null
}

/** Все опубликованные объекты (для распределения по экспертам и избранного). */
export async function allPublished(locale: Locale): Promise<Property[]> {
  const { docs } = await (await payloadClient()).find({
    collection: 'properties', locale, where: { status: { equals: 'published' } }, sort: '-id', limit: 2000, depth: 1, pagination: false, ...pub,
  })
  return docs
}

export type PostQuery = { kind?: 'article' | 'news'; category?: string; author?: number; page?: number; limit?: number; exclude?: number }
export async function listPosts(locale: Locale, q: PostQuery = {}) {
  const and: Where[] = []
  if (q.kind) and.push({ kind: { equals: q.kind } })
  if (q.category) and.push({ category: { equals: q.category } })
  if (q.author) and.push({ author: { equals: q.author } })
  if (q.exclude) and.push({ id: { not_equals: q.exclude } })
  return (await payloadClient()).find({
    collection: 'posts', locale, where: and.length ? { and } : undefined, sort: ['-pinned', '-publishedAt'],
    limit: q.limit ?? 12, page: q.page ?? 1, depth: 2, ...pub,
  })
}

export async function getPost(slug: string, locale: Locale): Promise<Post | null> {
  const { docs } = await (await payloadClient()).find({ collection: 'posts', locale, where: { slug: { equals: slug } }, limit: 1, depth: 2, ...pub })
  return docs[0] ?? null
}

export async function listReviews(): Promise<Review[]> {
  const { docs } = await (await payloadClient()).find({ collection: 'reviews', sort: '-date', limit: 500, depth: 0, pagination: false, ...pub })
  return docs
}

/** Объекты избранного по списку ID (в порядке списка); проданные и забронированные тоже — с пометкой статуса. */
export async function getPropertiesByIds(ids: number[], locale: Locale): Promise<Property[]> {
  if (!ids.length) return []
  const { docs } = await (await payloadClient()).find({
    collection: 'properties', locale, where: { and: [{ id: { in: ids } }, { status: { in: [...PUBLIC_STATUSES] } }] }, limit: ids.length, depth: 1, pagination: false, ...pub,
  })
  return ids.map((id) => docs.find((d) => d.id === id)).filter((d): d is Property => !!d)
}

/** Адреса для sitemap.xml и llms.txt: только то, что видит посетитель. */
export async function sitemapData() {
  const p = await payloadClient()
  const opts = { limit: 5000, depth: 0, pagination: false, ...pub } as const
  const [districts, team, posts, properties] = await Promise.all([
    p.find({ collection: 'districts', ...opts, sort: 'order', select: { slug: true, name: true, updatedAt: true } }),
    p.find({ collection: 'team', ...opts, sort: 'order', select: { slug: true, name: true, updatedAt: true } }),
    p.find({ collection: 'posts', ...opts, sort: '-publishedAt', select: { slug: true, kind: true, title: true, updatedAt: true } }),
    p.find({ collection: 'properties', ...opts, sort: '-id', where: { status: { equals: 'published' } }, select: { slug: true, updatedAt: true } }),
  ])
  return { districts: districts.docs, team: team.docs, posts: posts.docs, properties: properties.docs }
}
