import '@/app/(frontend)/styles/pages.css'

import { getTranslations, setRequestLocale } from 'next-intl/server'

import { CoastMap } from '@/components/site/CoastMap'
import { Price } from '@/components/site/Currency'
import { DistrictCard } from '@/components/site/DistrictCard'
import { NavSelect } from '@/components/site/NavSelect'
import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { type DistrictStat, districtStats, listDistricts } from '@/lib/data'
import { districtPm } from '@/lib/district-prices'
import { pageMeta, SITE_URL } from '@/lib/seo'
import type { District } from '@/payload-types'

type SP = Promise<Record<string, string | string[] | undefined>>
type Props = { params: Promise<{ locale: Locale }>; searchParams: SP }

const FILTERS = ['sea', 'inland', 'life', 'rent', 'quiet', 'budget'] as const
const SORTS = ['geo', 'cheap', 'exp', 'objs', 'center'] as const
type F = (typeof FILTERS)[number]
// столбцы таблицы сравнения; у первых трёх «лучше» — меньше
const CMP = ['toCenter', 'toSea', 'pm', 'sale', 'rent', 'life', 'rentScore', 'beach', 'quiet'] as const
type C = (typeof CMP)[number]
type Dir = 'asc' | 'desc'
const ASC_FIRST: readonly C[] = ['toCenter', 'toSea', 'pm']
type S = (typeof SORTS)[number]

const pos = (d: District) => d.coastKm ?? 0
const km = (d: District) => Math.abs(pos(d))

export async function generateMetadata({ params, searchParams }: Props) {
  const { locale } = await params
  const sp = await searchParams
  const t = await getTranslations({ locale, namespace: 'districts' })
  const n = (await listDistricts(locale)).length
  return pageMeta(locale, '/districts', { title: t('listTitle'), description: t('listMetaDesc', { n }), noindex: !!(sp.f || sp.sort || sp.cmp) })
}

export default async function DistrictsPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const sp = await searchParams
  const t = await getTranslations('districts')
  const tc = await getTranslations('catalog')
  const tcard = await getTranslations('card')
  const [districts, stats] = await Promise.all([listDistricts(locale), districtStats()])
  const st = (d: District): DistrictStat => stats[d.id] ?? { sale: 0, rent: 0, minSea: null, pm: 0, pmN: 0, pmAll: 0, pmAllN: 0, rentFrom: 0 }
  // цена за м² — медиана по квартирам каталога или запасное значение из админки (src/lib/district-prices.ts)
  const pm = (d: District) => districtPm(d, stats[d.id])?.eur ?? 0
  const f = FILTERS.find((x) => x === sp.f) as F | undefined
  const sort: S = SORTS.find((x) => x === sp.sort) ?? 'geo'

  const byPm = [...districts].filter((d) => pm(d)).sort((a, b) => pm(a) - pm(b))
  const budgetMax = byPm.length ? pm(byPm[Math.min(4, byPm.length - 1)]) : 0
  const sc = (d: District, k: 'life' | 'rent' | 'beach' | 'infra' | 'quiet') => d.scores?.[k] ?? 0
  const FN: Record<F, (d: District) => boolean> = {
    sea: (d) => !d.inland, inland: (d) => !!d.inland, life: (d) => sc(d, 'life') >= 4, rent: (d) => sc(d, 'rent') >= 4,
    quiet: (d) => sc(d, 'quiet') >= 4, budget: (d) => !!pm(d) && pm(d) <= budgetMax,
  }
  const SN: Record<S, (a: District, b: District) => number> = {
    geo: (a, b) => (a.inland ? pos(a) - 0.5 : pos(a)) - (b.inland ? pos(b) - 0.5 : pos(b)),
    cheap: (a, b) => (pm(a) || 1e9) - (pm(b) || 1e9),
    exp: (a, b) => pm(b) - pm(a),
    objs: (a, b) => st(b).sale - st(a).sale,
    center: (a, b) => km(a) - km(b),
  }
  const list = districts.filter(f ? FN[f] : () => true).sort(SN[sort])

  // таблица сравнения сортируется отдельно, по клику на заголовок столбца (?cmp=beach&dir=desc#compare).
  // Первый клик — «лучшие первыми»: ближе, дешевле, больше объектов, выше оценка; повторный — наоборот.
  const seaVal = (d: District) => (d.mountains ? 1e6 : (st(d).minSea ?? (d.inland ? 5e5 : 9e5)))
  const CV: Record<C, (d: District) => number> = {
    toCenter: km, toSea: seaVal, pm: (d) => pm(d) || 1e9, sale: (d) => st(d).sale, rent: (d) => st(d).rent,
    life: (d) => sc(d, 'life'), rentScore: (d) => sc(d, 'rent'), beach: (d) => sc(d, 'beach'), quiet: (d) => sc(d, 'quiet'),
  }
  const firstDir = (k: C): Dir => (ASC_FIRST.includes(k) ? 'asc' : 'desc')
  const cmp = CMP.find((x) => x === sp.cmp)
  const dir: Dir | undefined = cmp ? (sp.dir === 'asc' || sp.dir === 'desc' ? sp.dir : firstDir(cmp)) : undefined
  const all = cmp
    ? [...districts].sort((a, b) => (dir === 'asc' ? 1 : -1) * (CV[cmp](a) - CV[cmp](b)) || SN.geo(a, b))
    : [...districts].sort(SN[sort])
  const href = (patch: { f?: string; sort?: string; cmp?: C; dir?: Dir }, hash = '') => {
    const q = new URLSearchParams()
    const nf = 'f' in patch ? patch.f : f
    const ns = 'sort' in patch ? patch.sort : sort
    const nc = 'cmp' in patch ? patch.cmp : cmp
    if (nf) q.set('f', nf)
    if (ns && ns !== 'geo') q.set('sort', ns)
    if (nc) {
      q.set('cmp', nc)
      const nd = 'dir' in patch ? patch.dir : dir
      if (nd && nd !== firstDir(nc)) q.set('dir', nd)
    }
    return `/districts${q.size ? `?${q}` : ''}${hash}`
  }
  const seaTxt = (d: District) => {
    if (d.mountains) return t('seaTepe')
    const m = st(d).minSea
    return m != null ? t('seaFrom', { m }) : t('seaNear')
  }
  const cls = (k: C) => `num${cmp === k ? ' sorted' : ''}`
  const kmTxt = (d: District) => (km(d) ? t('km', { n: km(d) }) : t('center'))
  const dots = (n: number) => (
    <span className="dots" role="img" aria-label={t('outOf5', { n })}>{'●'.repeat(n)}<i>{'●'.repeat(5 - n)}</i></span>
  )
  const names = (fn: (d: District) => boolean) => districts.filter(fn).map((d) => d.name).join(', ')
  const faq = [
    [t('listFaq.lifeQ'), t('listFaq.lifeA', { names: names((d) => sc(d, 'life') >= 5) })],
    [t('listFaq.rentQ'), t('listFaq.rentA', { names: names((d) => sc(d, 'rent') >= 4) })],
    [t('listFaq.cheapQ'), t('listFaq.cheapA', { names: byPm.slice(0, 4).map((d) => d.name).join(', '), top: byPm.slice(-2).reverse().map((d) => d.name).join(', ') })],
    [t('listFaq.inlandQ'), t('listFaq.inlandA', { names: names((d) => !!d.inland) })],
    [t('listFaq.airportQ'), t('listFaq.airportA')],
  ]
  const ld = [
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [[t('crumbs'), '/districts']].map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${getPathname({ href: p, locale })}` })),
    },
    {
      '@context': 'https://schema.org', '@type': 'ItemList', name: t('crumbs'), numberOfItems: districts.length,
      itemListElement: districts.map((d, i) => ({ '@type': 'ListItem', position: i + 1, name: d.name, url: `${SITE_URL}${getPathname({ href: `/districts/${d.slug}`, locale })}` })),
    },
  ]

  return (
    <main className="pg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <section className="dhero" style={{ paddingBottom: 40 }}>
        <div className="wrap">
          <nav className="crumbs" aria-label={tc('crumbs')}><Link href="/">{tc('home')}</Link>›<span aria-current="page">{t('crumbs')}</span></nav>
          <span className="eyebrow">{t('guide')}</span>
          <h1>{t('listTitle')}</h1>
          <p className="lead-t">{t('listLead', { sea: districts.filter((d) => !d.inland).length, inland: districts.filter((d) => d.inland).length })}</p>
          <div className="map-box" id="coast" style={{ marginTop: 28, minHeight: 380 }}>
            <CoastMap districts={districts} locale={locale} label={t('mapLabel')} />
            <span className="map-note"><span>{t('mapNote')}</span></span>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="dfilters">
            <div className="chips" role="group" aria-label={t('filterLabel')}>
              <Link className="chip" href={href({ f: undefined })} aria-current={!f ? 'true' : undefined}>{t('filters.all', { n: districts.length })}</Link>
              {FILTERS.map((x) => (
                <Link key={x} className="chip" href={href({ f: x })} aria-current={f === x ? 'true' : undefined}>{t(`filters.${x}`)}</Link>
              ))}
            </div>
            <NavSelect className="dsort" label={t('sortLabel')} value={sort} options={SORTS.map((s) => ({ value: s, label: t(`sorts.${s}`), href: href({ sort: s }) }))} />
          </div>
          {f && <p className="hint" aria-live="polite" style={{ margin: '-8px 0 16px' }}>{t('found', { n: list.length })}</p>}
          <div className="dgrid">
            {list.map((d) => <DistrictCard key={d.slug} d={d} stat={st(d)} />)}
          </div>
          <p className="hint" style={{ marginTop: 10 }}>{t('photoNote')}</p>
        </div>
      </section>

      <section className="sec" id="compare" style={{ background: 'var(--mist)' }}>
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">{t('cmpEyebrow')}</span><h2>{t('cmpTitle')}</h2></div><p>{t('cmpNote')}</p></div>
          <p className="cmp-state hint" aria-live="polite">
            {cmp ? (
              <>{t('cmpSortedBy', { col: t(`th.${cmp}`) })} {dir === 'asc' ? '▲' : '▼'} · <Link href={href({ cmp: undefined }, '#compare')} scroll={false} className="link">{t('cmpReset')}</Link></>
            ) : t('cmpSortHint')}
          </p>
          <div className="cmp-wrap">
            <table className={`ptable${cmp ? ' is-sorted' : ''}`}>
              <caption className="vh">{t('cmpTitle')}</caption>
              <thead>
                <tr>
                  <th scope="col">{t('th.district')}</th>
                  {CMP.map((k) => {
                    const on = cmp === k
                    const next: Dir = on ? (dir === 'asc' ? 'desc' : 'asc') : firstDir(k)
                    return (
                      <th key={k} scope="col" className={`num${on ? ' sorted' : ''}`} aria-sort={on ? (dir === 'asc' ? 'ascending' : 'descending') : undefined}>
                        <Link href={href({ cmp: k, dir: next }, '#compare')} scroll={false} aria-label={t('cmpSortBy', { col: t(`th.${k}`) })}>
                          {t(`th.${k}`)}<span className="arr" aria-hidden="true">{on ? (dir === 'asc' ? '▲' : '▼') : '↕'}</span>
                        </Link>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {all.map((d, i) => (
                  <tr key={d.slug} className={cmp && i < 3 ? 'top' : undefined}>
                    <td>{cmp && <span className="rank">{i + 1}</span>}<Link href={`/districts/${d.slug}`}>{d.name}</Link>{d.inland && <span className="hint"> · {t(d.mountains ? 'mountainsShort' : 'inlandShort')}</span>}</td>
                    <td className={cls('toCenter')}>{kmTxt(d)}</td>
                    <td className={cls('toSea')}>{seaTxt(d)}</td>
                    <td className={cls('pm')}>{pm(d) ? <Price eur={pm(d)} suffix={tcard('perM2')} /> : '—'}</td>
                    <td className={cls('sale')}><Link href={`/sale?district=${d.slug}`}>{st(d).sale}</Link></td>
                    <td className={cls('rent')}><Link href={`/rent?district=${d.slug}`}>{st(d).rent}</Link></td>
                    <td className={cls('life')}>{dots(sc(d, 'life'))}</td>
                    <td className={cls('rentScore')}>{dots(sc(d, 'rent'))}</td>
                    <td className={cls('beach')}>{dots(sc(d, 'beach'))}</td>
                    <td className={cls('quiet')}>{dots(sc(d, 'quiet'))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap faq">
          <div>
            <span className="eyebrow">{t('faqEyebrow')}</span>
            <h2 style={{ marginTop: 8 }}>{t('listFaqTitle')}</h2>
            <p className="hint" style={{ marginTop: 10 }}>{t('listFaqHint')} <a href="#lead" className="link">{t('listFaqAsk')}</a></p>
          </div>
          <div>{faq.map(([q, a], i) => <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>)}</div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap seo">
          <h2>{t('listSeoTitle')}</h2>
          <p>{t('listSeo1')}</p>
          <p>{t('listSeo2')}</p>
          <div className="links">{districts.map((d) => <Link key={d.slug} href={`/districts/${d.slug}`}>{t('seoLink', { where: tc('inDistrict', { where: d.nameIn || d.name }) })}</Link>)}</div>
        </div>
      </section>
    </main>
  )
}
