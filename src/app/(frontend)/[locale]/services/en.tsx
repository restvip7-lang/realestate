import '@/app/(frontend)/styles/pages.css'

import { listServices, listTeam } from '@/lib/data'
import { getTranslations } from 'next-intl/server'

import { ServiceCard } from '@/components/site/ServiceCard'

import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { SITE_URL } from '@/lib/seo'
import { catalogBasePath } from '@/lib/catalog-params'

// Английская версия страницы; русская — ru.tsx (вёрстка одинаковая, меняется только текст)
export const meta = { title: 'Real estate agency services in Alanya', description: 'Property selection and viewings, document checks, deal support, residence permits and citizenship, rental management and selling property in Alanya. Service prices.' }

export default async function ServicesEn({ locale }: { locale: Locale }) {
  const [team, services, ts] = await Promise.all([listTeam(locale), listServices(locale), getTranslations('svc')])
  // подробные страницы услуг и бесплатная помощь покупателям (docs/content-import.md)
  const pages = services.filter((x) => x.group !== 'free')
  const free = services.filter((x) => x.group === 'free')
  const by = (slug: string, kind: 'founder' | 'expert' | 'lawyer') => {
    const m = team.find((t) => t.slug === slug) || (kind !== 'expert' ? team.find((t) => t.kind === kind) : undefined)
    return m ? <p className="hint">Your contact: <Link href={`/team/${m.slug}`} className="link">{m.name}</Link>, {m.role.toLowerCase()}</p> : null
  }
  const FAQ: [string, string][] = [["Do I pay for the shortlist and viewings?", "No. The consultation, shortlist and viewings are free. Agency services are paid only after the sale contract is signed."], ["Who pays the commission on a new build?", "If the property is from a partner developer, the developer pays the commission, and your price is the same as at the sales office."], ["Can I order just a document check?", "Yes. If you found a property yourself, the lawyer will check the TAPU, debts, permits and the neighbourhood’s residence-permit status, from €300 (demo), in 3–5 days."], ["Do you work with sellers?", "Yes. We value the apartment, take photos and video, list it in Russian, English and Turkish, and handle viewings and the deal. Terms: 2% + KDV (demo)."], ["What does rental management include?", "Finding and vetting tenants, the contract, collecting rent, checking the apartment’s condition, minor repairs and a monthly report."]]
  const SERVICES: [string, string][] = [["Selection and viewings", "We pick properties for your budget and goal, show them in person or by video, and tell you honestly about the drawbacks."], ["Document checks", "Our lawyer checks the property before booking. If you found an apartment yourself, we’ll check it separately."], ["Deal support", "We handle the deal from booking to the TAPU and the keys: tax number, bank account, contract, valuation, land registry, translator."], ["Residence permit and citizenship", "We arrange residence permits for the whole family after the purchase and handle the citizenship-by-investment programme."], ["Rental management", "We rent out your apartment while you’re away from Turkey: we find and vet tenants, collect rent and look after the apartment."], ["Help after the purchase", "We stay with you after the deal: we help you settle in and sort out everyday matters."], ["Selling your property", "For owners in Alanya: we’ll value your apartment, take photos and video, list it in our catalogue and on portals, and handle the deal."]]
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Home', '/'], ['Services', '/services']].map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${getPathname({ href: p, locale })}` })) }
  const ld = [
    crumbs,
    { '@context': 'https://schema.org', '@type': 'RealEstateAgent', name: 'Kleo Homes', hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Kleo Homes services', itemListElement: SERVICES.map(([name, description]) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name, description, areaServed: 'Alanya' } })) } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ]

  return (
    <main className="pg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <section className="dhero short">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumbs"><Link href="/">Home</Link>›<span aria-current="page">Services</span></nav>
          <span className="eyebrow">Services</span>
          <h1>Kleo Homes services</h1>
          <p className="lead-t">The full cycle: from selection to the keys, plus service after the purchase. The consultation and shortlist are free; you pay for the deal only after the contract is signed.</p>
          <div className="cta"><a href="#lead" className="btn btn-coral">Free consultation</a><a href="#prices" className="btn btn-ghost">Service prices</a></div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sgrid">
            <article className="scard rv" id="selection">
              <div className="top"><span className="ic" aria-hidden="true">⌕</span><span className="price-tag free">Free</span></div>
              <h3>Selection and viewings</h3><p>We pick properties for your budget and goal, show them in person or by video, and tell you honestly about the drawbacks.</p>
              <ul className="checklist"><li>A shortlist of 5–10 properties in 2–5 days</li><li>Price per m², the date the price was checked and a cost estimate</li><li>In-person viewings with transfer, or by video call</li><li>District comparison for your lifestyle</li></ul>
              <div className="acts"><Link href="/how-to-buy#step-2" className="btn btn-line btn-sm">How selection works</Link><Link href={catalogBasePath({ deal: 'sale' })} className="btn btn-line btn-sm">Catalogue</Link><a href="#lead" className="btn btn-dark btn-sm">Order</a></div>
              {by("anna-sokolova", "expert")}
            </article>
            <article className="scard rv" id="legal">
              <div className="top"><span className="ic" aria-hidden="true">§</span><span className="price-tag free">Included in the deal</span></div>
              <h3>Document checks</h3><p>Our lawyer checks the property before booking. If you found an apartment yourself, we’ll check it separately.</p>
              <ul className="checklist"><li>TAPU, debts and encumbrances</li><li>Occupancy permit (iskan) and alterations</li><li>The neighbourhood’s residence-permit status</li><li>The developer’s reputation and permits</li><li>A separate property check from €300 (demo)</li></ul>
              <div className="acts"><Link href="/how-to-buy#step-4" className="btn btn-line btn-sm">When we check</Link><Link href="/services/due-diligence" className="btn btn-line btn-sm">More about the check</Link><Link href="/team/murat-kaya" className="btn btn-line btn-sm">The agency’s lawyer</Link><a href="#lead" className="btn btn-dark btn-sm">Order</a></div>
              {by("murat-kaya", "lawyer")}
            </article>
            <article className="scard rv" id="deal">
              <div className="top"><span className="ic" aria-hidden="true">✎</span><span className="price-tag">2% + KDV</span></div>
              <h3>Deal support</h3><p>We handle the deal from booking to the TAPU and the keys: tax number, bank account, contract, valuation, land registry, translator.</p>
              <ul className="checklist"><li>Tax number and bank account in 1 day</li><li>Bilingual contract</li><li>Valuation report and land registry appointment</li><li>Remote deal by power of attorney</li><li>Partner new builds: the developer pays the commission</li></ul>
              <div className="acts"><Link href="/how-to-buy" className="btn btn-line btn-sm">All 6 steps of buying</Link><Link href="/how-to-buy#costs" className="btn btn-line btn-sm">Cost calculator</Link><a href="#lead" className="btn btn-dark btn-sm">Order</a></div>
              {by("grigoriy-lazarev", "founder")}
            </article>
            <article className="scard rv" id="permits">
              <div className="top"><span className="ic" aria-hidden="true">✈</span><span className="price-tag free">Residence permit: free</span></div>
              <h3>Residence permit and citizenship</h3><p>We arrange residence permits for the whole family after the purchase and handle the citizenship-by-investment programme.</p>
              <ul className="checklist"><li>We check that the property qualifies before booking</li><li>Insurance, documents, migration office appointment</li><li>Residence permit renewal while you own the property</li><li>Citizenship through a purchase from $400,000, by agreement</li></ul>
              <div className="acts"><Link href="/residence-permit" className="btn btn-line btn-sm">Residence permit</Link><Link href="/citizenship" className="btn btn-line btn-sm">Citizenship</Link><a href="#lead" className="btn btn-dark btn-sm">Order</a></div>
              {by("murat-kaya", "lawyer")}
            </article>
            <article className="scard rv" id="rental">
              <div className="top"><span className="ic" aria-hidden="true">⌂</span><span className="price-tag">from 15% of rent</span></div>
              <h3>Rental management</h3><p>We rent out your apartment while you’re away from Turkey: we find and vet tenants, collect rent and look after the apartment.</p>
              <ul className="checklist"><li>Long-term rental: 15% of the rent (demo)</li><li>Seasonal rental: 25% of income (demo)</li><li>Photos, listings, viewings, contract</li><li>Monthly report and minor repairs</li><li>Free yield calculation before you buy</li></ul>
              <div className="acts"><Link href="/blog/dokhodnost-arendy-v-alanii-skolko-realno-zarabotat" className="btn btn-line btn-sm">Rental yield</Link><Link href={catalogBasePath({ deal: 'rent' })} className="btn btn-line btn-sm">Apartments for rent</Link><a href="#lead" className="btn btn-dark btn-sm">Order</a></div>
              {by("daniel-marten", "expert")}
            </article>
            <article className="scard rv" id="after">
              <div className="top"><span className="ic" aria-hidden="true">✓</span><span className="price-tag">At partners’ prices</span></div>
              <h3>Help after the purchase</h3><p>We stay with you after the deal: we help you settle in and sort out everyday matters.</p>
              <ul className="checklist"><li>Transfer of water, electricity and internet to your name</li><li>DASK earthquake insurance and home insurance</li><li>Furniture packages and repairs by trusted tradespeople</li><li>Paying aidat and utilities while you’re away from Turkey</li></ul>
              <div className="acts"><Link href="/how-to-buy#step-6" className="btn btn-line btn-sm">What happens after the TAPU</Link><a href="#lead" className="btn btn-dark btn-sm">Order</a></div>
              {by("elena-demir", "expert")}
            </article>
            <article className="scard rv wide" id="sell">
              <div className="top"><span className="ic" aria-hidden="true">€</span><span className="price-tag">2% + KDV</span></div>
              <h3>Selling your property</h3><p>For owners in Alanya: we’ll value your apartment, take photos and video, list it in our catalogue and on portals, and handle the deal.</p>
              <ul className="checklist"><li>Free market valuation</li><li>Professional photos and video</li><li>Advertising in Russian, English and Turkish</li><li>Viewings and negotiations without you</li></ul>
              <div className="acts"><a href="#lead" className="btn btn-line btn-sm">Value my apartment</a><a href="#lead" className="btn btn-dark btn-sm">Order</a></div>
              {by("grigoriy-lazarev", "founder")}
            </article>
          </div>
        </div>
      </section>

      {pages.length > 0 && (
        <section className="sec" id="more" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head"><div><span className="eyebrow">{ts('pagesEyebrow')}</span><h2>{ts('pagesTitle')}</h2></div></div>
            <div className="pgrid">{pages.map((x) => <ServiceCard key={x.id} s={x} />)}</div>
          </div>
        </section>
      )}

      {free.length > 0 && (
        <section className="sec" id="free" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head"><div><span className="eyebrow">{ts('freeEyebrow')}</span><h2>{ts('freeTitle')}</h2></div></div>
            <div className="pgrid">{free.map((x) => <ServiceCard key={x.id} s={x} />)}</div>
          </div>
        </section>
      )}

      <section className="sec" style={{ background: "var(--mist)" }} id="prices">
        <div className="wrap cols2">
          <div>
            <span className="eyebrow">Prices</span>
            <h2 style={{ margin: "8px 0 14px" }}>What our services cost</h2>
            <p style={{ color: "#2B323C" }}>All terms are fixed in an agreement before the first viewing. No hidden fees: state fees, taxes and notary services are paid against receipts and included in the estimate.</p>
            <div className="contacts" style={{ marginTop: "18px" }}><Link href="/how-to-buy#costs" className="btn btn-dark">Purchase cost calculator</Link></div>
          </div>
          <table className="ptable"><caption className="vh">Service prices (demo)</caption><thead><tr><th scope="col">Service</th><th scope="col" className="num">Price (demo)</th></tr></thead><tbody>
            <tr><td>Selection and viewings</td><td className="num">free</td></tr><tr><td>Document check when buying through us</td><td className="num">included in the deal</td></tr><tr><td>Separate property check</td><td className="num">from €300</td></tr><tr><td>Purchase support (resale)</td><td className="num">2% + KDV 20%</td></tr><tr><td>Purchase support (partner new build)</td><td className="num">paid by the developer</td></tr><tr><td>Residence permit for buyers</td><td className="num">free (state fees extra)</td></tr><tr><td>Citizenship by investment</td><td className="num">by agreement</td></tr><tr><td>Long-term rental: finding a tenant</td><td className="num">one month’s rent</td></tr><tr><td>Rental management</td><td className="num">15–25% of income</td></tr><tr><td>Selling your property</td><td className="num">2% + KDV 20%</td></tr>
          </tbody></table>
        </div>
      </section>

      <section className="sec">
        <div className="wrap faq">
          <div><span className="eyebrow">Questions</span><h2 style={{ marginTop: "8px" }}>Frequently asked questions about our services</h2><p className="hint" style={{ marginTop: "10px" }}>Didn’t find an answer? <a href="#lead" className="link">Ask us →</a></p></div>
          <div id="faq">{FAQ.map(([q, a], i) => <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>)}</div>
        </div>
      </section>
    </main>
  )
}
