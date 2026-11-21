import { permanentRedirect } from 'next/navigation'

import { getPathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'

// Старый адрес новости /news/{slug} → /blog/news/{slug} (308)
export default async function Page({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params
  permanentRedirect(getPathname({ href: `/blog/news/${slug}`, locale }))
}
