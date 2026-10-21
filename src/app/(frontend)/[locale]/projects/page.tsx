import '@/app/(frontend)/styles/pages.css'
import '@/app/(frontend)/styles/projects.css'

import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Price } from '@/components/site/Currency'
import { NavSelect } from '@/components/site/NavSelect'
import { ProjectCard } from '@/components/site/ProjectCard'
import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { parseProjects, projectsQueryString, type SearchParams } from '@/lib/catalog-params'
import { listDistricts, listProjects, type ProjectQuery, projectStats } from '@/lib/data'
import { propertyPath } from '@/lib/format'
import { pageMeta, SITE_URL } from '@/lib/seo'

// Новостройки: проекты застройщиков (объекты с type 'project'), docs/projects.md
type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<SearchParams> }

const BUDGETS = [150_000, 250_000, 400_000, 700_000, 1_000_000]
const fmt = (n: number, locale: Locale) => n.toLocaleString(locale === 'en' ? 'en-US' : locale, { maximumFractionDigits: 0 })

export async function generateMetadata({ params, searchParams }: Props) {
  const { locale } = await params
  const q = parseProjects(await searchParams)
  const t = await getTranslations({ locale, namespace: 'projects' })
  const s = await projectStats()
  // страницы с фильтрами не индексируем, canonical — на основной раздел
  return pageMeta(locale, '/projects', {
    title: t('metaTitle', { n: s.total }),
    description: t('metaDesc', { price: fmt(s.minPrice, locale) }),
    noindex: !!(q.district || q.when || q.max || q.citizenship || q.sort || q.page),
  })
}

export default async function ProjectsPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const q = parseProjects(await searchParams)
  const t = await getTranslations('projects')
  const tc = await getTranslations('catalog')
  const districts = await listDistricts(locale)
  const [res, s] = await Promise.all([listProjects(locale, q, districts), projectStats()])
  const d = districts.find((x) => x.slug === q.district)
  const withProjects = districts.filter((x) => s.byDistrict[x.id])
  const years = Object.keys(s.years).map(Number).sort()
  const href = (patch: Partial<ProjectQuery>) => `/projects${projectsQueryString({ ...q, page: undefined }, patch)}`
  const title = d ? t('titleIn', { where: tc('inDistrict', { where: d.nameIn || d.name }) }) : t('title')
  const pages = Array.from({ length: res.totalPages }, (_, i) => i + 1)
  const faq = t.raw('faq') as { q: string; a: string }[]

  const ld = [
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [[t('crumbs'), '/projects']].map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${getPathname({ href: p, locale })}` })),
    },
    {
      '@context': 'https://schema.org', '@type': 'ItemList', name: title, numberOfItems: res.totalDocs,
      itemListElement: res.docs.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.title, url: `${SITE_URL}${getPathname({ href: propertyPath(p), locale })}` })),
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })),
    },
  ]

  return (
    <main className="pg pg-projects">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <section className="dhero">
        <div className="wrap">
          <nav className="crumbs" aria-label={tc('crumbs')}>
            <Link href="/">{tc('home')}</Link>›
            {d ? <><Link href="/projects">{t('crumbs')}</Link>›<span aria-current="page">{d.name}</span></> : <span aria-current="page">{t('crumbs')}</span>}
          </nav>
          <span className="eyebrow">{t('eyebrow')}</span>
          <h1>{title}</h1>
          <p className="lead-t">{t('lead')}</p>
          <dl className="pstats">
            <div><dt>{t('statProjects', { n: s.total })}</dt><dd>{s.total}</dd></div>
            {s.minPrice > 0 && <div><dt>{t('statFrom')}</dt><dd><Price eur={s.minPrice} /></dd></div>}
            <div><dt>{t('statDistricts', { n: withProjects.length })}</dt><dd>{withProjects.length}</dd></div>
            {years.length > 0 && <div><dt>{t('statYears')}</dt><dd>{years[0] === years.at(-1) ? years[0] : `${years[0]}–${years.at(-1)}`}</dd></div>}
          </dl>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="pfilters">
            <div className="chips" role="group" aria-label={t('whenLabel')}>
              <Link className="chip" scroll={false} href={href({ when: undefined })} aria-current={!q.when ? 'true' : undefined}>{t('whenAll')}</Link>
              {years.map((y) => (
                <Link key={y} className="chip" scroll={false} href={href({ when: y })} aria-current={q.when === y ? 'true' : undefined}>{y}</Link>
              ))}
              <Link className="chip" scroll={false} href={href({ citizenship: !q.citizenship })} aria-current={q.citizenship ? 'true' : undefined}>{t('cit')}</Link>
            </div>
            <div className="selects">
              <NavSelect
                label={t('district')}
                value={q.district ?? ''}
                options={[{ value: '', label: t('districtAll'), href: href({ district: undefined }) }, ...withProjects.map((x) => ({ value: x.slug, label: `${x.name} (${s.byDistrict[x.id]})`, href: href({ district: x.slug }) }))]}
              />
              <NavSelect
                label={t('budget')}
                value={String(q.max ?? '')}
                options={[{ value: '', label: t('budgetAll'), href: href({ max: undefined }) }, ...BUDGETS.map((b) => ({ value: String(b), label: t('budgetTo', { sum: fmt(b, locale) }), href: href({ max: b }) }))]}
              />
              <NavSelect
                label={t('sort')}
                value={q.sort ?? 'new'}
                options={(['new', 'cheap', 'expensive', 'soon'] as const).map((x) => ({ value: x, label: t(`sorts.${x}`), href: href({ sort: x }) }))}
              />
            </div>
          </div>
          <div className="pres">
            <p className="cnt" aria-live="polite">{t('found', { n: res.totalDocs })}</p>
            <Link href="/sale?new=1" className="link">{t('units')}</Link>
          </div>
          {res.docs.length ? (
            <div className="grid3">{res.docs.map((p, i) => <ProjectCard key={p.id} p={p} priority={i < 3} />)}</div>
          ) : (
            <div className="empty">
              <b>{t('empty')}</b>
              <p className="hint">{t('emptyHint')}</p>
              <Link href="/projects" className="btn btn-dark">{t('reset')}</Link>
            </div>
          )}
          {pages.length > 1 && (
            <nav className="ppages" aria-label={t('pagination')}>
              {pages.map((n) =>
                n === res.page ? <span key={n} aria-current="page">{n}</span> : <Link key={n} href={`/projects${projectsQueryString(q, { page: n })}`}>{n}</Link>,
              )}
            </nav>
          )}
        </div>
      </section>

      <section className="sec" style={{ background: 'var(--mist)' }}>
        <div className="wrap faq">
          <div>
            <span className="eyebrow">{t('faqEyebrow')}</span>
            <h2 style={{ marginTop: 8 }}>{t('faqTitle')}</h2>
            <p className="hint" style={{ marginTop: 10 }}>{t('faqHint')} <a href="#lead" className="link">{t('faqAsk')}</a></p>
          </div>
          <div>{faq.map((x, i) => <details key={x.q} open={i === 0}><summary>{x.q}</summary><p>{x.a}</p></details>)}</div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap seo">
          <h2>{t('seoTitle')}</h2>
          <p>{t('seo1')}</p>
          <p>{t('seo2')}</p>
          <h3>{t('seoByDistrict')}</h3>
          <div className="links">
            {withProjects.map((x) => <Link key={x.slug} href={`/projects?district=${x.slug}`}>{t('titleIn', { where: tc('inDistrict', { where: x.nameIn || x.name }) })}</Link>)}
          </div>
        </div>
      </section>
    </main>
  )
}
