import { setRequestLocale } from 'next-intl/server'

import { PostPage, postMeta } from '@/components/site/PostPage'
import type { Locale } from '@/i18n/locales'

type Props = { params: Promise<{ locale: Locale; slug: string }> }

export const revalidate = 600
export function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  return postMeta(locale, slug)
}

export default async function Page({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  return <PostPage locale={locale} slug={slug} kind="article" />
}
