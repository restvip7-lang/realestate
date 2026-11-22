import '@/app/(frontend)/styles/pages.css'

import { permanentRedirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { PostCard } from '@/components/site/PostCard'
import { PropertyCard } from '@/components/site/PropertyCard'
import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { catalogBasePath } from '@/lib/catalog-params'
import { searchSite } from '@/lib/data'
import { breadcrumbLd, JsonLd } from '@/lib/jsonld'
import { pageMeta } from '@/lib/seo'

// Поиск по сайту (ТЗ: /search, noindex). Сюда ведёт SearchAction из JSON-LD WebSite. Номер объекта → сразу на объект.
type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<Record<string, string | string[] | undefined>> }

const queryOf = (sp: Record<string, string | string[] | undefined>) => (Array.isArray(sp.q) ? sp.q[0] : sp.q || '').trim().slice(0, 80)

export async function generateMetadata({ params, searchParams }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'searchPage' })
  const q = queryOf(await searchParams)
  return pageMeta(locale, '/search', { title: q ? t('titleQ', { q }) : t('title'), description: t('desc'), noindex: true })
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, tc] = await Promise.all([getTranslations('searchPage'), getTranslations('catalog')])
  const q = queryOf(await searchParams)
  const id = q.replace(/^(id|#)\s*/i, '')
  if (/^\d{1,9}$/.test(id)) permanentRedirect(getPathname({ href: `/property/${id}`, locale }))
  const res = q.length >= 2 ? await searchSite(locale, q) : null
  const total = res ? res.properties.length + res.districts.length + res.posts.length : 0

  return (
    <main className="pg pg-search">
      <JsonLd data={breadcrumbLd([[tc('home'), '/'], [t('title'), '/search']], locale)} />
      <section className="dhero short">
        <div className="wrap">
          <nav className="crumbs" aria-label={tc('crumbs')}><Link href="/">{tc('home')}</Link>›<span aria-current="page">{t('title')}</span></nav>
          <h1>{q ? t('titleQ', { q }) : t('title')}</h1>
          <form className="sform" role="search" action={getPathname({ href: '/search', locale })}>
            <label className="vh" htmlFor="sq">{t('label')}</label>
            <input id="sq" name="q" type="search" defaultValue={q} placeholder={t('placeholder')} maxLength={80} />
            <button type="submit" className="btn btn-coral">{t('submit')}</button>
          </form>
        </div>
      </section>
      <section className="sec">
        <div className="wrap">
          {!res ? (
            <p className="hint">{t('hint')}</p>
          ) : !total ? (
            <div className="empty">
              <b>{t('nothing', { q })}</b>
              <Link href={catalogBasePath({ deal: 'sale' })} className="btn btn-dark btn-sm">{t('toCatalog')}</Link>
            </div>
          ) : (
            <>
              {res.districts.length > 0 && (
                <div className="sres">
                  <h2>{t('districts')}</h2>
                  <div className="links">{res.districts.map((d) => <Link key={d.slug} href={`/districts/${d.slug}`} className="link">{d.name}</Link>)}</div>
                </div>
              )}
              {res.properties.length > 0 && (
                <div className="sres">
                  <h2>{t('properties', { n: res.properties.length })}</h2>
                  <div className="grid3">{res.properties.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
                </div>
              )}
              {res.posts.length > 0 && (
                <div className="sres">
                  <h2>{t('posts')}</h2>
                  <div className="grid3">{res.posts.map((p) => <PostCard key={p.id} p={p} />)}</div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}
