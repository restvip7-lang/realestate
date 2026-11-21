import '@/app/(frontend)/styles/pages.css'

import Image from 'next/image'
import { setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { catalogBasePath } from '@/lib/catalog-params'
import { districtStats, getCompany, listDistricts, listTeam, mediaUrl } from '@/lib/data'
import { abs, AGENT_ID, breadcrumbLd, JsonLd } from '@/lib/jsonld'
import { pageMeta } from '@/lib/seo'

// «О компании» (/about) по ТЗ: кто мы, цифры по каталогу, руководитель, офис и лицензия, ссылки на команду, отзывы и контакты.
// Цифры считаются по базе; тексты — общие, без выдуманных фактов (год основания и т. п. — только из «Компании» в админке).
const T = {
  ru: {
    meta: { title: 'О компании Kleo Homes — агентство недвижимости в Алании', description: 'Kleo Homes помогает купить и арендовать недвижимость в Алании: подбор, проверка документов, сделка, ВНЖ и аренда. Команда, офис, лицензия и отзывы.' },
    crumbs: ['Главная', 'О компании'],
    h1: 'О компании Kleo Homes',
    lead: 'Агентство недвижимости в Алании. Помогаем выбрать район и объект, проверяем документы, ведём сделку до ТАПУ и ключей и остаёмся рядом после покупки.',
    stats: ['объектов в каталоге', 'районов Алании', 'специалистов в команде', 'языка: RU · EN · TR'],
    whatTitle: 'Чем занимаемся',
    what: [['Продажа', 'Квартиры, пентхаусы, виллы и новостройки по всей Алании.'], ['Аренда', 'Долгосрочная аренда и управление вашей квартирой.'], ['Проверка и сделка', 'Юрист, сопровождение сделки, сделка удалённо по доверенности.'], ['ВНЖ и гражданство', 'Документы для всей семьи после покупки.']],
    leadTitle: 'Руководитель',
    officeTitle: 'Офис и лицензия',
    license: 'Лицензия агентства',
    links: [['Команда', '/team'], ['Отзывы клиентов', '/reviews'], ['Услуги', '/services'], ['Контакты', '/contacts']],
    toCatalog: 'Смотреть каталог',
  },
  en: {
    meta: { title: 'About Kleo Homes — real estate agency in Alanya', description: 'Kleo Homes helps you buy and rent property in Alanya: selection, legal checks, the transaction, residence permits and rentals. Team, office, licence and reviews.' },
    crumbs: ['Home', 'About'],
    h1: 'About Kleo Homes',
    lead: 'A real estate agency in Alanya. We help you choose a district and a property, check the documents, handle the deal through to the title deed and keys, and stay in touch after you buy.',
    stats: ['properties in the catalogue', 'Alanya districts', 'specialists on the team', 'languages: RU · EN · TR'],
    whatTitle: 'What we do',
    what: [['Sales', 'Apartments, penthouses, villas and new builds across Alanya.'], ['Rentals', 'Long-term rentals and management of your apartment.'], ['Checks and the deal', 'In-house lawyer, transaction support, remote purchase by power of attorney.'], ['Residence and citizenship', 'Documents for the whole family after purchase.']],
    leadTitle: 'Management',
    officeTitle: 'Office and licence',
    license: 'Agency licence',
    links: [['Team', '/team'], ['Client reviews', '/reviews'], ['Services', '/services'], ['Contacts', '/contacts']],
    toCatalog: 'Browse the catalogue',
  },
} satisfies Record<Locale, unknown>

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return pageMeta(locale, '/about', T[locale].meta)
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = T[locale]
  const [company, districts, team, stats] = await Promise.all([getCompany(locale), listDistricts(locale), listTeam(locale), districtStats()])
  const total = Object.values(stats).reduce((a, s) => a + s.sale + s.rent, 0)
  const head = team.find((m) => m.kind === 'founder')
  const headImg = head ? mediaUrl(head.photo, 'card') : null
  const office = mediaUrl(company.officePhoto, 'large')
  const ld = [
    breadcrumbLd([[t.crumbs[0], '/'], [t.crumbs[1], '/about']], locale),
    { '@context': 'https://schema.org', '@type': 'AboutPage', name: t.h1, url: abs('/about', locale), mainEntity: { '@id': AGENT_ID } },
  ]
  return (
    <main className="pg">
      <JsonLd data={ld} />
      <section className="dhero short">
        <div className="wrap">
          <nav className="crumbs" aria-label={t.crumbs[0]}><Link href="/">{t.crumbs[0]}</Link>›<span aria-current="page">{t.crumbs[1]}</span></nav>
          <h1>{t.h1}</h1>
          <p className="lead-t">{t.lead}</p>
          <div className="cta"><Link href={catalogBasePath({ deal: 'sale' })} className="btn btn-coral">{t.toCatalog}</Link></div>
        </div>
      </section>
      <section className="sec">
        <div className="wrap">
          <div className="stats">
            {[total, districts.length, team.length, 3].map((n, i) => <div key={i}><b>{n.toLocaleString(locale)}</b><span>{t.stats[i]}</span></div>)}
          </div>
        </div>
      </section>
      <section className="sec">
        <div className="wrap">
          <h2>{t.whatTitle}</h2>
          <div className="sgrid">{t.what.map(([h, p]) => <article className="scard" key={h}><h3>{h}</h3><p>{p}</p></article>)}</div>
        </div>
      </section>
      {head && (
        <section className="sec">
          <div className="wrap">
            <h2>{t.leadTitle}</h2>
            <div className="ccards">
              <div className="ccard">
                {headImg && <Image src={headImg} alt={head.name} width={240} height={300} />}
                <b><Link href={`/team/${head.slug}`} className="link">{head.name}</Link></b>
                <span>{head.role}</span>
              </div>
            </div>
          </div>
        </section>
      )}
      <section className="sec">
        <div className="wrap">
          <h2>{t.officeTitle}</h2>
          <p>{company.address}{company.hours ? ` · ${company.hours}` : ''}</p>
          {company.legal?.license && <p className="hint">{t.license}: {company.legal.license}</p>}
          {office && <Image src={office} alt={t.officeTitle} width={900} height={560} sizes="(max-width: 760px) 100vw, 900px" />}
          <div className="acts">{t.links.map(([label, href]) => <Link key={href} href={href} className="btn btn-line btn-sm">{label}</Link>)}</div>
        </div>
      </section>
    </main>
  )
}
