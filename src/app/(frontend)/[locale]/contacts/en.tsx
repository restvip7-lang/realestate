import '@/app/(frontend)/styles/pages.css'

import Image from 'next/image'

import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { COAST } from '@/lib/coast'
import { getCompany, listDistricts, listTeam, mediaUrl } from '@/lib/data'
import { SITE_URL } from '@/lib/seo'

// Английская версия страницы; русская — ru.tsx (вёрстка одинаковая, меняется только текст). Контакты — из админки
export const meta = { title: 'Contacts of the real estate agency in Alanya', description: 'Kleo Homes phone, WhatsApp, Telegram and email, office and showroom addresses in Alanya, company details.' }

export default async function ContactsEn({ locale }: { locale: Locale }) {
  const [company, team, districts] = await Promise.all([getCompany(locale), listTeam(locale), listDistricts(locale)])
  const tel = company.phone.replace(/[^+\d]/g, '')
  const wa = (text: string) => `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(text)}`
  const cards: [string, string, string, string, string, string, string][] = [
    ['☎', 'Phone', company.phone, company.hours || '', `tel:${tel}`, 'Call', 'btn-dark'],
    ['✆', 'WhatsApp', company.phone, 'We reply every day', wa('Hello! I would like a consultation.'), 'Message on WhatsApp', 'btn-wa'],
    ...(company.telegram ? [['✈', 'Telegram', `@${company.telegram}`, 'Chat and news channel', `https://t.me/${company.telegram}`, 'Open Telegram', 'btn-tg'] as [string, string, string, string, string, string, string]] : []),
    ['✉', 'Email', company.email, 'For documents and requests', `mailto:${company.email}`, 'Send an email', 'btn-line'],
  ]
  const c = districts.find((d) => d.slug === 'center'), m = districts.find((d) => d.slug === 'mahmutlar')
  const map = (
    <svg viewBox="360 60 480 260" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Map: the office in central Alanya and the showroom in Mahmutlar" className="zoom">
      <defs><pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="rgba(0,163,196,.28)" /></pattern></defs>
      <path d={`${COAST} L1000 440 L0 440Z`} fill="url(#dots)" />
      <path d={COAST} fill="none" stroke="#00A3C4" strokeWidth="1.6" />
      {districts.filter((d) => d !== c && d !== m).map((d) => <circle key={d.slug} cx={d.schema?.x ?? 0} cy={d.schema?.y ?? 0} r="4" fill="rgba(255,255,255,.3)" />)}
      {([[c, 'Office · Centre', 'middle', 0], [m, 'Showroom · Mahmutlar', 'end', 14]] as const).map(([d, t, anc, dx]) => d && (
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
          <a key={t.id} href={wa(`Hello, ${t.name}! I would like a consultation.`)} target="_blank" rel="noopener">
            {a ? <Image src={a} alt="" width={120} height={120} /> : <span />}
            <span><b>{t.name}</b><span>{t.role} · {t.langs}</span></span>
          </a>
        )
      })}
    </div>
  )
  const ld = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Home', '/'], ['Contacts', '/contacts']].map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${getPathname({ href: p, locale })}` })) },
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
          <nav className="crumbs" aria-label="Breadcrumbs"><Link href="/">Home</Link>›<span aria-current="page">Contacts</span></nav>
          <span className="eyebrow">Contacts</span>
          <h1>Kleo Homes contacts</h1>
          <p className="lead-t">We reply in Russian, English and Turkish: within 15 minutes during working hours, and the next day at weekends.</p>
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
          <div className="sec-head"><div><span className="eyebrow">Addresses</span><h2>Office and showroom</h2></div><p>Drop in during opening hours without an appointment, or arrange a meeting: we'll meet you and show you properties.</p></div>
          <div className="offices">
            <div className="box"><h3>Office in the centre</h3><dl><dt>Address</dt><dd>{company.address}</dd><dt>Hours</dt><dd>{company.hours}</dd><dt>Nearby</dt><dd>A 5-minute walk to Cleopatra Beach</dd></dl><a href="#lead" className="btn btn-dark btn-sm">Book a meeting</a></div>
            <div className="box"><h3>Showroom in Mahmutlar</h3><dl><dt>Address</dt><dd>{company.showroom}</dd><dt>Hours</dt><dd>{company.hours}</dd><dt>What's there</dt><dd>New-build presentations, lawyer consultations</dd></dl><Link href="/news/kleo-homes-otkryvaet-shourum-v-makhmutlare-demo" className="btn btn-line btn-sm">About the showroom</Link></div>
            <div className="map-box">
              {map}
              <span className="map-note"><span>The map is not to scale. We'll send you the exact route on WhatsApp.</span></span>
            </div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">Experts</span><h2>Message an expert directly</h2></div><Link href="/team" className="link">Whole team →</Link></div>
          {experts}
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap cols2">
          <div className="box">
            <h3>Company details</h3>
            <dl className="req">
              <dt>Company</dt><dd>{company.legal?.name}</dd>
              <dt>TTYB licence</dt><dd>No. <span>{company.legal?.license}</span></dd>
              <dt>Tax office</dt><dd>{company.legal?.taxOffice}</dd>
              <dt>Tax number</dt><dd>{company.legal?.taxNo}</dd>
              <dt>Data controller registry</dt><dd>VERBİS No. <span>{company.legal?.verbis}</span></dd>
              <dt>Registered address</dt><dd>{company.address}</dd>
            </dl>
          </div>
          <div className="faq" style={{ display: "block" }}>
            <h3 style={{ fontSize: "19px", marginBottom: "4px" }}>Frequently asked questions</h3>
            <details open><summary>Do you work at weekends?</summary><p>The office and showroom are open Monday to Saturday. On Sundays we hold viewings by appointment, and we reply on WhatsApp every day.</p></details>
            <details><summary>Can we meet if I'm not in Turkey yet?</summary><p>Yes. We hold consultations and viewings by video call at a time that suits you, taking your time zone into account.</p></details>
            <details><summary>How do I request or delete my data?</summary><p>Email us with the subject "Personal data". The procedure is described in our <Link href="/privacy#how" className="link">privacy policy</Link>.</p></details>
          </div>
        </div>
      </section>
    </main>
  )
}
