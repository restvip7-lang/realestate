import '@/app/(frontend)/styles/pages.css'

import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { NavSelect } from '@/components/site/NavSelect'
import { ReviewForm } from '@/components/site/ReviewForm'
import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { getCompany, listReviews, listTeam, mediaUrl } from '@/lib/data'
import { fmtDate } from '@/lib/format'
import { pageMeta, SITE_URL } from '@/lib/seo'

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<Record<string, string | string[] | undefined>> }
const SVC = ['buy', 'rent', 'docs', 'sell'] as const

export async function generateMetadata({ params, searchParams }: Props) {
  const { locale } = await params
  const sp = await searchParams
  const t = await getTranslations({ locale, namespace: 'reviews' })
  return pageMeta(locale, '/reviews', { title: t('title'), description: t('metaDesc'), noindex: !!(sp.s || sp.e) })
}

export default async function ReviewsPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const sp = await searchParams
  const [t, tc, company, all, team] = await Promise.all([getTranslations('reviews'), getTranslations('catalog'), getCompany(locale), listReviews(), listTeam(locale)])
  const svc = SVC.find((s) => s === sp.s)
  const expertSlug = typeof sp.e === 'string' ? sp.e : ''
  const expertOf = (r: (typeof all)[number]) => {
    const id = typeof r.expert === 'object' ? r.expert?.id : r.expert
    return team.find((m) => m.id === id)
  }
  const list = all.filter((r) => (!svc || r.service === svc) && (!expertSlug || expertOf(r)?.slug === expertSlug))
  const avg = all.reduce((a, r) => a + r.rating, 0) / (all.length || 1)
  const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n)
  const href = (s?: string, e?: string) => {
    const q = new URLSearchParams()
    if (s) q.set('s', s)
    if (e) q.set('e', e)
    return `/reviews${q.size ? `?${q}` : ''}`
  }
  const withReviews = team.filter((m) => all.some((r) => expertOf(r)?.id === m.id))
  // JSON-LD: только хлебные крошки — звёзды за отзывы о себе на своём сайте Google не показывает (docs/PLAN.md)
  const ld = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [[tc('home'), '/'], [t('crumbs'), '/reviews']].map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${getPathname({ href: p, locale })}` })) }

  return (
    <main className="pg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <section className="dhero short">
        <div className="wrap">
          <nav className="crumbs" aria-label={tc('crumbs')}><Link href="/">{tc('home')}</Link>›<span aria-current="page">{t('crumbs')}</span></nav>
          <span className="eyebrow">{t('crumbs')}{company.isDemo && <> <span className="demo-tag">demo</span></>}</span>
          <h1>{t('title')}</h1>
          <p className="lead-t">{t('lead')}</p>
          <div className="rsum">
            <div>
              <div className="avg">{avg.toFixed(1)}</div>
              <div className="stars" aria-label={t('avgLabel', { avg: avg.toFixed(1) })}>{stars(Math.round(avg))}</div>
              <small>{t('count', { n: all.length })}</small>
            </div>
            <div className="dist">
              {[5, 4, 3, 2, 1].map((n) => {
                const c = all.filter((r) => r.rating === n).length
                return <div key={n}><span>{n} ★</span><i><b style={{ width: `${all.length ? (c / all.length) * 100 : 0}%` }} /></i><span>{c}</span></div>
              })}
            </div>
          </div>
          <div className="cta">
            <a href="#write" className="btn btn-coral">{t('write')}</a>
            <a href="https://www.google.com/maps/search/Kleo+Homes+Alanya" className="btn btn-ghost" target="_blank" rel="noopener">{t('google')}</a>
            <a href="https://yandex.ru/maps/?text=Kleo%20Homes%20Alanya" className="btn btn-ghost" target="_blank" rel="noopener">{t('yandex')}</a>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="pfilters">
            <div className="chips" role="group" aria-label={t('svcLabel')}>
              <Link className="chip" href={href(undefined, expertSlug)} aria-current={!svc ? 'true' : undefined}>{t('all', { n: all.length })}</Link>
              {SVC.map((s) => (
                <Link key={s} className="chip" href={href(s, expertSlug)} aria-current={svc === s ? 'true' : undefined}>{t(`services.${s}`)} · {all.filter((r) => r.service === s).length}</Link>
              ))}
            </div>
            <NavSelect className="dsort" label={t('expert')} value={expertSlug} options={[{ value: '', label: t('allExperts'), href: href(svc) }, ...withReviews.map((m) => ({ value: m.slug || '', label: m.name, href: href(svc, m.slug || '') }))]} />
          </div>
          {(svc || expertSlug) && <p className="hint" aria-live="polite" style={{ margin: '-8px 0 16px' }}>{t('found', { n: list.length })}</p>}
          <div className="rgrid">
            {list.length ? list.map((r) => {
              const m = expertOf(r)
              const a = mediaUrl(m?.photo, 'thumb')
              return (
                <article className="rev" key={r.id}>
                  <span className="tag">{t(`services.${r.service || 'buy'}`)}</span>
                  <div className="stars" aria-label={t('ofFive', { n: r.rating })}>{stars(r.rating)}</div>
                  <p>«{r.text}»</p>
                  {m && <span className="by">{a && <Image src={a} alt="" width={56} height={56} />}{t('expertIs')} <Link href={`/team/${m.slug}`} className="link">{m.name}</Link></span>}
                  <div className="who"><span><b>{r.who}</b>{r.country ? ` · ${r.country}` : ''}</span><span>{fmtDate(r.date, locale, { month: '2-digit', year: 'numeric' })}</span></div>
                </article>
              )
            }) : <div className="empty"><b>{t('empty')}</b>{t('emptyHint')}</div>}
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: 'var(--mist)' }} id="write">
        <div className="wrap cols2">
          <div>
            <span className="eyebrow">{t('formEyebrow')}</span>
            <h2 style={{ margin: '8px 0 14px' }}>{t('formTitle')}</h2>
            <p style={{ color: '#2B323C' }}>{t('formText')}</p>
          </div>
          <ReviewForm experts={team.map((m) => ({ id: m.id, name: m.name }))} />
        </div>
      </section>
    </main>
  )
}
