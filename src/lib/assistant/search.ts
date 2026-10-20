import type { Where } from 'payload'
import type { Locale } from '@/i18n/locales'
import type { District } from '@/payload-types'
import { findPublished, getRates, propertyCover, districtOf } from '@/lib/data'
import { propertyPath } from '@/lib/format'
import { searchBounds, type Filters, type Card } from './schema'

export async function searchProperties(locale: Locale, f: Filters, districts: District[]) {
  const bounds = searchBounds(f, await getRates())
  if ('error' in bounds) return { cards: [], total: null, notice: bounds.error }
  const district = f.district ? districts.find((d) => d.slug === f.district) : null
  if (f.district && !district) return { cards: [], total: null, notice: 'location' as const }
  const and: Where[] = [{ deal: { equals: f.deal } }]
  if (district) and.push({ district: { equals: district.id } })
  if (f.type) and.push({ type: { equals: f.type } })
  if (f.rooms) and.push({ rooms: { equals: f.rooms } })
  if (bounds.min != null) and.push({ price: { greater_than_equal: bounds.min } })
  if (bounds.max != null) and.push({ price: { less_than_equal: bounds.max } })
  if (bounds.min != null || bounds.max != null) and.push({ price: { greater_than: 0 } })
  if (f.sea != null) and.push({ sea: { less_than_equal: f.sea } })
  if (f.furnished === true) and.push({ furnished: { equals: 'yes' } })
  if (f.furnished === false) and.push({ furnished: { equals: 'no' } })
  const result = await findPublished(locale, { and }, { limit: 4, sort: '-id' })
  const cards: Card[] = result.docs.map((p) => ({ id: p.id, title: p.title, url: `/${locale}${propertyPath(p)}`, image: propertyCover(p)?.src || null, district: districtOf(p)?.name || '', price: p.price && p.price > 0 ? p.price : null, priceFrom: !!p.priceFrom, rooms: p.rooms || null, area: p.area || null, sea: p.sea ?? null, deal: p.deal }))
  return { cards, total: result.total, notice: null }
}
