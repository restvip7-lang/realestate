import { PROPERTY_TYPES, type PropertyType } from './catalog'
import type { CatalogQuery, ProjectQuery } from './data'

export type SearchParams = Record<string, string | string[] | undefined>

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || ''
const int = (v: string | string[] | undefined) => {
  const n = parseInt(one(v).replace(/\D/g, ''), 10)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

/** Параметры адреса каталога → фильтр. Неизвестные значения игнорируются. */
export function parseCatalog(deal: 'sale' | 'rent', sp: SearchParams): CatalogQuery {
  const sort = one(sp.sort)
  return {
    deal,
    type: one(sp.type) || undefined,
    district: one(sp.district) || undefined,
    rooms: one(sp.rooms) || undefined,
    min: int(sp.min),
    max: int(sp.max),
    sea: int(sp.sea),
    area: int(sp.area),
    seaView: one(sp.view) === 'sea' || one(sp.seaview) === '1',
    furnished: one(sp.furn) === '1',
    newBuild: one(sp.new) === '1',
    citizenship: one(sp.cit) === '1',
    floor: (['notfirst', 'notlast', 'top'] as const).find((f) => f === one(sp.floor)),
    owner: one(sp.owner) === '1',
    video: one(sp.video) === '1',
    pets: deal === 'rent' && one(sp.pets) === '1',
    pool: one(sp.pool) === '1',
    sort: (['new', 'cheap', 'expensive', 'sea'] as const).find((s) => s === sort),
    page: int(sp.page),
  }
}

/** Фильтр → строка запроса (без deal). */
export function catalogQueryString(q: CatalogQuery, patch: Partial<CatalogQuery> = {}): string {
  const x = { ...q, ...patch }
  const p = new URLSearchParams()
  if (x.type) p.set('type', x.type)
  if (x.district) p.set('district', x.district)
  if (x.rooms) p.set('rooms', x.rooms)
  if (x.min) p.set('min', String(x.min))
  if (x.max) p.set('max', String(x.max))
  if (x.sea) p.set('sea', String(x.sea))
  if (x.area) p.set('area', String(x.area))
  if (x.seaView) p.set('view', 'sea')
  if (x.furnished) p.set('furn', '1')
  if (x.newBuild) p.set('new', '1')
  if (x.citizenship) p.set('cit', '1')
  if (x.floor) p.set('floor', x.floor)
  if (x.owner) p.set('owner', '1')
  if (x.video) p.set('video', '1')
  if (x.pets) p.set('pets', '1')
  if (x.pool) p.set('pool', '1')
  if (x.sort && x.sort !== 'new') p.set('sort', x.sort)
  if (x.page && x.page > 1) p.set('page', String(x.page))
  const s = p.toString()
  return s ? `?${s}` : ''
}

/**
 * Адреса каталога по ТЗ (раздел «URL-иерархия»): /{lang}/turkey/alanya/{район}/{сделка}/{тип}/page-N.
 * Район, сделка, тип и страница — часть пути (индексируемые ЧПУ), остальные фильтры — параметры
 * (noindex + canonical на путь без параметров). Старые /sale и /rent ведут сюда 308-редиректом.
 */
export const CATALOG_BASE = '/turkey/alanya'
export const DEALS = ['sale', 'rent'] as const
export type Deal = (typeof DEALS)[number]

const TYPE_BY_PATH = Object.fromEntries(Object.entries(PROPERTY_TYPES).map(([k, v]) => [v.path, k])) as Record<string, PropertyType>
export const typePath = (type?: string) => (type && type in PROPERTY_TYPES ? PROPERTY_TYPES[type as PropertyType].path : undefined)

/**
 * Посадочные страницы по признакам (сегмент {feature} из ТЗ). Белый список: другие сочетания — только параметрами.
 * В пути — один признак: первый подходящий по порядку списка, остальные фильтры остаются параметрами.
 */
export const LANDINGS = {
  'sea-view': { patch: { seaView: true } },
  'first-line': { patch: { sea: 100 } },
  'near-sea': { patch: { sea: 500 } },
  'with-pool': { patch: { pool: true } },
  furnished: { patch: { furnished: true } },
  'new-build': { patch: { newBuild: true } },
  citizenship: { patch: { citizenship: true }, deal: 'sale' },
  pets: { patch: { pets: true }, deal: 'rent' },
} as const satisfies Record<string, { patch: Partial<CatalogQuery>; deal?: Deal }>
export type Landing = keyof typeof LANDINGS
export const LANDING_KEYS = Object.keys(LANDINGS) as Landing[]

export const landingFits = (k: Landing, deal: Deal) => !('deal' in LANDINGS[k]) || (LANDINGS[k] as { deal?: Deal }).deal === deal

/** Какой признак из фильтра попадает в путь. */
export function landingOf(q: CatalogQuery): Landing | undefined {
  return LANDING_KEYS.find((k) => landingFits(k, q.deal || 'sale') && Object.entries(LANDINGS[k].patch).every(([f, v]) => q[f as keyof CatalogQuery] === v))
}

/** Путь каталога без параметров: район, сделка, тип, признак, страница. */
export function catalogBasePath(q: CatalogQuery): string {
  const segs = [q.district, q.deal || 'sale', typePath(q.type), landingOf(q), q.page && q.page > 1 ? `page-${q.page}` : undefined].filter(Boolean)
  return `${CATALOG_BASE}/${segs.join('/')}`
}

/** Полный адрес каталога: ЧПУ-путь + остальные фильтры параметрами. */
export function catalogHref(q: CatalogQuery, patch: Partial<CatalogQuery> = {}): string {
  const x = { ...q, ...patch }
  const f = landingOf(x)
  const unset = f ? Object.fromEntries(Object.keys(LANDINGS[f].patch).map((k) => [k, undefined])) : {}
  const rest = catalogQueryString({ ...x, ...unset, district: undefined, type: undefined, page: undefined })
  return catalogBasePath(x) + rest
}

/** Есть ли фильтры или сортировка сверх ЧПУ-пути (такие страницы не индексируем). */
export const hasQueryParams = (q: CatalogQuery) => catalogHref(q).includes('?')

/**
 * Разбор сегментов после /turkey/alanya/: [район]/сделка/[тип]/[page-N].
 * null — такого адреса нет (404). Районы передаются списком slug, чтобы отличить район от сделки.
 */
export function parseCatalogPath(segs: string[], districtSlugs: string[]): { deal: Deal; district?: string; type?: PropertyType; landing?: Landing; page?: number } | null {
  const s = segs.map((x) => decodeURIComponent(x).toLowerCase())
  let i = 0
  let district: string | undefined
  if (s[i] && !DEALS.includes(s[i] as Deal)) {
    if (!districtSlugs.includes(s[i])) return null
    district = s[i++]
  }
  const deal = s[i++] as Deal
  if (!DEALS.includes(deal)) return null
  let type: PropertyType | undefined
  if (s[i] && TYPE_BY_PATH[s[i]]) type = TYPE_BY_PATH[s[i++]]
  let landing: Landing | undefined
  if (s[i] && LANDING_KEYS.includes(s[i] as Landing) && landingFits(s[i] as Landing, deal)) landing = s[i++] as Landing
  let page: number | undefined
  const m = s[i]?.match(/^page-(\d{1,4})$/)
  if (m) {
    page = Number(m[1])
    if (page < 1) return null
    i++
  }
  if (i !== s.length) return null
  return { deal, district, type, landing, page }
}

export const hasFilters = (q: CatalogQuery) =>
  !!(q.type || q.district || q.rooms || q.min || q.max || q.sea || q.area || q.seaView || q.furnished || q.newBuild || q.citizenship || q.floor || q.owner || q.video || q.pets || q.pool)

/** Параметры адреса раздела новостроек (/projects). */
export function parseProjects(sp: SearchParams): ProjectQuery {
  const year = int(sp.when)
  return {
    district: one(sp.district) || undefined,
    when: year && year >= 2000 && year < 2100 ? year : undefined,
    max: int(sp.max),
    citizenship: one(sp.cit) === '1',
    sort: (['new', 'cheap', 'expensive', 'soon'] as const).find((s) => s === one(sp.sort)),
    page: int(sp.page),
  }
}

export function projectsQueryString(q: ProjectQuery, patch: Partial<ProjectQuery> = {}): string {
  const x = { ...q, ...patch }
  const p = new URLSearchParams()
  if (x.district) p.set('district', x.district)
  if (x.when) p.set('when', String(x.when))
  if (x.max) p.set('max', String(x.max))
  if (x.citizenship) p.set('cit', '1')
  if (x.sort && x.sort !== 'new') p.set('sort', x.sort)
  if (x.page && x.page > 1) p.set('page', String(x.page))
  const s = p.toString()
  return s ? `?${s}` : ''
}
