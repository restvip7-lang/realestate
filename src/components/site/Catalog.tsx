import '@/app/(frontend)/styles/catalog.css'

import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { PROPERTY_TYPES, type PropertyType } from '@/lib/catalog'
import { catalogBasePath, catalogHref, hasQueryParams, LANDING_KEYS, LANDINGS, landingFits, landingOf } from '@/lib/catalog-params'
import { type CatalogQuery, districtOf, landingSamples, listDistricts, listProperties, mapProperties, propertyCover } from '@/lib/data'
import { propertyPath } from '@/lib/format'
import { abs, breadcrumbLd, JsonLd } from '@/lib/jsonld'
import type { SeoPage } from '@/payload-types'
import { INDEX_MIN, landingMatrix } from '@/lib/landings'

import { CatalogFilters, SortSelect } from './CatalogFilters'
import { CatalogLayout, type MapPoint } from './CatalogMap'
import { Price } from './Currency'
import { PrintButton } from './PrintButton'
import { PropertyCard } from './PropertyCard'

const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1)

/** Заголовок каталога: «Квартиры в Махмутларе», «Аренда вилл» и т. п. */
export async function catalogTitle(locale: Locale, q: CatalogQuery) {
  const t = await getTranslations({ locale, namespace: 'catalog' })
  const districts = await listDistricts(locale)
  const d = districts.find((x) => x.slug === q.district)
  const type = q.type && PROPERTY_TYPES[q.type as PropertyType]?.plural[locale]
  const f = landingOf(q)
  const phrase = f ? ` ${t(`landing.${f}` as never)}` : ''
  const what = (type || t(q.deal === 'rent' ? 'rentAll' : 'saleAll')) + phrase
  const where = d ? t('inDistrict', { where: d.nameIn || d.name }) : t('inAlanya')
  return q.deal === 'rent' && type ? t('rentOf', { what: type + phrase, where }) : `${what} ${where}`
}

export async function Catalog({ locale, q, seo }: { locale: Locale; q: CatalogQuery; seo?: SeoPage | null }) {
  const t = await getTranslations('catalog')
  const ts = await getTranslations('search')
  const tf = await getTranslations('favs')
  const deal = q.deal || 'sale'
  const districts = await listDistricts(locale)
  const [res, all, samples] = await Promise.all([listProperties(locale, { ...q, limit: 24 }, districts), mapProperties(locale, q, districts), landingSamples()])
  // перелинковка — только на ЧПУ-страницы, где не меньше INDEX_MIN объектов (пороги ТЗ)
  const live = new Map(landingMatrix(samples, districts).filter((x) => x.n >= INDEX_MIN).map((x) => [x.path, x.n]))
  const ok = (x: CatalogQuery) => live.has(catalogBasePath(x))
  const f = landingOf(q)
  const base = { deal, district: q.district, type: q.type }
  // страница за пределами списка (/page-9 при двух страницах) — 404, а не пустой каталог
  if (q.page && q.page > 1 && q.page > res.totalPages) notFound()
  const points: MapPoint[] = all
    .filter((p) => p.lat && p.lng)
    .map((p) => ({
      id: p.id,
      href: getPathname({ href: propertyPath(p), locale }),
      lat: p.lat!,
      lng: p.lng!,
      eur: p.price ?? 0,
      deal: p.deal,
      hint: [districtOf(p)?.name, p.rooms, p.area && `${p.area} ${tf('m2')}`].filter(Boolean).join(' · '),
      title: p.title,
      img: propertyCover(p, 'thumb')?.src ?? null,
    }))
  const title = await catalogTitle(locale, q)
  // H1 и SEO-текст из админки — только на самом разделе: без фильтров в параметрах, текст — на первой странице
  const own = seo && !hasQueryParams(q) ? seo : null
  const ownText = own?.text && !(q.page && q.page > 1) ? own.text.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean) : null
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
  if (q.floor) chips.push([t(`floors.${q.floor}`), { floor: undefined }])
  if (q.owner) chips.push([t('owner'), { owner: false }])
  if (q.video) chips.push([t('video'), { video: false }])
  if (q.pets) chips.push([t('pets'), { pets: false }])
  if (q.pool) chips.push([t('poolChip'), { pool: false }])
  const pages = Array.from({ length: res.totalPages }, (_, i) => i + 1)
  // ItemList объектов страницы и хлебные крошки (ТЗ, JSON-LD каталога)
  const ld = [
    breadcrumbLd([[t('home'), '/'], [t(deal), catalogBasePath({ deal })], ...(d ? [[d.name, catalogBasePath({ deal, district: d.slug })] as [string, string]] : []), ...(q.type || f ? [[title, catalogBasePath({ ...q, page: undefined })] as [string, string]] : [])], locale),
    {
      '@context': 'https://schema.org', '@type': 'ItemList', name: title, numberOfItems: res.totalDocs,
      itemListElement: res.docs.map((p, i) => ({ '@type': 'ListItem', position: (res.page! - 1) * 24 + i + 1, url: abs(propertyPath(p), locale), name: p.title })),
    },
  ]

  return (
    <>
      <JsonLd data={ld} />
      <CatalogFilters q={q} districts={districts.map((x) => ({ slug: x.slug, name: x.name }))} />
      <CatalogLayout points={points}>
        <section className="listcol" aria-labelledby="h1">
          <div className="print-head"><b>Kleo Homes · {title}</b><span>{new Date().toLocaleDateString(locale)}</span></div>
          <nav className="crumbs" aria-label={t('crumbs')}>
            <Link href="/">{t('home')}</Link>›
            {d ? <><Link href={catalogBasePath({ deal })}>{t(deal)}</Link>›<span aria-current="page">{d.name}</span></> : <span aria-current="page">{t(deal)}</span>}
          </nav>
          <div className="res-head">
            <div>
              <h1 id="h1">{own?.h1 || title}</h1>
              <div className="cnt" aria-live="polite">{t('found', { n: res.totalDocs })}</div>
            </div>
            <div className="acts"><SortSelect q={q} /><PrintButton label={tf('print')} className="btn btn-line btn-sm btn-pdf" /></div>
          </div>
          {(chips.length > 0 || q.min || q.max) && (
            <div className="chips-act">
              {chips.map(([label, patch]) => (
                <Link key={label} href={catalogHref({ ...q, page: undefined }, patch)} aria-label={t('removeFilter', { f: label })}>{label} ✕</Link>
              ))}
              {(q.min || q.max) && (
                <Link href={catalogHref({ ...q, page: undefined }, { min: undefined, max: undefined })}>
                  {q.min ? <>{ts('from')} <Price eur={q.min} /> </> : null}{q.max ? <>{ts('to')} <Price eur={q.max} /></> : null} ✕
                </Link>
              )}
              <Link className="clear" href={catalogBasePath({ deal })}>{t('reset')}</Link>
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
              {/* 0 объектов на ЧПУ — альтернативы из ТЗ: без признака, без района */}
              <div className="alts">
                {f && ok(base) && <Link href={catalogBasePath(base)} className="link">{t('altNoFeature')}: {await catalogTitle(locale, base)}</Link>}
                {q.district && ok({ ...base, district: undefined }) && <Link href={catalogBasePath({ ...base, district: undefined, ...(f ? LANDINGS[f].patch : {}) })} className="link">{t('altAllAlanya')}</Link>}
              </div>
              <Link href={catalogBasePath({ deal })} className="btn btn-dark">{t('reset')}</Link>
            </div>
          )}
          {pages.length > 1 && (
            <div className="more-wrap">
              <nav className="pages" aria-label={t('pagination')}>
                {pages.map((n) =>
                  n === res.page ? <span key={n} aria-current="page">{n}</span> : <Link key={n} href={catalogHref(q, { page: n })}>{n}</Link>,
                )}
              </nav>
            </div>
          )}
        </section>
      </CatalogLayout>
      <section className="cat-seo" aria-labelledby="seo-h">
        <div className="wrap cols">
          <div>
            <h2 id="seo-h">{hasQueryParams(q) || q.district || q.type || f ? title : t(deal === 'rent' ? 'seoRentTitle' : 'seoSaleTitle')}</h2>
            {ownText ? ownText.map((x, i) => <p key={i}>{x}</p>) : <p>{t(deal === 'rent' ? 'seoRentText' : 'seoSaleText')}</p>}
          </div>
          <div>
            <h3>{t('byDistrict')}</h3>
            <div className="links">{districts.filter((x) => ok({ deal, district: x.slug, type: q.type })).map((x) => <Link key={x.slug} href={catalogBasePath({ deal, district: x.slug, type: q.type })}>{x.name}</Link>)}</div>
            <h3>{t('byType')}</h3>
            <div className="links">{(['apartment', 'penthouse', 'villa', 'duplex', 'project'] as const).filter((k) => ok({ deal, district: q.district, type: k })).map((k) => <Link key={k} href={catalogBasePath({ deal, district: q.district, type: k })}>{t(`typesPlural.${k}`)}</Link>)}</div>
            <h3>{t('landingsTitle')}</h3>
            <div className="links">
              {LANDING_KEYS.filter((k) => landingFits(k, deal) && k !== f && ok({ ...base, ...LANDINGS[k].patch })).map((k) => (
                <Link key={k} href={catalogBasePath({ ...base, ...LANDINGS[k].patch })}>{cap(t(`landing.${k}` as never))}</Link>
              ))}
              {deal === 'sale' ? <Link href={catalogBasePath({ deal: 'rent', district: q.district })}>{t('rent')}</Link> : <Link href={catalogBasePath({ deal: 'sale', district: q.district })}>{t('sale')}</Link>}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
