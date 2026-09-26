import '@/app/(frontend)/styles/pages.css'

import Image from 'next/image'
import { setRequestLocale } from 'next-intl/server'

import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { COAST } from '@/lib/coast'
import { getCompany, listDistricts, listTeam, mediaUrl } from '@/lib/data'
import { pageMeta, SITE_URL } from '@/lib/seo'

// Тексты страницы — русские (длинные тексты переводятся отдельно, docs/CLAUDE-NOTES.md); контакты — из админки
type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return pageMeta(locale, '/contacts', { title: 'Контакты агентства недвижимости в Алании', description: 'Телефон, WhatsApp, Telegram и e-mail Kleo Homes, адреса офиса и шоурума в Алании, реквизиты компании.' })
}

export default async function ContactsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const [company, team, districts] = await Promise.all([getCompany(locale), listTeam(locale), listDistricts(locale)])
  const tel = company.phone.replace(/[^+\d]/g, '')
  const wa = (text: string) => `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(text)}`
  const cards: [string, string, string, string, string, string, string][] = [
    ['☎', 'Телефон', company.phone, company.hours || '', `tel:${tel}`, 'Позвонить', 'btn-dark'],
    ['✆', 'WhatsApp', company.phone, 'Отвечаем каждый день', wa('Здравствуйте! Хочу проконсультироваться.'), 'Написать в WhatsApp', 'btn-wa'],
    ...(company.telegram ? [['✈', 'Telegram', `@${company.telegram}`, 'Чат и канал с новостями', `https://t.me/${company.telegram}`, 'Открыть Telegram', 'btn-tg'] as [string, string, string, string, string, string, string]] : []),
    ['✉', 'E-mail', company.email, 'Для документов и запросов', `mailto:${company.email}`, 'Написать письмо', 'btn-line'],
  ]
  const c = districts.find((d) => d.slug === 'center'), m = districts.find((d) => d.slug === 'mahmutlar')
  const map = (
    <svg viewBox="360 60 480 260" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Схема: офис в центре Аланьи и шоурум в Махмутларе" className="zoom">
      <defs><pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="rgba(0,163,196,.28)" /></pattern></defs>
      <path d={`${COAST} L1000 440 L0 440Z`} fill="url(#dots)" />
      <path d={COAST} fill="none" stroke="#00A3C4" strokeWidth="1.6" />
      {districts.filter((d) => d !== c && d !== m).map((d) => <circle key={d.slug} cx={d.schema?.x ?? 0} cy={d.schema?.y ?? 0} r="4" fill="rgba(255,255,255,.3)" />)}
      {([[c, 'Офис · Центр', 'middle', 0], [m, 'Шоурум · Махмутлар', 'end', 14]] as const).map(([d, t, anc, dx]) => d && (
        <g className="pin on" key={t}>
          <circle className="dot" cx={d.schema?.x ?? 0} cy={d.schema?.y ?? 0} r="9" />
          <text x={(d.schema?.x ?? 0) + dx} y={(d.schema?.y ?? 0) - 18} textAnchor={anc}>{t}</text>
        </g>
      ))}
    </svg>
  )
  const experts = (
    <div className="xrow">
      {team.filter((t) => t.kind !== 'founder').map((t) => {
        const a = mediaUrl(t.photo, 'thumb')
        return (
          <a key={t.id} href={wa(`Здравствуйте, ${t.name}! Хочу проконсультироваться.`)} target="_blank" rel="noopener">
            {a ? <Image src={a} alt="" width={120} height={120} /> : <span />}
            <span><b>{t.name}</b><span>{t.role} · {t.langs}</span></span>
          </a>
        )
      })}
    </div>
  )
  const ld = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Главная', '/'], ['Контакты', '/contacts']].map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${getPathname({ href: p, locale })}` })) },
    {
      '@context': 'https://schema.org', '@type': 'RealEstateAgent', name: 'Kleo Homes', legalName: company.legal?.name, telephone: company.phone, email: company.email,
      address: { '@type': 'PostalAddress', streetAddress: company.address, addressLocality: 'Alanya', addressRegion: 'Antalya', addressCountry: 'TR' },
      ...(company.lat && company.lng ? { geo: { '@type': 'GeoCoordinates', latitude: company.lat, longitude: company.lng } } : {}),
      openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '09:00', closes: '19:00' }],
      sameAs: [company.telegram && `https://t.me/${company.telegram}`, ...(company.social || []).map((s) => s.url)].filter(Boolean),
    },
  ]

  return (
    <main className="pg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <section className="dhero short">
        <div className="wrap">
          <nav className="crumbs" aria-label="Хлебные крошки"><Link href="/">Главная</Link>›<span aria-current="page">Контакты</span></nav>
          <span className="eyebrow">Контакты</span>
          <h1>Контакты Kleo Homes</h1>
          <p className="lead-t">Отвечаем на русском, английском и турецком. В рабочее время — в течение 15 минут, в выходные — на следующий день.</p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="ccards">
            {cards.map(([ic, t, v, s, href, cta, cls]) => (
              <div className="ccard" key={t}>
                <span className="ic" aria-hidden="true">{ic}</span><span>{t}</span><b>{v}</b><span>{s}</span>
                <a className={`btn ${cls} btn-sm`} href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}>{cta}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: "var(--mist)" }}>
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">Адреса</span><h2>Офис и шоурум</h2></div><p>Приходите без записи в часы работы или договоритесь о встрече — встретим и покажем объекты.</p></div>
          <div className="offices">
            <div className="box"><h3>Офис в центре</h3><dl><dt>Адрес</dt><dd>{company.address}</dd><dt>Часы</dt><dd>{company.hours}</dd><dt>Рядом</dt><dd>5 минут пешком до пляжа Клеопатры</dd></dl><a href="#lead" className="btn btn-dark btn-sm">Записаться на встречу</a></div>
            <div className="box"><h3>Шоурум в Махмутларе</h3><dl><dt>Адрес</dt><dd>{company.showroom}</dd><dt>Часы</dt><dd>{company.hours}</dd><dt>Что есть</dt><dd>Презентации новостроек, консультации юриста</dd></dl><Link href="/news/kleo-homes-otkryvaet-shourum-v-makhmutlare-demo" className="btn btn-line btn-sm">О шоуруме</Link></div>
            <div className="map-box">
              {map}
              <span className="map-note"><span>Схема не в масштабе. Точный маршрут пришлём в WhatsApp.</span></span>
            </div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">Эксперты</span><h2>Написать эксперту напрямую</h2></div><Link href="/team" className="link">Вся команда →</Link></div>
          {experts}
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap cols2">
          <div className="box">
            <h3>Реквизиты</h3>
            <dl className="req">
              <dt>Компания</dt><dd>{company.legal?.name}</dd>
              <dt>Лицензия TTYB</dt><dd>№ <span>{company.legal?.license}</span></dd>
              <dt>Налоговая инспекция</dt><dd>{company.legal?.taxOffice}</dd>
              <dt>Налоговый номер</dt><dd>{company.legal?.taxNo}</dd>
              <dt>Реестр операторов данных</dt><dd>VERBİS № <span>{company.legal?.verbis}</span></dd>
              <dt>Юридический адрес</dt><dd>{company.address}</dd>
            </dl>
          </div>
          <div className="faq" style={{ display: "block" }}>
            <h3 style={{ fontSize: "19px", marginBottom: "4px" }}>Частые вопросы</h3>
            <details open><summary>Работаете ли вы в выходные?</summary><p>Офис и шоурум открыты с понедельника по субботу. В воскресенье проводим показы по договорённости, а в WhatsApp отвечаем каждый день.</p></details>
            <details><summary>Можно ли встретиться, если я ещё не в Турции?</summary><p>Да. Проводим консультации и показы по видеосвязи в удобное вам время — с учётом часового пояса.</p></details>
            <details><summary>Как запросить или удалить свои данные?</summary><p>Напишите на почту с темой «Персональные данные». Порядок описан в <Link href="/privacy#how" className="link">политике конфиденциальности</Link>.</p></details>
          </div>
        </div>
      </section>
    </main>
  )
}
