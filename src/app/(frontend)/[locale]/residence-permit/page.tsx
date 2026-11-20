import { setRequestLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/locales'
import { pageMeta } from '@/lib/seo'

import ResidenceEn, { meta as metaEn } from './en'
import ResidenceRu, { meta as metaRu } from './ru'

// Длинный текст страницы написан отдельно на каждом языке: ru.tsx и en.tsx (docs/CLAUDE-NOTES.md)
const PAGES = { ru: { meta: metaRu, Body: ResidenceRu }, en: { meta: metaEn, Body: ResidenceEn } } satisfies Record<Locale, unknown>

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return pageMeta(locale, '/residence-permit', PAGES[locale].meta)
}

export default async function ResidencePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const { Body } = PAGES[locale]
  return <Body locale={locale} />
}
