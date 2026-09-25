export const LOCALES = ['ru', 'en', 'tr'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'ru'
export const isLocale = (s: string): s is Locale => (LOCALES as readonly string[]).includes(s)
