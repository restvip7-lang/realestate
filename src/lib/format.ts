import type { Locale } from '@/i18n/locales'
import type { Property } from '@/payload-types'

import { PROPERTY_TYPES, type PropertyType } from './catalog'

export const typeName = (type: string, locale: Locale) => PROPERTY_TYPES[type as PropertyType]?.[locale] ?? type

export const propertyPath = (p: Pick<Property, 'id' | 'slug'>) => `/property/${p.id}${p.slug ? `-${p.slug}` : ''}`

export const fmtDate = (iso: string | null | undefined, locale: Locale, opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }) =>
  iso ? new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : locale, { timeZone: 'Europe/Istanbul', ...opts }).format(new Date(iso)) : ''

/** Аргументы для подсказки «2 спальни + 1 гостиная»: t(key, values). */
export function roomsHint(rooms: string | null | undefined): { key: 'studioHint' | 'roomsHint'; values: { a: number; b: number } } {
  const [a, b] = String(rooms || '').split('+').map((x) => parseInt(x, 10) || 0)
  return { key: a === 1 && b === 0 ? 'studioHint' : 'roomsHint', values: { a, b } }
}
