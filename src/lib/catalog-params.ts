import type { CatalogQuery } from './data'

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
  if (x.sort && x.sort !== 'new') p.set('sort', x.sort)
  if (x.page && x.page > 1) p.set('page', String(x.page))
  const s = p.toString()
  return s ? `?${s}` : ''
}

export const hasFilters = (q: CatalogQuery) =>
  !!(q.type || q.district || q.rooms || q.min || q.max || q.sea || q.area || q.seaView || q.furnished || q.newBuild || q.citizenship)
