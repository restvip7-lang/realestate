import { permanentRedirect } from 'next/navigation'

import { getPathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { catalogBasePath } from '@/lib/catalog-params'

// /turkey без города → каталог продажи
export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  permanentRedirect(getPathname({ href: catalogBasePath({ deal: 'sale' }), locale }))
}
