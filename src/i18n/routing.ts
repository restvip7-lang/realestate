import { defineRouting } from 'next-intl/routing'

import { DEFAULT_LOCALE, LOCALES } from './locales'

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always', // /ru/…, /en/…, /tr/… — у каждого языка свой адрес (docs/PLAN.md)
  localeDetection: false, // «/» всегда ведёт на /ru/, язык меняет сам посетитель
})
