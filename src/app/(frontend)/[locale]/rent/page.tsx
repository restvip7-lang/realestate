import { permanentRedirect } from 'next/navigation'

import { getPathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { catalogHref, parseCatalog, type SearchParams } from '@/lib/catalog-params'

// Старый адрес каталога /rent?district=…&type=… → ЧПУ по ТЗ (/turkey/alanya/{район}/rent/{тип}), 308
type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<SearchParams> }

export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params
  permanentRedirect(getPathname({ href: catalogHref(parseCatalog('rent', await searchParams)), locale }))
}
