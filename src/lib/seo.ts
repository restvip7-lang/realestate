import type { Metadata } from 'next'

import { LOCALES, type Locale } from '@/i18n/locales'

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

/** Пока на сайте демо-данные, его не индексируем. Включить: SITE_INDEXABLE=1 в переменных Vercel. */
export const INDEXABLE = process.env.SITE_INDEXABLE === '1'

/** canonical + hreflang для страницы `path` (без языка, например «/sale» или «/property/1031-slug»). */
export function pageMeta(locale: Locale, path: string, meta: { title: string; description?: string; image?: string | null; noindex?: boolean }): Metadata {
  const p = path === '/' ? '' : path
  const languages = Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}${p}`]))
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `${SITE_URL}/${locale}${p}`, languages: { ...languages, 'x-default': `${SITE_URL}/ru${p}` } },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${SITE_URL}/${locale}${p}`,
      siteName: 'Kleo Homes',
      locale,
      type: 'website',
      ...(meta.image ? { images: [{ url: meta.image.startsWith('http') ? meta.image : `${SITE_URL}${meta.image}` }] } : {}),
    },
    robots: !INDEXABLE || meta.noindex ? { index: false, follow: !meta.noindex || INDEXABLE } : undefined,
  }
}
