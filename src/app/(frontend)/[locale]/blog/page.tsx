import '@/app/(frontend)/styles/pages.css'

import { getTranslations, setRequestLocale } from 'next-intl/server'

import { permanentRedirect } from 'next/navigation'

import { CAT_SECTIONS, JournalList } from '@/components/site/Journal'
import { getPathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { pageMeta } from '@/lib/seo'

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata({ params, searchParams }: Props) {
  const { locale } = await params
  const sp = await searchParams
  const t = await getTranslations({ locale, namespace: 'journal' })
  return pageMeta(locale, '/blog', { title: t('blogTitle'), description: t('blogMetaDesc'), noindex: !!sp.cat })
}

export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const sp = await searchParams
  // рубрики со своим разделом (/blog?cat=laws → /blog/laws)
  if (typeof sp.cat === 'string' && CAT_SECTIONS[sp.cat]) permanentRedirect(getPathname({ href: CAT_SECTIONS[sp.cat], locale }))
  return <JournalList kind="article" cat={typeof sp.cat === 'string' ? sp.cat : undefined} />
}
