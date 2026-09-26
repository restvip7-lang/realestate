import '@/app/(frontend)/styles/property.css'

import Image from 'next/image'
import { notFound, permanentRedirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Costs, CostsLine } from '@/components/site/Costs'
import { Price } from '@/components/site/Currency'
import { FavButton } from '@/components/site/FavButton'
import { Gallery } from '@/components/site/Gallery'
import { PrintButton } from '@/components/site/PrintButton'
import { PropertyCard } from '@/components/site/PropertyCard'
import { ShareButton } from '@/components/site/ShareButton'
import { ViewForm } from '@/components/site/ViewForm'
import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { agentFor, districtOf, getCompany, getProperty, listTeam, mediaUrl, similarProperties } from '@/lib/data'
import { fmtDate, propertyPath, roomsHint, typeName } from '@/lib/format'
import { pageMeta, SITE_URL } from '@/lib/seo'
import type { Media } from '@/payload-types'

type Props = { params: Promise<{ locale: Locale; slug: string }> }

// страницы объектов строятся при первом заходе и кэшируются; правка в админке сбрасывает кэш (src/lib/revalidate.ts)
export const revalidate = 600
export function generateStaticParams() {
  return []
}

const idOf = (slug: string) => {
  const id = parseInt(slug, 10)
  return Number.isInteger(id) && id > 0 ? id : null
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  const id = idOf(slug)
  const p = id ? await getProperty(id, locale) : null
  if (!p) return {}
  const t = await getTranslations({ locale, namespace: 'property' })
  const d = districtOf(p)
  const tn = typeName(p.type, locale)
  return pageMeta(locale, propertyPath(p), {
    title: p.seo?.title || t('metaTitle', { title: p.title, district: d?.name ?? '', id: p.id }),
    description:
      p.seo?.description ||
      t(p.deal === 'rent' ? 'metaDescRent' : 'metaDesc', { type: tn, rooms: p.rooms ?? '', area: p.area ?? 0, sea: p.sea ?? 0, district: d?.name ?? '', id: p.id }),
    image: mediaUrl(p.photos?.[0], 'large'),
  })
}

export default async function PropertyPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const id = idOf(slug)
  const p = id ? await getProperty(id, locale) : null
  if (!p) notFound()
  // старый или неполный адрес → постоянный редирект на правильный (ID в адресе, slug можно менять)
  const canonical = propertyPath(p)
  if (`/property/${slug}` !== canonical) permanentRedirect(getPathname({ href: canonical, locale }))

  const [t, tc, company, team, similar] = await Promise.all([
    getTranslations('property'),
    getTranslations('card'),
    getCompany(locale),
    listTeam(locale),
    similarProperties(p, locale),
  ])
  const d = districtOf(p)
  const rent = p.deal === 'rent'
  const closed = p.status === 'sold' || p.status === 'rented'
  const tn = typeName(p.type, locale)
  const agent = agentFor(p, team)
  const agentImg = mediaUrl(agent?.photo, 'thumb')
  const photos = (p.photos || []).filter((m): m is Media => typeof m === 'object' && !!m?.url).map((m, i) => ({
    src: mediaUrl(m, 'large')!,
    full: m.url!,
    alt: m.alt || t('photoAlt', { type: tn, rooms: p.rooms ?? '', district: d?.name ?? '', n: i + 1 }),
  }))
  const url = `${SITE_URL}${getPathname({ href: canonical, locale })}`
  const wa = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(t('waText', { id: p.id, title: p.title, url }))}`
  const status = { reserved: t('reserved'), sold: t('sold'), rented: t('rented') }[p.status as string]
  const resale = !(p.condition !== 'resale' && p.source !== 'owner') // новостройка от застройщика — услуги агентства платит застройщик
  const feats = p.features?.length ? p.features : []
  const rentInfo = rent && p.rent ? { deposit: p.rent.deposit ?? p.price ?? 0, advance: p.rent.advance ?? 1, utilities: !!p.rent.utilities } : undefined
  const para = (p.description || '').split(/\n\s*\n/).filter(Boolean)
  const view = { sea: t('views.sea'), mountain: t('views.mountain'), castle: t('views.castle'), city: t('views.city') }[p.view || 'city']
  const furn = { yes: t('furn.yes'), no: t('furn.no'), partial: t('furn.partial') }[p.furnished || 'no']

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: p.title,
    url,
    image: photos.slice(0, 3).map((x) => (x.src.startsWith('http') ? x.src : `${SITE_URL}${x.src}`)),
    datePosted: p.createdAt,
    offers: {
      '@type': 'Offer',
      price: p.price,
      priceCurrency: 'EUR',
      availability: `https://schema.org/${closed ? 'SoldOut' : p.status === 'reserved' ? 'LimitedAvailability' : 'InStock'}`,
      businessFunction: rent ? 'http://purl.org/goodrelations/v1#LeaseOut' : 'http://purl.org/goodrelations/v1#Sell',
    },
    about: {
      '@type': p.type === 'villa' ? 'SingleFamilyResidence' : 'Apartment',
      numberOfRooms: p.rooms,
      floorSize: { '@type': 'QuantitativeValue', value: p.area, unitCode: 'MTK' },
      address: { '@type': 'PostalAddress', addressLocality: 'Alanya', addressRegion: 'Antalya', addressCountry: 'TR' },
    },
  }

  return (
    <>
      <main className="wrap pg-property">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
        <nav className="crumbs" aria-label={t('crumbs')}>
          <Link href="/">{t('home')}</Link>›<Link href={`/${p.deal}`}>{t(rent ? 'rent' : 'sale')}</Link>›
          {d && <><Link href={`/${p.deal}?district=${d.slug}`}>{d.name}</Link>›</>}
          <span aria-current="page">ID {p.id}</span>
        </nav>
        <div className="p-head">
          <div>
            {status && <span className="badge rent" style={{ display: 'inline-block', marginBottom: 10 }}>{status}</span>}
            <h1>{p.title}</h1>
            <div className="loc"><span>{d?.name}, {tc('alanya')}</span><span>{tc('toSea', { m: p.sea ?? 0 })}</span><span className="mono">ID {p.id}</span></div>
          </div>
          <div className="acts"><FavButton id={p.id} variant="page" /><ShareButton label={t('share')} done={t('copied')} title={p.title} /><PrintButton label={t('pdf')} className="btn btn-line btn-sm pdf" /></div>
        </div>
        <Gallery photos={photos} />
        <div className="p-grid">
          <div>
            <div className="facts">
              <div><span>{t('layout')}</span><b><abbr title={tc(roomsHint(p.rooms).key, roomsHint(p.rooms).values)} style={{ textDecoration: 'none' }}>{p.rooms}</abbr></b></div>
              <div><span>{t('area')}</span><b>{p.area} {tc('sqm')}</b></div>
              <div><span>{t('floor')}</span><b>{p.type === 'villa' ? tc('floors', { n: p.floors ?? 1 }) : t('floorOf', { floor: p.floor ?? 1, floors: p.floors ?? 1 })}</b></div>
              <div><span>{t('toSea')}</span><b>{p.sea} {t('m')}</b></div>
            </div>
            <div className="block">
              <h2>{t('params')}</h2>
              <dl className="params">
                <div><dt>{t('type')}</dt><dd>{tn}</dd></div>
                <div><dt>{t('deal')}</dt><dd>{t(rent ? 'rent' : 'sale')}</dd></div>
                <div><dt>{t('district')}</dt><dd>{d?.name}</dd></div>
                <div><dt>{t('furniture')}</dt><dd>{furn}</dd></div>
                <div><dt>{t('view')}</dt><dd>{view}</dd></div>
                {p.year ? <div><dt>{t('year')}</dt><dd>{p.year}</dd></div> : null}
                {p.complex ? <div><dt>{t('complex')}</dt><dd>{p.complex}</dd></div> : null}
                {rent && p.rent ? (
                  <>
                    <div><dt>{t('rentPeriod')}</dt><dd>{t(`periods.${p.rent.period || 'long'}` as never)}</dd></div>
                    <div><dt>{t('deposit')}</dt><dd><Price eur={p.rent.deposit ?? 0} /></dd></div>
                    <div><dt>{t('minTerm')}</dt><dd>{t('months', { n: p.rent.minTerm ?? 1 })}</dd></div>
                    <div><dt>{t('availableFrom')}</dt><dd>{fmtDate(p.rent.availableFrom, locale) || '—'}</dd></div>
                    <div><dt>{t('utilities')}</dt><dd>{t(p.rent.utilities ? 'utilIncluded' : 'utilSeparate')}</dd></div>
                    <div><dt>{t('pets')}</dt><dd>{t(p.rent.pets ? 'yes' : 'no')}</dd></div>
                  </>
                ) : (
                  <>
                    <div><dt>{t('source')}</dt><dd>{t(`sources.${p.source || 'developer'}` as never)}</dd></div>
                    <div><dt>{t('pricePerM2')}</dt><dd><Price eur={(p.price ?? 0) / (p.area || 1)} suffix={tc('perM2')} /></dd></div>
                    {p.installment?.months ? <div><dt>{t('installment')}</dt><dd>{t('installmentVal', { months: p.installment.months, down: p.installment.down ?? 0 })}</dd></div> : null}
                    {p.citizenship ? <div><dt>{t('citizenship')}</dt><dd>{t('yes')}</dd></div> : null}
                  </>
                )}
              </dl>
            </div>
            {para.length > 0 && (
              <div className="block desc"><h2>{t('description')}</h2>{para.map((x, i) => <p key={i}>{x}</p>)}</div>
            )}
            {feats.length > 0 && (
              <div className="block"><h2>{t('features')}</h2><div className="feats">{feats.map((f) => <span key={f}>{f}</span>)}</div></div>
            )}
            <div className="block">
              <h2>{t('location')}</h2>
              <div className="dist-list">
                <div><b>{p.sea} {t('m')}</b>{t('toSeaLower')}</div>
                <div><b>{d?.coastKm ? `${Math.abs(d.coastKm)} ${t('km')}` : t('center')}</b>{t('toCenter')}{d?.inland ? ` · ${t('inland')}` : ''}</div>
                {p.airport ? <div><b>{p.airport} {t('km')}</b>{t('toAirport')}</div> : null}
              </div>
              <p className="hint" style={{ marginTop: 8 }}>{t('addressNote')}</p>
              {d && <p style={{ marginTop: 10 }}><Link href={`/districts/${d.slug}`} className="link">{t('aboutDistrict', { name: d.name })}</Link></p>}
            </div>
            {!closed && (
              <div className="block" id="costs">
                <h2>{t(rent ? 'costsRent' : 'costsBuy')}</h2>
                <Costs price={p.price ?? 0} resale={resale} rent={rentInfo} />
              </div>
            )}
            <div className="block">
              <h2>{t('beforeBuy')}</h2>
              <div className="trustq">
                {(t.raw('trustq') as { q: string; a: string }[]).map((x) => <details key={x.q}><summary>{x.q}</summary><p>{x.a}</p></details>)}
                <p style={{ marginTop: 6 }}><Link href="/how-to-buy" className="link">{t('howToBuy')}</Link></p>
              </div>
            </div>
          </div>
          <aside className="side">
            <div className="pricebox">
              <span className="sub">{t(rent ? 'rent' : 'price')}</span>
              <span className="big"><Price eur={p.price ?? 0} suffix={rent ? tc('perMonth') : ''} /></span>
              {rent && p.rent ? (
                <span className="sub">{t('depositLine', { months: p.rent.minTerm ?? 1 })} <Price eur={p.rent.deposit ?? 0} /></span>
              ) : (
                <span className="sub"><Price eur={(p.price ?? 0) / (p.area || 1)} suffix={tc('perM2')} /></span>
              )}
              {!closed && <CostsLine price={p.price ?? 0} resale={resale} rent={rentInfo} />}
              {p.priceCheckedAt && (
                <div className="checked">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M5 12l4 4 10-10" /></svg>
                  <span><b>{t('checked')}</b><br />{fmtDate(p.priceCheckedAt, locale)} · {t('checkedNote')}</span>
                </div>
              )}
              {closed ? (
                <>
                  <p className="sub">{t(p.status === 'sold' ? 'soldNote' : 'rentedNote')}</p>
                  <a href="#similar" className="btn btn-coral">{t('seeSimilar')}</a>
                  <a href={wa} className="btn btn-wa" target="_blank" rel="noopener">{t('waSimilar')}</a>
                </>
              ) : (
                <>
                  <a href="#view" className="btn btn-coral">{t('book')}</a>
                  <a href={wa} className="btn btn-wa" target="_blank" rel="noopener">{t('askWa')}</a>
                </>
              )}
              {agent && (
                <div className="agent">
                  {agentImg && <Image src={agentImg} alt={agent.role} width={112} height={112} />}
                  <div><b><Link href={`/team/${agent.slug}`}>{agent.name}</Link></b><span>{agent.role}{d ? ` · ${d.name}` : ''}{agent.langs ? ` · ${agent.langs}` : ''}</span></div>
                </div>
              )}
            </div>
            {!closed && <ViewForm propertyId={p.id} />}
          </aside>
        </div>
      </main>
      {similar.length > 0 && (
        <section className="sec" style={{ background: 'var(--mist)' }} id="similar">
          <div className="wrap">
            <div className="sec-head">
              <div><span className="eyebrow">{t('similarEyebrow')}</span><h2>{closed ? t('similarForSale') : t('similarIn', { name: d?.name ?? '' })}</h2></div>
              <Link href={`/${p.deal}${d ? `?district=${d.slug}` : ''}`} className="link">{t('toCatalog')}</Link>
            </div>
            <div className="grid3">{similar.map((s) => <PropertyCard key={s.id} p={s} />)}</div>
          </div>
        </section>
      )}
    </>
  )
}
