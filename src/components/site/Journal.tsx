import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'

import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { POST_CATEGORIES } from '@/lib/catalog'
import { getRates, listPosts, mediaUrl } from '@/lib/data'
import { fmtDate } from '@/lib/format'
import { SITE_URL } from '@/lib/seo'
import type { Post } from '@/payload-types'

import { PostCard, postPath } from './PostCard'

const host = (s: string) => {
  try {
    return new URL(/^https?:/.test(s) ? s : `https://${s}`).hostname.replace(/^www\./, '')
  } catch {
    return s
  }
}

/** Список статей (/blog) или новостей (/news) с фильтром по рубрике ?cat= */
export async function JournalList({ kind, cat }: { kind: 'article' | 'news'; cat?: string }) {
  const locale = (await getLocale()) as Locale
  const [t, tc, tcat] = await Promise.all([getTranslations('journal'), getTranslations('catalog'), getTranslations('catalogCats')])
  const all = (await listPosts(locale, { kind, limit: 200 })).docs
  const cats = POST_CATEGORIES.map((c) => c.value).filter((c) => all.some((p) => p.category === c))
  const current = cats.find((c) => c === cat)
  const list = all.filter((p) => !current || p.category === current)
  const base = kind === 'news' ? '/news' : '/blog'
  const news = kind === 'news'
  const catName = (c: string) => tcat(c as never)
  const ld = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [[tc('home'), '/'], [t(news ? 'news' : 'blog'), base]].map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${getPathname({ href: p, locale })}` })) },
    news
      ? { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: all.slice(0, 10).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}${getPathname({ href: postPath(p), locale })}` })) }
      : { '@context': 'https://schema.org', '@type': 'Blog', name: t('blogEyebrow'), blogPost: all.slice(0, 10).map((p) => ({ '@type': 'BlogPosting', headline: p.title, datePublished: p.publishedAt, url: `${SITE_URL}${getPathname({ href: postPath(p), locale })}` })) },
  ]
  const chips = (
    <div className="chips" role="group" aria-label={t('catsLabel')}>
      <Link className="chip" href={base} aria-current={!current ? 'true' : undefined}>{news ? t('all') : t('allN', { n: all.length })}</Link>
      {cats.map((c) => (
        <Link key={c} className="chip" href={`${base}?cat=${c}`} aria-current={current === c ? 'true' : undefined}>
          {catName(c)}{news ? '' : ` · ${all.filter((p) => p.category === c).length}`}
        </Link>
      ))}
    </div>
  )

  const hero = (
    <section className="dhero short">
      <div className="wrap">
        <nav className="crumbs" aria-label={tc('crumbs')}><Link href="/">{tc('home')}</Link>›<span aria-current="page">{t(news ? 'news' : 'blog')}</span></nav>
        <span className="eyebrow">{news ? t('news') : t('blogEyebrow')}</span>
        <h1>{news ? t('newsTitle') : t('blogTitle')}</h1>
        <p className="lead-t">{news ? t('newsLead') : t('blogLead')} <Link href={news ? '/blog' : '/news'} className="link" style={{ color: 'var(--sea-light)' }}>{news ? t('toBlog') : t('toNews')}</Link></p>
      </div>
    </section>
  )
  const ldTag = <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />

  if (!news) {
    const [f, ...rest] = list
    const a = f?.author && typeof f.author === 'object' ? f.author : null
    const cover = mediaUrl(f?.cover, 'large')
    return (
      <main className="pg">
        {ldTag}
        {hero}
        <section className="sec">
          <div className="wrap">
            <div className="pfilters">{chips}<span className="hint" aria-live="polite">{t('articlesN', { n: list.length })}</span></div>
            {f ? (
              <article className="feat">
                {cover ? <Image src={cover} alt="" width={1100} height={620} priority sizes="(max-width: 760px) 100vw, 60vw" /> : <div />}
                <div className="bd">
                  <span className="meta-line">
                    {f.pinned && <span className="pin-tag">{t('pinned')}</span>}
                    <span className="cat">{catName(f.category)}</span><span>{fmtDate(f.publishedAt, locale, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    {f.readingMins ? <span>{t('minsRead', { n: f.readingMins })}</span> : null}
                  </span>
                  <h2><Link href={postPath(f)}>{f.title}</Link></h2>
                  {f.lead && <p>{f.lead}</p>}
                  <span className="by">
                    {a && mediaUrl(a.photo, 'thumb') && <Image src={mediaUrl(a.photo, 'thumb')!} alt="" width={56} height={56} />}
                    {a ? `${a.name} · ${a.role}` : t('editorial')}
                  </span>
                </div>
              </article>
            ) : (
              <div className="empty"><b>{t('emptyCat')}</b>{t('emptyCatHint')}</div>
            )}
            <div className="pgrid">{rest.map((p) => <PostCard key={p.id} p={p} />)}</div>
          </div>
        </section>
      </main>
    )
  }

  const [rates, arts] = await Promise.all([getRates(), listPosts(locale, { kind: 'article', limit: 3 })])
  const SYM: Record<string, string> = { USD: '$', TRY: '₺', RUB: '₽', KZT: '₸', GBP: '£' }
  return (
    <main className="pg">
      {ldTag}
      {hero}
      <section className="sec">
        <div className="wrap news-layout">
          <div>
            <div className="pfilters">{chips}</div>
            <div className="nlist">
              {list.length ? list.map((p) => {
                const img = mediaUrl(p.cover, 'thumb')
                return (
                  <article className="nitem" key={p.id}>
                    {img ? <Image src={img} alt="" width={400} height={300} sizes="160px" /> : <div />}
                    <div>
                      <span className="meta-line">
                        {p.pinned && <span className="pin-tag">{t('pinned')}</span>}
                        <span>{fmtDate(p.publishedAt, locale, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span className="cat">{catName(p.category)}</span>
                        {p.source && <span>{t('source')} {host(p.source)}</span>}
                      </span>
                      <h3><Link href={postPath(p)}>{p.title}</Link></h3>
                      {p.lead && <p>{p.lead}</p>}
                    </div>
                  </article>
                )
              }) : <div className="empty"><b>{t('emptyCat')}</b></div>}
            </div>
          </div>
          <aside>
            <div className="aside-box">
              <h2>{t('rates')}</h2>
              <div className="rates">{Object.entries(rates).filter(([k]) => k !== 'EUR').map(([k, r]) => <div key={k}><span>1 € → {k}</span><b>{r.toLocaleString('ru-RU')} {SYM[k] || ''}</b></div>)}</div>
              <p className="hint">{t('ratesNote')}</p>
            </div>
            <div className="aside-box">
              <h2>{t('usefulArticles')}</h2>
              <div className="arts-mini">{arts.docs.map((p: Post) => <Link key={p.id} href={postPath(p)}>{p.title}<span>{catName(p.category)} · {fmtDate(p.publishedAt, locale)}</span></Link>)}</div>
              <Link href="/blog" className="link">{t('allArticles')}</Link>
            </div>
            <div className="aside-box cta-box" style={{ border: 0 }}>
              <b style={{ fontSize: 18 }}>{t('tgTitle')}</b><p>{t('tgText')}</p>
              <a href="https://t.me/kleohomes" className="btn btn-tg" target="_blank" rel="noopener">{t('subscribe')}</a>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
