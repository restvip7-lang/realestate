import '../styles/home.css'

import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Price } from '@/components/site/Currency'
import { PropertyCard } from '@/components/site/PropertyCard'
import { SearchForm } from '@/components/site/SearchForm'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { POST_CATEGORIES } from '@/lib/catalog'
import { districtCounts, getCompany, latestPosts, latestReviews, listDistricts, listProperties, listTeam, mediaUrl } from '@/lib/data'
import { fmtDate } from '@/lib/format'
import { pageMeta } from '@/lib/seo'

const TOP = ['mahmutlar', 'oba', 'kestel', 'center', 'kargicak', 'avsallar']
const HERO_IMG = 'oba' // фото района на первом экране

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return pageMeta(locale, '/', { title: t('homeTitle'), description: t('homeDescription') })
}

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('home')
  const tc = await getTranslations('catalogCats')
  const [company, districts, counts, props, team, reviews, articles, news] = await Promise.all([
    getCompany(locale),
    listDistricts(locale),
    districtCounts('sale'),
    listProperties(locale, { deal: 'sale', limit: 8 }),
    listTeam(locale),
    latestReviews(3),
    latestPosts(locale, 'article', 3),
    latestPosts(locale, 'news', 4),
  ])
  const heroImg = mediaUrl(districts.find((d) => d.slug === HERO_IMG)?.image, 'large')
  const minPm = Math.min(...districts.map((d) => d.pricePerM2 || Infinity))
  const cat = (v: string) => (POST_CATEGORIES.some((c) => c.value === v) ? tc(v) : v)
  const trust = t.raw('trust') as { b: string; s: string }[]
  const svc = t.raw('services') as { b: string; p: string }[]
  const steps = t.raw('steps') as { b: string; p: string }[]
  const faq = t.raw('faq') as { q: string; a: string }[]
  const ICONS = [
    <g key="lic"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></g>,
    <g key="docs"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></g>,
    <path key="deal" d="M4 12h16M14 6l6 6-6 6" />,
    <path key="after" d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />,
  ]
  const SVC_ICONS = [
    <g key="pick"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></g>,
    <g key="view"><rect x="2" y="5" width="14" height="14" rx="2" /><path d="M16 10l6-3v10l-6-3" /></g>,
    <path key="check" d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z" />,
    <g key="deal"><path d="M4 4h16v16H4z" /><path d="M8 9h8M8 13h8M8 17h4" /></g>,
    <path key="after" d="M3 11l9-7 9 7v9H3z" />,
  ]

  return (
    <main>
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-txt">
            <span className="eyebrow">{t('eyebrow')}</span>
            <h1>{t('h1')}</h1>
            <p>{t('lead')}</p>
            <div className="hero-cta">
              <a href="#objects" className="btn btn-coral">{t('ctaObjects')}</a>
              <a href="#lead" className="btn btn-ghost">{t('ctaHelp')}</a>
            </div>
          </div>
          <Link className="hero-ph" href="/districts">
            {heroImg && <Image src={heroImg} alt={t('heroAlt')} width={1100} height={733} priority sizes="(max-width: 760px) 100vw, 50vw" />}
            <span className="tagline">
              <span>{t('heroTag', { n: districts.length })} <b><Price eur={minPm} suffix={t('perM2')} /></b>{company.isDemo && <> <span className="demo-tag">{t('demo')}</span></>}</span>
              <span className="more" style={{ color: 'var(--sea-light)' }}>{t('compare')}</span>
            </span>
          </Link>
        </div>
      </section>

      <div className="search-wrap">
        <div className="wrap">
          <SearchForm districts={districts.map((d) => ({ slug: d.slug, name: d.name }))} />
        </div>
      </div>

      <section className="sec-tight" style={{ background: 'var(--mist)' }}>
        <div className="wrap">
          <div className="chips" role="group" aria-label={t('chipsLabel')}>
            <Link className="chip" href="/sale?sea=300">{t('chipSea')}</Link>
            <Link className="chip" href="/sale?new=1">{t('chipNew')}</Link>
            <Link className="chip" href="/sale?furn=1">{t('chipFurn')}</Link>
            <Link className="chip" href="/sale?max=150000">{t('chipBudget')} <Price eur={150000} /></Link>
            <Link className="chip" href="/sale?view=sea">{t('chipView')}</Link>
          </div>
          <div className="trust">
            {trust.map((x, i) => (
              <div key={x.b}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">{ICONS[i]}</svg>
                <p><b>{i === 0 ? x.b.replace('{license}', company.legal?.license || '') : x.b}</b><span>{x.s}</span></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" id="objects">
        <div className="wrap">
          <div className="sec-head">
            <div><span className="eyebrow">{t('saleEyebrow')}</span><h2>{t('objectsTitle')}</h2></div>
            <Link href="/sale" className="link">{t('allCatalog')}</Link>
          </div>
          <div className="grid3 limit4">
            {props.docs.map((p, i) => <PropertyCard key={p.id} p={p} priority={i < 3} />)}
          </div>
          <div className="res-actions">
            <Link href="/sale" className="btn btn-dark">{t('allSale')}</Link>
            <Link href="/rent" className="btn btn-line">{t('rent')}</Link>
          </div>
        </div>
      </section>

      <section className="sec" id="districts" style={{ background: 'var(--mist)' }}>
        <div className="wrap">
          <div className="sec-head">
            <div><span className="eyebrow">{t('districtsEyebrow')}</span><h2>{t('districtsTitle')}</h2></div>
            <Link href="/districts" className="btn btn-dark">{t('allDistricts', { n: districts.length })}</Link>
          </div>
          <div className="dgrid">
            {TOP.map((s) => districts.find((d) => d.slug === s)).filter(Boolean).map((d) => {
              const img = mediaUrl(d!.image, 'card')
              return (
                <div className="dcard" key={d!.slug}>
                  {img && <Image src={img} alt="" width={600} height={400} sizes="(max-width: 760px) 50vw, 400px" />}
                  <h3>{d!.name}</h3>
                  <div className="meta">
                    <span><Price eur={d!.pricePerM2 || 0} suffix={t('perM2')} />{company.isDemo ? ` · ${t('demo')}` : ''}</span>
                    <span>{t('onSale', { n: counts[d!.id] || 0 })}</span>
                  </div>
                  <Link href={`/districts/${d!.slug}`} className="dcard-link" aria-label={t('aboutDistrict', { name: d!.name })} />
                </div>
              )
            })}
          </div>
          {company.isDemo && <p className="hint" style={{ marginTop: 10 }}>{t('districtsNote')}</p>}
        </div>
      </section>

      <section className="sec" id="services">
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">{t('teamEyebrow')}</span><h2>{t('teamTitle')}</h2></div></div>
          <div className="help">
            <ul className="svc">
              {svc.map((s, i) => (
                <li key={s.b}>
                  <span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">{SVC_ICONS[i]}</svg></span>
                  <div><b>{s.b}</b><p>{s.p}</p></div>
                </li>
              ))}
            </ul>
            <div className="team">
              <div className="people">
                {team.slice(0, 3).map((m) => {
                  const img = mediaUrl(m.photo, 'thumb')
                  return (
                    <Link className="person" key={m.id} href={`/team/${m.slug}`}>
                      {img && <Image src={img} alt={m.role} width={300} height={300} sizes="160px" />}
                      <b>{m.name}</b>
                      <span>{m.role} · {m.langs}</span>
                    </Link>
                  )
                })}
              </div>
              <div className="office-txt"><b>{t('office')}</b><br /><span className="hint">{company.address}<br />{company.hours}</span></div>
              {company.isDemo && <p className="hint" style={{ fontSize: 12.5 }}>{t('teamNote')}</p>}
              <Link href="/team" className="btn btn-dark">{t('aboutTeam')}</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="sec-tight">
        <div className="wrap">
          <div className="banner">
            <div><h2>{t('bannerTitle')}</h2><p>{t('bannerText')}</p></div>
            <a href="#lead" className="btn btn-coral">{t('bannerCta')}</a>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">{t('processEyebrow')}</span><h2>{t('processTitle')}</h2></div><Link href="/how-to-buy" className="link">{t('processMore')}</Link></div>
          <div className="steps">
            {steps.map((s, i) => (
              <div className="step" key={s.b}><span className="n">{String(i + 1).padStart(2, '0')}</span><b>{s.b}</b><p>{s.p}</p></div>
            ))}
          </div>
          <div className="progs">
            <Link href="/citizenship" className="prog"><h3>{t('citizenshipTitle')}</h3><p>{t('citizenshipText')}</p><span className="link">{t('more')}</span></Link>
            <Link href="/residence-permit" className="prog"><h3>{t('residenceTitle')}</h3><p>{t('residenceText')}</p><span className="link">{t('more')}</span></Link>
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: 'var(--mist)' }}>
        <div className="wrap">
          <div className="sec-head">
            <div><span className="eyebrow">{t('reviewsEyebrow')}{company.isDemo && <> <span className="demo-tag">{t('demo')}</span></>}</span><h2>{t('reviewsTitle')}</h2></div>
            <Link href="/reviews" className="link">{t('allReviews')}</Link>
          </div>
          <div className="revs">
            {reviews.map((r) => (
              <div className="rev" key={r.id}>
                <div className="stars" aria-label={t('stars', { n: r.rating })}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                <p>«{r.text}»</p>
                <div className="who"><span>{r.who}</span><span>{fmtDate(r.date, locale, { month: '2-digit', year: 'numeric' })}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" id="journal">
        <div className="wrap pubs">
          <div>
            <div className="sec-head"><div><span className="eyebrow">{t('journalEyebrow')}</span><h2>{t('journalTitle')}</h2></div><Link href="/blog" className="link">{t('allArticles')}</Link></div>
            <div className="arts">
              {articles.map((p) => {
                const img = mediaUrl(p.cover, 'thumb')
                return (
                  <Link href={`/blog/${p.slug}`} className="art" key={p.id}>
                    {img ? <Image src={img} alt="" width={400} height={267} sizes="160px" /> : <span />}
                    <div>
                      <span className="m">{cat(p.category)} · {fmtDate(p.publishedAt, locale)}{p.readingMins ? ` · ${t('mins', { n: p.readingMins })}` : ''}</span>
                      <h3>{p.title}</h3>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
          <div>
            <div className="sec-head"><div><span className="eyebrow">{t('newsEyebrow')}</span><h2>{t('newsTitle')}</h2></div><Link href="/news" className="link">{t('allNews')}</Link></div>
            <div className="news">
              {news.map((p) => {
                const img = mediaUrl(p.cover, 'thumb')
                return (
                  <Link href={`/news/${p.slug}`} key={p.id}>
                    {img ? <Image src={img} alt="" width={200} height={133} sizes="96px" /> : <span />}
                    <span>
                      {p.pinned && <span className="pin-tag">{t('pinned')} · </span>}
                      <span className="m">{fmtDate(p.publishedAt, locale)} · {cat(p.category)}</span>
                      <h3>{p.title}</h3>
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="faq">
            <div>
              <span className="eyebrow">{t('faqEyebrow')}</span>
              <h2 style={{ marginTop: 8 }}>{t('faqTitle')}</h2>
              {company.isDemo && <p className="hint" style={{ marginTop: 10 }}>{t('faqNote')}</p>}
            </div>
            <div>
              {faq.map((f) => (
                <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
