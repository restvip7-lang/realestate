import '@/app/(frontend)/styles/pages.css'

import Image from 'next/image'

import { Price } from '@/components/site/Currency'
import { PropertyCard } from '@/components/site/PropertyCard'
import { findPublished, getCompany, getRates, listTeam, mediaUrl } from '@/lib/data'

import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { SITE_URL } from '@/lib/seo'

// Английская версия страницы; русская — ru.tsx (вёрстка одинаковая, меняется только текст)
export const meta = { title: 'Turkish residence permit when buying a home in Alanya', description: 'Residence permit through property ownership: requirements, open neighbourhoods, documents, timelines and costs. Properties in Alanya that qualify for a residence permit.' }

export default async function ResidenceEn({ locale }: { locale: Locale }) {
  const [company, team, rates] = await Promise.all([getCompany(locale), listTeam(locale), getRates()])
  const minEur = 200000 / (rates.USD || 1)
  const { docs: objs, total: objsTotal } = await findPublished(
    locale,
    { and: [{ deal: { equals: 'sale' } }, { or: [{ price: { greater_than_equal: minEur } }, { residence: { equals: true } }] }] },
    { sort: '-price' },
  )
  const lawyer = team.find((t) => t.kind === 'lawyer') || team[0]
  const lawyerImg = mediaUrl(lawyer?.photo, 'thumb')
  const FAQ: [string, React.ReactNode, string][] = [["Can I get a residence permit if the home costs less than $200,000?", <>Not on the basis of ownership (demo condition for Antalya). You can get a tourist residence permit with a rental contract or buy a more expensive property. We'll help you choose.</>, "Not on the basis of ownership (demo condition for Antalya). You can get a tourist residence permit with a rental contract or buy a more expensive property. We'll help you choose."], ["How do I renew the residence permit?", <>As long as you own the property, the permit can be renewed: you apply before the card expires. We'll remind you and prepare the documents.</>, "As long as you own the property, the permit can be renewed: you apply before the card expires. We'll remind you and prepare the documents."], ["Will my family get a residence permit?", <>Yes, your spouse and children under 18 get residence permits as the owner's family members. You need apostilled and translated marriage and birth certificates.</>, "Yes, your spouse and children under 18 get residence permits as the owner's family members. You need apostilled and translated marriage and birth certificates."], ["Can I work with an owner's residence permit?", <>No. Working in Turkey requires a separate work permit. The residence permit lets you live here, open a bank account, connect utilities and take out insurance.</>, "No. Working in Turkey requires a separate work permit. The residence permit lets you live here, open a bank account, connect utilities and take out insurance."], ["How do I find out whether a neighbourhood is open for residence permits?", <>The migration office publishes and regularly updates the list of closed neighbourhoods. We check the address of every property before booking and report changes in the <Link href="/news" className="link">news</Link>.</>, "The migration office publishes and regularly updates the list of closed neighbourhoods. We check the address of every property before booking and report changes in the news."], ["Can I get citizenship later?", <>After several years of continuous residence you can apply for citizenship on general grounds, and with a purchase from $400,000 through the <Link href="/citizenship" className="link">investment programme</Link>.</>, "After several years of continuous residence you can apply for citizenship on general grounds, and with a purchase from $400,000 through the investment programme."]]
  const objsBlock = objs.length ? (
    <div className="grid3 limit4">{objs.slice(0, 6).map((p) => <PropertyCard key={p.id} p={p} />)}</div>
  ) : (
    <div className="empty"><b>There are no properties from $200,000 in the catalogue right now</b>We'll find options with partner developers or suggest several properties for the required amount.<a href="#lead" className="btn btn-line btn-sm" style={{ marginTop: 14 }}>Send a request</a></div>
  )
  const lawyerBox = lawyer ? (
    <div className="author-box" style={{ maxWidth: 'none' }}>
      {lawyerImg && <Image src={lawyerImg} alt={lawyer.name} width={160} height={160} />}
      <div>
        <span className="hint">Your adviser</span><br />
        <b>{lawyer.name}</b> · <span className="hint">{lawyer.role}, {lawyer.exp} years of experience</span>
        {lawyer.bio && <p>{lawyer.bio}</p>}
        <div className="contacts">
          <a href={`https://wa.me/${company.whatsapp}?text=${encodeURIComponent("Hello! A question for the lawyer about a residence permit when buying a home.")}`} className="btn btn-wa btn-sm">Ask the lawyer on WhatsApp</a>
          <Link href={`/team/${lawyer.slug}`} className="btn btn-line btn-sm">Profile</Link>
        </div>
      </div>
    </div>
  ) : null
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Home', '/'], ['Residence permit when buying a home', '/residence-permit']].map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${getPathname({ href: p, locale })}` })) }
  const ld = [crumbs, { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, , a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }]

  return (
    <main className="pg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <section className="dhero short">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumbs"><Link href="/">Home</Link>›<span aria-current="page">Residence permit when buying a home</span></nav>
          <span className="eyebrow">Residence permit</span>
          <h1>Turkish residence permit when buying a home in Alanya</h1>
          <p className="lead-t">A home owner can get a residence permit for themselves and their family. We'll check whether the property qualifies and whether the neighbourhood is open for residence permits, and help with the documents until you receive the card.</p>
          <div className="cta"><a href="#objects" className="btn btn-coral">Properties for a residence permit</a><a href="#lead" className="btn btn-ghost">Check a property</a></div>
        </div>
      </section>

      <div className="wrap">
        <div className="kfacts k4" role="list" aria-label="The residence permit in brief">
          <div role="listitem"><span>Property value</span><b>from $200,000</b><small>≈ <Price eur={minEur} /></small></div>
          <div role="listitem"><span>Card validity</span><b>1–2 years</b><small>renewable while you own the property</small></div>
          <div role="listitem"><span>Processing</span><b>1–2 months</b><small>from application to card</small></div>
          <div role="listitem"><span>Who qualifies</span><b>The whole family</b><small>spouse and children under 18</small></div>
        </div>
      </div>

      <section className="sec">
        <div className="wrap cols2">
          <div className="box">
            <h3>Requirements</h3>
            <ul className="checklist">
              <li>A home you own, with the TAPU in your name</li>
              <li>Value under the valuation report from $200,000 for Antalya and Alanya (demo condition)</li>
              <li>The neighbourhood is open for first-time residence permits for foreigners</li>
              <li>Health insurance for the full validity of the card</li>
              <li>Your residential address is registered at this property</li>
            </ul>
          </div>
          <div className="box">
            <h3>Good to know</h3>
            <ul className="checklist no">
              <li>Some neighbourhoods are closed to new residence permits, and the list changes several times a year. We check the status of every address before booking.</li>
              <li>A residence permit doesn't give the right to work: that requires a separate work permit.</li>
              <li>Haven't bought yet? You can get a residence permit with a rental contract: we'll find you <Link href="/rent" className="link">an apartment to rent</Link>.</li>
            </ul>
            <p className="hint" style={{ marginTop: "12px" }}>News about rule changes is in the <Link href="/news?cat=%D0%92%D0%9D%D0%96%20%D0%B8%20%D0%B3%D1%80%D0%B0%D0%B6%D0%B4%D0%B0%D0%BD%D1%81%D1%82%D0%B2%D0%BE" className="link">News</Link> section.</p>
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: "var(--mist)" }}>
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">Process</span><h2>How to get a residence permit</h2></div><p>Timelines are approximate (demo). The agency's lawyer prepares and checks the documents.</p></div>
          <ol className="timeline">
            <li><b>Shortlist with a neighbourhood check</b><p>We only show properties in neighbourhoods open for residence permits.</p><span className="t">1–2 weeks</span></li>
            <li><b>Purchase and TAPU</b><p>Document checks, valuation, ownership registration.</p><span className="t">2–4 weeks</span></li>
            <li><b>Insurance and registration</b><p>Health insurance and registration of your residential address.</p><span className="t">2–3 days</span></li>
            <li><b>Application and interview</b><p>An online application, then a visit to the migration office. The card arrives by post.</p><span className="t">1–2 months</span></li>
          </ol>
        </div>
      </section>

      <section className="sec">
        <div className="wrap cols2">
          <div className="box">
            <h3>Documents</h3>
            <ul className="checklist">
              <li>Passport and its notarised translation</li>
              <li>TAPU and valuation report</li>
              <li>Health insurance for the permit period</li>
              <li>Photos and an address registration certificate</li>
              <li>For children: apostilled and translated birth certificates</li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: "19px", marginBottom: "12px" }}>Application costs</h3>
            <table className="ptable"><caption className="vh">Residence permit application costs (demo)</caption><thead><tr><th scope="col">What is paid</th><th scope="col" className="num">Amount (demo)</th></tr></thead><tbody>
              <tr><td>Residence permit state fee</td><td className="num">depends on nationality and term</td></tr>
              <tr><td>Card fee</td><td className="num">about €30–50</td></tr>
              <tr><td>Health insurance</td><td className="num">€100–400 a year</td></tr>
              <tr><td>Passport translation, notary</td><td className="num">€50–100</td></tr>
              <tr><td>Lawyer's support</td><td className="num">free for buyers</td></tr>
            </tbody></table>
            <p className="hint" style={{ marginTop: "10px" }}>The full list of documents and timelines is <Link href="/blog/vnzh-pri-pokupke-nedvizhimosti-v-alanii-usloviya-i-dokumenty" className="link">in our residence permit article</Link>.</p>
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: "var(--mist)" }} id="objects">
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">Catalogue {objsTotal ? <span className="hint">{objsTotal} in the catalogue</span> : null}</span><h2>Properties for a residence permit</h2></div><p>From $200,000 (<span>≈ <Price eur={minEur} /></span>). We check the neighbourhood status on the date of the deal. Districts for year-round living are <Link href="/districts?f=life" className="link">in our district guide</Link>.</p></div>
          {objsBlock}
          <div className="res-actions"><Link href={`/sale?min=${Math.round(minEur)}`} className="btn btn-dark">All properties from $200,000</Link><a href="#lead" className="btn btn-line">Check my property</a></div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="warn"><b>Terms change.</b> The minimum value and the list of closed neighbourhoods are set by the Turkish authorities. This page shows demo terms; before booking, the lawyer checks the requirements in force on the date of the deal.</div>
          {lawyerBox}
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap faq">
          <div><span className="eyebrow">Questions</span><h2 style={{ marginTop: "8px" }}>Frequently asked questions about residence permits</h2><p className="hint" style={{ marginTop: "10px" }}>Didn't find an answer? <a href="#lead" className="link">Ask the lawyer →</a></p></div>
          <div id="faq">{FAQ.map(([q, a], i) => <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>)}</div>
        </div>
      </section>
    </main>
  )
}
