import '@/app/(frontend)/styles/pages.css'

import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { CoastMap } from '@/components/site/CoastMap'
import { Price } from '@/components/site/Currency'
import { DealTabs } from '@/components/site/DealTabs'
import { DistrictCard } from '@/components/site/DistrictCard'
import { PropertyCard } from '@/components/site/PropertyCard'
import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { aytKm, gzpKm } from '@/lib/coast'
import { districtProperties, districtStats, getDistrict, listDistricts, mediaUrl } from '@/lib/data'
import { pageMeta, SITE_URL } from '@/lib/seo'
import type { District, Property } from '@/payload-types'

type Props = { params: Promise<{ locale: Locale; slug: string }> }

// страницы районов строятся при первом заходе и кэшируются; правка в админке сбрасывает кэш
export const revalidate = 600
export function generateStaticParams() {
  return []
}

const pos = (d: District) => d.coastKm ?? 0
const km = (d: District) => Math.abs(pos(d))
const minOf = (a: number[]) => (a.length ? Math.min(...a) : 0)
const rentFromOf = (d: District, rent: Property[]) => minOf(rent.map((o) => o.price ?? 0)) || Math.round(((d.pricePerM2 ?? 0) * 0.38) / 10) * 10
const ROOMS = ['1+0', '1+1', '2+1', '3+1', '4+1', '5+1']
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  const d = await getDistrict(slug, locale)
  if (!d) return {}
  const t = await getTranslations({ locale, namespace: 'districts' })
  const stats = await districtStats()
  return pageMeta(locale, `/districts/${d.slug}`, {
    title: t('metaTitle', { name: d.name }),
    description: t('metaDesc', { lead: d.lead || d.about || '', name: d.name, n: stats[d.id]?.sale ?? 0 }),
    image: mediaUrl(d.image, 'large'),
  })
}

export default async function DistrictPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const d = await getDistrict(slug, locale)
  if (!d) notFound()
  const [t, tc, tcard, districts, objs, stats] = await Promise.all([
    getTranslations('districts'),
    getTranslations('catalog'),
    getTranslations('card'),
    listDistricts(locale),
    districtProperties(d.id, locale),
    districtStats(),
  ])
  const sale = objs.filter((o) => o.deal !== 'rent')
  const rent = objs.filter((o) => o.deal === 'rent')
  const where = tc('inDistrict', { where: d.nameIn || d.name })
  const rentFrom = rentFromOf(d, rent)
  const seaTxt = d.inland ? (d.slug === 'tepe' ? t('seaTepe') : t('seaInland')) : objs.length ? t('seaFrom', { m: minOf(objs.map((o) => o.sea ?? 0)) }) : t('seaNear')
  const nbrs = districts
    .filter((x) => x.slug !== d.slug)
    .sort((a, b) => Math.abs(pos(a) - pos(d)) - Math.abs(pos(b) - pos(d)) || (a.inland === d.inland ? -1 : 1))
    .slice(0, 3)
  const x = d.schema?.x ?? 500, y = d.schema?.y ?? 200
  const vb = `${clamp(x - 260, 0, 480)} ${clamp(y - 150, 0, 160)} 520 280`
  const img = mediaUrl(d.image, 'large')
  const sc = d.scores || {}
  const SC = ['life', 'rent', 'beach', 'infra', 'quiet'] as const

  // цены по планировкам (по объектам каталога)
  const rows = ROOMS.map((r) => {
    const list = sale.filter((o) => o.rooms === r)
    if (!list.length) return null
    const ppm = list.reduce((s, o) => s + (o.price ?? 0) / (o.area || 1), 0) / list.length
    return { r, n: list.length, from: minOf(list.map((o) => o.price ?? 0)), ppm, q: r === '4+1' || r === '5+1' ? '4+' : r }
  }).filter((v): v is NonNullable<typeof v> => !!v)

  // текстовые цены для FAQ (в евро: FAQ попадает в JSON-LD, валюта посетителя там не нужна)
  const eur = (n: number) => `${Math.round(n).toLocaleString('ru-RU').replace(/[  ]/g, ' ')} €`
  const rentScore = sc.rent ?? 0
  const faq: [string, string][] = [
    [t('faq.priceQ', { where }), t('faq.priceA', { inCatalog: sale.length ? t('faq.priceInCatalog', { n: sale.length, from: eur(minOf(sale.map((o) => o.price ?? 0))) }) : '', pm: eur(d.pricePerM2 ?? 0) })],
    [t('faq.rentQ', { where }), t('faq.rentA', { rent: eur(rentFrom) })],
    [t('faq.vnzhQ', { where }), t('faq.vnzhA')],
    [t('faq.airportQ'), t('faq.airportA', { gzp: gzpKm(d), ayt: aytKm(d) })],
    [t('faq.rentabilityQ', { name: d.name }), rentScore >= 4 ? t('faq.rentabilityHigh', { where }) : rentScore === 3 ? t('faq.rentabilityMid') : t('faq.rentabilityLow', { name: d.name })],
  ]
  const url = (p: string) => `${SITE_URL}${getPathname({ href: p, locale })}`
  const ld = [
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [[tc('home'), '/'], [t('crumbs'), '/districts'], [d.name, `/districts/${d.slug}`]].map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: url(p) })),
    },
    {
      '@context': 'https://schema.org', '@type': 'Place', name: `${d.name}, Alanya`, description: d.lead,
      ...(d.lat && d.lng ? { geo: { '@type': 'GeoCoordinates', latitude: d.lat, longitude: d.lng } } : {}),
      containedInPlace: { '@type': 'City', name: 'Alanya' },
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ]
  const grid = (list: Property[], deal: 'sale' | 'rent') =>
    list.length ? (
      <>
        <div className="grid3 limit4">{list.slice(0, 6).map((p) => <PropertyCard key={p.id} p={p} />)}</div>
        <div className="res-actions">
          <Link href={`/${deal}?district=${d.slug}`} className="btn btn-dark">{t('allInCatalog', { n: list.length })}</Link>
        </div>
      </>
    ) : (
      <div className="empty">
        <b>{t(deal === 'rent' ? 'emptyRent' : 'emptySale', { where })}</b>
        <span className="hint">{t('emptyHint')}</span>
        <a href="#lead" className="btn btn-coral btn-sm">{t('ctaPick', { where })}</a>
      </div>
    )

  return (
    <main className="pg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <section className="dhero">
        <div className="wrap">
          <nav className="crumbs" aria-label={tc('crumbs')}>
            <Link href="/">{tc('home')}</Link>›<Link href="/districts">{t('crumbs')}</Link>›<span aria-current="page">{d.name}</span>
          </nav>
          <div className="dhero-grid">
            <div className="dhero-txt">
              <span className="eyebrow">{t('guideOne')}{d.inland && <span className="tag-inland">{t('inlandShort')}</span>}</span>
              <h1>{t('h1', { name: d.name })}</h1>
              {d.lead && <p className="lead-t">{d.lead}</p>}
              <div className="cta">
                <Link href={`/sale?district=${d.slug}`} className="btn btn-coral">{t('ctaObjects', { n: sale.length })}</Link>
                <a href="#lead" className="btn btn-ghost">{t('ctaPick', { where })}</a>
              </div>
            </div>
            <div className="dhero-ph">
              {img && <Image src={img} alt={t('photoAlt', { name: d.name })} width={1100} height={733} priority sizes="(max-width: 760px) 100vw, 50vw" />}
              <span className="cap">{t('photoCap')}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="kfacts" role="list" aria-label={t('kf.label')}>
          <div role="listitem">
            <span>{t('kf.toCenter')}</span><b>{km(d) ? t('km', { n: km(d) }) : t('kf.isCenter')}</b>
            <small>{pos(d) < 0 ? t('kf.west') : pos(d) > 0 ? (d.inland ? t('kf.mountains') : t('kf.east')) : t('kf.castle')}</small>
          </div>
          <div role="listitem"><span>{t('kf.toSea')}</span><b>{seaTxt}</b><small>{d.inland ? t('kf.serpentine') : t('kf.byCatalog')}</small></div>
          <div role="listitem"><span>{t('kf.gzp')}</span><b>≈ {t('km', { n: gzpKm(d) })}</b><small>{t('kf.gzpName')}</small></div>
          <div role="listitem"><span>{t('kf.ayt')}</span><b>≈ {t('km', { n: aytKm(d) })}</b><small>{t('kf.aytName')}</small></div>
          <div role="listitem"><span>{t('kf.pm')}</span><b><Price eur={d.pricePerM2 || 0} suffix={tcard('perM2')} /></b><small>{t('kf.pmNote')}</small></div>
          <div role="listitem"><span>{t('kf.inCatalog')}</span><b>{sale.length} / {rent.length}</b><small>{t('kf.saleRent')}</small></div>
        </div>
      </div>

      <section className="sec">
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">{t('fitEyebrow')}</span><h2>{t('fitTitle', { name: d.name })}</h2></div></div>
          <div className="fit">
            <div className="scores">
              <h3>{t('scoresTitle')}</h3>
              {SC.map((k) => {
                const n = sc[k] ?? 0
                return (
                  <div className="sc-row" key={k}>
                    <span>{t(`scores.${k}`)}</span>
                    <span className="sc-bar" role="img" aria-label={`${t(`scores.${k}`)}: ${t('outOf5', { n })}`}><i style={{ width: `${n * 20}%` }} /></span>
                    <b>{n}/5</b>
                  </div>
                )
              })}
              <p className="hint">{t('scoresNote')}</p>
            </div>
            <div className="pc">
              {!!d.pros?.length && <div><h3>{t('pros')}</h3><ul>{d.pros.map((p) => <li key={p.id}>{p.text}</li>)}</ul></div>}
              {!!d.cons?.length && <div className="minus"><h3>{t('cons')}</h3><ul>{d.cons.map((p) => <li key={p.id}>{p.text}</li>)}</ul></div>}
            </div>
          </div>
          {!!d.infra?.length && (
            <>
              <h3 style={{ fontSize: 18, marginTop: 32 }}>{t('nearby')}</h3>
              <div className="infra">{d.infra.map((x) => <span key={x.id}>{x.text}</span>)}</div>
            </>
          )}
        </div>
      </section>

      <section className="sec" style={{ background: 'var(--mist)' }} id="objects">
        <div className="wrap">
          <DealTabs
            head={<div><span className="eyebrow">{t('objEyebrow')}</span><h2>{t('objTitle', { where })}</h2></div>}
            label={t('dealLabel')}
            tabs={[t('tabSale', { n: sale.length }), t('tabRent', { n: rent.length })]}
          >
            {grid(sale, 'sale')}
            {grid(rent, 'rent')}
          </DealTabs>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">{t('pricesEyebrow')}</span><h2>{t('pricesTitle', { where })}</h2></div></div>
          <div className="pm-grid">
            <div>
              {rows.length ? (
                <table className="ptable">
                  <caption className="vh">{t('pricesCaption')}</caption>
                  <thead>
                    <tr><th scope="col">{t('pt.layout')}</th><th scope="col" className="num">{t('pt.count')}</th><th scope="col" className="num">{t('pt.from')}</th><th scope="col" className="num">{t('pt.avg')}</th></tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.r}>
                        <td><Link href={`/sale?district=${d.slug}&rooms=${encodeURIComponent(r.q)}`}>{r.r === '1+0' ? t('studio') : r.r}</Link></td>
                        <td className="num">{r.n}</td>
                        <td className="num"><Price eur={r.from} /></td>
                        <td className="num"><Price eur={r.ppm} suffix={tcard('perM2')} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty"><span>{t('noPrices', { pm: eur(d.pricePerM2 ?? 0) })}</span></div>
              )}
              <p className="hint" style={{ marginTop: 10 }}>{t('pricesNote', { rent: eur(rentFrom) })}</p>
            </div>
            <div className="map-box">
              <CoastMap districts={districts} locale={locale} current={d.slug} labels={nbrs.map((n) => n.slug)} viewBox={vb} zoom label={t('mapZoomLabel', { name: d.name })} />
              <span className="map-note"><span>{t('mapScale')}</span></span>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: 'var(--mist)' }}>
        <div className="wrap">
          <div className="sec-head">
            <div><span className="eyebrow">{t('nbrEyebrow')}</span><h2>{t('nbrTitle')}</h2></div>
            <Link href="/districts" className="link">{t('allDistricts', { n: districts.length })}</Link>
          </div>
          <div className="dgrid nbr">{nbrs.map((n) => <DistrictCard key={n.slug} d={n} sale={stats[n.id]?.sale ?? 0} />)}</div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap faq">
          <div>
            <span className="eyebrow">{t('faqEyebrow')}</span>
            <h2 style={{ marginTop: 8 }}>{t('faqTitle', { name: d.name })}</h2>
            <p className="hint" style={{ marginTop: 10 }}>{t('faqHint')} <a href="#lead" className="link">{t('faqAsk')}</a></p>
          </div>
          <div>
            {faq.map(([q, a], i) => <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>)}
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap seo">
          <h2>{t('seoTitle', { where })}</h2>
          <p>{t('seo1', { lead: d.lead || '', pm: eur(d.pricePerM2 ?? 0), rent: eur(rentFrom) })}</p>
          <p>{t('seo2', { name: d.name })}</p>
          <div className="links">
            <Link href={`/sale?district=${d.slug}&type=apartment`}>{t('seoApartments', { where })}</Link>
            {sale.some((o) => o.type === 'villa') && <Link href={`/sale?district=${d.slug}&type=villa`}>{t('seoVillas', { where })}</Link>}
            {sale.some((o) => o.condition !== 'resale') && <Link href={`/sale?district=${d.slug}&new=1`}>{t('seoNew', { where })}</Link>}
            <Link href={`/rent?district=${d.slug}`}>{t('seoRent', { where })}</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
