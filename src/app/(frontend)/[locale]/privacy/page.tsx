import { setRequestLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/locales'
import { pageMeta } from '@/lib/seo'

import PrivacyEn, { meta as metaEn } from './en'
import PrivacyRu, { meta as metaRu } from './ru'

// Длинный текст страницы написан отдельно на каждом языке: ru.tsx и en.tsx (docs/CLAUDE-NOTES.md)
const PAGES = { ru: { meta: metaRu, Body: PrivacyRu }, en: { meta: metaEn, Body: PrivacyEn } } satisfies Record<Locale, unknown>

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return pageMeta(locale, '/privacy', PAGES[locale].meta)
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const { Body } = PAGES[locale]
  return <Body locale={locale} />
}
