import '@/app/(frontend)/styles/pages.css'

import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { PostCard } from '@/components/site/PostCard'
import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { getCompany, getTeamPage, listPosts, listTeam, mediaUrl } from '@/lib/data'
import { pageMeta, SITE_URL } from '@/lib/seo'
import type { District } from '@/payload-types'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const [t, tp] = await Promise.all([getTranslations({ locale, namespace: 'team' }), getTeamPage(locale)])
  return pageMeta(locale, '/team', { title: tp.title || t('crumbs'), description: t('metaDesc') })
}

export default async function TeamPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, tc, company, tp, team, arts] = await Promise.all([
    getTranslations('team'), getTranslations('catalog'), getCompany(locale), getTeamPage(locale), listTeam(locale), listPosts(locale, { kind: 'article', limit: 50 }),
  ])
  const founder = team.find((m) => m.kind === 'founder')
  const others = team.filter((m) => m !== founder)
  const artsBy = (id: number) => arts.docs.filter((p) => (typeof p.author === 'object' ? p.author?.id : p.author) === id).length
  const wa = (name: string) => `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(t('waHello', { name }))}`
  const tel = company.phone.replace(/[^+\d]/g, '')
  const quote = tp.quote?.replace(/^[«"]|[»"]$/g, '')
  const office = mediaUrl(company.officePhoto, 'large')
  const license = mediaUrl(company.licensePhoto, 'card')
  const ld = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [[tc('home'), '/'], [t('crumbs'), '/team']].map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${getPathname({ href: p, locale })}` })) },
    {
      '@context': 'https://schema.org', '@type': 'RealEstateAgent', name: 'Kleo Homes', telephone: company.phone, email: company.email,
      address: { '@type': 'PostalAddress', streetAddress: company.address, addressLocality: 'Alanya', addressRegion: 'Antalya', addressCountry: 'TR' },
      ...(founder ? { founder: { '@type': 'Person', name: founder.name } } : {}),
      employee: team.map((m) => ({ '@type': 'Person', name: m.name, jobTitle: m.role, knowsLanguage: (m.langs || '').split(' · ') })),
    },
  ]

  return (
    <main className="pg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <section className="dhero short">
        <div className="wrap">
          <nav className="crumbs" aria-label={tc('crumbs')}><Link href="/">{tc('home')}</Link>›<span aria-current="page">{t('crumbs')}</span></nav>
          <span className="eyebrow">{t('eyebrow')}</span>
          <h1>{tp.title}</h1>
          {tp.lead && <p className="lead-t">{tp.lead}</p>}
        </div>
      </section>

      <div className="wrap">
        <div className="stats" role="list" aria-label={t('statsLabel')}>
          {(tp.stats || []).map((s) => <div role="listitem" key={s.id}><b>{s.value || team.length}</b><span>{s.label}</span></div>)}
        </div>
      </div>

      {founder && (
        <section className="sec" id="founder">
          <div className="wrap founder">
            {mediaUrl(founder.photo, 'large') && <Image src={mediaUrl(founder.photo, 'large')!} alt={t('founderAlt', { name: founder.name })} width={760} height={950} sizes="(max-width: 760px) 100vw, 400px" />}
            <div>
              <span className="eyebrow">{t('founderEyebrow')}</span>
              <h2 style={{ marginTop: 8 }}>{founder.name}</h2>
              <p className="hint" style={{ marginTop: 4 }}>{t('founderMeta', { role: founder.role, n: founder.exp ?? 0, langs: founder.langs ?? '' })}</p>
              {quote && <blockquote>«{quote}»</blockquote>}
              {founder.bio && <p>{founder.bio}</p>}
              <p>{t('founderTeam', { n: team.length })}</p>
              <div className="contacts" style={{ marginTop: 18 }}>
                <a href={wa(founder.name)} className="btn btn-wa">{t('writeFounder')}</a>
                <Link href={`/team/${founder.slug}`} className="btn btn-dark">{t('more')}</Link>
                <a href="#team" className="btn btn-line">{t('allTeam')}</a>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="sec" style={{ background: 'var(--mist)' }} id="team">
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">{t('expertsEyebrow')}</span><h2>{t('expertsTitle')}</h2></div><p>{t('expertsNote')}</p></div>
          <div className="tgrid">
            {others.map((m) => {
              const img = mediaUrl(m.photo, 'card')
              const n = artsBy(m.id)
              const areas = (m.areas || []).filter((a): a is District => typeof a === 'object')
              return (
                <article className="mcard" id={m.slug || undefined} key={m.id}>
                  {img && <Image src={img} alt={m.name} width={600} height={450} sizes="(max-width: 760px) 100vw, 400px" />}
                  <div className="bd">
                    <h3><Link href={`/team/${m.slug}`}>{m.name}</Link></h3>
                    <span className="role">{m.role}</span>
                    <span className="facts-m"><span>{t('expYears', { n: m.exp ?? 0 })}</span><span>{m.langs}</span></span>
                    {m.spec && <span className="spec">{m.spec}</span>}
                    {m.bio && <p>{m.bio}</p>}
                    {areas.length > 0 && <div className="areas" aria-label={t('areasLabel')}>{areas.map((d) => <Link key={d.slug} href={`/districts/${d.slug}`}>{d.name}</Link>)}</div>}
                    <div className="acts">
                      <Link href={`/team/${m.slug}`} className="btn btn-dark btn-sm">{t('profile')}</Link>
                      <a href={wa(m.name)} className="btn btn-wa btn-sm">WhatsApp</a>
                      {n > 0 && <Link href={`/team/${m.slug}#arts`} className="btn btn-line btn-sm">{t('articles', { n })}</Link>}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
          {company.isDemo && <p className="hint" style={{ marginTop: 14 }}>{t('demoNote')}</p>}
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">{t('valuesEyebrow')}</span><h2>{t('valuesTitle')}</h2></div></div>
          <div className="values">{(t.raw('values') as { b: string; p: string }[]).map((v) => <div key={v.b}><b>{v.b}</b><p>{v.p}</p></div>)}</div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }} id="office">
        <div className="wrap office-b">
          {office ? <Image src={office} alt={t('officeAlt')} width={900} height={560} sizes="(max-width: 760px) 100vw, 50vw" /> : <div />}
          <div>
            <span className="eyebrow">{t('officeEyebrow')}</span>
            <h2 style={{ marginTop: 8 }}>{t('officeTitle')}</h2>
            <dl>
              <dt>{t('office')}</dt><dd>{company.address}</dd>
              {company.showroom && <><dt>{t('showroom')}</dt><dd>{company.showroom}</dd></>}
              {company.hours && <><dt>{t('hours')}</dt><dd>{company.hours}</dd></>}
              <dt>{t('phone')}</dt><dd><a href={`tel:${tel}`}>{company.phone}</a></dd>
              <dt>{t('email')}</dt><dd><a href={`mailto:${company.email}`}>{company.email}</a></dd>
            </dl>
            <div className="contacts">
              <a href={`https://wa.me/${company.whatsapp}`} className="btn btn-wa">WhatsApp</a>
              {company.telegram && <a href={`https://t.me/${company.telegram}`} className="btn btn-tg">Telegram</a>}
              <a href="#lead" className="btn btn-line">{t('meet')}</a>
            </div>
          </div>
        </div>
      </section>

      {company.legal?.license && (
        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="lic" id="license">
              {license ? <Image src={license} alt={t('licenseAlt')} width={520} height={390} /> : <div />}
              <div>
                <h3>{t('licenseTitle', { n: company.legal.license })}</h3>
                <p>{t('licenseText')}</p>
                {company.awards && <p style={{ marginTop: 10 }}><b>{t('awards')}</b> {company.awards}</p>}
              </div>
            </div>
          </div>
        </section>
      )}

      {arts.docs.some((p) => p.author) && (
        <section className="sec" style={{ background: 'var(--mist)' }}>
          <div className="wrap">
            <div className="sec-head"><div><span className="eyebrow">{t('artsEyebrow')}</span><h2>{t('artsTitle')}</h2></div><Link href="/blog" className="link">{t('allArticles')}</Link></div>
            <div className="pgrid">{arts.docs.filter((p) => p.author).slice(0, 3).map((p) => <PostCard key={p.id} p={p} />)}</div>
          </div>
        </section>
      )}
    </main>
  )
}
