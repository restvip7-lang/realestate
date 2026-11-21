import { notFound, permanentRedirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Catalog, catalogTitle } from '@/components/site/Catalog'
import { getPathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { CATALOG_BASE, catalogBasePath, catalogHref, hasQueryParams, LANDINGS, parseCatalog, parseCatalogPath, type SearchParams } from '@/lib/catalog-params'
import { countProperties, getSeoPage, listDistricts } from '@/lib/data'
import { INDEX_MIN } from '@/lib/landings'
import { pageMeta } from '@/lib/seo'

// Каталог по ЧПУ из ТЗ: /{lang}/turkey/alanya/{район}/{сделка}/{тип}/page-N (docs/seo-urls.md)
type Props = { params: Promise<{ locale: Locale; path: string[] }>; searchParams: Promise<SearchParams> }

async function resolve(locale: Locale, path: string[], sp: SearchParams) {
  const districts = await listDistricts(locale)
  const seg = parseCatalogPath(path, districts.map((d) => d.slug))
  if (!seg) notFound()
  // путь главнее параметров: ?district= и ?type= в адресе ЧПУ игнорируем, признак из пути добавляется к фильтру
  return { ...parseCatalog(seg.deal, sp), district: seg.district, type: seg.type, ...(seg.landing ? LANDINGS[seg.landing].patch : {}), page: seg.page }
}

export async function generateMetadata({ params, searchParams }: Props) {
  const { locale, path } = await params
  const q = await resolve(locale, path, await searchParams)
  const t = await getTranslations({ locale, namespace: 'catalog' })
  const title = await catalogTitle(locale, q)
  // порог ТЗ: меньше INDEX_MIN объектов — страница открыта, но не индексируется
  const [n, seo] = await Promise.all([countProperties(locale, q), getSeoPage(catalogBasePath({ ...q, page: undefined }), locale)])
  // свои title и description из админки (SEO → SEO разделов), иначе шаблон
  const base = seo?.title || title
  return pageMeta(locale, catalogBasePath(q), {
    title: q.page && q.page > 1 ? `${base} — ${t('pageN', { n: q.page })}` : base,
    description: seo?.description || t(q.deal === 'rent' ? 'seoRentText' : 'seoSaleText'),
    // фильтры и сортировка параметрами — noindex, canonical на ЧПУ без параметров; галочка в админке закрывает страницу всегда
    noindex: hasQueryParams(q) || n < INDEX_MIN || !!seo?.noindex,
  })
}

export default async function Page({ params, searchParams }: Props) {
  const { locale, path } = await params
  setRequestLocale(locale)
  const q = await resolve(locale, path, await searchParams)
  // один адрес на страницу: /page-1, признак параметром (?view=sea), регистр — 308 на канонический ЧПУ
  const here = `${CATALOG_BASE}/${path.join('/')}`
  if (here !== catalogBasePath(q)) permanentRedirect(getPathname({ href: catalogHref(q), locale }))
  const seo = await getSeoPage(catalogBasePath({ ...q, page: undefined }), locale)
  return <Catalog locale={locale} q={q} seo={seo} />
}
