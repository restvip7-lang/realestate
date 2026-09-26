import '@/app/(frontend)/styles/pages.css'

import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { DistrictCard } from '@/components/site/DistrictCard'
import { PostCard } from '@/components/site/PostCard'
import { PropertyCard } from '@/components/site/PropertyCard'
import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { agentFor, allPublished, districtStats, getCompany, getMember, listPosts, listReviews, listTeam, mediaUrl } from '@/lib/data'
import { fmtDate } from '@/lib/format'
import { pageMeta, SITE_URL } from '@/lib/seo'
import type { District } from '@/payload-types'

type Props = { params: Promise<{ locale: Locale; slug: string }> }

export const revalidate = 600
export function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  const m = await getMember(slug, locale)
  if (!m) return {}
  const t = await getTranslations({ locale, namespace: 'member' })
  return pageMeta(locale, `/team/${m.slug}`, {
    title: t('metaTitle', { name: m.name, role: m.role.toLowerCase() }),
    description: t('metaDesc', { name: m.name, role: m.role.toLowerCase(), years: t('years', { n: m.exp ?? 0 }), langs: m.langs ?? '', spec: m.spec ?? '' }),
    image: mediaUrl(m.photo, 'card'),
  })
}

export default async function MemberPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const m = await getMember(slug, locale)
  if (!m) notFound()
  const [t, tc, company, team, props, arts, reviews, stats] = await Promise.all([
    getTranslations('member'), getTranslations('catalog'), getCompany(locale), listTeam(locale), allPublished(locale),
    listPosts(locale, { kind: 'article', author: m.id, limit: 3 }), listReviews(), districtStats(),
  ])
  // объекты эксперта — как на странице объекта; основатель ведёт виллы и премиум, юрист объектов не ведёт
  const objs = m.kind === 'founder'
    ? props.filter((o) => o.deal === 'sale' && (o.type === 'villa' || (o.price ?? 0) >= 250000))
    : m.kind === 'lawyer' ? [] : props.filter((o) => agentFor(o, team)?.id === m.id)
  const revs = reviews.filter((r) => (typeof r.expert === 'object' ? r.expert?.id : r.expert) === m.id)
  const areas = (m.areas || []).filter((a): a is District => typeof a === 'object')
  const img = mediaUrl(m.photo, 'large')
  const wa = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(t('waHello', { name: m.name }))}`
  const tel = company.phone.replace(/[^+\d]/g, '')
  const url = (p: string) => `${SITE_URL}${getPathname({ href: p, locale })}`
  const ld = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [[tc('home'), '/'], [t('crumbs'), '/team'], [m.name, `/team/${m.slug}`]].map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: url(p) })) },
    {
      '@context': 'https://schema.org', '@type': 'Person', name: m.name, jobTitle: m.role, description: m.bio, knowsLanguage: (m.langs || '').split(' · '),
      knowsAbout: areas.map((d) => `${d.name}, Alanya`), worksFor: { '@type': 'RealEstateAgent', name: 'Kleo Homes', telephone: company.phone }, url: url(`/team/${m.slug}`),
    },
  ]

  return (
    <main className="pg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <section className="mhero">
        <div className="wrap">
          <nav className="crumbs" aria-label={tc('crumbs')}><Link href="/">{tc('home')}</Link>›<Link href="/team">{t('crumbs')}</Link>›<span aria-current="page">{m.name}</span></nav>
          <div className="mhero-grid">
            {img ? <Image src={img} alt={t('photoAlt', { name: m.name })} width={600} height={750} priority sizes="(max-width: 760px) 220px, 300px" /> : <div />}
            <div>
              <span className="eyebrow">{m.kind === 'founder' ? t('founder') : t('expert')}</span>
              <h1>{m.name}</h1>
              <span className="role">{t('meta', { role: m.role, n: m.exp ?? 0, langs: m.langs ?? '' })}</span>
              {m.spec && <p className="spec">{m.spec}</p>}
              {areas.length > 0 && <div className="areas" aria-label={t('areasLabel')}>{areas.map((d) => <Link key={d.slug} href={`/districts/${d.slug}`}>{d.name}</Link>)}</div>}
              <div className="cta">
                <a href={wa} className="btn btn-wa" target="_blank" rel="noopener">{t('wa')}</a>
                <a href="#lead" className="btn btn-coral">{t('consult')}</a>
                <a href={`tel:${tel}`} className="btn btn-ghost">{company.phone}</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="kfacts k4" role="list" aria-label={t('factsLabel')}>
          <div role="listitem"><span>{t('exp')}</span><b>{t('years', { n: m.exp ?? 0 })}</b><small>{t('inRealty')}</small></div>
          <div role="listitem"><span>{t('langs')}</span><b>{m.langs}</b><small>{t('langsNote')}</small></div>
          <div role="listitem">
            <span>{m.kind === 'lawyer' ? t('checks') : t('leads')}</span>
            <b>{m.kind === 'lawyer' ? t('everyDeal') : objs.length}</b>
            <small>{m.kind === 'lawyer' ? t('beforeBooking') : t('inCatalogNow')}</small>
          </div>
          <div role="listitem"><span>{t('articles')}</span><b>{arts.totalDocs}</b><small>{arts.totalDocs ? t('inJournal') : t('noneYet')}</small></div>
        </div>
      </div>

      <section className="sec">
        <div className="wrap cols2">
          <div className="box"><h3>{t('help')}</h3><ul className="checklist">{(m.help || []).map((h) => <li key={h.id}>{h.text}</li>)}</ul></div>
          <div className="box">
            <h3>{t('about')}</h3>
            <p style={{ color: '#2B323C' }}>{m.bio || m.spec}</p>
            <p className="hint" style={{ marginTop: 12 }}>{t('answers')}</p>
          </div>
        </div>
      </section>

      {areas.length > 0 && (
        <section className="sec" style={{ background: 'var(--mist)' }}>
          <div className="wrap">
            <div className="sec-head"><div><span className="eyebrow">{t('areasEyebrow')}</span><h2>{t('areasTitle', { name: m.name.split(' ')[0] })}</h2></div><Link href="/districts" className="link">{t('allDistricts')}</Link></div>
            <div className="dgrid nbr">{areas.map((d) => <DistrictCard key={d.slug} d={d} sale={stats[d.id]?.sale ?? 0} />)}</div>
          </div>
        </section>
      )}

      {objs.length > 0 && (
        <section className="sec" id="objs">
          <div className="wrap">
            <div className="sec-head"><div><span className="eyebrow">{t('objsEyebrow')}</span><h2>{m.kind === 'founder' ? t('objsFounder') : t('objsExpert')}</h2></div><span className="hint">{t('objsCount', { n: objs.length })}</span></div>
            <div className="grid3 limit4">{objs.slice(0, 6).map((p) => <PropertyCard key={p.id} p={p} />)}</div>
          </div>
        </section>
      )}

      {arts.docs.length > 0 && (
        <section className="sec" style={{ background: 'var(--mist)' }} id="arts">
          <div className="wrap">
            <div className="sec-head"><div><span className="eyebrow">{t('artsEyebrow')}</span><h2>{t('artsTitle')}</h2></div><Link href="/blog" className="link">{t('allArticles')}</Link></div>
            <div className="pgrid">{arts.docs.map((p) => <PostCard key={p.id} p={p} />)}</div>
          </div>
        </section>
      )}

      {revs.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <div className="sec-head">
              <div><span className="eyebrow">{t('revsEyebrow')}{company.isDemo && <> <span className="demo-tag">demo</span></>}</span><h2>{t('revsTitle')}</h2></div>
              <Link href={`/reviews?e=${m.slug}`} className="link">{t('allReviews')}</Link>
            </div>
            <div className="revs">
              {revs.slice(0, 3).map((r) => (
                <div className="rev" key={r.id}>
                  <div className="stars" aria-label={`${r.rating}/5`}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  <p>«{r.text}»</p>
                  <div className="who"><span>{r.who}</span><span>{fmtDate(r.date, locale, { month: '2-digit', year: 'numeric' })}</span></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">{t('othersEyebrow')}</span><h2>{t('othersTitle')}</h2></div><Link href="/team" className="link">{t('allTeam')}</Link></div>
          <div className="xrow">
            {team.filter((x) => x.id !== m.id).map((x) => {
              const a = mediaUrl(x.photo, 'thumb')
              return (
                <Link key={x.id} href={`/team/${x.slug}`}>
                  {a ? <Image src={a} alt="" width={120} height={120} /> : <span />}
                  <span><b>{x.name}</b><span>{x.role} · {x.langs}</span></span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
