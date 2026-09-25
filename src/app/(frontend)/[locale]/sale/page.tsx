import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Catalog, catalogTitle } from '@/components/site/Catalog'
import type { Locale } from '@/i18n/locales'
import { hasFilters, parseCatalog, type SearchParams } from '@/lib/catalog-params'
import { pageMeta } from '@/lib/seo'

const DEAL = 'sale' as 'sale' | 'rent'

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<SearchParams> }

export async function generateMetadata({ params, searchParams }: Props) {
  const { locale } = await params
  const q = parseCatalog(DEAL, await searchParams)
  const t = await getTranslations({ locale, namespace: 'catalog' })
  // страницы с фильтрами в адресе не индексируем, canonical — на основной каталог (docs/PLAN.md)
  return pageMeta(locale, `/${DEAL}`, {
    title: await catalogTitle(locale, q),
    description: t(DEAL === 'rent' ? 'seoRentText' : 'seoSaleText'),
    noindex: hasFilters(q) || !!q.page || !!q.sort,
  })
}

export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <Catalog locale={locale} q={parseCatalog(DEAL, await searchParams)} />
}
