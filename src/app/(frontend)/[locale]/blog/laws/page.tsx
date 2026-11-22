import '@/app/(frontend)/styles/pages.css'

import { getTranslations, setRequestLocale } from 'next-intl/server'

import { JournalList } from '@/components/site/Journal'
import type { Locale } from '@/i18n/locales'
import { pageMeta } from '@/lib/seo'

// Раздел журнала «Законы» по ТЗ: /blog/laws (статьи рубрики laws)
type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'journal' })
  return pageMeta(locale, '/blog/laws', { title: t('lawsTitle'), description: t('lawsMetaDesc') })
}

export default async function Page({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <JournalList kind="article" cat="laws" />
}
