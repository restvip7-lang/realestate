import '@/app/(frontend)/styles/pages.css'

import { CookieSettings } from '@/components/site/CookieSettings'
import { getCompany } from '@/lib/data'

import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { SITE_URL } from '@/lib/seo'

// Английская версия страницы; русская — ru.tsx (вёрстка одинаковая, меняется только текст)
export const meta = { title: 'Privacy and cookie policy', description: 'How Kleo Homes collects, uses and protects personal data: KVKK and GDPR, cookies, your rights and retention periods.' }

export default async function PrivacyEn({ locale }: { locale: Locale }) {
  const company = await getCompany(locale)
  const mail = `mailto:${company.email}?subject=${encodeURIComponent('Personal data')}`
  const ld = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Home', '/'], ['Privacy and cookie policy', '/privacy']].map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${getPathname({ href: p, locale })}` })) }

  return (
    <main className="pg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <section className="dhero short">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumbs"><Link href="/">Home</Link>›<span aria-current="page">Privacy policy</span></nav>
          <span className="eyebrow">Documents</span>
          <h1>Privacy and cookie policy</h1>
          <p className="lead-t">How Kleo Homes collects, uses and protects your data. This policy follows the Turkish Personal Data Protection Law (KVKK, No. 6698) and the EU General Data Protection Regulation (GDPR). Version of 25 September 2026.</p>
        </div>
      </section>
      <section className="sec">
        <div className="wrap post-grid">
          <article className="prose legal" id="prose">
            <h2 id="who">1. Who processes your data</h2>
            <p>The data controller is <b>{company.legal?.name}</b> (Kleo Homes), <span>{company.address}</span>. Real estate trading licence TTYB No. <span>{company.legal?.license}</span>, registered in the VERBİS data controller registry under No. <span>{company.legal?.verbis}</span>.</p>
            <p>For any questions about your data, email <a href={mail}>{company.email}</a> with the subject "Personal data".</p>

            <h2 id="what">2. What data we collect</h2>
            <ul>
              <li><b>From forms on the site:</b> name, phone, email, preferred contact method, budget, purchase goal and wishes, the ID of the property you are interested in.</li>
              <li><b>In correspondence:</b> messages on WhatsApp, Telegram and by email, call recordings, but only if you have been told.</li>
              <li><b>For a deal</b> (provided separately, under a contract): passport details, tax number, bank details, documents for a residence permit or citizenship.</li>
              <li><b>Automatically:</b> IP address, device and browser type, pages you viewed, the referral source and ad campaign (UTM tags), via cookies; see section 8.</li>
            </ul>

            <h2 id="why">3. Why, and on what legal basis</h2>
            <table><thead><tr><th>Purpose</th><th>Legal basis (KVKK art. 5 / GDPR art. 6)</th></tr></thead><tbody>
              <tr><td>Replying to your request, selecting properties, booking viewings</td><td>Your request and steps before a contract</td></tr>
              <tr><td>Completing the deal, the TAPU, a residence permit or citizenship</td><td>Performance of a contract, legal requirements</td></tr>
              <tr><td>Accounting and tax records</td><td>Legal requirements</td></tr>
              <tr><td>Visit statistics and site improvement</td><td>Your consent to analytics cookies</td></tr>
              <tr><td>Advertising and new property selections</td><td>Your separate consent, which you can withdraw at any time</td></tr>
            </tbody></table>

            <h2 id="share">4. Who we share data with</h2>
            <ul>
              <li>Kleo Homes staff who work on your request.</li>
              <li>Lawyers, notaries, translators, valuers and banks, when needed for the deal.</li>
              <li>Developers and owners: only your name and contact, and only when you asked for a viewing or booking.</li>
              <li>Services that run the site: hosting, email, analytics (Google Analytics, Yandex Metrica), advertising (Google, Meta), to the extent you consented to.</li>
              <li>Public authorities, only when required by law.</li>
            </ul>
            <p>Some services store data outside Turkey (for example, in the EU). Such transfers follow Article 9 of the KVKK and Chapter V of the GDPR.</p>

            <h2 id="keep">5. How long we keep data</h2>
            <ul>
              <li>Requests and correspondence without a deal: up to 3 years after your last contact, then deleted.</li>
              <li>Deal documents: as long as Turkish tax and commercial law requires (usually 10 years).</li>
              <li>Cookie data: no longer than the periods given in section 8.</li>
            </ul>

            <h2 id="rights">6. Your rights</h2>
            <p>Under Article 11 of the KVKK and the GDPR you can:</p>
            <ul>
              <li>find out whether we process your data and get a copy of it;</li>
              <li>correct inaccurate data;</li>
              <li>ask us to delete your data or restrict its processing;</li>
              <li>object to processing and withdraw consent to mailings and cookies;</li>
              <li>find out who your data was shared with;</li>
              <li>complain to the Turkish Personal Data Protection Authority (KVKK) or the supervisory authority of your EU country.</li>
            </ul>

            <h2 id="how">7. How to send a request</h2>
            <p>Email <a href={mail}>{company.email}</a> or send a letter to the office address. Include your name and the contact you left with us so we can find your data. We reply within 30 days, usually sooner.</p>

            <h2 id="cookies">8. Cookies</h2>
            <p>Cookies are small files the site stores in your browser. Necessary cookies always work; the others only with your consent.</p>
            <table><thead><tr><th>Type</th><th>Purpose</th><th>Period</th></tr></thead><tbody>
              <tr><td>Necessary</td><td>Selected currency and language, favourites, spam protection for forms</td><td>up to 1 year</td></tr>
              <tr><td>Analytics</td><td>Google Analytics, Yandex Metrica: which pages are viewed and where visitors come from</td><td>up to 2 years</td></tr>
              <tr><td>Advertising</td><td>Google Ads, Meta Pixel: showing ads to people who have visited the site</td><td>up to 13 months</td></tr>
            </tbody></table>
            <CookieSettings />

            <h2 id="changes">9. Changes to this policy</h2>
            <p>We update the policy when laws or our services change. The date of the current version is given at the top of the page. The policy is published in Russian, English and Turkish; in case of discrepancies, the Turkish version prevails.</p>
            <p className="demo-note">Demo text for the prototype. Before launch, a lawyer will check the policy for KVKK and GDPR compliance and add the information notice (aydınlatma metni) and separate consents.</p>
          </article>
          <aside className="post-side">
            <nav className="toc" aria-label="Contents"><b>Contents</b><ol><li><a href="#who">Who processes your data</a></li><li><a href="#what">What data we collect</a></li><li><a href="#why">Why, and on what legal basis</a></li><li><a href="#share">Who we share data with</a></li><li><a href="#keep">How long we keep data</a></li><li><a href="#rights">Your rights</a></li><li><a href="#how">How to send a request</a></li><li><a href="#cookies">Cookies</a></li><li><a href="#changes">Changes to this policy</a></li></ol></nav>
            <div className="cta-box"><b style={{ fontSize: "18px" }}>Data request</b><p>Find out what data we hold, correct it or delete it.</p><a className="btn btn-coral" href={mail}>Send an email</a><a href="#cookies" className="btn btn-line" style={{ background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,.3)" }}>Cookie settings</a></div>
          </aside>
        </div>
      </section>
    </main>
  )
}
