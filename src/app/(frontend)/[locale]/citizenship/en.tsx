import '@/app/(frontend)/styles/pages.css'

import Image from 'next/image'

import { Price } from '@/components/site/Currency'
import { PropertyCard } from '@/components/site/PropertyCard'
import { findPublished, getCompany, getRates, listTeam, mediaUrl } from '@/lib/data'

import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { SITE_URL } from '@/lib/seo'

// Английская версия страницы; русская — ru.tsx (вёрстка одинаковая, меняется только текст)
export const meta = { title: 'Turkish citizenship by buying property in Alanya', description: 'Terms of the citizenship-by-investment programme through real estate: from $400,000, no sale for 3 years, documents, timelines, costs and suitable properties in Alanya.' }

export default async function CitizenshipEn({ locale }: { locale: Locale }) {
  const [company, team, rates] = await Promise.all([getCompany(locale), listTeam(locale), getRates()])
  const minEur = 400000 / (rates.USD || 1)
  const { docs: objs, total: objsTotal } = await findPublished(
    locale,
    { and: [{ deal: { equals: 'sale' } }, { or: [{ price: { greater_than_equal: minEur } }, { citizenship: { equals: true } }] }] },
    { sort: '-price' },
  )
  const lawyer = team.find((t) => t.kind === 'lawyer') || team[0]
  const lawyerImg = mediaUrl(lawyer?.photo, 'thumb')
  const FAQ: [string, React.ReactNode, string][] = [["Can I buy several apartments instead of one?", <>Yes. You can buy several properties if their total value under the valuation reports is from $400,000 (demo condition). All of them get a no-sale annotation for 3 years.</>, "Yes. You can buy several properties if their total value under the valuation reports is from $400,000 (demo condition). All of them get a no-sale annotation for 3 years."], ["Can I rent the property out?", <>Yes, you can rent it out for all 3 years. This is a common choice: the property earns income while the application is processed. We’ll calculate the yield, <Link href="/blog/dokhodnost-arendy-v-alanii-skolko-realno-zarabotat" className="link">as in our rental article</Link>.</>, "Yes, you can rent it out for all 3 years. This is a common choice: the property earns income while the application is processed. We’ll calculate the yield, as in our rental article."], ["Do I have to live in Turkey?", <>No. There are no residence or language requirements. You need to come to give biometrics; everything else can be done by power of attorney.</>, "No. There are no residence or language requirements. You need to come to give biometrics; everything else can be done by power of attorney."], ["Will children over 18 get a passport?", <>No. Under the programme, passports are issued to the spouse and children under 18. Adult children need a separate purchase or another basis.</>, "No. Under the programme, passports are issued to the spouse and children under 18. Adult children need a separate purchase or another basis."], ["What if I sell the property before 3 years?", <>You can’t: the annotation on the TAPU blocks the sale from being registered. After 3 years you can sell, and you keep the passport.</>, "You can’t: the annotation on the TAPU blocks the sale from being registered. After 3 years you can sell, and you keep the passport."], ["Does a new build qualify?", <>Yes, if it is valued at the required amount and paid through a bank. Properties under construction have special rules; the lawyer will explain them at the consultation.</>, "Yes, if it is valued at the required amount and paid through a bank. Properties under construction have special rules; the lawyer will explain them at the consultation."]]
  const objsBlock = objs.length ? (
    <div className="grid3 limit4">{objs.slice(0, 6).map((p) => <PropertyCard key={p.id} p={p} />)}</div>
  ) : (
    <div className="empty"><b>There are no properties from $400,000 in the catalogue right now</b>We’ll find options with partner developers or suggest several properties for the required amount.<a href="#lead" className="btn btn-line btn-sm" style={{ marginTop: 14 }}>Send a request</a></div>
  )
  const lawyerBox = lawyer ? (
    <div className="author-box" style={{ maxWidth: 'none' }}>
      {lawyerImg && <Image src={lawyerImg} alt={lawyer.name} width={160} height={160} />}
      <div>
        <span className="hint">Your adviser</span><br />
        <b>{lawyer.name}</b> · <span className="hint">{lawyer.role}, {lawyer.exp} years of experience</span>
        {lawyer.bio && <p>{lawyer.bio}</p>}
        <div className="contacts">
          <a href={`https://wa.me/${company.whatsapp}?text=${encodeURIComponent("Hello! A question for the lawyer about Turkish citizenship through buying property.")}`} className="btn btn-wa btn-sm">Ask the lawyer on WhatsApp</a>
          <Link href={`/team/${lawyer.slug}`} className="btn btn-line btn-sm">Profile</Link>
        </div>
      </div>
    </div>
  ) : null
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Home', '/'], ['Turkish citizenship', '/citizenship']].map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${getPathname({ href: p, locale })}` })) }
  const ld = [crumbs, { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, , a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }]

  return (
    <main className="pg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <section className="dhero short">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumbs"><Link href="/">Home</Link>›<span aria-current="page">Turkish citizenship</span></nav>
          <span className="eyebrow">Citizenship programme</span>
          <h1>Turkish citizenship by buying property</h1>
          <p className="lead-t">Buy a home from $400,000 and get a Turkish passport for yourself, your spouse and children. We’ll find properties in Alanya, check the documents and handle the whole application.</p>
          <div className="cta"><a href="#objects" className="btn btn-coral">Properties for citizenship</a><a href="#lead" className="btn btn-ghost">Free consultation</a></div>
        </div>
      </section>

      <div className="wrap">
        <div className="kfacts k4" role="list" aria-label="The programme in brief">
          <div role="listitem"><span>Purchase amount</span><b>from $400,000</b><small>≈ <Price eur={minEur} /></small></div>
          <div role="listitem"><span>No sale for</span><b>3 years</b><small>annotation on the TAPU</small></div>
          <div role="listitem"><span>Processing</span><b>6–12 months</b><small>from booking to passport</small></div>
          <div role="listitem"><span>Who qualifies</span><b>The whole family</b><small>spouse and children under 18</small></div>
        </div>
      </div>

      <section className="sec">
        <div className="wrap cols2">
          <div className="box">
            <h3>Programme terms</h3>
            <ul className="checklist">
              <li>One or several properties worth a total of $400,000 or more under the valuation report</li>
              <li>Payment through a Turkish bank with a currency conversion certificate</li>
              <li>Annotation on the TAPU: the property cannot be sold for 3 years</li>
              <li>The property has not been used for citizenship before</li>
              <li>No need to speak Turkish or live in Turkey</li>
            </ul>
          </div>
          <div className="box">
            <h3>What a Turkish passport gives you</h3>
            <ul className="checklist">
              <li>The right to live, work and study in Turkey without a residence or work permit</li>
              <li>Visa-free travel to countries open to Turkish citizens</li>
              <li>Passports for your spouse and children under 18</li>
              <li>Turkey allows dual citizenship; check the laws of your country</li>
              <li>The property can be rented out for all 3 years</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: "var(--mist)" }}>
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">Process</span><h2>How the application works</h2></div><p>Timelines are approximate (demo). Each step is handled by the agency’s lawyer.</p></div>
          <ol className="timeline">
            <li><b>Consultation and shortlist</b><p>Budget, family members, goal: living, renting out or just the passport.</p><span className="t">1–2 weeks</span></li>
            <li><b>Checks and booking</b><p>The lawyer checks the TAPU, debts and the property’s history.</p><span className="t">3–7 days</span></li>
            <li><b>Valuation report</b><p>A licensed valuer confirms the value.</p><span className="t">1 week</span></li>
            <li><b>Bank payment</b><p>A Turkish bank account, the transfer and the conversion certificate.</p><span className="t">1–2 weeks</span></li>
            <li><b>TAPU with annotation</b><p>Registration of ownership and the 3-year no-sale restriction.</p><span className="t">1–2 weeks</span></li>
            <li><b>Certificate of conformity</b><p>Confirmation that the purchase qualifies for the programme.</p><span className="t">2–4 weeks</span></li>
            <li><b>Investor residence permit</b><p>A residence permit for the whole family while the application is reviewed.</p><span className="t">2–4 weeks</span></li>
            <li><b>Passport</b><p>Citizenship application, checks and passport issue.</p><span className="t">3–6 months</span></li>
          </ol>
        </div>
      </section>

      <section className="sec">
        <div className="wrap cols2">
          <div className="box">
            <h3>Documents</h3>
            <ul className="checklist">
              <li>Passports of all family members</li>
              <li>Marriage and children’s birth certificates, apostilled and translated</li>
              <li>Photos meeting the migration office requirements</li>
              <li>Tax number and Turkish bank account (we arrange them in 1 day)</li>
              <li>TAPU, valuation report, bank payment documents</li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: "19px", marginBottom: "12px" }}>Application costs</h3>
            <table className="ptable"><caption className="vh">Citizenship application costs (demo)</caption><thead><tr><th scope="col">What is paid</th><th scope="col" className="num">Amount (demo)</th></tr></thead><tbody>
              <tr><td>TAPU registration tax</td><td className="num">4% of the price</td></tr>
              <tr><td>Valuation report</td><td className="num">€400–700</td></tr>
              <tr><td>Translations, notary, apostilles</td><td className="num">€300–800</td></tr>
              <tr><td>Fees and state charges for the family</td><td className="num">€500–1,000</td></tr>
              <tr><td>Lawyer’s support</td><td className="num">by agreement</td></tr>
            </tbody></table>
            <p className="hint" style={{ marginTop: "10px" }}>We give an exact estimate for your family and property before booking. Purchase costs are explained <Link href="/blog/skolko-stoit-pokupka-sverkh-tseny-kvartiry-nalogi-tapu-dask" className="link">in this article</Link>.</p>
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: "var(--mist)" }} id="objects">
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">Catalogue {objsTotal ? <span className="hint">{objsTotal} in the catalogue</span> : null}</span><h2>Properties for citizenship</h2></div><p>From $400,000 (<span>≈ <Price eur={minEur} /></span>) or several properties for this amount. The lawyer gives the final confirmation that a property qualifies.</p></div>
          {objsBlock}
          <div className="res-actions"><Link href={`/sale?min=${Math.round(minEur)}`} className="btn btn-dark">All properties from $400,000</Link><a href="#lead" className="btn btn-line">Pick several properties</a></div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="warn"><b>Terms change.</b> The amount and rules of the programme are set by decisions of the Turkish government. This page shows demo terms; before booking, the lawyer checks the requirements in force on the date of the deal. A detailed guide is <Link href="/blog/grazhdanstvo-turtsii-za-pokupku-nedvizhimosti-kak-eto-rabotaet" className="link">in our citizenship article</Link>.</div>
          {lawyerBox}
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap faq">
          <div><span className="eyebrow">Questions</span><h2 style={{ marginTop: "8px" }}>Frequently asked questions about citizenship</h2><p className="hint" style={{ marginTop: "10px" }}>Didn’t find an answer? <a href="#lead" className="link">Ask the lawyer →</a></p></div>
          <div id="faq">{FAQ.map(([q, a], i) => <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>)}</div>
        </div>
      </section>
    </main>
  )
}
