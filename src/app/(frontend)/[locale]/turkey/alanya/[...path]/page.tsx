import { notFound, permanentRedirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Catalog, catalogTitle } from '@/components/site/Catalog'
import { getPathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { catalogBasePath, catalogHref, hasExtraFilters, parseCatalog, parseCatalogPath, type SearchParams } from '@/lib/catalog-params'
import { listDistricts } from '@/lib/data'
import { pageMeta } from '@/lib/seo'

// Каталог по ЧПУ из ТЗ: /{lang}/turkey/alanya/{район}/{сделка}/{тип}/page-N (docs/seo-urls.md)
type Props = { params: Promise<{ locale: Locale; path: string[] }>; searchParams: Promise<SearchParams> }

async function resolve(locale: Locale, path: string[], sp: SearchParams) {
  const districts = await listDistricts(locale)
  const seg = parseCatalogPath(path, districts.map((d) => d.slug))
  if (!seg) notFound()
  // путь главнее параметров: ?district= и ?type= в адресе ЧПУ игнорируем
  return { ...parseCatalog(seg.deal, sp), district: seg.district, type: seg.type, page: seg.page }
}

export async function generateMetadata({ params, searchParams }: Props) {
  const { locale, path } = await params
  const q = await resolve(locale, path, await searchParams)
  const t = await getTranslations({ locale, namespace: 'catalog' })
  const title = await catalogTitle(locale, q)
  return pageMeta(locale, catalogBasePath(q), {
    title: q.page && q.page > 1 ? `${title} — ${t('pageN', { n: q.page })}` : title,
    description: t(q.deal === 'rent' ? 'seoRentText' : 'seoSaleText'),
    // фильтры и сортировка параметрами — noindex, canonical на ЧПУ без параметров
    noindex: hasExtraFilters(q) || !!q.sort,
  })
}

export default async function Page({ params, searchParams }: Props) {
  const { locale, path } = await params
  setRequestLocale(locale)
  const q = await resolve(locale, path, await searchParams)
  // /page-1 — то же, что первая страница без номера
  if (q.page === 1) permanentRedirect(getPathname({ href: catalogHref(q, { page: undefined }), locale }))
  return <Catalog locale={locale} q={q} />
}
