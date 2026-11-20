/** Языки сайта. Турецкий пока скрыт: на демо только RU и EN (решение владельца, docs/CLAUDE-NOTES.md). */
export const LOCALES = ['ru', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'ru'
export const isLocale = (s: string): s is Locale => (LOCALES as readonly string[]).includes(s)

/** Языки контента в базе и админке: турецкие тексты храним на будущее, на сайте их не показываем. */
export const CONTENT_LOCALES = ['ru', 'en', 'tr'] as const
/** Скрытые языки сайта: их старые адреса ведут на английскую версию (src/proxy.ts). */
export const HIDDEN_LOCALES = CONTENT_LOCALES.filter((l) => !isLocale(l))
