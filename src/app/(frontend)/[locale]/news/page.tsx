import { permanentRedirect } from 'next/navigation'

import { getPathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'

// Старый адрес новостей /news → раздел журнала по ТЗ /blog/news (308, рубрика ?cat= сохраняется)
type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params
  const cat = (await searchParams).cat
  permanentRedirect(getPathname({ href: `/blog/news${typeof cat === 'string' ? `?cat=${encodeURIComponent(cat)}` : ''}`, locale }))
}
