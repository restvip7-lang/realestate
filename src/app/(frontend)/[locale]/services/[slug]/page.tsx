import '@/app/(frontend)/styles/pages.css'

import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Prose } from '@/components/site/Prose'
import { ServiceCard } from '@/components/site/ServiceCard'
import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { coverOf, getCompany, getService, listServices } from '@/lib/data'
import { lexicalText } from '@/lib/lexical'
import { pageMeta, SITE_URL } from '@/lib/seo'

// Страница услуги из Stay Property (docs/content-import.md)
type Props = { params: Promise<{ locale: Locale; slug: string }> }

export const revalidate = 600
export function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  const s = await getService(slug, locale)
  if (!s) return {}
  return pageMeta(locale, `/services/${s.slug}`, { title: s.seo?.title || s.title, description: s.seo?.description || s.excerpt || undefined, image: coverOf(s, 'large')?.src })
}

export default async function ServicePage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const s = await getService(slug, locale)
  if (!s) notFound()
  const [t, tc, company, all] = await Promise.all([getTranslations('svc'), getTranslations('catalog'), getCompany(locale), listServices(locale)])
  const cover = coverOf(s, 'large')
  const path = `/services/${s.slug}`
  // «Кратко» у услуг Stay Property часто повторяет начало текста — тогда не показываем его над текстом
  const excerptRepeats = !!s.excerpt && lexicalText(s.body).startsWith(s.excerpt.replace(/[….\s]+$/, '').slice(0, 80))
  const others = all.filter((x) => x.id !== s.id).sort((a, b) => Number(b.group === s.group) - Number(a.group === s.group)).slice(0, 3)
  const wa = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(s.title)}`
  const ld = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [[tc('home'), '/'], [t('crumbs'), '/services'], [s.title, path]].map(([name, h], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${getPathname({ href: h, locale })}` })) },
    {
      '@context': 'https://schema.org', '@type': 'Service', name: s.title, description: s.excerpt || undefined, areaServed: 'Alanya',
      provider: { '@type': 'RealEstateAgent', name: 'Kleo Homes', url: SITE_URL }, url: `${SITE_URL}${getPathname({ href: path, locale })}`,
      ...(cover ? { image: cover.src.startsWith('http') ? cover.src : `${SITE_URL}${cover.src}` } : {}),
    },
  ]

  return (
    <main className="pg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <div className="wrap">
        <nav className="crumbs" aria-label={tc('crumbs')}>
          <Link href="/">{tc('home')}</Link>›<Link href="/services">{t('crumbs')}</Link>›<span aria-current="page">{s.title}</span>
        </nav>
        <header className="post-head">
          <span className="meta-line"><span className="cat">{s.group === 'free' ? t('free') : t('service')}</span></span>
          <h1>{s.title}</h1>
          {s.excerpt && !excerptRepeats && <p className="lead-p">{s.excerpt}</p>}
        </header>
        {cover && <div className="post-cover"><Image src={cover.src} alt="" width={1400} height={612} priority sizes="(max-width: 1280px) 100vw, 1216px" unoptimized={cover.remote} /></div>}
        <div className="post-grid" style={{ marginTop: 28 }}>
          <article><Prose data={s.body} /></article>
          <aside className="post-side">
            <div className="cta-box">
              <b style={{ fontSize: 18 }}>{t('needHelp')}</b>
              <p>{t('help')}</p>
              <a href="#lead" className="btn btn-coral">{t('ask')}</a>
              <a href={wa} className="btn btn-wa">WhatsApp</a>
            </div>
          </aside>
        </div>
      </div>

      {others.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <div className="sec-head"><div><h2>{t('more')}</h2></div><Link href="/services" className="link">{t('all')}</Link></div>
            <div className="pgrid">{others.map((x) => <ServiceCard key={x.id} s={x} />)}</div>
          </div>
        </section>
      )}
    </main>
  )
}
