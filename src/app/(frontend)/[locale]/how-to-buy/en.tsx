import '@/app/(frontend)/styles/pages.css'

import { BuyCalculator } from '@/components/site/BuyCalculator'

import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { SITE_URL } from '@/lib/seo'

// Английская версия страницы; русская — ru.tsx (вёрстка одинаковая, меняется только текст)
export const meta = { title: 'Buying property in Alanya: 6 steps', description: 'Buying an apartment in Turkey step by step: shortlist, viewings, document checks, contract and payment, TAPU. Timelines, documents, costs on top of the price and remote purchase.' }

export default async function HowToBuyEn({ locale }: { locale: Locale }) {
  const FAQ: [string, string][] = [["How long does a purchase take?", "A resale home usually takes 3–6 weeks from the first enquiry to the TAPU. A new build follows the developer's schedule: booking and contract in 1–2 weeks, the TAPU after the building is completed (demo timelines)."], ["Can I buy without coming to Turkey?", "Yes. Video viewing, power of attorney at a notary, bank payment. See \"Buying remotely\" on this page for details."], ["Which currency do I pay in?", "The price is fixed in the contract in the currency agreed with the seller (usually euros or dollars). Payment is by bank transfer; for citizenship a currency transfer through a bank is mandatory."], ["When are the agency's services paid?", "After the sale contract is signed. Consultation, shortlist and viewings are free. The terms are fixed in an agreement before the first viewing."], ["What happens if the check finds a problem?", "If the lawyer finds debts, encumbrances or permit problems, the deposit is refunded under the booking agreement, and we find you another property."], ["Do I need a Turkish bank account?", "Yes, for the payment and utility bills. We open it together with your tax number, usually in 1 day, and it can be done by power of attorney."]]
  const STEPS: [string, string, string][] = [["step-1", "Enquiry and consultation", "You tell us your budget, goal and timing by phone, on WhatsApp or through the form. An expert explains how the purchase works and what it costs on top of the price."], ["step-2", "Shortlist", "We send 5–10 options with the price per m², the date the price was checked, the pros and cons of each property and a cost estimate."], ["step-3", "Viewings", "We show you the apartment, the complex, the grounds and the way to the sea, in person or by live video call."], ["step-4", "Checks and booking", "Our lawyer checks the documents before you pay a deposit. The booking fixes the price and takes the property off the market."], ["step-5", "Contract and payment", "We get your tax number and a Turkish bank account, order the valuation report and sign the sale contract with a translation."], ["step-6", "TAPU and keys", "We register the ownership at the land registry: signing with a translator, the TAPU issued in your name, the keys handed over with a handover report."]]
  const url = `${SITE_URL}${getPathname({ href: '/how-to-buy', locale })}`
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Home', '/'], ['How buying works', '/how-to-buy']].map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${getPathname({ href: p, locale })}` })) }
  const ld = [
    crumbs,
    { '@context': 'https://schema.org', '@type': 'HowTo', name: 'How to buy property in Alanya', totalTime: 'P6W', step: STEPS.map(([id, name, text], i) => ({ '@type': 'HowToStep', position: i + 1, name, text, url: `${url}#${id}` })) },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ]

  return (
    <main className="pg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <section className="dhero short">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumbs"><Link href="/">Home</Link>›<span aria-current="page">How buying works</span></nav>
          <span className="eyebrow">Process</span>
          <h1>How to buy property in Alanya: 6 steps</h1>
          <p className="lead-t">From the first enquiry to the TAPU and the keys: usually 3–6 weeks for a resale home. You can buy in person or fully remotely: video viewing, power of attorney, bank payment.</p>
          <div className="cta"><a href="#lead" className="btn btn-coral">Get a shortlist</a><a href="#costs" className="btn btn-ghost">Calculate the costs</a></div>
        </div>
      </section>

      <div className="wrap">
        <div className="kfacts k4" role="list" aria-label="The purchase in brief">
          <div role="listitem"><span>Deal time</span><b>3–6 weeks</b><small>resale home, demo</small></div>
          <div role="listitem"><span>Costs on top of the price</span><b>6–8%</b><small>including agency services</small></div>
          <div role="listitem"><span>Without travelling</span><b>Possible</b><small>by power of attorney</small></div>
          <div role="listitem"><span>Consultation</span><b>Free</b><small>and so is the shortlist</small></div>
        </div>
      </div>

      <section className="sec">
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">Step by step</span><h2>What happens at each stage</h2></div><p>Timelines are approximate (demo). Each step is handled by one expert; documents are checked by a lawyer.</p></div>
          <div className="psteps">
            <article className="pstep rv" id="step-1">
              <div><span className="n">01</span><h3>Enquiry and consultation</h3><span className="t">1 day</span></div>
              <div><p>You tell us your budget, goal and timing by phone, on WhatsApp or through the form. An expert explains how the purchase works and what it costs on top of the price.</p>
                <div className="who"><div><b>From you</b><ul><li>Budget and payment currency</li><li>Goal: living, holidays, renting out, residence permit or citizenship</li><li>Preferred districts and timing</li></ul></div><div><b>What we do</b><ul><li>Assign an expert for your districts</li><li>Explain the costs and the deal procedure</li><li>The consultation is free</li></ul></div></div>
                </div>
            </article>
            <article className="pstep rv" id="step-2">
              <div><span className="n">02</span><h3>Shortlist</h3><span className="t">2–5 days</span></div>
              <div><p>We send 5–10 options with the price per m², the date the price was checked, the pros and cons of each property and a cost estimate.</p>
                <div className="who"><div><b>From you</b><ul><li>Pick 3–5 properties to view</li><li>Ask questions about each one</li></ul></div><div><b>What we do</b><ul><li>Confirm the price and availability with the seller</li><li>Tell you honestly about the drawbacks: noise, view, neighbours</li><li>Compare districts for your needs</li></ul></div></div>
                <p className="more"><Link href="/districts" className="link">District guide →</Link></p></div>
            </article>
            <article className="pstep rv" id="step-3">
              <div><span className="n">03</span><h3>Viewings</h3><span className="t">1–7 days</span></div>
              <div><p>We show you the apartment, the complex, the grounds and the way to the sea, in person or by live video call.</p>
                <div className="who"><div><b>From you</b><ul><li>Come for 2–3 days or watch by video</li><li>Note what you liked</li></ul></div><div><b>What we do</b><ul><li>Transfer from the airport and between properties</li><li>Video viewing with answers to your questions</li><li>Record videos for your family</li></ul></div></div>
                </div>
            </article>
            <article className="pstep rv" id="step-4">
              <div><span className="n">04</span><h3>Checks and booking</h3><span className="t">3–7 days</span></div>
              <div><p>Our lawyer checks the documents before you pay a deposit. The booking fixes the price and takes the property off the market.</p>
                <div className="who"><div><b>From you</b><ul><li>Sign the booking agreement</li><li>Pay the deposit (usually €2,000–5,000, demo)</li></ul></div><div><b>What we do</b><ul><li>Check the TAPU, debts and encumbrances</li><li>Check the occupancy permit (iskan)</li><li>Check the neighbourhood's residence-permit status</li><li>The deposit is refunded if the check finds a problem</li></ul></div></div>
                <p className="more"><Link href="/team/murat-kaya" className="link">The agency's lawyer →</Link></p></div>
            </article>
            <article className="pstep rv" id="step-5">
              <div><span className="n">05</span><h3>Contract and payment</h3><span className="t">1–2 weeks</span></div>
              <div><p>We get your tax number and a Turkish bank account, order the valuation report and sign the sale contract with a translation.</p>
                <div className="who"><div><b>From you</b><ul><li>Passport and its translation</li><li>Bank payment: a transfer from your country or cash paid into the account</li></ul></div><div><b>What we do</b><ul><li>Tax number in 1 day</li><li>Bank account opening</li><li>Bilingual contract</li><li>A cost estimate with no surprises</li></ul></div></div>
                <p className="more"><Link href="/blog/skolko-stoit-pokupka-sverkh-tseny-kvartiry-nalogi-tapu-dask" className="link">Article on purchase costs →</Link></p></div>
            </article>
            <article className="pstep rv" id="step-6">
              <div><span className="n">06</span><h3>TAPU and keys</h3><span className="t">1–2 weeks</span></div>
              <div><p>We register the ownership at the land registry: signing with a translator, the TAPU issued in your name, the keys handed over with a handover report.</p>
                <div className="who"><div><b>From you</b><ul><li>Sign the documents at the land registry in person or by power of attorney</li></ul></div><div><b>What we do</b><ul><li>Land registry appointment and translator</li><li>DASK insurance</li><li>Transfer water, electricity and internet to your name</li><li>Hand over the keys and the handover report</li></ul></div></div>
                <p className="more"><Link href="/residence-permit" className="link">Residence permit after the purchase →</Link></p></div>
            </article>
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: "var(--mist)" }} id="costs">
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">Calculator</span><h2>What the purchase costs on top of the price</h2></div><p>An approximate calculation at demo rates. We give an exact estimate for a property before booking.</p></div>
          <BuyCalculator articleHref={"/blog/skolko-stoit-pokupka-sverkh-tseny-kvartiry-nalogi-tapu-dask"} />
        </div>
      </section>

      <section className="sec" id="remote">
        <div className="wrap cols2">
          <div>
            <span className="eyebrow">Buying remotely</span>
            <h2 style={{ margin: "8px 0 14px" }}>You can buy without flying to Turkey</h2>
            <p style={{ color: "#2B323C" }}>About half of our clients buy remotely. The only thing you have to do yourself is sign a power of attorney at a notary. We do the rest, and you see every step in the chat and on video.</p>
            <div className="contacts" style={{ marginTop: "18px" }}><a href="#lead" className="btn btn-dark">Discuss a remote purchase</a><Link href="/team/anna-sokolova" className="btn btn-line">Remote deals expert</Link></div>
          </div>
          <div className="box">
            <h3>How it works</h3>
            <ul className="checklist">
              <li>Video viewing: the apartment, the view from the windows, the complex, the way to the sea</li>
              <li>Power of attorney at a notary in Turkey, or in your country with an apostille and translation</li>
              <li>Tax number and bank account by power of attorney</li>
              <li>Payment by bank transfer, no cash</li>
              <li>Your representative receives the TAPU and the keys, and we send the documents to you</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: "var(--mist)" }}>
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">After the purchase</span><h2>We stay with you after the deal</h2></div></div>
          <div className="values">
            <div className="rv"><b>Residence permit</b><p>Documents, insurance and the migration office appointment. <Link href="/residence-permit" className="link">Learn more</Link></p></div>
            <div className="rv"><b>Utilities</b><p>Water, electricity, internet, the complex's aidat fee.</p></div>
            <div className="rv"><b>Furniture and repairs</b><p>Furniture packages and trusted tradespeople.</p></div>
            <div className="rv"><b>Renting out</b><p>We find tenants and manage the apartment. <Link href="/blog/dokhodnost-arendy-v-alanii-skolko-realno-zarabotat" className="link">Rental yield</Link></p></div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap faq">
          <div><span className="eyebrow">Questions</span><h2 style={{ marginTop: "8px" }}>Frequently asked questions about buying</h2><p className="hint" style={{ marginTop: "10px" }}>Didn't find an answer? <a href="#lead" className="link">Ask an expert →</a></p></div>
          <div id="faq">{FAQ.map(([q, a], i) => <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>)}</div>
        </div>
      </section>
    </main>
  )
}
