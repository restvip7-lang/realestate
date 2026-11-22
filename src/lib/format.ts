import type { Locale } from '@/i18n/locales'
import type { Property } from '@/payload-types'

import { PROPERTY_TYPES, type PropertyType } from './catalog'

export const typeName = (type: string, locale: Locale) => PROPERTY_TYPES[type as PropertyType]?.[locale] ?? type

/**
 * Адрес объекта по ТЗ: /turkey/alanya/{район}/{сделка}/id{номер} (docs/seo-urls.md).
 * Район берётся из связи (нужен slug) или передаётся явно; без района адрес всё равно открывается и ведёт 308 на полный.
 */
/** Адрес объекта по ТЗ: /turkey/alanya/{район}/{сделка}/id{номер}; новый проект (ЖК) — …/sale/complexes/{slug}-id{номер}. */
export function propertyPath(p: Pick<Property, 'id' | 'deal'> & Partial<Pick<Property, 'type' | 'slug'>> & { district?: Property['district'] | null }, districtSlug?: string | null) {
  const slug = districtSlug ?? (p.district && typeof p.district === 'object' ? p.district.slug : null)
  const base = `/turkey/alanya/${slug ? `${slug}/` : ''}`
  if (p.type === 'project' && p.deal !== 'rent') return `${base}sale/complexes/${p.slug ? `${p.slug}-` : ''}id${p.id}`
  return `${base}${p.deal === 'rent' ? 'rent' : 'sale'}/id${p.id}`
}

export const fmtDate = (iso: string | null | undefined, locale: Locale, opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }) =>
  iso ? new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : locale, { timeZone: 'Europe/Istanbul', ...opts }).format(new Date(iso)) : ''

/** Аргументы для подсказки «2 спальни + 1 гостиная»: t(key, values). */
export function roomsHint(rooms: string | null | undefined): { key: 'studioHint' | 'roomsHint'; values: { a: number; b: number } } {
  const [a, b] = String(rooms || '').split('+').map((x) => parseInt(x, 10) || 0)
  return { key: a === 1 && b === 0 ? 'studioHint' : 'roomsHint', values: { a, b } }
}

/** Цитата в кавычках языка: «…» по-русски, “…” по-английски. */
export const quoted = (text: string, locale: string) => (locale === 'ru' ? `«${text}»` : `“${text}”`)
