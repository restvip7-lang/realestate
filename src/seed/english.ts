// Английские тексты демо-контента, которого не было на английском (владелец 20.11.2026: на демо только RU и EN,
// под /en не должно быть русского текста). Заполняются только пустые значения: правки менеджера не трогаем.
// Вызывают: сид (шаг globals) и миграция 20261120_190000_demo_english.
import type { Payload, PayloadRequest } from 'payload'

import { htmlToLexical } from '@/lib/lexical'

type TeamEn = { name: string; role: string; spec: string; bio: string; help: string[] }

/** Сотрудники по slug. */
export const TEAM_EN: Record<string, TeamEn> = {
  'emre-yyldyz': {
    name: 'Emre Yıldız', role: 'Founder', spec: 'Strategy, developer partnerships, complex deals',
    bio: 'Born in Alanya, 14 years in real estate. He started as a sales manager at a developer and founded Kleo Homes in 2019 to make it easier for foreigners to buy a home honestly and without surprises. He personally handles villa and premium property deals.',
    help: ['Villa and premium property deals', 'Price negotiations with developers and owners', 'Buying several properties for citizenship', 'Complex cases: inheritance, shared ownership, alterations'],
  },
  'anna-sokolova': {
    name: 'Anna Sokolova', role: 'Property expert', spec: 'Seaside apartments, remote purchases, video viewings',
    bio: 'She moved to Alanya in 2017 and went through buying an apartment herself. She helps buyers from Russia, Kazakhstan and Europe choose a district, check a property and complete the deal by power of attorney.',
    help: ['Choosing a seaside apartment for your budget and goal', 'Live video viewings', 'Remote purchase by power of attorney', 'Comparing 2–3 districts for your lifestyle'],
  },
  'murat-kaya': {
    name: 'Murat Kaya', role: 'Lawyer', spec: 'TAPU checks, contracts, residence permits and citizenship',
    bio: 'Member of the Antalya Bar Association (demo). He checks the documents of every property before booking, handles TAPU registration and residence permit applications, and writes about laws and taxes in the journal.',
    help: ['Checking the TAPU, debts and encumbrances before booking', 'Contracts with developers and owners', 'Ownership registration', 'Residence permits and citizenship for the whole family'],
  },
  'elena-demir': {
    name: 'Elena Demir', role: 'Property expert', spec: 'Homes for year-round living, families with children',
    bio: 'She lives in Oba with her family and knows the schools, clinics and districts for permanent living. She finds apartments for people moving to Alanya for good.',
    help: ['Apartments for year-round living', 'Choosing a district near schools and clinics', 'Help with the move: utilities, insurance, school', 'Apartments with a garden and for families with children'],
  },
  'daniel-marten': {
    name: 'Daniel Marten', role: 'Rental expert', spec: 'Long-term rentals, yield, rental management',
    bio: "He is in charge of rentals and managing clients' properties. He calculates the yield before you buy and finds long-term tenants.",
    help: ['Yield calculation before you buy', 'Long-term and seasonal rentals', 'Finding tenants and checking contracts', 'Managing your apartment while you are away from Turkey'],
  },
  'amina-arslan': {
    name: 'Amina Arslan', role: 'New-build expert', spec: 'New builds and developer installment plans',
    bio: "She works directly with partner developers and knows the completion dates, installment terms and reputation of every project. She checks building permits before booking.",
    help: ['New builds directly from partner developers', 'Interest-free installments for 12–36 months', "Checking permits and the developer's reputation", 'Construction monitoring and apartment handover'],
  },
}

export const TEAM_PAGE_EN = {
  title: 'The Kleo Homes team',
  lead: 'A real estate agency in Alanya since 2019. We help you choose, check and buy a home, in person or remotely, and we stay with you after the deal.',
  quote: 'I want buying an apartment in Turkey to be as clear as at home: an honest price, checked documents and people who answer the phone after the deal.',
  stats: ['year founded', 'specialists on the team', 'languages we speak', 'partner developers'],
}

export const COMPANY_EN = {
  hours: 'Mon–Sat 9:00–19:00',
  awards: '“Agency of the Year — Alanya 2025”, 12 partner developers, accredited with two banks for mortgages.',
}

const DEMO = '<p class="demo-note">Demo text for the prototype. Terms and figures are checked on the date of the deal.</p>'

/** Статьи и новости демо-журнала по slug (адреса страниц общие для всех языков). Ссылки — сразу на /en/. */
export const POSTS_EN: Record<string, { title: string; lead: string; body: string }> = {
  'tseny-na-nedvizhimost-v-alanii-v-2026-godu-rayony-i-tsena-za-m2': {
    title: 'Property prices in Alanya in 2026: districts and price per m²',
    lead: 'What a square metre costs in different districts of Alanya, why neighbouring apartments differ in price by 20%, and where to find the best balance of price and location.',
    body: `<p>Prices in Alanya depend heavily on the district, the distance to the sea and the age of the complex. Below are guide figures from our catalogue and the agency's deals over recent months.</p>
<h2>Average price per m² by district</h2>
<ul><li><b>City centre</b>: about €2,400/m². Cleopatra Beach, everything within walking distance, few new builds.</li><li><b>Tepe</b>: about €2,300/m². Villas with panoramic views; you need to drive to the sea.</li><li><b>Oba and Kargıcak</b>: €2,100–2,200/m². Districts for everyday life with sea views.</li><li><b>Mahmutlar</b>: about €1,700/m². The widest choice of apartments for any budget.</li><li><b>Avsallar, Demirtaş, Gazipaşa</b>: €1,300–1,600/m². Outer areas with beaches and lower prices.</li></ul>
<p>More about each district is in the <a href="/en/districts">Alanya districts</a> section.</p>
<h2>Why neighbouring apartments cost different amounts</h2>
<p>Five factors affect the price: distance to the sea (the seafront is 15–25% more expensive), the view, the floor, the complex's facilities and the year of construction. A furnished apartment usually costs €5,000–8,000 more.</p>
<blockquote>Compare the price per m² only within one district and one type of complex, otherwise the comparison tells you nothing.</blockquote>
<h2>How not to overpay</h2>
<p>The same property is often sold by several agencies at different prices. Ask for the property ID, the complex address and the date the price was checked. Every listing in our catalogue shows when we confirmed the price with the owner or developer.</p>${DEMO}`,
  },
  'skolko-stoit-pokupka-sverkh-tseny-kvartiry-nalogi-tapu-dask': {
    title: 'What buying costs on top of the price: taxes, TAPU, DASK',
    lead: 'TAPU registration tax, valuation, DASK insurance, translation and notary: what the costs on top of the apartment price are made of and how much to budget.',
    body: `<p>On top of the property price, the buyer pays for the ownership registration and several mandatory services. Together this is usually 6–8% of the price. Let's go through it item by item.</p>
<h2>TAPU registration tax: 4%</h2>
<p>The tax is calculated on the value in the deal documents. By law it is split between buyer and seller (2% each), but in practice the buyer most often pays the whole amount; this is agreed before booking.</p>
<h2>Valuation report</h2>
<p>Deals with foreigners require a report from a licensed valuer. It costs a few hundred euros depending on the property.</p>
<h2>DASK insurance and other costs</h2>
<ul><li><b>DASK</b>: mandatory earthquake insurance, from €50 a year for an apartment.</li><li><b>Tax number, translation and notary</b>: €150–300.</li><li><b>Water and electricity connection</b>: deposits of €100–200.</li><li><b>Agency services</b>: under the agreement (Kleo Homes terms are on the home page).</li></ul>
<h2>Example for an apartment at €150,000</h2>
<p>TAPU tax at 4%: €6,000; valuation: about €400; translation and notary: €250; DASK: €60; utility deposits: €150. In total about <b>€6,900</b> on top of the price, excluding agency services.</p>
<p>We give a full estimate for a specific property before booking: <a href="#lead">send us a request</a>.</p>${DEMO}`,
  },
  'makhmutlar-oba-ili-kestel-gde-zhit-kruglyy-god': {
    title: 'Mahmutlar, Oba or Kestel: where to live all year round',
    lead: 'The three most popular districts for year-round living: comparing prices, schools, shops, the drive to the centre and the atmosphere.',
    body: `<p>If you are moving to Alanya for good, the district matters more than the apartment: it determines the school, the doctor, the shops and your commute. Let's compare the three districts our clients choose most often.</p>
<h2><a href="/en/districts/mahmutlar">Mahmutlar</a>: everything nearby and many international neighbours</h2>
<p>The largest district for foreigners. Markets, clinics, cafés, a long promenade. Prices are lower than in Oba, but the buildings are dense. 9.5 km to the centre.</p>
<h2><a href="/en/districts/oba">Oba</a>: a modern district next to the centre</h2>
<p>A shopping mall, a public hospital and private clinics, schools, parks. 2 km to the centre. Prices are above average, but everything you need is within walking distance.</p>
<h2><a href="/en/districts/kestel">Kestel</a>: new builds by the sea</h2>
<p>Many new complexes with pools and a promenade. Fewer shops than in Mahmutlar, but quieter. 7 km to the centre.</p>
<blockquote>Tip: live in the district for a week in the off-season before you buy. In winter, resort areas look very different.</blockquote>
<p>All 14 districts with ratings and prices are on the <a href="/en/districts">Alanya districts</a> page.</p>${DEMO}`,
  },
  'kurs-liry-k-evro-na-25-sentyabrya-2026-demo': {
    title: 'Lira to euro exchange rate on 25 September 2026 (demo)',
    lead: 'The Central Bank of Turkey has published the official rates for 25 September. Prices on the site are converted at demo rates.',
    body: `<p>According to the Central Bank of Turkey, the euro was worth about ₺45.2 on 25 September 2026 (a demo value for the prototype).</p><p>Property prices in the Kleo Homes catalogue are given in euros and converted into the currency you choose. The final deal amount is fixed in the contract in the currency agreed with the seller.</p>${DEMO}`,
  },
  'migratsionnaya-sluzhba-obnovila-spisok-otkrytykh-rayonov-dlya-vnzh-demo': {
    title: 'The migration office has updated the list of neighbourhoods open for residence permits (demo)',
    lead: 'The list of neighbourhoods in Antalya where a first residence permit can be issued at your address has changed. We check every property before booking.',
    body: `<p>The Turkish migration office has updated the list of neighbourhoods closed to first-time residence permits for foreigners (demo news). The list is revised several times a year.</p><h2>What this means for buyers</h2><p>If a residence permit matters to you, check the neighbourhood's status on the date of the deal. Our lawyer <a href="/en/team/murat-kaya">Murat Kaya</a> checks this for every property before booking.</p><p>More details are in the article <a href="/en/blog/vnzh-pri-pokupke-nedvizhimosti-v-alanii-usloviya-i-dokumenty">“Residence permit when buying property”</a>.</p>${DEMO}`,
  },
  'kleo-homes-otkryvaet-shourum-v-makhmutlare-demo': {
    title: 'Kleo Homes opens a showroom in Mahmutlar (demo)',
    lead: 'A new office for meetings and viewings: new-build presentations, lawyer consultations and coffee with a view of the promenade.',
    body: `<p>Kleo Homes is opening a showroom in Mahmutlar (demo news). Here you can see presentations of our partners' new builds, get a consultation with a lawyer and discuss a shortlist with an expert.</p><p>The showroom is open Monday to Saturday from 9:00 to 19:00. You can book a meeting on WhatsApp or through the form on the site.</p>${DEMO}`,
  },
  'vnzh-pri-pokupke-nedvizhimosti-v-alanii-usloviya-i-dokumenty': {
    title: 'Residence permit when buying property in Alanya: requirements and documents',
    lead: 'Who can get a residence permit as a home owner, what property value is required, which neighbourhoods are closed and what documents to prepare.',
    body: `<p>Buying a home in Turkey gives you the right to apply for a short-term residence permit as an owner. Here are the main requirements at the time of publication.</p>
<h2>Minimum property value</h2>
<p>For large cities, which include Antalya and Alanya, the home's value under the valuation report must be at least the set threshold ($200,000 at the time of publication, demo). The terms change, so we check them on the date of the deal.</p>
<h2>Closed neighbourhoods</h2>
<p>In some neighbourhoods, first-time residence permits for foreigners are temporarily closed. The list is updated several times a year; see the <a href="/en/news">news</a>.</p>
<h2>Documents</h2>
<ul><li>Passport and its notarised translation</li><li>The TAPU in your name</li><li>Health insurance for the permit period</li><li>Photos, and a rental contract or the TAPU as proof of address</li><li>Payment of the fees and the card</li></ul>
<h2>Timelines</h2>
<p>You apply online, then attend an interview at the migration office. The card usually arrives by post in 1–2 months.</p>
<p>Requirements, costs and properties that qualify are collected on the <a href="/en/residence-permit">Residence permit when buying a home</a> page.</p>${DEMO}`,
  },
  'grazhdanstvo-turtsii-za-pokupku-nedvizhimosti-kak-eto-rabotaet': {
    title: 'Turkish citizenship by buying property: how it works',
    lead: 'The minimum amount, the no-sale period, bank payment and the application procedure: the essentials of the citizenship-by-investment programme through real estate.',
    body: `<p>Turkey grants citizenship to foreigners who buy property worth a certain amount and keep it for several years. The main terms at the time of publication (demo):</p>
<ul><li>The value of one or several properties is from $400,000 under the valuation report.</li><li>No sale for 3 years; an annotation is added to the TAPU.</li><li>Payment only through a Turkish bank with confirmation of the currency transfer.</li></ul>
<h2>How the application works</h2>
<p>Choosing a property → document checks → valuation report → bank payment → TAPU registration with the annotation → certificate of conformity → residence permit → citizenship application. On average the process takes 6 to 12 months.</p>
<h2>Which properties qualify</h2>
<p>Both new builds and resale homes qualify, but not every property: the sales history and the valuation matter. You can find such properties in the catalogue with a filter, and the lawyer gives the final confirmation.</p>
<p>Steps, documents, costs and suitable properties are on the <a href="/en/citizenship">Turkish citizenship</a> page.</p>${DEMO}`,
  },
  'dokhodnost-arendy-v-alanii-skolko-realno-zarabotat': {
    title: 'Rental yield in Alanya: how much you can really earn',
    lead: 'We calculate the yield of a 1+1 apartment on long-term and seasonal rentals, including complex fees, taxes and management.',
    body: `<p>Ads often promise 10% a year. Let's do an honest calculation for a 1+1 apartment by the sea at €110,000.</p>
<h2>Long-term rental</h2>
<p>Rent of €650 a month is €7,800 a year. Costs: the complex fee (aidat) of about €600, rental income tax, insurance and minor repairs, another €700–900. About €6,300 remains net, which is <b>5.7% a year</b>.</p>
<h2>Seasonal rental</h2>
<p>Income is higher in summer, but the apartment stands empty in winter, and short-term letting requires a licence. A management company takes 20–25% of income. The result is usually 5–7% a year.</p>
<blockquote>Yields are higher in the centre and by the sea: apartments there don't stand empty even in winter.</blockquote>
<p>We calculate the yield of every property before you buy and can take the apartment under management.</p>${DEMO}`,
  },
  'novostroyka-ili-vtorichka-v-alanii-chto-vybrat': {
    title: 'New build or resale in Alanya: which to choose',
    lead: 'Installments and new complexes versus a finished home with the TAPU straight away. The pros, cons and risks of each option.',
    body: `<p>About half of our clients choose new builds. Let's look at when that pays off.</p>
<h2>New build</h2>
<ul><li>Interest-free developer installments for 12–36 months.</li><li>The price during construction is 10–20% lower.</li><li>Risk: delayed completion. We check the building permit and the developer's past projects.</li></ul>
<h2>Resale home</h2>
<ul><li>The TAPU and the keys right after the deal; you can rent it out from the first month.</li><li>You can see the real condition of the building and the neighbours.</li><li>Risk: unpaid utility bills and aidat. We check this before booking.</li></ul>
<p>If a residence permit or rental income matters now, choose a finished home. If you have time and want a new complex at a lower price, choose a new build from a reliable developer.</p>${DEMO}`,
  },
  'aeroport-gazipasha-alanya-rasshiril-zimnee-raspisanie-demo': {
    title: 'Gazipaşa-Alanya airport has expanded its winter schedule (demo)',
    lead: 'More flights in the winter season: getting to the eastern districts of Alanya will be easier.',
    body: `<p>Gazipaşa-Alanya airport (GZP) has announced a winter schedule with additional flights (demo news).</p><p>For buyers in Gazipaşa, Demirtaş and Mahmutlar this means a shorter trip to viewings and home. The distance to the airport is given on the page of each <a href="/en/districts">district</a>.</p>${DEMO}`,
  },
  'prodazhi-zhilya-inostrantsam-v-antalii-za-avgust-demo': {
    title: 'Home sales to foreigners in Antalya in August (demo)',
    lead: 'The Turkish Statistical Institute has published data on deals with foreigners. Antalya remains among the leaders.',
    body: `<p>According to the Turkish Statistical Institute, in August Antalya was among the top three regions for home sales to foreigners (demo news, figures for the prototype).</p><p>Most deals took place in Alanya and Muratpaşa. Prices by district are analysed in the article <a href="/en/blog/tseny-na-nedvizhimost-v-alanii-v-2026-godu-rayony-i-tsena-za-m2">“Property prices in Alanya in 2026”</a>.</p>${DEMO}`,
  },
  'utochneny-pravila-otsenki-nedvizhimosti-dlya-inostrantsev-demo': {
    title: 'Property valuation rules for foreigners clarified (demo)',
    lead: 'The Official Gazette has published changes to how homes are valued in deals with foreign buyers.',
    body: `<p>The Turkish Official Gazette has published clarifications to the procedure for valuing homes sold to foreigners (demo news).</p><p>A valuation report is still mandatory. We include its timing and cost in the estimate before booking; more in the article <a href="/en/blog/skolko-stoit-pokupka-sverkh-tseny-kvartiry-nalogi-tapu-dask">on purchase costs</a>.</p>${DEMO}`,
  },
  'kleo-homes-provela-onlayn-vstrechu-dlya-pokupateley-iz-kazakhstana-demo': {
    title: 'Kleo Homes held an online meeting for buyers from Kazakhstan (demo)',
    lead: 'Our experts explained how to buy an apartment remotely: video viewings, power of attorney and money transfers.',
    body: `<p>Kleo Homes experts <a href="/en/team/anna-sokolova">Anna Sokolova</a> and <a href="/en/team/murat-kaya">Murat Kaya</a> held an online meeting for buyers from Kazakhstan (demo news).</p><p>They talked about video viewings, power of attorney for the deal and transferring money through a bank. We'll send the recording on request via WhatsApp.</p>${DEMO}`,
  },
}

/** Теги статей. */
export const TAGS_EN: Record<string, string> = {
  ВНЖ: 'residence permit', ТАПУ: 'TAPU', аренда: 'rental', гражданство: 'citizenship', документы: 'documents', доходность: 'yield',
  жизнь: 'living', налоги: 'taxes', новостройки: 'new builds', районы: 'districts', расходы: 'costs', цены: 'prices',
}

/** Отзывы по имени клиента (русская версия): [имя, страна, текст]. Текст клиента остаётся в русской версии. */
export const REVIEWS_EN: Record<string, [string, string, string]> = {
  Ерлан: ['Yerlan', 'Kazakhstan', 'We bought a 2+1 in Kestel with a 24-month installment plan. The developer was checked in advance, and the building was completed on time.'],
  'Анна и Игорь': ['Anna and Igor', '', 'We bought an apartment in Mahmutlar without flying out once: Anna showed us 6 apartments by video and told us honestly where it was damp and where it was noisy.'],
  'Семья Ковалёвых': ['The Kovalev family', '', 'Elena told us which school has a Russian-speaking class and found us an apartment 10 minutes from it.'],
  'Олег и Марина': ['Oleg and Marina', '', 'Emre personally handled our villa purchase in Tepe: he negotiated an €18,000 discount and found a problem with the pool permit before the deal.'],
  Markus: ['Markus', '', 'Daniel found long-term tenants in two weeks and sends a clear monthly report.'],
  Дмитрий: ['Dmitry', '', 'Calm, to the point and without pressure. The cost estimate matched to the euro.'],
  Светлана: ['Svetlana', '', 'Murat found the seller\'s unpaid utility bills and made sure they were paid off before the deal.'],
  Азамат: ['Azamat', '', 'We got residence permits for a family of four in 5 weeks; they prepared all the documents for us.'],
  Гульнара: ['Gulnara', '', 'Amina showed us three projects and explained why one of them was better avoided. We bought with a 24-month installment plan.'],
  Ольга: ['Olga', 'Belarus', 'We rented an apartment in Oba for a year. Everything was quick and honest, but we had to wait a few days for the contract in English.'],
  Stefan: ['Stefan', '', 'Professional and honest. Emre explained every risk before we paid the deposit.'],
  Jonas: ['Jonas', 'Sweden', 'They sold my apartment in Tosmur in two months. Photos, video and viewings all without me: I was in Stockholm.'],
  Ирина: ['Irina', '', 'She helped us not only buy but also move in: electricity, water, internet, all in two days.'],
  Татьяна: ['Tatiana', 'Russia', 'We were choosing between Mahmutlar and Kargıcak. Anna compared the districts honestly and talked us out of an apartment next to a noisy road.'],
  Алексей: ['Alexey', '', 'He calculated the yield honestly, without promising “10% a year”. The apartment has been rented out since the first month.'],
  Ахмет: ['Ahmet', 'Turkey', 'The sale was quick and transparent. I would have liked more viewings in the first month, but I am happy with the final price.'],
  Павел: ['Pavel', '', 'She sent photos from the construction site every month, and we did the handover inspection together: all the defects were fixed before the TAPU.'],
  Игорь: ['Igor', 'Ukraine', 'We got citizenship by buying two apartments. The lawyer handled everything from the valuation to the passport, and the timeline was as promised.'],
  'Удалённая покупка в Газипаше': ['Remote purchase in Gazipaşa', '', 'The agency helped me buy an apartment in Gazipaşa remotely in 2022. I am happy with the agent\'s work: he went to the property and showed me the complex, the apartment and the area by video call. I had never been to this town before. I was nervous, but my fears did not come true. The agent advised me and answered all my questions. Yesterday I received the TAPU. Thank you to our agent Veronika!'],
}

const KONAKLI = `Konaklı is a western district of Alanya, 7 km from Cleopatra Beach and the centre. The drive into town is short, and the district's own infrastructure covers all everyday needs: supermarkets, a market, restaurants, transport, medical centres and pharmacies. Konaklı is more of a tourist area, but recently construction has begun on upmarket low-rise residential complexes in attractive locations near the beach and the sea.

An important feature of many properties in Konaklı is that you don't have to cross the D-400 highway on the way to the beach, as you do in almost every other district. There are many breakwaters, so the sea is always calm. On the hill above the shore there is a picnic area with barbecues right in the pine forest. The district is cosy, uncrowded, beautiful and quiet.

The proximity to central Alanya and the Cleopatra promenade, panoramic sea views and beautiful nature give property in Konaklı high rental potential. It is also a good purchase for your own holidays or for living in Turkey. There are schools in the district itself and in the centre.`

/** Объекты из CRM без английского текста — по ID в CRM (stay.objectId). */
export const PROPERTIES_EN: Record<number, { title: string; description: string }> = {
  2538: {
    title: '2+1 penthouse surrounded by pine forest in Avsallar',
    description: `Kleo Homes presents a 2+1 penthouse apartment in the Avsallar district.

The apartment is 93 m², and the beach is 1,400 metres away.

The perfect combination of beaches and forests: Avsallar lies right on the Mediterranean coast and is surrounded on one side by dense pine forests. Famous for its sandy beaches and pine woods, Avsallar rightly deserves the title of Alanya's greenest suburb.

Avsallar infrastructure: the district is 20 km from central Alanya on the Cleopatra Beach side and 95 km from Antalya airport. Public transport runs along the coast. Avsallar has all the basics, including a farmers' market, chain supermarkets, currency exchange offices, ATMs and various services, plus a good choice of restaurants, bakeries and Turkish cafés.

Property in Avsallar has high rental potential: the district is considered one of the best for a seaside holiday surrounded by Turkey's beautiful nature. There is also a good choice of both resale property and new projects.`,
  },
  2452: {
    title: 'Bright penthouse with nature views in Konaklı',
    description: `Kleo Homes presents a 3+1 apartment in Konaklı.

The apartment is 200 m², and the beach is 400 metres away.

${KONAKLI}`,
  },
  377: {
    title: '4+1 penthouse with views and a large terrace in Konaklı',
    description: `Kleo Homes presents a 4+1 apartment in Konaklı.

The apartment is 300 m², and the beach is 300 metres away.

${KONAKLI}`,
  },
  2363: {
    title: 'Spacious 4+1 apartment in Avsallar',
    description: `An apartment in Avsallar is for sale.
The layout is 4+1, the total area is 185 square metres, and the sea is 500 metres away.

If you love sandy beaches, Avsallar is the place: it has the best beaches in the region. Famous for its sandy beaches and pine forests, Avsallar rightly deserves the title of Alanya's greenest suburb. It lies 20 km west of the centre, towards Antalya, and 95 km from the airport.

There are several excellent beaches here: along the line of seafront hotels, at a campsite in the pine forest, and in neighbouring İncekum. The latter has fine sand that is ideal for children's games and is one of the best beaches on Turkey's Mediterranean coast.
In recent years the whole district has been actively built up, including plots further from the sea. Property in Avsallar is in demand both for renting out and for permanent living, and Avsallar has all the infrastructure needed for everyday life.

This property qualifies for Turkish citizenship. For details, message us in the chat, request a call back or send us a request. We will be happy to help!`,
  },
  2362: {
    title: 'New 2+1 apartment in Gazipaşa',
    description: `Kleo Homes presents a 2+1 apartment in Gazipaşa.

The apartment is 95 m², and the beach is 5,000 metres away.

A promising Turkish town on the Mediterranean coast whose growth was driven by the construction of an international airport. Gazipaşa has wonderful nature, an excellent climate and, of course, the Mediterranean Sea, although just a few years ago it was not such a popular location.

A major plus for many is that there are almost no hotels in the town, so if you are looking for a peaceful place to live, this is it, and on a smaller budget than in Alanya.

Gazipaşa has good town infrastructure: schools for children of all ages and all the necessary services, and you won't be bored here either, with cafés, bars, restaurants and much more.

Gazipaşa has 50 km of sandy coastline, including the famous 2.5 km Selinus beach, and beautiful rocky shores where you can swim surrounded by pine trees.`,
  },
}

// Кириллица, похожая на латиницу: в английских текстах CRM встречаются «construсtion», «Сleopatra» (с — русская)
const HOMOGLYPHS: Record<string, string> = { а: 'a', с: 'c', е: 'e', о: 'o', р: 'p', х: 'x', у: 'y', і: 'i', А: 'A', В: 'B', С: 'C', Е: 'E', Н: 'H', К: 'K', М: 'M', О: 'O', Р: 'P', Т: 'T', Х: 'X' }
/** Заменить кириллические «двойники» латинских букв внутри латинских слов. Русские слова не трогаем. */
export function fixHomoglyphs(text: string) {
  return text.replace(/[\p{L}]+/gu, (w) => (/[A-Za-z]/.test(w) && /[А-Яа-яі]/.test(w) && [...w].every((ch) => /[A-Za-z]/.test(ch) || ch in HOMOGLYPHS) ? [...w].map((ch) => HOMOGLYPHS[ch] ?? ch).join('') : w))
}

const empty = (v: unknown) => v == null || (typeof v === 'string' && !v.trim())

/** Заполнить пустые английские тексты демо-контента. Возвращает число изменённых записей. */
export async function applyEnglish(payload: Payload, req?: Partial<PayloadRequest>) {
  let n = 0
  const opts = { req, overrideAccess: true, depth: 0 } as const

  // сотрудники
  const { docs: team } = await payload.find({ collection: 'team', limit: 100, pagination: false, locale: 'ru', ...opts })
  for (const t of team) {
    const en = TEAM_EN[t.slug || '']
    if (!en) continue
    const cur = await payload.findByID({ collection: 'team', id: t.id, locale: 'en', fallbackLocale: false, ...opts })
    const data: Record<string, unknown> = {}
    if (empty(cur.name) || cur.name === t.name) data.name = en.name
    if (empty(cur.role) || cur.role === t.role) data.role = en.role
    if (empty(cur.spec)) data.spec = en.spec
    if (empty(cur.bio)) data.bio = en.bio
    if (!cur.help?.length) data.help = en.help.map((text) => ({ text }))
    if (!Object.keys(data).length) continue
    await payload.update({ collection: 'team', id: t.id, locale: 'en', data: { role: cur.role || en.role, ...data }, ...opts })
    n++
  }

  // страница «Команда»
  const tpRu = await payload.findGlobal({ slug: 'team-page', locale: 'ru', ...opts })
  const tpEn = await payload.findGlobal({ slug: 'team-page', locale: 'en', fallbackLocale: false, ...opts })
  const tp: Record<string, unknown> = {}
  if (empty(tpEn.title)) tp.title = TEAM_PAGE_EN.title
  if (empty(tpEn.lead)) tp.lead = TEAM_PAGE_EN.lead
  if (empty(tpEn.quote)) tp.quote = TEAM_PAGE_EN.quote
  const stats = tpRu.stats || []
  if (stats.length && (tpEn.stats || []).some((s) => empty(s.label))) {
    tp.stats = stats.map((s, i) => ({ id: s.id, value: s.value, label: (tpEn.stats?.[i]?.label || '').trim() || TEAM_PAGE_EN.stats[i] || s.label }))
  }
  if (Object.keys(tp).length) {
    await payload.updateGlobal({ slug: 'team-page', locale: 'en', data: { title: tpEn.title || TEAM_PAGE_EN.title, ...tp }, ...opts })
    n++
  }

  // контакты: часы работы и награды
  const coEn = await payload.findGlobal({ slug: 'company', locale: 'en', fallbackLocale: false, ...opts })
  const co: Record<string, unknown> = {}
  if (empty(coEn.hours)) co.hours = COMPANY_EN.hours
  if (empty(coEn.awards)) co.awards = COMPANY_EN.awards
  if (Object.keys(co).length) {
    await payload.updateGlobal({ slug: 'company', locale: 'en', data: co, ...opts })
    n++
  }

  // статьи и новости демо-журнала; теги — у всех статей, где английских тегов нет
  const { docs: postsRu } = await payload.find({ collection: 'posts', limit: 1000, pagination: false, locale: 'ru', select: { slug: true, tags: true }, ...opts })
  for (const ru of postsRu) {
    const text = POSTS_EN[ru.slug || '']
    const tags = (ru.tags || []).map((t) => TAGS_EN[t])
    if (!text && !(ru.tags?.length && tags.every(Boolean))) continue
    const p = await payload.findByID({ collection: 'posts', id: ru.id, locale: 'en', fallbackLocale: false, ...opts })
    const data: Record<string, unknown> = {}
    if (text && empty(p.title)) Object.assign(data, { title: text.title, lead: text.lead, body: htmlToLexical(text.body) })
    if (ru.tags?.length && tags.every(Boolean) && !p.tags?.length) data.tags = tags
    if (!Object.keys(data).length) continue
    await payload.update({
      collection: 'posts', id: p.id, locale: 'en',
      data: { title: p.title || text?.title, ...data, slug: p.slug, ...(p._status === 'published' ? { _status: 'published' as const } : {}) } as never,
      ...opts,
    })
    n++
  }

  // отзывы: перевод имени, страны и текста (русская версия — как написал клиент)
  const { docs: reviews } = await payload.find({ collection: 'reviews', limit: 1000, pagination: false, locale: 'ru', ...opts })
  for (const r of reviews) {
    const en = REVIEWS_EN[r.who]
    if (!en) continue
    const cur = await payload.findByID({ collection: 'reviews', id: r.id, locale: 'en', fallbackLocale: false, ...opts })
    if (!empty(cur.text)) continue
    await payload.update({ collection: 'reviews', id: r.id, locale: 'en', data: { who: en[0], country: en[1] || undefined, text: en[2] }, ...opts })
    n++
  }

  // объекты из CRM без английского текста
  const ids = Object.keys(PROPERTIES_EN).map(Number)
  const { docs: props } = await payload.find({ collection: 'properties', where: { 'stay.objectId': { in: ids } }, limit: 100, pagination: false, locale: 'en', fallbackLocale: false, ...opts })
  for (const p of props) {
    const en = PROPERTIES_EN[p.stay?.objectId ?? 0]
    if (!en) continue
    const data: Record<string, unknown> = {}
    if (empty(p.title)) data.title = en.title
    if (empty(p.description)) data.description = en.description
    if (!Object.keys(data).length) continue
    await payload.update({ collection: 'properties', id: p.id, locale: 'en', data: { ...data, slug: p.slug }, ...opts })
    n++
  }
  n += await mediaAltEnglish(payload, opts)
  return n
}

const ALT_EN: Record<string, string> = {
  'Документ в рамке (пример вместо скана лицензии)': 'Framed document (sample instead of the licence scan)',
  'Офис агентства (фото для примера)': 'Agency office (sample photo)',
}

type L10n = { ru?: string | null; en?: string | null }
const loc = (v: unknown) => (v && typeof v === 'object' ? (v as L10n) : { ru: v as string })

/** Описания фото (alt) демо-медиа: районы, сотрудники, объекты и статьи — по их английским названиям. */
async function mediaAltEnglish(payload: Payload, opts: { req?: Partial<PayloadRequest>; overrideAccess: true; depth: 0 }) {
  const all = { locale: 'all' as never, pagination: false, limit: 5000, ...opts }
  const { docs: media } = await payload.find({ collection: 'media', select: { alt: true }, ...all })
  const todo = media.filter((m) => { const a = loc(m.alt); return a.ru && !a.en?.trim() })
  if (!todo.length) return 0
  const map = new Map<string, string>(Object.entries(ALT_EN))
  const { docs: districts } = await payload.find({ collection: 'districts', select: { name: true }, ...all })
  for (const d of districts) { const x = loc(d.name); if (x.ru && x.en) map.set(`Аланья, ${x.ru}`, `Alanya, ${x.en}`) }
  const { docs: team } = await payload.find({ collection: 'team', select: { name: true }, ...all })
  for (const t of team) { const x = loc(t.name); if (x.ru && x.en) map.set(x.ru, x.en) }
  const alts = todo.map((m) => loc(m.alt).ru!).filter((a) => !map.has(a))
  for (const collection of ['properties', 'posts'] as const) {
    if (!alts.length) break
    const { docs } = await payload.find({ collection, where: { title: { in: alts } }, select: { title: true }, ...all })
    for (const d of docs) { const x = loc(d.title); if (x.ru && x.en && !map.has(x.ru)) map.set(x.ru, x.en) }
  }
  let n = 0
  for (const m of todo) {
    const en = map.get(loc(m.alt).ru!)
    if (!en) continue
    await payload.update({ collection: 'media', id: m.id, locale: 'en', data: { alt: en }, ...opts })
    n++
  }
  return n
}
