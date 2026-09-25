import '@/app/(frontend)/styles/catalog.css'

import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { PROPERTY_TYPES, type PropertyType } from '@/lib/catalog'
import { catalogQueryString, hasFilters } from '@/lib/catalog-params'
import { type CatalogQuery, listDistricts, listProperties } from '@/lib/data'

import { CatalogFilters, SortSelect } from './CatalogFilters'
import { Price } from './Currency'
import { PropertyCard } from './PropertyCard'

/** Заголовок каталога: «Квартиры в Махмутларе», «Аренда вилл» и т. п. */
export async function catalogTitle(locale: Locale, q: CatalogQuery) {
  const t = await getTranslations({ locale, namespace: 'catalog' })
  const districts = await listDistricts(locale)
  const d = districts.find((x) => x.slug === q.district)
  const type = q.type && PROPERTY_TYPES[q.type as PropertyType]?.plural[locale]
  const what = type || t(q.deal === 'rent' ? 'rentAll' : 'saleAll')
  const where = d ? t('inDistrict', { where: d.nameIn || d.name }) : t('inAlanya')
  return q.deal === 'rent' && type ? t('rentOf', { what: type, where }) : `${what} ${where}`
}

export async function Catalog({ locale, q }: { locale: Locale; q: CatalogQuery }) {
  const t = await getTranslations('catalog')
  const ts = await getTranslations('search')
  const deal = q.deal || 'sale'
  const districts = await listDistricts(locale)
  const res = await listProperties(locale, { ...q, limit: 24 }, districts)
  const title = await catalogTitle(locale, q)
  const d = districts.find((x) => x.slug === q.district)

  // активные фильтры — чипы с крестиком
  const chips: [string, Partial<CatalogQuery>][] = []
  if (q.type) chips.push([t(`typesPlural.${q.type}` as never), { type: undefined }])
  if (d) chips.push([d.name, { district: undefined }])
  if (q.rooms) chips.push([q.rooms, { rooms: undefined }])
  if (q.sea) chips.push([ts('upToM', { m: q.sea }), { sea: undefined }])
  if (q.area) chips.push([t('areaFrom', { n: q.area }), { area: undefined }])
  if (q.seaView) chips.push([ts('seaView'), { seaView: false }])
  if (q.furnished) chips.push([ts('furnished'), { furnished: false }])
  if (q.newBuild) chips.push([ts('newBuild'), { newBuild: false }])
  if (q.citizenship) chips.push([ts('citizenship'), { citizenship: false }])
  const pages = Array.from({ length: res.totalPages }, (_, i) => i + 1)

  return (
    <>
      <CatalogFilters q={q} districts={districts.map((x) => ({ slug: x.slug, name: x.name }))} />
      <main className="cat list-only">
        <section className="listcol" aria-labelledby="h1">
          <nav className="crumbs" aria-label={t('crumbs')}>
            <Link href="/">{t('home')}</Link>›
            {d ? <><Link href={`/${deal}`}>{t(deal)}</Link>›<span aria-current="page">{d.name}</span></> : <span aria-current="page">{t(deal)}</span>}
          </nav>
          <div className="res-head">
            <div>
              <h1 id="h1">{title}</h1>
              <div className="cnt" aria-live="polite">{t('found', { n: res.totalDocs })}</div>
            </div>
            <div className="acts"><SortSelect q={q} /></div>
          </div>
          {(chips.length > 0 || q.min || q.max) && (
            <div className="chips-act">
              {chips.map(([label, patch]) => (
                <Link key={label} href={`/${deal}${catalogQueryString({ ...q, page: undefined }, patch)}`} aria-label={t('removeFilter', { f: label })}>{label} ✕</Link>
              ))}
              {(q.min || q.max) && (
                <Link href={`/${deal}${catalogQueryString({ ...q, page: undefined }, { min: undefined, max: undefined })}`}>
                  {q.min ? <>{ts('from')} <Price eur={q.min} /> </> : null}{q.max ? <>{ts('to')} <Price eur={q.max} /></> : null} ✕
                </Link>
              )}
              <Link className="clear" href={`/${deal}`}>{t('reset')}</Link>
            </div>
          )}
          {res.docs.length ? (
            <div className="grid2">
              {res.docs.map((p, i) => <PropertyCard key={p.id} p={p} priority={i < 2} />)}
            </div>
          ) : (
            <div className="empty">
              <b>{t('empty')}</b>
              <p className="hint">{t('emptyHint')}</p>
              <Link href={`/${deal}`} className="btn btn-dark">{t('reset')}</Link>
            </div>
          )}
          {pages.length > 1 && (
            <div className="more-wrap">
              <nav className="pages" aria-label={t('pagination')}>
                {pages.map((n) =>
                  n === res.page ? <span key={n} aria-current="page">{n}</span> : <Link key={n} href={`/${deal}${catalogQueryString(q, { page: n })}`}>{n}</Link>,
                )}
              </nav>
            </div>
          )}
        </section>
      </main>
      <section className="seo" aria-labelledby="seo-h">
        <div className="wrap cols">
          <div>
            <h2 id="seo-h">{hasFilters(q) ? title : t(deal === 'rent' ? 'seoRentTitle' : 'seoSaleTitle')}</h2>
            <p>{t(deal === 'rent' ? 'seoRentText' : 'seoSaleText')}</p>
          </div>
          <div>
            <h3>{t('byDistrict')}</h3>
            <div className="links">{districts.map((x) => <Link key={x.slug} href={`/${deal}?district=${x.slug}`}>{x.name}</Link>)}</div>
            <h3>{t('byType')}</h3>
            <div className="links">{(['apartment', 'penthouse', 'villa', 'duplex'] as const).map((k) => <Link key={k} href={`/${deal}?type=${k}`}>{t(`typesPlural.${k}`)}</Link>)}</div>
            <h3>{t('collections')}</h3>
            <div className="links">
              <Link href={`/${deal}?view=sea`}>{ts('seaView')}</Link>
              <Link href={`/${deal}?sea=100`}>{t('firstLine')}</Link>
              <Link href={`/${deal}?new=1`}>{ts('newBuild')}</Link>
              <Link href={`/${deal}?furn=1`}>{ts('furnished')}</Link>
              {deal === 'sale' ? <Link href="/rent">{t('rent')}</Link> : <Link href="/sale">{t('sale')}</Link>}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
