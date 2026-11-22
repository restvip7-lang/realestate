import '@/app/(frontend)/styles/pages.css'

import { setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { catalogBasePath } from '@/lib/catalog-params'
import { abs, AGENT_ID, breadcrumbLd, JsonLd } from '@/lib/jsonld'
import { pageMeta } from '@/lib/seo'

// Услуга «Проверка объекта перед покупкой» (due diligence) — отдельная страница по ТЗ.
// Цены и сроки — демо, как на странице «Услуги»; проверит агентство (docs/demo-data.md).
const T = {
  ru: {
    meta: { title: 'Проверка недвижимости перед покупкой в Алании (due diligence)', description: 'Юрист проверит квартиру или виллу в Алании до брони: ТАПУ, долги и обременения, iskan, статус квартала для ВНЖ, застройщик. От 300 €, 3–5 дней.' },
    crumbs: ['Главная', 'Услуги', 'Проверка объекта'],
    eyebrow: 'Услуга',
    h1: 'Проверка объекта перед покупкой',
    lead: 'Нашли квартиру сами или у другого агентства? Юрист Kleo Homes проверит её до брони и задатка и скажет, можно ли покупать. Отчёт на русском или английском.',
    cta: 'Заказать проверку',
    price: 'от 300 € · 3–5 рабочих дней (демо)',
    whatTitle: 'Что проверяем',
    what: [
      ['ТАПУ (свидетельство о собственности)', 'Кто собственник, совпадает ли площадь и тип объекта, нет ли совладельцев и ограничений на продажу.'],
      ['Долги и обременения', 'Ипотека, аресты, запреты, долги по налогу на недвижимость, коммунальным платежам и aidat.'],
      ['Iskan и перепланировки', 'Есть ли разрешение на заселение, совпадает ли квартира с проектом, узаконены ли пристройки.'],
      ['Статус квартала для ВНЖ', 'Открыт ли квартал (mahalle) для ВНЖ иностранцам — от этого зависит, получите ли вы ВНЖ по этой покупке.'],
      ['Застройщик и проект', 'Для новостроек: разрешение на строительство, репутация застройщика, сроки, гарантии в договоре.'],
      ['Договор и оценка', 'Читаем договор и предварительный договор, сверяем цену с отчётом об оценке (SPK) и рынком района.'],
    ],
    howTitle: 'Как проходит',
    how: ['Присылаете адрес или ссылку на объект и копию ТАПУ, если есть.', 'Юрист запрашивает данные в кадастре и муниципалитете, при необходимости выезжает на объект.', 'Через 3–5 рабочих дней — письменный отчёт: риски, что исправить до сделки, можно ли покупать.', 'Если покупаете через нас — стоимость проверки входит в сопровождение сделки.'],
    faqTitle: 'Частые вопросы',
    faq: [
      ['Сколько стоит проверка?', 'От 300 € за квартиру на вторичном рынке. Виллы, земля и коммерческая недвижимость — по запросу (цены демо).'],
      ['Нужно ли приезжать в Турцию?', 'Нет. Нужны только данные объекта; отчёт пришлём по почте или в мессенджер.'],
      ['Что, если найдут проблемы?', 'В отчёте будет, что именно не так и можно ли это исправить до сделки. Решение о покупке остаётся за вами.'],
      ['Проверяете ли новостройки?', 'Да: разрешения, застройщика, договор и график платежей.'],
    ],
    toCatalog: 'Каталог проверенных объектов',
    toServices: 'Все услуги',
  },
  en: {
    meta: { title: 'Property due diligence in Alanya before you buy', description: 'A lawyer checks an apartment or villa in Alanya before you reserve: title deed, debts and encumbrances, iskan, residence-permit status, developer. From €300, 3–5 days.' },
    crumbs: ['Home', 'Services', 'Property check'],
    eyebrow: 'Service',
    h1: 'Property check before you buy',
    lead: 'Found a property yourself or through another agency? A Kleo Homes lawyer checks it before any reservation or deposit and tells you whether it is safe to buy. Report in English or Russian.',
    cta: 'Order a check',
    price: 'from €300 · 3–5 business days (demo)',
    whatTitle: 'What we check',
    what: [
      ['Title deed (TAPU)', 'Who owns it, whether area and type match, co-owners and any restrictions on sale.'],
      ['Debts and encumbrances', 'Mortgages, seizures, bans, unpaid property tax, utilities and aidat.'],
      ['Iskan and alterations', 'Occupancy permit, whether the flat matches the approved project, whether extensions are legal.'],
      ['Residence-permit status', 'Whether the neighbourhood (mahalle) is open to residence permits for foreigners.'],
      ['Developer and project', 'For new builds: building permit, developer track record, deadlines and contract guarantees.'],
      ['Contract and valuation', 'We review the contract and the preliminary agreement and compare the price with the SPK valuation and the district market.'],
    ],
    howTitle: 'How it works',
    how: ['Send us the address or listing link and a copy of the title deed if you have one.', 'Our lawyer requests data from the land registry and municipality and visits the property if needed.', 'In 3–5 business days you get a written report: risks, what to fix before the deal, and whether to buy.', 'If you buy through us, the check is included in the transaction service.'],
    faqTitle: 'FAQ',
    faq: [
      ['How much does it cost?', 'From €300 for a resale apartment. Villas, land and commercial property on request (demo prices).'],
      ['Do I need to come to Turkey?', 'No. We only need the property details; the report is sent by email or messenger.'],
      ['What if problems are found?', 'The report explains what is wrong and whether it can be fixed before the deal. The decision is yours.'],
      ['Do you check new builds?', 'Yes: permits, developer, contract and payment schedule.'],
    ],
    toCatalog: 'Browse checked properties',
    toServices: 'All services',
  },
} satisfies Record<Locale, unknown>

type Props = { params: Promise<{ locale: Locale }> }
const PATH = '/services/due-diligence'

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return pageMeta(locale, PATH, T[locale].meta)
}

export default async function DueDiligencePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = T[locale]
  const ld = [
    breadcrumbLd([[t.crumbs[0], '/'], [t.crumbs[1], '/services'], [t.crumbs[2], PATH]], locale),
    { '@context': 'https://schema.org', '@type': 'Service', name: t.h1, serviceType: 'Property due diligence', description: t.meta.description, url: abs(PATH, locale), provider: { '@id': AGENT_ID }, areaServed: { '@type': 'City', name: 'Alanya' }, offers: { '@type': 'Offer', price: 300, priceCurrency: 'EUR' } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: t.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ]
  return (
    <main className="pg">
      <JsonLd data={ld} />
      <section className="dhero short">
        <div className="wrap">
          <nav className="crumbs" aria-label={t.crumbs[0]}><Link href="/">{t.crumbs[0]}</Link>›<Link href="/services">{t.crumbs[1]}</Link>›<span aria-current="page">{t.crumbs[2]}</span></nav>
          <span className="eyebrow">{t.eyebrow}</span>
          <h1>{t.h1}</h1>
          <p className="lead-t">{t.lead}</p>
          <div className="cta"><a href="#lead" className="btn btn-coral">{t.cta}</a><span className="price-tag">{t.price}</span></div>
        </div>
      </section>
      <section className="sec">
        <div className="wrap">
          <h2>{t.whatTitle}</h2>
          <div className="sgrid">
            {t.what.map(([h, p]) => (
              <article className="scard" key={h}><h3>{h}</h3><p>{p}</p></article>
            ))}
          </div>
        </div>
      </section>
      <section className="sec">
        <div className="wrap">
          <h2>{t.howTitle}</h2>
          <ol className="checklist">{t.how.map((x) => <li key={x}>{x}</li>)}</ol>
          <div className="acts"><Link href={catalogBasePath({ deal: 'sale' })} className="btn btn-line btn-sm">{t.toCatalog}</Link><Link href="/services" className="btn btn-line btn-sm">{t.toServices}</Link><a href="#lead" className="btn btn-dark btn-sm">{t.cta}</a></div>
        </div>
      </section>
      <section className="sec">
        <div className="wrap faq">
          <div><h2>{t.faqTitle}</h2></div>
          <div>{t.faq.map(([q, a], i) => <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>)}</div>
        </div>
      </section>
    </main>
  )
}
