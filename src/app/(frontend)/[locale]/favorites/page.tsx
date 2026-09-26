import '@/app/(frontend)/styles/pages.css'

import Image from 'next/image'
import { Fragment } from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Price } from '@/components/site/Currency'
import { type CmpItem, FavActions, FavCompare, FavSync } from '@/components/site/FavTools'
import { PropertyCard } from '@/components/site/PropertyCard'
import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { agentFor, allPublished, districtOf, getCompany, getPropertiesByIds, listTeam, mediaUrl } from '@/lib/data'
import { buyCosts } from '@/lib/costs'
import { fmtDate, propertyPath, typeName } from '@/lib/format'
import { pageMeta, SITE_URL } from '@/lib/seo'
import type { Property } from '@/payload-types'

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'favs' })
  return pageMeta(locale, '/favorites', { title: t('title'), description: t('metaDesc'), noindex: true })
}

const parseIds = (v: unknown) =>
  [...new Set(String(v ?? '').split(',').map(Number).filter((n) => Number.isInteger(n) && n > 0))].slice(0, 50)

export default async function FavoritesPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const sp = await searchParams
  const ids = parseIds(sp.ids)
  const shared = ids.length > 0 && sp.my !== '1' // подборка по ссылке (от эксперта или друга)
  const [t, tc, tcard, company, list, team] = await Promise.all([
    getTranslations('favs'), getTranslations('catalog'), getTranslations('card'), getCompany(locale), getPropertiesByIds(ids, locale), listTeam(locale),
  ])
  const need = list.length === 0 || (!shared && list.length < 4)
  const published = need ? await allPublished(locale) : []
  const ST: Record<string, string | undefined> = { reserved: t('reserved'), sold: t('sold'), rented: t('rented') }
  const url = (p: Property) => `${SITE_URL}${getPathname({ href: propertyPath(p), locale })}`
  const title = (p: Property) => `${typeName(p.type, locale)} ${p.rooms ?? ''}, ${districtOf(p)?.name ?? ''}`
  const ld = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [[tc('home'), '/'], [t('title'), '/favorites']].map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${getPathname({ href: p, locale })}` })) }
  const h1 = shared ? t('sharedTitle', { n: list.length }) : list.length ? t('titleN', { n: list.length }) : t('title')

  let body: React.ReactNode
  if (!list.length) {
    const fresh = published.filter((p) => p.deal === 'sale').slice(0, 3)
    body = (
      <>
        <div className="empty" style={{ marginBottom: 32 }}>
          <b>{shared ? t('emptyShared') : t('emptyTitle')}</b>
          {t('emptyText')}
          <br />
          <Link href="/sale" className="btn btn-dark btn-sm" style={{ marginTop: 14 }}>{t('toCatalog')}</Link>
        </div>
        <div className="sec-head"><div><span className="eyebrow">{t('freshEyebrow')}</span><h2>{t('freshTitle')}</h2></div></div>
        <div className="grid3">{fresh.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
      </>
    )
  } else {
    const lines = list.map((p) => `• ID ${p.id} — ${title(p)} — ${url(p)}`).join('\n')
    const wa = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(`${t('waText')}\n${lines}`)}`
    const more = !shared && list.length < 4 ? published.filter((p) => p.deal === list[0].deal && !ids.includes(p.id)).slice(0, 3) : []
    body = (
      <>
        {shared && (
          <div className="shared"><span><b>{t('sharedNote', { n: list.length })}</b> {t('sharedSave')}</span><Link href="/favorites" className="btn btn-line btn-sm">{t('mine')}</Link></div>
        )}
        <div className="fbar">
          <span className="hint">{t('count', { n: list.length })}{list.some((p) => ST[p.status ?? '']) && ` · ${t('someGone')}`}</span>
          <FavActions ids={list.map((p) => p.id)} shared={shared} wa={wa} />
        </div>
        <div className="grid3">{list.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
        {more.length > 0 && (
          <>
            <div className="sec-head" style={{ marginTop: 40 }}>
              <div><span className="eyebrow">{t('moreEyebrow')}</span><h2>{t('moreTitle')}</h2></div>
              <Link href={list[0].deal === 'rent' ? '/rent' : '/sale'} className="link">{t('allCatalog')}</Link>
            </div>
            <div className="grid3">{more.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
          </>
        )}
      </>
    )
  }

  // сравнение: ячейки рисуем на сервере, выбор столбцов и подсветку лучшего делает клиент
  const rows: { label: string; best?: 'min' | 'max' }[] = [
    { label: t('rows.price'), best: 'min' }, { label: t('rows.ppm'), best: 'min' }, { label: t('rows.costs'), best: 'min' },
    { label: t('rows.district') }, { label: t('rows.type') }, { label: t('rows.area'), best: 'max' }, { label: t('rows.floor') },
    { label: t('rows.sea'), best: 'min' }, { label: t('rows.view') }, { label: t('rows.furniture') }, { label: t('rows.condition') },
    { label: t('rows.checked') }, { label: t('rows.expert') }, { label: t('rows.status') },
  ]
  const items: CmpItem[] = list.map((p) => {
    const rent = p.deal === 'rent'
    const price = p.price ?? 0
    const area = p.area || 1
    const d = districtOf(p)
    const agent = agentFor(p, team)
    const costs = rent ? null : buyCosts(price, { resale: !(p.condition !== 'resale' && p.source !== 'owner') }).total
    const cover = mediaUrl((p.photos || []).find((m) => typeof m === 'object'), 'card')
    return {
      id: p.id,
      deal: p.deal,
      chip: `ID ${p.id} · ${title(p)}`,
      head: (
        <>
          {cover && <Image src={cover} alt="" width={400} height={300} sizes="220px" />}
          <Link href={propertyPath(p)}>{p.title}</Link>
          <span className="id">ID {p.id}</span>
        </>
      ),
      cells: [
        <Price key="p" eur={price} suffix={rent ? tcard('perMonth') : ''} />,
        rent ? '—' : <Price key="m" eur={price / area} suffix={tcard('perM2')} />,
        costs == null ? '—' : <Price key="c" eur={costs} />,
        d ? <><Link href={`/districts/${d.slug}`} className="link">{d.name}</Link>{d.inland && ` · ${t('inland')}`}</> : '—',
        `${typeName(p.type, locale)} ${p.rooms ?? ''}`,
        `${p.area ?? '—'} ${t('m2')}`,
        p.type === 'villa' ? t('floors', { n: p.floors ?? 1 }) : t('floorOf', { floor: p.floor ?? '—', floors: p.floors ?? '—' }),
        `${p.sea ?? '—'} ${t('m')}`,
        p.view === 'sea' ? t('viewSea') : t('viewOther'),
        p.furnished === 'yes' || p.furnished === 'partial' ? t('yes') : t('no'),
        p.condition === 'resale' ? t('resale') : t('newBuild'),
        fmtDate(p.priceCheckedAt, locale) || '—',
        agent ? (agent.slug ? <Link href={`/team/${agent.slug}`} className="link">{agent.name}</Link> : agent.name) : '—',
        ST[p.status ?? ''] ?? (rent ? t('forRent') : t('onSale')),
      ].map((c, i) => <Fragment key={i}>{c}</Fragment>),
      vals: [price, rent ? null : price / area, costs, null, null, p.area ?? null, null, p.sea ?? null, null, null, null, null, null, null],
    }
  })

  return (
    <main className="pg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      {!shared && <FavSync current={ids.join(',')} />}
      <section className="dhero short">
        <div className="wrap">
          <nav className="crumbs" aria-label={tc('crumbs')}><Link href="/">{tc('home')}</Link>›<span aria-current="page">{t('title')}</span></nav>
          <span className="eyebrow">{t('title')}</span>
          <h1>{h1}</h1>
          <p className="lead-t">{t('lead')}</p>
        </div>
      </section>
      <section className="sec">
        <div className="wrap">{body}</div>
      </section>
      {items.length >= 2 && (
        <section className="sec" style={{ background: 'var(--mist)' }} id="compare">
          <div className="wrap">
            <div className="sec-head"><div><span className="eyebrow">{t('cmpEyebrow')}</span><h2>{t('cmpTitle')}</h2></div><p>{t('cmpLead')}</p></div>
            <FavCompare key={ids.join(',')} items={items} rows={rows} shared={shared} />
          </div>
        </section>
      )}
    </main>
  )
}
