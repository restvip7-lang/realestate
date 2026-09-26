import '@/app/(frontend)/styles/pages.css'

import Image from 'next/image'
import { notFound, permanentRedirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { POST_CATEGORIES } from '@/lib/catalog'
import { allPublished, getCompany, getPost, listPosts, mediaUrl } from '@/lib/data'
import { fmtDate } from '@/lib/format'
import { pageMeta, SITE_URL } from '@/lib/seo'
import type { Property } from '@/payload-types'

import { CopyLink } from './CopyLink'
import { PostCard, postPath } from './PostCard'
import { PropertyCard } from './PropertyCard'
import { Prose, tocOf } from './Prose'

export async function postMeta(locale: Locale, slug: string) {
  const p = await getPost(slug, locale)
  if (!p) return {}
  return pageMeta(locale, postPath(p), { title: p.seo?.title || p.title, description: p.seo?.description || p.lead || undefined, image: mediaUrl(p.cover, 'large') })
}

export async function PostPage({ locale, slug, kind }: { locale: Locale; slug: string; kind: 'article' | 'news' }) {
  const p = await getPost(slug, locale)
  if (!p) notFound()
  if (p.kind !== kind) permanentRedirect(getPathname({ href: postPath(p), locale }))
  const [t, tc, tcat, company, published, others] = await Promise.all([
    getTranslations('journal'), getTranslations('catalog'), getTranslations('catalogCats'), getCompany(locale), allPublished(locale),
    listPosts(locale, { kind: p.kind, exclude: p.id, limit: 20 }),
  ])
  const news = p.kind === 'news'
  const base = news ? '/news' : '/blog'
  const a = p.author && typeof p.author === 'object' ? p.author : null
  const catOk = POST_CATEGORIES.some((c) => c.value === p.category)
  const cover = mediaUrl(p.cover, 'large')
  const url = `${SITE_URL}${getPathname({ href: postPath(p), locale })}`
  const src = p.source ? (/^https?:/.test(p.source) ? p.source : `https://${p.source}`) : ''
  const toc = tocOf(p.body)
  const wa = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(t('waQuestion', { title: p.title }))}`

  // объекты по теме: выбранные в админке, затем объекты упомянутых районов
  const idOf = (x: unknown) => (x && typeof x === 'object' ? (x as { id: number }).id : (x as number))
  const relIds = (p.relatedProperties || []).map(idOf)
  const relDistricts = (p.relatedDistricts || []).map(idOf)
  let objs: Property[] = relIds.map((id) => published.find((o) => o.id === id)).filter((o): o is Property => !!o)
  if (objs.length < 3 && relDistricts.length) {
    objs = objs.concat(published.filter((o) => o.deal === 'sale' && relDistricts.includes(idOf(o.district)) && !objs.includes(o))).slice(0, 3)
  }
  const related = others.docs.sort((x, y) => Number(y.category === p.category) - Number(x.category === p.category)).slice(0, 3)
  const ld = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [[tc('home'), '/'], [t(news ? 'news' : 'blog'), base], [p.title, postPath(p)]].map(([name, h], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${getPathname({ href: h, locale })}` })) },
    {
      '@context': 'https://schema.org', '@type': news ? 'NewsArticle' : 'Article', headline: p.title, description: p.lead,
      ...(cover ? { image: [cover.startsWith('http') ? cover : `${SITE_URL}${cover}`] } : {}),
      datePublished: p.publishedAt, dateModified: p.reviewedAt || p.updatedAt,
      author: a ? { '@type': 'Person', name: a.name, jobTitle: a.role, url: `${SITE_URL}${getPathname({ href: `/team/${a.slug}`, locale })}` } : { '@type': 'Organization', name: 'Kleo Homes' },
      publisher: { '@type': 'Organization', name: 'Kleo Homes' }, mainEntityOfPage: url, ...(src ? { isBasedOn: src } : {}),
    },
  ]

  return (
    <main className="pg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <div className="wrap">
        <nav className="crumbs" aria-label={tc('crumbs')}>
          <Link href="/">{tc('home')}</Link>›<Link href={base}>{t(news ? 'news' : 'blog')}</Link>›<Link href={`${base}?cat=${p.category}`}>{catOk ? tcat(p.category as never) : p.category}</Link>
        </nav>
        <header className="post-head">
          <span className="meta-line"><span className="cat">{t(news ? 'kindNews' : 'kindArticle')} · {catOk ? tcat(p.category as never) : p.category}</span></span>
          <h1>{p.title}</h1>
          {p.lead && <p className="lead-p">{p.lead}</p>}
          <div className="post-meta">
            {a ? (
              <Link className="who" href={`/team/${a.slug}`}>
                {mediaUrl(a.photo, 'thumb') && <Image src={mediaUrl(a.photo, 'thumb')!} alt="" width={96} height={96} />}
                <span>{a.name}<small>{a.role}</small></span>
              </Link>
            ) : <span className="who">{t('editorial')}</span>}
            <span>{fmtDate(p.publishedAt, locale, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            {p.readingMins && !news ? <span>{t('minsRead', { n: p.readingMins })}</span> : null}
            {p.reviewedAt && <span className="checked-b">{t('actual', { date: fmtDate(p.reviewedAt, locale) })}</span>}
          </div>
        </header>
        {cover && <div className="post-cover"><Image src={cover} alt="" width={1400} height={612} priority sizes="(max-width: 1280px) 100vw, 1216px" /></div>}
        <div className="post-grid" style={{ marginTop: 28 }}>
          <article>
            <Prose data={p.body} />
            {src && <div className="src-box">{t('source')} <a href={src} target="_blank" rel="noopener nofollow">{p.source}</a></div>}
            {!!p.tags?.length && <div className="tags">{p.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>}
            <div className="share">
              <CopyLink label={t('copy')} done={t('copied')} />
              <a className="btn btn-wa btn-sm" href={`https://wa.me/?text=${encodeURIComponent(`${p.title} ${url}`)}`} target="_blank" rel="noopener">{t('shareWa')}</a>
              <a className="btn btn-tg btn-sm" href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(p.title)}`} target="_blank" rel="noopener">Telegram</a>
            </div>
            {a && (
              <div className="author-box">
                {mediaUrl(a.photo, 'thumb') && <Image src={mediaUrl(a.photo, 'thumb')!} alt={a.name} width={160} height={160} />}
                <div>
                  <span className="hint">{t('author')}</span><br />
                  <b>{a.name}</b> · <span className="hint">{t('authorMeta', { role: a.role, n: a.exp ?? 0 })}</span>
                  {a.bio && <p>{a.bio}</p>}
                  <Link href={`/team/${a.slug}`} className="link">{t('authorProfile')}</Link>
                </div>
              </div>
            )}
          </article>
          <aside className="post-side">
            {toc.length > 1 && (
              <nav className="toc" aria-label={t('toc')}>
                <b>{t('toc')}</b>
                <ol>{toc.map((h) => <li key={h.id}><a href={`#${h.id}`}>{h.text}</a></li>)}</ol>
              </nav>
            )}
            <div className="cta-box">
              <b style={{ fontSize: 18 }}>{t('needHelp')}</b>
              <p>{news ? t('helpNews') : t('helpArticle')}</p>
              <a href="#lead" className="btn btn-coral">{t('ask')}</a>
              <a href={wa} className="btn btn-wa">WhatsApp</a>
            </div>
          </aside>
        </div>
      </div>

      {objs.length > 0 && (
        <section className="sec" style={{ background: 'var(--mist)', marginTop: 48 }}>
          <div className="wrap">
            <div className="sec-head"><div><span className="eyebrow">{t('relObjEyebrow')}</span><h2>{t('relObjTitle')}</h2></div><Link href="/sale" className="link">{t('relObjAll')}</Link></div>
            <div className="grid3">{objs.slice(0, 3).map((o) => <PropertyCard key={o.id} p={o} />)}</div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <div className="sec-head"><div><h2>{news ? t('relPostsNews') : t('relPostsArticles')}</h2></div><Link href={base} className="link">{news ? t('allNews') : t('allArticles')}</Link></div>
            <div className="pgrid">{related.map((x) => <PostCard key={x.id} p={x} />)}</div>
          </div>
        </section>
      )}
    </main>
  )
}
