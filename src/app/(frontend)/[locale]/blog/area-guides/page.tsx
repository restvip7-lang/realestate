import '@/app/(frontend)/styles/pages.css'

import { getTranslations, setRequestLocale } from 'next-intl/server'

import { DistrictCard } from '@/components/site/DistrictCard'
import { PostCard } from '@/components/site/PostCard'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { districtStats, listDistricts, listPosts } from '@/lib/data'
import { abs, breadcrumbLd, JsonLd } from '@/lib/jsonld'
import { pageMeta } from '@/lib/seo'

// Раздел журнала «Гиды по районам» по ТЗ: /blog/area-guides — гиды районов (/districts/{slug}) и статьи о жизни в Алании
type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'journal' })
  return pageMeta(locale, '/blog/area-guides', { title: t('guidesTitle'), description: t('guidesMetaDesc') })
}

export default async function Page({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, tc, districts, stats, life] = await Promise.all([
    getTranslations('journal'), getTranslations('catalog'), listDistricts(locale), districtStats(), listPosts(locale, { kind: 'article', category: 'life', limit: 6 }),
  ])
  const ld = [
    breadcrumbLd([[tc('home'), '/'], [t('blog'), '/blog'], [t('guidesTitle'), '/blog/area-guides']], locale),
    { '@context': 'https://schema.org', '@type': 'ItemList', name: t('guidesTitle'), itemListElement: districts.map((d, i) => ({ '@type': 'ListItem', position: i + 1, name: d.name, url: abs(`/districts/${d.slug}`, locale) })) },
  ]
  return (
    <main className="pg">
      <JsonLd data={ld} />
      <section className="dhero short">
        <div className="wrap">
          <nav className="crumbs" aria-label={tc('crumbs')}><Link href="/">{tc('home')}</Link>›<Link href="/blog">{t('blog')}</Link>›<span aria-current="page">{t('guidesTitle')}</span></nav>
          <h1>{t('guidesTitle')}</h1>
          <p className="lead-t">{t('guidesLead')}</p>
        </div>
      </section>
      <section className="sec">
        <div className="wrap">
          <div className="dgrid">{districts.map((d) => <DistrictCard key={d.slug} d={d} stat={stats[d.id]} />)}</div>
        </div>
      </section>
      {life.docs.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <div className="sec-head"><div><h2>{t('guidesArticles')}</h2></div><Link href="/blog?cat=life" className="link">{t('allArticles')}</Link></div>
            <div className="grid3">{life.docs.map((p) => <PostCard key={p.id} p={p} />)}</div>
          </div>
        </section>
      )}
    </main>
  )
}
