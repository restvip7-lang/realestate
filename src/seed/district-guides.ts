// Гиды по районам: разделы текста на ru/en/tr, а для en/tr — ещё вступление, плюсы, минусы и «рядом»
// (русские уже лежат в базе из демо-данных). Черновик Claude 21.10.2026 — факты проверяет агентство (docs/districts.md).
// Без цифр цен и точных расстояний: их страница района считает сама по каталогу и координатам.
import type { Payload, PayloadRequest } from 'payload'

type Loc = 'ru' | 'en' | 'tr'
type Texts = { lead?: string; guide: [string, string][]; pros?: string[]; cons?: string[]; infra?: string[] }

const T = {
  ru: ['Кому подходит', 'Море и пляжи', 'Быт и инфраструктура', 'Транспорт', 'Недвижимость'],
  ruIn: ['Кому подходит', 'Море и природа', 'Быт и инфраструктура', 'Транспорт', 'Недвижимость'],
  en: ['Who it suits', 'Sea and beaches', 'Everyday life', 'Getting around', 'Property'],
  enIn: ['Who it suits', 'Sea and nature', 'Everyday life', 'Getting around', 'Property'],
  tr: ['Kimler için uygun', 'Deniz ve plajlar', 'Günlük yaşam', 'Ulaşım', 'Gayrimenkul'],
  trIn: ['Kimler için uygun', 'Deniz ve doğa', 'Günlük yaşam', 'Ulaşım', 'Gayrimenkul'],
}
const sec = (titles: string[], texts: string[]): [string, string][] => texts.map((x, i) => [titles[i], x])

export const DISTRICT_GUIDES: Record<string, Record<Loc, Texts>> = {
  avsallar: {
    ru: {
      guide: sec(T.ru, [
        'Тем, кто хочет жить у хорошего пляжа и не против расстояния до центра: отдых летом, сдача в аренду в сезон, спокойная зима. Для круглогодичной жизни с детьми удобнее районы ближе к городу.',
        'Главная гордость — пляж Инджекум: широкий, песчаный, с пологим входом в воду и сосновым лесом рядом. Он подходит для детей, поэтому летом здесь много отдыхающих.',
        'Супермаркеты, еженедельный рынок, аптеки, кафе и отели вдоль моря. Летом жизнь кипит, зимой часть кафе и магазинов закрывается, за крупными покупками и к врачам ездят в Конаклы или центр.',
        'По прибрежному шоссе ходят автобусы в центр Аланьи и в соседние посёлки. Для ежедневных поездок в город удобнее своя машина. Аэропорт Антальи отсюда ближе, чем из центра.',
        'В основном новые жилые комплексы с бассейнами, садом и охраной: студии и квартиры 1+1–2+1 для отдыха и аренды, есть дуплексы и виллы. Цены ниже, чем ближе к центру.',
      ]),
    },
    en: {
      lead: 'A resort village in the west of Alanya with one of the best sandy beaches on the coast, Incekum. Busy in summer, quiet in winter.',
      guide: sec(T.en, [
        'For those who want to live by a great beach and do not mind the distance to the centre: summer holidays, seasonal rentals and a quiet winter. Families living here all year may prefer districts closer to town.',
        'The main asset is Incekum beach: wide and sandy, with a gentle entry into the water and a pine forest nearby. It is good for children, so it gets busy in summer.',
        'Supermarkets, a weekly market, pharmacies, cafés and seaside hotels. Life is lively in summer; in winter some cafés and shops close, and people go to Konaklı or the centre for big shopping and doctors.',
        'Buses run along the coastal road to central Alanya and nearby villages. A car is more convenient for daily trips to town. Antalya airport is closer from here than from the centre.',
        'Mostly new complexes with pools, gardens and security: studios and 1+1 to 2+1 apartments for holidays and rentals, plus some duplexes and villas. Prices are lower than closer to the centre.',
      ]),
      pros: ['Sandy Incekum beach with a gentle entry into the sea', 'Lower prices than closer to the centre', 'Many new complexes with pools'],
      cons: ['Far from central Alanya: you need a car or a bus', 'Some cafés and shops close in winter'],
      infra: ['Incekum beach', 'Supermarkets and a weekly market', 'Seaside hotels and cafés', 'Buses to central Alanya'],
    },
    tr: {
      lead: 'Alanya’nın batısında, kıyının en güzel kumsallarından İncekum’a sahip tatil beldesi. Yazın hareketli, kışın sakin.',
      guide: sec(T.tr, [
        'İyi bir plajın yanında yaşamak isteyen ve merkeze uzaklığı sorun etmeyenler için: yaz tatili, sezonluk kiralama ve sakin bir kış. Yıl boyu çocuklarla yaşayacaklar için şehre yakın bölgeler daha rahattır.',
        'En büyük artısı İncekum plajı: geniş, kumlu, denize girişi sığ ve yanında çam ormanı var. Çocuklar için uygundur, bu yüzden yazın kalabalıktır.',
        'Süpermarketler, haftalık pazar, eczaneler, kafeler ve deniz kenarında oteller. Yazın hayat canlıdır; kışın bazı kafe ve dükkânlar kapanır, büyük alışveriş ve doktor için Konaklı’ya veya merkeze gidilir.',
        'Sahil yolu boyunca Alanya merkezine ve komşu beldelere otobüs var. Şehre her gün gidip gelmek için araç daha rahattır. Antalya havalimanı buradan merkeze göre daha yakındır.',
        'Çoğunlukla havuzlu, bahçeli ve güvenlikli yeni siteler: tatil ve kiralama için stüdyo ve 1+1–2+1 daireler, ayrıca dubleks ve villalar. Fiyatlar merkeze yakın bölgelerden düşüktür.',
      ]),
      pros: ['Denize girişi sığ İncekum kumsalı', 'Merkeze yakın bölgelerden düşük fiyatlar', 'Havuzlu çok sayıda yeni site'],
      cons: ['Alanya merkezine uzak: araç veya otobüs gerekir', 'Kışın bazı kafe ve dükkânlar kapanır'],
      infra: ['İncekum plajı', 'Süpermarketler ve haftalık pazar', 'Sahilde oteller ve kafeler', 'Alanya merkezine otobüsler'],
    },
  },
  turkler: {
    ru: {
      guide: sec(T.ru, [
        'Тем, кто ищет тихое место у моря без плотной застройки: отдых, сезонная аренда, спокойная жизнь на пенсии. Если нужна развитая городская жизнь рядом, лучше смотреть Конаклы или центр.',
        'Пляж и набережная рядом с посёлком, вдоль берега — отели. Песчаные пляжи соседнего Авсаллара в нескольких минутах езды.',
        'На месте — небольшие магазины, кафе и аптеки, отели работают в сезон. За крупными покупками, в школы и клиники ездят в Авсаллар, Конаклы или центр.',
        'Автобусы по прибрежному шоссе в Аланью и Авсаллар. Для жизни круглый год удобнее своя машина.',
        'Новые небольшие комплексы у моря и в глубине посёлка, квартиры для отдыха и аренды, дуплексы. Новостройки здесь доступнее, чем в районах ближе к центру.',
      ]),
    },
    en: {
      lead: 'A small village between Avsallar and Payallar: new complexes by the sea and a relaxed atmosphere.',
      guide: sec(T.en, [
        'For those looking for a quiet seaside place without dense development: holidays, seasonal rentals, a calm retirement. If you want busy town life nearby, look at Konaklı or the centre.',
        'There is a beach and promenade by the village, with hotels along the shore. The sandy beaches of neighbouring Avsallar are a few minutes’ drive away.',
        'Small shops, cafés and pharmacies are on site; hotels work in season. For big shopping, schools and clinics people go to Avsallar, Konaklı or the centre.',
        'Buses run along the coastal road to Alanya and Avsallar. A car is more convenient for year-round living.',
        'Small new complexes by the sea and further inland, apartments for holidays and rentals, and duplexes. New builds here are more affordable than closer to the centre.',
      ]),
      pros: ['Quiet, little dense development', 'Affordable new builds', 'Avsallar’s beaches and hotels nearby'],
      cons: ['Limited infrastructure on site', 'Far from central Alanya'],
      infra: ['Beach and promenade', 'Small shops and cafés', 'Hotels', 'Buses to Alanya and Avsallar'],
    },
    tr: {
      lead: 'Avsallar ile Payallar arasında küçük bir belde: denize yakın yeni siteler ve sakin bir atmosfer.',
      guide: sec(T.tr, [
        'Yoğun yapılaşma olmayan sakin bir sahil yeri arayanlar için: tatil, sezonluk kiralama, huzurlu emeklilik. Yakında hareketli şehir hayatı isteyenler Konaklı’ya veya merkeze bakmalı.',
        'Beldenin yanında plaj ve sahil yolu, kıyı boyunca oteller var. Komşu Avsallar’ın kumsallarına arabayla birkaç dakika.',
        'Yerinde küçük marketler, kafeler ve eczaneler var; oteller sezonda çalışır. Büyük alışveriş, okul ve klinik için Avsallar’a, Konaklı’ya veya merkeze gidilir.',
        'Sahil yolu boyunca Alanya’ya ve Avsallar’a otobüs var. Yıl boyu yaşamak için araç daha rahattır.',
        'Denize yakın ve beldenin içinde küçük yeni siteler, tatil ve kiralama için daireler, dubleksler. Yeni konutlar merkeze yakın bölgelerden daha uygundur.',
      ]),
      pros: ['Sakin, yoğun yapılaşma az', 'Uygun fiyatlı yeni konutlar', 'Avsallar’ın plajları ve otelleri yakında'],
      cons: ['Yerinde altyapı sınırlı', 'Alanya merkezine uzak'],
      infra: ['Plaj ve sahil yolu', 'Küçük marketler ve kafeler', 'Oteller', 'Alanya ve Avsallar’a otobüsler'],
    },
  },
  payallar: {
    ru: {
      guide: sec(T.ru, [
        'Тем, кто хочет тишины и зелени у моря, но с городом в паре десятков минут: отдых, аренда, спокойная жизнь. Удобно тем, у кого есть машина.',
        'Пляжи вдоль посёлка, у берега — отели и рестораны. Летом оживлённо, но без толп центра.',
        'Минимаркеты и кафе на месте, большие супермаркеты, школы и клиники — в соседнем Конаклы. Зимой в Паяларе очень спокойно.',
        'Автобусы ходят в Конаклы и центр Аланьи по прибрежному шоссе. Аэропорт Антальи ближе, чем из восточных районов.',
        'Новые комплексы с бассейнами и охраной, квартиры 1+1–3+1 и дуплексы. Хороший выбор для тех, кто хочет новостройку у моря дешевле, чем ближе к центру.',
      ]),
    },
    en: {
      lead: 'A quiet seaside area between Türkler and Konaklı: beaches, hotels and new residential complexes.',
      guide: sec(T.en, [
        'For those who want peace and greenery by the sea with the town about twenty minutes away: holidays, rentals and a quiet life. Best if you have a car.',
        'Beaches stretch along the village, with hotels and restaurants by the shore. It is lively in summer but without the crowds of the centre.',
        'Mini-markets and cafés on site; large supermarkets, schools and clinics are in neighbouring Konaklı. Payallar is very quiet in winter.',
        'Buses run to Konaklı and central Alanya along the coastal road. Antalya airport is closer than from the eastern districts.',
        'New complexes with pools and security, 1+1 to 3+1 apartments and duplexes. A good choice for a new build by the sea at lower prices than closer to the centre.',
      ]),
      pros: ['Peace and greenery', 'New complexes with pools and security', 'Konaklı’s shops nearby'],
      cons: ['Shops and schools are mostly in neighbouring districts', 'Very quiet in winter'],
      infra: ['Beaches', 'Hotels and restaurants', 'Mini-markets', 'Buses to Konaklı and the centre'],
    },
    tr: {
      lead: 'Türkler ile Konaklı arasında sakin bir sahil bölgesi: plajlar, oteller ve yeni konut siteleri.',
      guide: sec(T.tr, [
        'Deniz kenarında huzur ve yeşillik isteyen, şehre yirmi dakika kadar uzakta olmayı sorun etmeyenler için: tatil, kiralama, sakin yaşam. Araç sahipleri için en uygunu.',
        'Belde boyunca plajlar, kıyıda oteller ve restoranlar var. Yazın hareketli ama merkezdeki kalabalık yok.',
        'Yerinde minimarketler ve kafeler var; büyük süpermarketler, okullar ve klinikler komşu Konaklı’da. Payallar kışın çok sakindir.',
        'Sahil yolu boyunca Konaklı’ya ve Alanya merkezine otobüs var. Antalya havalimanı doğu bölgelerine göre daha yakın.',
        'Havuzlu ve güvenlikli yeni siteler, 1+1–3+1 daireler ve dubleksler. Merkeze yakın bölgelerden daha uygun fiyata denize yakın yeni konut isteyenler için iyi seçenek.',
      ]),
      pros: ['Huzur ve yeşillik', 'Havuzlu ve güvenlikli yeni siteler', 'Konaklı’nın dükkânları yakında'],
      cons: ['Market ve okullar çoğunlukla komşu bölgelerde', 'Kışın çok sakin'],
      infra: ['Plajlar', 'Oteller ve restoranlar', 'Minimarketler', 'Konaklı ve merkeze otobüsler'],
    },
  },
  konakli: {
    ru: {
      guide: sec(T.ru, [
        'Тем, кто переезжает жить круглый год, в том числе с детьми: здесь всё работает и зимой. Подходит и для аренды — спрос есть и летом, и зимой.',
        'Длинная набережная и пляжи вдоль всего района. В сезон много туристов из отелей.',
        'Супермаркеты, рынок, школы и детские сады, клиники и аптеки, кафе. Большое сообщество иностранцев и турецких семей, которые живут здесь постоянно.',
        'Регулярные автобусы в центр Аланьи и западные посёлки, такси. Для жизни без машины Конаклы — один из самых удобных районов на западе.',
        'Жилые комплексы на любой бюджет: от небольших квартир на вторичном рынке до новых комплексов с бассейнами, есть виллы на склонах.',
      ]),
    },
    en: {
      lead: 'A large residential district west of the centre: many families and residents who live here all year round.',
      guide: sec(T.en, [
        'For people moving here to live all year, including families with children: everything works in winter too. Also good for rentals, with demand in both summer and winter.',
        'A long promenade and beaches run along the whole district. Many hotel tourists in season.',
        'Supermarkets, a market, schools and kindergartens, clinics and pharmacies, cafés. A large community of foreigners and Turkish families who live here permanently.',
        'Regular buses to central Alanya and the western villages, taxis. For life without a car, Konaklı is one of the most convenient western districts.',
        'Complexes for every budget: from small resale apartments to new complexes with pools, plus villas on the slopes.',
      ]),
      pros: ['Year-round life: shops, schools and cafés stay open in winter', 'Complexes for every budget', 'A long promenade and beaches'],
      cons: ['Some distance from the centre', 'Many tourists in season'],
      infra: ['Supermarkets and a market', 'Schools and kindergartens', 'Clinics and pharmacies', 'Promenade and beaches', 'Regular buses to the centre'],
    },
    tr: {
      lead: 'Merkezin batısında büyük bir yerleşim bölgesi: yıl boyu burada yaşayan çok sayıda aile ve sakin.',
      guide: sec(T.tr, [
        'Yıl boyu yaşamak için taşınanlar, çocuklu aileler dahil: burada her şey kışın da çalışır. Kiralama için de uygundur, talep hem yazın hem kışın var.',
        'Bölge boyunca uzun bir sahil yolu ve plajlar var. Sezonda otellerden çok turist gelir.',
        'Süpermarketler, pazar, okullar ve anaokulları, klinikler ve eczaneler, kafeler. Burada sürekli yaşayan büyük bir yabancı ve Türk aile topluluğu var.',
        'Alanya merkezine ve batıdaki beldelere düzenli otobüs, taksi. Araçsız yaşam için Konaklı batının en rahat bölgelerinden biridir.',
        'Her bütçeye uygun konut: ikinci eldeki küçük dairelerden havuzlu yeni sitelere, yamaçlarda villalar da var.',
      ]),
      pros: ['Yıl boyu yaşam: dükkânlar, okullar ve kafeler kışın da açık', 'Her bütçeye uygun siteler', 'Uzun sahil yolu ve plajlar'],
      cons: ['Merkeze biraz uzak', 'Sezonda çok turist'],
      infra: ['Süpermarketler ve pazar', 'Okullar ve anaokulları', 'Klinikler ve eczaneler', 'Sahil yolu ve plajlar', 'Merkeze düzenli otobüsler'],
    },
  },
  center: {
    ru: {
      guide: sec(T.ru, [
        'Тем, кто хочет всё в шаговой доступности и активную городскую жизнь, а также инвесторам: в центре самый стабильный спрос на аренду. Тем, кто ищет тишину, лучше выбрать соседние районы.',
        'Пляж Клеопатры к западу от полуострова с крепостью — один из самых известных в Турции, рядом пещера Дамлаташ. К востоку от порта — городской пляж Кейкубат.',
        'Госучреждения и банки, рынки и торговые улицы, больницы и частные клиники, рестораны, порт с Красной башней и крепость. Всё для жизни — пешком.',
        'Отсюда расходятся городские автобусы во все районы. Многие живут в центре без машины. До обоих аэропортов — Газипаши и Антальи — ходят трансферы и автобусы.',
        'Больше вторичного жилья, новостроек мало, участков под застройку почти нет. Цены за м² самые высокие в Аланье, особенно у пляжа Клеопатры.',
      ]),
    },
    en: {
      lead: 'The heart of Alanya: Cleopatra Beach, the castle, the harbour, the promenade and all of city life within walking distance.',
      guide: sec(T.en, [
        'For those who want everything within walking distance and an active city life, and for investors: the centre has the most stable rental demand. If you are looking for peace, neighbouring districts are a better fit.',
        'Cleopatra Beach, west of the castle peninsula, is one of the best-known beaches in Turkey, with Damlataş Cave next to it. East of the harbour is the town’s Keykubat beach.',
        'Government offices and banks, markets and shopping streets, hospitals and private clinics, restaurants, the harbour with the Red Tower and the castle. Everything is on foot.',
        'City buses to every district start here. Many people live in the centre without a car. Transfers and buses run to both airports, Gazipaşa and Antalya.',
        'Mostly resale homes; there are few new builds and almost no land left. Prices per m² are the highest in Alanya, especially near Cleopatra Beach.',
      ]),
      pros: ['Everything within walking distance: beach, market, restaurants, offices', 'The most stable rental demand', 'Cleopatra Beach, one of the best-known in Turkey'],
      cons: ['The highest prices per m²', 'Noisy in the tourist season', 'Few new builds, mostly resale'],
      infra: ['Cleopatra Beach and the east beach', 'Castle and harbour', 'Government offices and banks', 'Markets and shopping streets', 'Hospitals and private clinics'],
    },
    tr: {
      lead: 'Alanya’nın kalbi: Kleopatra plajı, kale, liman, sahil yolu ve tüm şehir hayatı yürüme mesafesinde.',
      guide: sec(T.tr, [
        'Her şeyin yürüme mesafesinde olmasını ve hareketli şehir hayatını isteyenler ile yatırımcılar için: kirada en istikrarlı talep merkezdedir. Sessizlik arayanlar komşu bölgeleri seçmeli.',
        'Kale yarımadasının batısındaki Kleopatra plajı Türkiye’nin en bilinen plajlarından biridir, yanında Damlataş mağarası var. Limanın doğusunda şehrin Keykubat plajı.',
        'Resmî daireler ve bankalar, pazarlar ve alışveriş caddeleri, hastaneler ve özel klinikler, restoranlar, Kızıl Kule’li liman ve kale. Her şey yürüyerek.',
        'Tüm bölgelere giden şehir otobüsleri buradan kalkar. Birçok kişi merkezde araçsız yaşar. Gazipaşa ve Antalya havalimanlarına transfer ve otobüs var.',
        'Çoğunlukla ikinci el konut; yeni proje az, boş arsa neredeyse yok. m² fiyatları Alanya’nın en yükseği, özellikle Kleopatra plajı yakınında.',
      ]),
      pros: ['Her şey yürüme mesafesinde: plaj, pazar, restoranlar, resmî daireler', 'Kirada en istikrarlı talep', 'Türkiye’nin en bilinen plajlarından Kleopatra'],
      cons: ['En yüksek m² fiyatları', 'Turizm sezonunda gürültülü', 'Yeni proje az, çoğunlukla ikinci el'],
      infra: ['Kleopatra ve doğu plajı', 'Kale ve liman', 'Resmî daireler ve bankalar', 'Pazarlar ve alışveriş caddeleri', 'Hastaneler ve özel klinikler'],
    },
  },
  tepe: {
    ru: {
      guide: sec(T.ru, [
        'Тем, кто ценит виды, простор и тишину и готов ездить к морю на машине: семьи, которые хотят дом или виллу, и покупатели премиум-сегмента.',
        'Район на склонах над центром: с участков открываются панорамы на море, город и крепость. Летом здесь прохладнее, чем внизу. До пляжей — несколько километров по серпантину.',
        'На месте — небольшие магазины и кафе с видовыми террасами. За покупками, в школы и клиники ездят в центр или Оба.',
        'Без машины жить неудобно: общественный транспорт ходит реже, дорога в центр на машине занимает 10–15 минут.',
        'Виллы с участками и бассейнами, малоэтажные комплексы и дуплексы с видом. Цены за м² у вилл выше средних, квартиры — ближе к среднему по городу.',
      ]),
    },
    en: {
      lead: 'A hillside district above the centre: villas and houses with panoramic views of the town and the sea. It is quiet here and cooler in summer.',
      guide: sec(T.en, [
        'For those who value views, space and quiet and are happy to drive to the sea: families who want a house or a villa, and premium buyers.',
        'The district lies on the slopes above the centre, with panoramic views of the sea, the town and the castle. It is cooler than down below in summer. The beaches are a few kilometres away along winding roads.',
        'Small shops and cafés with view terraces on site. For shopping, schools and clinics people go to the centre or Oba.',
        'Life without a car is inconvenient: public transport is less frequent, and the drive to the centre takes 10–15 minutes.',
        'Villas with gardens and pools, low-rise complexes and duplexes with views. Villas cost more per m² than average; apartments are closer to the town average.',
      ]),
      pros: ['Panoramic views of the sea and the castle', 'Cooler than down below in summer', 'Spacious plots and villas'],
      cons: ['Beaches are a few kilometres away along winding roads', 'Inconvenient without a car'],
      infra: ['Small shops', 'Cafés with view terraces', '10–15 minutes by car to the centre'],
    },
    tr: {
      lead: 'Merkezin üstündeki yamaçlarda bir bölge: şehre ve denize panoramik manzaralı villalar ve evler. Sessiz ve yazın daha serin.',
      guide: sec(T.tr, [
        'Manzaraya, genişliğe ve sessizliğe önem veren, denize arabayla gitmeyi sorun etmeyenler için: ev veya villa isteyen aileler ve lüks segment alıcıları.',
        'Bölge merkezin üstündeki yamaçlardadır; denize, şehre ve kaleye panoramik manzara açılır. Yazın aşağıdan daha serindir. Plajlara virajlı yoldan birkaç kilometre.',
        'Yerinde küçük marketler ve manzaralı terasa sahip kafeler var. Alışveriş, okul ve klinik için merkeze veya Oba’ya gidilir.',
        'Araçsız yaşamak zordur: toplu taşıma seyrek, merkeze arabayla 10–15 dakika.',
        'Bahçeli ve havuzlu villalar, az katlı siteler ve manzaralı dubleksler. Villaların m² fiyatı ortalamanın üstünde, daireler şehir ortalamasına yakın.',
      ]),
      pros: ['Denize ve kaleye panoramik manzara', 'Yazın aşağıdan daha serin', 'Geniş arsalar ve villalar'],
      cons: ['Plajlara virajlı yoldan birkaç kilometre', 'Araçsız yaşamak zor'],
      infra: ['Küçük marketler', 'Manzaralı kafeler', 'Merkeze arabayla 10–15 dakika'],
    },
  },
  cikcilli: {
    ru: {
      guide: sec(T.ru, [
        'Семьям и тем, кто живёт в Аланье круглый год и хочет современный комплекс дешевле, чем у моря. Хороший вариант для жизни, для сезонной аренды — слабее прибрежных районов.',
        'Выхода к морю у района нет: южная граница проходит по шоссе D400, за ним — Оба и пляжи. От южной части до моря около 700 м, от северной, у склонов, — 2–2,5 км. Из домов на склонах видно море.',
        'Школы и детские сады, торговые центры и супермаркеты, рынок, клиники, спортивные площадки. Много местных жителей, жизнь не замирает зимой.',
        'Городские автобусы в центр и Оба. В часы пик на главных улицах много машин.',
        'Много новых комплексов с бассейнами, фитнесом и охраной, квартиры от 1+1 до просторных 3+1 и дуплексы. Цены ниже, чем у моря в Оба и центре.',
      ]),
    },
    en: {
      lead: 'A residential district behind Oba, north of the D400 highway: schools, markets, a shopping mall and many local residents. 700 m to 2.5 km to the sea.',
      guide: sec(T.en, [
        'For families and people living in Alanya all year who want a modern complex for less than by the sea. A good place to live; for seasonal rentals it is weaker than the coastal districts.',
        'The district has no seafront: its southern border runs along the D400 highway, with Oba and the beaches beyond it. The southern part is about 700 m from the sea, the northern part by the slopes 2–2.5 km. Homes on the slopes have sea views.',
        'Schools and kindergartens, shopping centres and supermarkets, a market, clinics and sports grounds. Many local residents, so life goes on in winter.',
        'City buses to the centre and Oba. The main streets get busy at rush hour.',
        'Many new complexes with pools, gyms and security, from 1+1 apartments to spacious 3+1 and duplexes. Prices are lower than by the sea in Oba and the centre.',
      ]),
      pros: ['Everything for daily life: schools, shops, clinics', 'Lower prices than by the sea', 'Many new complexes with pools'],
      cons: ['No seafront: 700 m to 2.5 km to the beach', 'Heavy traffic at rush hour'],
      infra: ['Schools and kindergartens', 'Shopping centres and supermarkets', 'Market', 'Clinics', 'Sports grounds'],
    },
    tr: {
      lead: 'Oba’nın arkasında, D400 karayolunun kuzeyinde bir yerleşim bölgesi: okullar, pazarlar, alışveriş merkezi ve çok sayıda yerli sakin. Denize 700 m ile 2,5 km arası.',
      guide: sec(T.tr, [
        'Aileler ve Alanya’da yıl boyu yaşayıp denize yakın bölgelerden daha uygun fiyata modern bir site isteyenler için. Yaşamak için iyi; sezonluk kiralamada kıyı bölgelerinden zayıf.',
        'Bölgenin denize kıyısı yok: güney sınırı D400 karayolu boyunca, ötesinde Oba ve plajlar var. Güney kısmı denize yaklaşık 700 m, kuzeyde yamaçlara yakın kısmı 2–2,5 km. Yamaçlardaki evlerden deniz görünür.',
        'Okullar ve anaokulları, alışveriş merkezleri ve süpermarketler, pazar, klinikler, spor alanları. Yerli sakin çok, kışın da hayat devam eder.',
        'Merkeze ve Oba’ya şehir otobüsleri. Ana caddelerde iş çıkış saatlerinde trafik yoğun.',
        'Havuzlu, spor salonlu ve güvenlikli çok sayıda yeni site; 1+1’den geniş 3+1’e kadar daireler ve dubleksler. Fiyatlar Oba ve merkezde denize yakın konutlardan düşük.',
      ]),
      pros: ['Günlük yaşam için her şey: okullar, marketler, klinikler', 'Denize yakın bölgelerden düşük fiyatlar', 'Havuzlu çok sayıda yeni site'],
      cons: ['Denize kıyısı yok: plaja 700 m ile 2,5 km arası', 'İş çıkış saatlerinde trafik'],
      infra: ['Okullar ve anaokulları', 'Alışveriş merkezleri ve süpermarketler', 'Pazar', 'Klinikler', 'Spor alanları'],
    },
  },
  oba: {
    ru: {
      guide: sec(T.ru, [
        'Тем, кто живёт в Аланье круглый год и хочет всё рядом, но не в шуме центра: семьи с детьми, пенсионеры, удалённые работники. Хорош и для аренды.',
        'Пляж и набережная у моря; часть района уходит вглубь, к склонам. До пляжей центра — пара километров.',
        'Торговый центр, государственная и частные клиники, школы, парки и спортивные площадки, рынок. Один из самых удобных районов для повседневной жизни.',
        'Частые городские автобусы в центр и соседние районы, такси. До центра — несколько минут на машине или долгая прогулка по набережной.',
        'Много современных комплексов с бассейнами и охраной, от 1+1 до больших квартир для семьи. Цены выше среднего по Аланье: за удобство расположения.',
      ]),
    },
    en: {
      lead: 'A modern district for everyday life next to the centre: a shopping mall, clinics, schools and parks.',
      guide: sec(T.en, [
        'For people living in Alanya all year who want everything nearby but not the noise of the centre: families with children, retirees, remote workers. Also good for rentals.',
        'A beach and promenade along the sea; part of the district stretches inland towards the slopes. The beaches of the centre are a couple of kilometres away.',
        'A shopping mall, state and private clinics, schools, parks and sports grounds, a market. One of the most convenient districts for everyday life.',
        'Frequent city buses to the centre and neighbouring districts, taxis. The centre is a few minutes by car or a long walk along the promenade.',
        'Many modern complexes with pools and security, from 1+1 to large family apartments. Prices are above the Alanya average, for the convenient location.',
      ]),
      pros: ['Everything for life nearby: schools, clinics, shops', 'Close to the centre', 'Popular with people who live in Alanya all year'],
      cons: ['Prices above average', 'Dense development along the main streets'],
      infra: ['Shopping mall', 'State and private clinics', 'Schools', 'Parks and sports grounds', 'Beach and promenade'],
    },
    tr: {
      lead: 'Merkezin yanında, günlük yaşam için modern bir bölge: alışveriş merkezi, klinikler, okullar ve parklar.',
      guide: sec(T.tr, [
        'Alanya’da yıl boyu yaşayan, her şeyin yakında olmasını isteyen ama merkezin gürültüsünü istemeyenler için: çocuklu aileler, emekliler, uzaktan çalışanlar. Kiralama için de iyi.',
        'Deniz kenarında plaj ve sahil yolu; bölgenin bir kısmı yamaçlara doğru içeri uzanır. Merkezin plajları birkaç kilometre.',
        'Alışveriş merkezi, devlet ve özel klinikler, okullar, parklar ve spor alanları, pazar. Günlük yaşam için en rahat bölgelerden biri.',
        'Merkeze ve komşu bölgelere sık şehir otobüsleri, taksi. Merkeze arabayla birkaç dakika ya da sahil yolunda uzun bir yürüyüş.',
        'Havuzlu ve güvenlikli çok sayıda modern site, 1+1’den büyük aile dairelerine kadar. Fiyatlar Alanya ortalamasının üstünde: konumun rahatlığı için.',
      ]),
      pros: ['Yaşam için her şey yakında: okullar, klinikler, marketler', 'Merkeze yakın', 'Alanya’da yıl boyu yaşayanların gözdesi'],
      cons: ['Fiyatlar ortalamanın üstünde', 'Ana caddeler boyunca yoğun yapılaşma'],
      infra: ['Alışveriş merkezi', 'Devlet ve özel klinikler', 'Okullar', 'Parklar ve spor alanları', 'Plaj ve sahil yolu'],
    },
  },
  tosmur: {
    ru: {
      guide: sec(T.ru, [
        'Тем, кто хочет жить рядом с Оба и морем, но потише: семьи, пенсионеры, любители зелени и прогулок у реки.',
        'Набережная и пляж у моря, рядом устье реки Димчай. Вдоль реки — рестораны и зелёные места для отдыха.',
        'Супермаркеты, кафе и рестораны у реки; школы, клиники и торговый центр — в соседнем Оба, в нескольких минутах.',
        'Городские автобусы в центр, Оба и Кестель. Центр — недалеко на машине.',
        'Новостроек меньше, чем в соседних районах, больше готовых комплексов. Часть домов стоит далеко от моря — расстояние стоит уточнять у каждого объекта.',
      ]),
    },
    en: {
      lead: 'A green district by the Dim River, next to Oba and the sea.',
      guide: sec(T.en, [
        'For those who want to live near Oba and the sea but somewhere quieter: families, retirees, people who like greenery and walks by the river.',
        'A promenade and beach by the sea, with the mouth of the Dim River nearby. Restaurants and green spots line the river.',
        'Supermarkets, cafés and riverside restaurants; schools, clinics and the shopping mall are in neighbouring Oba, a few minutes away.',
        'City buses to the centre, Oba and Kestel. The centre is a short drive away.',
        'Fewer new builds than in neighbouring districts, more finished complexes. Some buildings are far from the sea, so check the distance for each property.',
      ]),
      pros: ['The Dim River and greenery nearby', 'Quieter than Oba, but everything is close', 'Good value for the location'],
      cons: ['Fewer new builds than in neighbouring districts', 'Some buildings are far from the sea'],
      infra: ['Promenade and beach', 'Restaurants by the Dim River', 'Supermarkets', 'Schools in neighbouring Oba'],
    },
    tr: {
      lead: 'Dimçay kıyısında, Oba’ya ve denize yakın yeşil bir bölge.',
      guide: sec(T.tr, [
        'Oba’ya ve denize yakın ama daha sakin bir yerde yaşamak isteyenler için: aileler, emekliler, yeşilliği ve nehir kenarında yürüyüşü sevenler.',
        'Deniz kenarında sahil yolu ve plaj, yakında Dimçay’ın denize döküldüğü yer. Nehir boyunca restoranlar ve yeşil dinlenme alanları.',
        'Süpermarketler, kafeler ve nehir kenarında restoranlar; okullar, klinikler ve alışveriş merkezi birkaç dakika uzaklıktaki Oba’da.',
        'Merkeze, Oba’ya ve Kestel’e şehir otobüsleri. Merkez arabayla yakın.',
        'Komşu bölgelere göre yeni proje az, hazır site daha çok. Bazı binalar denize uzak, her ilanda mesafeyi sorun.',
      ]),
      pros: ['Dimçay ve yeşillik yakında', 'Oba’dan sakin ama her şey yakın', 'Konuma göre iyi fiyat'],
      cons: ['Komşu bölgelerden daha az yeni proje', 'Bazı binalar denize uzak'],
      infra: ['Sahil yolu ve plaj', 'Dimçay kıyısında restoranlar', 'Süpermarketler', 'Komşu Oba’da okullar'],
    },
  },
  kestel: {
    ru: {
      guide: sec(T.ru, [
        'Тем, кто хочет новый комплекс у моря и удобную дорогу в центр: отдых, аренда, жизнь круглый год без суеты Махмутлара.',
        'Пляж и набережная для прогулок вдоль моря. Прибрежное шоссе отделяет часть района от пляжа — у объектов «через дорогу» к морю идут по переходу.',
        'Супермаркеты, кафе и рестораны. Магазинов меньше, чем в соседнем Махмутларе, но он рядом.',
        'Автобусы в центр и Махмутлар по шоссе, до центра — несколько минут на машине.',
        'Много новостроек у моря и на склонах: квартиры 1+1–2+1 для отдыха и аренды, пентхаусы с видом. Цены — около среднего по Аланье.',
      ]),
    },
    en: {
      lead: 'New complexes by the sea, a well-developed promenade and an easy drive to the centre.',
      guide: sec(T.en, [
        'For those who want a new complex by the sea and an easy drive to the centre: holidays, rentals and year-round life without the bustle of Mahmutlar.',
        'A beach and promenade for walks along the sea. The coastal road separates part of the district from the beach; from properties “across the road” you reach the sea via a crossing.',
        'Supermarkets, cafés and restaurants. Fewer shops than in neighbouring Mahmutlar, but it is close by.',
        'Buses run along the highway to the centre and Mahmutlar; the centre is a few minutes by car.',
        'Many new builds by the sea and on the slopes: 1+1 to 2+1 apartments for holidays and rentals, penthouses with views. Prices are around the Alanya average.',
      ]),
      pros: ['Many new builds by the sea', 'A promenade for walks', 'An easy drive to the centre'],
      cons: ['The coastal road separates part of the district from the beach', 'Fewer shops than in Mahmutlar'],
      infra: ['Beach and promenade', 'Supermarkets', 'Cafés and restaurants', 'Buses to the centre and Mahmutlar'],
    },
    tr: {
      lead: 'Denize yakın yeni siteler, gelişmiş sahil yolu ve merkeze kolay ulaşım.',
      guide: sec(T.tr, [
        'Denize yakın yeni bir site ve merkeze kolay ulaşım isteyenler için: tatil, kiralama ve Mahmutlar’ın kalabalığı olmadan yıl boyu yaşam.',
        'Deniz boyunca yürüyüş için plaj ve sahil yolu. Sahil karayolu bölgenin bir kısmını plajdan ayırır; “yolun karşısındaki” konutlardan denize alt veya üst geçitle gidilir.',
        'Süpermarketler, kafeler ve restoranlar. Komşu Mahmutlar’dan daha az dükkân var ama Mahmutlar yakında.',
        'Karayolu boyunca merkeze ve Mahmutlar’a otobüs; merkeze arabayla birkaç dakika.',
        'Denize yakın ve yamaçlarda çok sayıda yeni proje: tatil ve kiralama için 1+1–2+1 daireler, manzaralı çatı dubleksleri. Fiyatlar Alanya ortalaması civarında.',
      ]),
      pros: ['Denize yakın çok sayıda yeni proje', 'Yürüyüş için sahil yolu', 'Merkeze kolay ulaşım'],
      cons: ['Sahil karayolu bölgenin bir kısmını plajdan ayırır', 'Mahmutlar’dan daha az dükkân'],
      infra: ['Plaj ve sahil yolu', 'Süpermarketler', 'Kafeler ve restoranlar', 'Merkeze ve Mahmutlar’a otobüsler'],
    },
  },
  mahmutlar: {
    ru: {
      guide: sec(T.ru, [
        'Тем, кто переезжает впервые и хочет, чтобы всё было рядом и на понятном языке: здесь самое большое сообщество иностранцев, много русскоговорящих соседей и сервисов. Подходит и для жизни круглый год, и для аренды.',
        'Длинная набережная вдоль всего района и пляжи — от песка до мелкой гальки. Вечером набережная — главное место для прогулок.',
        'Рынки и супермаркеты, клиники и аптеки, школы и детские сады, кафе, банки, салоны. Многие сервисы работают на русском языке.',
        'Регулярные автобусы в центр Аланьи, такси. До аэропорта Газипаши ближе, чем из центра. Жить без машины удобно.',
        'Квартиры на любой бюджет: от небольших 1+1 на вторичном рынке до новых комплексов с бассейнами и спа. Плотная застройка, много похожих комплексов — важно сравнивать расположение и состояние дома.',
      ]),
    },
    en: {
      lead: 'The largest area for international buyers: everything is close by, with many Russian-speaking neighbours.',
      guide: sec(T.en, [
        'For first-time movers who want everything nearby and services in a familiar language: the largest community of foreigners, with many Russian-speaking neighbours and services. Good both for year-round life and for rentals.',
        'A long promenade along the whole district, and beaches from sand to fine pebbles. In the evening the promenade is the main place for walks.',
        'Markets and supermarkets, clinics and pharmacies, schools and kindergartens, cafés, banks and salons. Many services are available in Russian and English.',
        'Regular buses to central Alanya, taxis. Gazipaşa airport is closer than from the centre. Living without a car is easy.',
        'Apartments for every budget, from small resale 1+1 to new complexes with pools and spas. Development is dense and many complexes look alike, so compare the location and condition of each building.',
      ]),
      pros: ['Everything for life: shops, markets, clinics, cafés', 'A large international community', 'A long promenade and apartments for every budget'],
      cons: ['Dense development, many similar complexes', 'Some distance from the centre'],
      infra: ['Promenade and beaches', 'Markets and supermarkets', 'Clinics and pharmacies', 'Schools and kindergartens', 'Regular buses to the centre'],
    },
    tr: {
      lead: 'Yabancılar için en büyük bölge: her şey yakında, çok sayıda Rusça konuşan komşu.',
      guide: sec(T.tr, [
        'İlk kez taşınan, her şeyin yakında ve anlaşılır dilde olmasını isteyenler için: en büyük yabancı topluluğu burada, Rusça konuşan çok sayıda komşu ve hizmet var. Hem yıl boyu yaşam hem kiralama için uygun.',
        'Bölge boyunca uzun bir sahil yolu, kumdan ince çakıla plajlar. Akşamları sahil yolu yürüyüşün merkezidir.',
        'Pazarlar ve süpermarketler, klinikler ve eczaneler, okullar ve anaokulları, kafeler, bankalar, kuaförler. Birçok hizmet Rusça ve İngilizce verilir.',
        'Alanya merkezine düzenli otobüs, taksi. Gazipaşa havalimanı merkeze göre daha yakın. Araçsız yaşamak kolay.',
        'Her bütçeye daire: ikinci elde küçük 1+1’lerden havuzlu ve spalı yeni sitelere. Yapılaşma yoğun ve birçok site birbirine benziyor; konumu ve binanın durumunu karşılaştırmak önemli.',
      ]),
      pros: ['Yaşam için her şey: dükkânlar, pazarlar, klinikler, kafeler', 'Büyük yabancı topluluğu', 'Uzun sahil yolu ve her bütçeye daire'],
      cons: ['Yoğun yapılaşma, birbirine benzeyen siteler', 'Merkeze biraz uzak'],
      infra: ['Sahil yolu ve plajlar', 'Pazarlar ve süpermarketler', 'Klinikler ve eczaneler', 'Okullar ve anaokulları', 'Merkeze düzenli otobüsler'],
    },
  },
  kargicak: {
    ru: {
      guide: sec(T.ru, [
        'Тем, кто хочет вид на море, тишину и зелень и ездит на машине: покупатели вилл и пентхаусов, семьи, которым важен простор.',
        'Район на склонах над морем: вид на море открывается с большинства участков. Пляжи — внизу, вдоль шоссе, там же рестораны у моря.',
        'На месте — небольшие магазины. Школы, рынки и клиники — в соседнем Махмутларе, в нескольких минутах на машине.',
        'Крутые склоны: без машины неудобно. По шоссе внизу ходят автобусы в Махмутлар и центр.',
        'Виллы и пентхаусы премиум-класса, современные комплексы с бассейнами и видами. Цены у вилл заметно выше, чем у квартир в соседних районах.',
      ]),
    },
    en: {
      lead: 'Villas and complexes on the slopes with sea views: quiet and green.',
      guide: sec(T.en, [
        'For those who want sea views, quiet and greenery and drive a car: buyers of villas and penthouses, families who value space.',
        'The district lies on the slopes above the sea, and most plots have sea views. The beaches are below along the highway, with seaside restaurants.',
        'Small shops on site. Schools, markets and clinics are in neighbouring Mahmutlar, a few minutes away by car.',
        'Steep slopes make life without a car inconvenient. Buses to Mahmutlar and the centre run along the highway below.',
        'Premium villas and penthouses, modern complexes with pools and views. Villas cost noticeably more than apartments in neighbouring districts.',
      ]),
      pros: ['Sea views from most plots', 'Quiet and green', 'Premium villas and penthouses'],
      cons: ['Steep slopes: inconvenient without a car', 'Shops and schools are in neighbouring Mahmutlar'],
      infra: ['Beaches along the highway', 'Small shops', 'Seaside restaurants', 'Mahmutlar nearby'],
    },
    tr: {
      lead: 'Deniz manzaralı yamaçlarda villalar ve siteler: sakin ve yeşil.',
      guide: sec(T.tr, [
        'Deniz manzarası, sessizlik ve yeşillik isteyen, arabası olanlar için: villa ve çatı dubleksi alıcıları, genişliğe önem veren aileler.',
        'Bölge denizin üstündeki yamaçlardadır; çoğu arsadan deniz görünür. Plajlar aşağıda, karayolu boyunca; deniz kenarında restoranlar da orada.',
        'Yerinde küçük marketler var. Okullar, pazarlar ve klinikler komşu Mahmutlar’da, arabayla birkaç dakika.',
        'Dik yamaçlar: araçsız zor. Aşağıdaki karayolundan Mahmutlar’a ve merkeze otobüs geçer.',
        'Lüks villalar ve çatı dubleksleri, havuzlu ve manzaralı modern siteler. Villaların fiyatı komşu bölgelerdeki dairelerden belirgin şekilde yüksek.',
      ]),
      pros: ['Çoğu arsadan deniz manzarası', 'Sakin ve yeşil', 'Lüks villalar ve çatı dubleksleri'],
      cons: ['Dik yamaçlar: araçsız zor', 'Market ve okullar komşu Mahmutlar’da'],
      infra: ['Karayolu boyunca plajlar', 'Küçük marketler', 'Deniz kenarında restoranlar', 'Mahmutlar yakında'],
    },
  },
  demirtas: {
    ru: {
      guide: sec(T.ru, [
        'Тем, кто хочет тишину, море и горы за меньшие деньги: отдых, жизнь на пенсии, покупка на этапе строительства. Тем, кому нужна городская жизнь рядом, будет скучно.',
        'Пляжи вдоль посёлка, туристов мало. За спиной — горы и банановые плантации.',
        'Магазины, кафе, сельский рынок. Зимой инфраструктуры мало: за крупными покупками и к врачам ездят в Махмутлар или центр.',
        'Автобусы в Аланью и Газипашу. Аэропорт Газипаши ближе, чем из центра Аланьи. Своя машина сильно упрощает жизнь.',
        'Новые комплексы с бассейнами и виды на море и горы; растёт число проектов от застройщиков. Цены ниже среднего по Аланье.',
      ]),
    },
    en: {
      lead: 'A quiet village in the east with beaches and mountain views; prices are lower than closer to the centre.',
      guide: sec(T.en, [
        'For those who want quiet, the sea and the mountains for less money: holidays, retirement, buying off-plan. Those who need town life nearby may find it too quiet.',
        'Beaches along the village and few tourists. Behind it are mountains and banana plantations.',
        'Shops, cafés and a village market. There is little infrastructure in winter: people go to Mahmutlar or the centre for big shopping and doctors.',
        'Buses to Alanya and Gazipaşa. Gazipaşa airport is closer than from central Alanya. A car makes life much easier.',
        'New complexes with pools and views of the sea and the mountains; more and more developer projects. Prices are below the Alanya average.',
      ]),
      pros: ['Prices below the Alanya average', 'Beaches with few tourists', 'Closer to Gazipaşa airport'],
      cons: ['Far from central Alanya', 'Little infrastructure in winter'],
      infra: ['Beaches', 'Shops and cafés', 'Village market', 'Buses to Alanya and Gazipaşa'],
    },
    tr: {
      lead: 'Doğuda, plajları ve dağ manzarası olan sakin bir belde; fiyatlar merkeze yakın bölgelerden düşük.',
      guide: sec(T.tr, [
        'Daha uygun fiyata sessizlik, deniz ve dağ isteyenler için: tatil, emeklilik, inşaat aşamasında alım. Yakında şehir hayatı arayanlar burayı fazla sakin bulabilir.',
        'Belde boyunca plajlar, turist az. Arkada dağlar ve muz bahçeleri.',
        'Dükkânlar, kafeler, köy pazarı. Kışın altyapı az: büyük alışveriş ve doktor için Mahmutlar’a veya merkeze gidilir.',
        'Alanya’ya ve Gazipaşa’ya otobüs. Gazipaşa havalimanı Alanya merkezine göre daha yakın. Araç hayatı çok kolaylaştırır.',
        'Havuzlu, deniz ve dağ manzaralı yeni siteler; müteahhit projeleri artıyor. Fiyatlar Alanya ortalamasının altında.',
      ]),
      pros: ['Alanya ortalamasının altında fiyatlar', 'Turistin az olduğu plajlar', 'Gazipaşa havalimanına daha yakın'],
      cons: ['Alanya merkezine uzak', 'Kışın altyapı az'],
      infra: ['Plajlar', 'Dükkânlar ve kafeler', 'Köy pazarı', 'Alanya ve Gazipaşa’ya otobüsler'],
    },
  },
  gazipasa: {
    ru: {
      guide: sec(T.ru, [
        'Тем, кто хочет спокойную жизнь небольшого турецкого города у моря и самые доступные цены на побережье, а также тем, кто часто летает: аэропорт рядом.',
        'Пляжи вдоль города и марина. Рядом — руины античного города Селинус и банановые плантации, туристов заметно меньше, чем в Аланье.',
        'Городской рынок и магазины, государственная больница, школы, кафе. Это отдельный город со своей жизнью, но выбор сервисов на иностранных языках меньше, чем в Аланье.',
        'Аэропорт Газипаша-Аланья — в нескольких минутах. До Аланьи — больше 40 км по прибрежному шоссе, ходят автобусы.',
        'Готового жилья на продажу меньше, растёт число новых комплексов. Цены за м² — самые низкие на побережье, но и ликвидность при перепродаже ниже.',
      ]),
    },
    en: {
      lead: 'A separate town next to Gazipaşa airport (GZP): a new marina, a relaxed life and the most affordable prices on the coast.',
      guide: sec(T.en, [
        'For those who want the calm life of a small Turkish seaside town and the most affordable prices on the coast, and for frequent flyers: the airport is next door.',
        'Beaches along the town and a marina. Nearby are the ruins of the ancient city of Selinus and banana plantations; there are far fewer tourists than in Alanya.',
        'A town market and shops, a state hospital, schools and cafés. It is a separate town with its own life, but fewer services in foreign languages than in Alanya.',
        'Gazipaşa-Alanya airport is a few minutes away. Alanya is over 40 km away along the coastal road, with buses.',
        'Less resale housing; the number of new complexes is growing. Prices per m² are the lowest on the coast, but resale liquidity is lower too.',
      ]),
      pros: ['Gazipaşa-Alanya airport nearby', 'The most affordable prices on the coast', 'The calm life of a small town'],
      cons: ['Far from Alanya', 'Less choice of finished homes'],
      infra: ['Gazipaşa-Alanya airport', 'Marina', 'Town market and shops', 'State hospital', 'Beaches'],
    },
    tr: {
      lead: 'Gazipaşa havalimanının (GZP) yanında ayrı bir ilçe: yeni marina, sakin yaşam ve kıyının en uygun fiyatları.',
      guide: sec(T.tr, [
        'Deniz kenarında küçük bir Türk ilçesinin sakin hayatını ve kıyının en uygun fiyatlarını isteyenler ile sık uçanlar için: havalimanı hemen yanında.',
        'İlçe boyunca plajlar ve marina. Yakında antik Selinus kentinin kalıntıları ve muz bahçeleri; turist Alanya’dan çok daha az.',
        'İlçe pazarı ve dükkânlar, devlet hastanesi, okullar, kafeler. Kendi hayatı olan ayrı bir ilçe, ancak yabancı dilde hizmet Alanya’dan az.',
        'Gazipaşa-Alanya havalimanı birkaç dakika uzaklıkta. Alanya’ya sahil yolundan 40 km’den fazla, otobüs var.',
        'Satılık hazır konut az, yeni sitelerin sayısı artıyor. m² fiyatları kıyının en düşüğü, ancak yeniden satışta likidite de düşük.',
      ]),
      pros: ['Gazipaşa-Alanya havalimanı yakında', 'Kıyının en uygun fiyatları', 'Küçük ilçenin sakin hayatı'],
      cons: ['Alanya’ya uzak', 'Hazır konut seçeneği az'],
      infra: ['Gazipaşa-Alanya havalimanı', 'Marina', 'İlçe pazarı ve dükkânlar', 'Devlet hastanesi', 'Plajlar'],
    },
  },
}

// район в горах — «Море и природа» вместо «Море и пляжи» (Джикджилли — не у моря, но не в горах: владелец 21.10.2026)
for (const slug of ['tepe']) {
  const g = DISTRICT_GUIDES[slug]
  g.ru.guide[1][0] = T.ruIn[1]
  g.en.guide[1][0] = T.enIn[1]
  g.tr.guide[1][0] = T.trIn[1]
}

type Doc = { id: number; slug: string; lead?: string | null; guide?: unknown[] | null; pros?: unknown[] | null; cons?: unknown[] | null; infra?: unknown[] | null }
const empty = (v: unknown) => v == null || v === '' || (Array.isArray(v) && v.length === 0)
const items = (list?: string[]) => list?.map((text) => ({ text }))

/**
 * Записать гиды в районы. Заполняет только пустые поля каждого языка — правки в админке не трогает.
 * Вызывается из миграции 20261021_111150_district_guide (рабочая база получит тексты при деплое) и из npm run seed.
 */
export async function applyDistrictGuides(payload: Payload, req?: Partial<PayloadRequest>) {
  let updated = 0
  for (const locale of ['ru', 'en', 'tr'] as const) {
    const { docs } = (await payload.find({
      collection: 'districts', locale, fallbackLocale: false, limit: 100, depth: 0, pagination: false, overrideAccess: true, req,
      select: { slug: true, lead: true, guide: true, pros: true, cons: true, infra: true },
    })) as unknown as { docs: Doc[] }
    for (const d of docs) {
      const src = DISTRICT_GUIDES[d.slug]?.[locale]
      if (!src) continue
      const data: Record<string, unknown> = {}
      if (empty(d.guide)) data.guide = src.guide.map(([title, text]) => ({ title, text }))
      if (src.lead && empty(d.lead)) data.lead = src.lead
      if (src.pros && empty(d.pros)) data.pros = items(src.pros)
      if (src.cons && empty(d.cons)) data.cons = items(src.cons)
      if (src.infra && empty(d.infra)) data.infra = items(src.infra)
      if (!Object.keys(data).length) continue
      try {
        await payload.update({ collection: 'districts', id: d.id, locale, data: data as never, overrideAccess: true, req })
        updated++
      } catch (err) {
        payload.logger.warn({ err, msg: `Гид района ${d.slug} (${locale}) не записан` })
      }
    }
  }
  return updated
}

// Джикджилли не в горах (владелец 21.10.2026): старые тексты «на склоне, до моря 1,5–2,5 км» → новые.
// Заменяем только точное совпадение со старым текстом — правки в админке не трогаем.
const OLD_GUIDE_SEA: Record<Loc, [string, string]> = {
  ru: ['Море и природа', 'Район на склоне за Оба, до моря 1,5–2,5 км: пешком далеко, на машине или автобусе — несколько минут. Из верхних частей района открываются виды на море.'],
  en: ['Sea and nature', 'The district lies on the slope behind Oba, 1.5–2.5 km from the sea: too far to walk, a few minutes by car or bus. The upper parts have sea views.'],
  tr: ['Deniz ve doğa', 'Bölge Oba’nın arkasındaki yamaçta, denize 1,5–2,5 km: yürüyerek uzak, arabayla veya otobüsle birkaç dakika. Yukarı kısımlardan deniz manzarası açılır.'],
}
const CIKCILLI_FIX: Record<Loc, { about: [string, string]; lead: [string, string]; cons: [string, string] }> = {
  ru: {
    about: ['Жилой район на склоне за Оба: школы, рынки, много местных жителей. До моря 1,5–2,5 км.', 'Жилой район за Оба, к северу от шоссе D400: школы, рынки, торговый центр и много местных жителей. До моря — от 700 м до 2,5 км.'],
    lead: ['Жилой район на склоне за Оба: школы, рынки и много местных жителей. До моря 1,5–2,5 км.', 'Жилой район за Оба, к северу от шоссе D400: школы, рынки, торговый центр и много местных жителей. До моря — от 700 м до 2,5 км.'],
    cons: ['До моря 1,5–2,5 км: пешком далеко', 'Выхода к морю нет: до пляжа от 700 м до 2,5 км'],
  },
  en: {
    about: ['A residential area on the slope behind Oba: schools, markets and many local residents. 1.5–2.5 km to the sea.', 'A residential area behind Oba, north of the D400 highway: schools, markets, a shopping mall and many local residents. 700 m to 2.5 km to the sea.'],
    lead: ['A residential district on the slope behind Oba: schools, markets and many local residents.', DISTRICT_GUIDES.cikcilli.en.lead!],
    cons: ['1.5–2.5 km to the sea: too far to walk', DISTRICT_GUIDES.cikcilli.en.cons![0]],
  },
  tr: {
    about: ['Oba’nın arkasındaki yamaçta yerleşim bölgesi: okullar, pazarlar, çok sayıda yerel halk. Denize 1,5–2,5 km.', 'Oba’nın arkasında, D400 karayolunun kuzeyinde yerleşim bölgesi: okullar, pazarlar, alışveriş merkezi, çok sayıda yerel halk. Denize 700 m ile 2,5 km arası.'],
    lead: ['Oba’nın arkasındaki yamaçta bir yerleşim bölgesi: okullar, pazarlar ve çok sayıda yerli sakin.', DISTRICT_GUIDES.cikcilli.tr.lead!],
    cons: ['Denize 1,5–2,5 km: yürüyerek uzak', DISTRICT_GUIDES.cikcilli.tr.cons![0]],
  },
}

type Item = { id?: string | null; text?: string | null; title?: string | null }
type FixDoc = { id: number; about?: string | null; lead?: string | null; cons?: Item[] | null; guide?: Item[] | null }

export async function fixCikcilliTexts(payload: Payload, req?: Partial<PayloadRequest>) {
  let updated = 0
  for (const locale of ['ru', 'en', 'tr'] as const) {
    const { docs } = (await payload.find({
      collection: 'districts', locale, fallbackLocale: false, where: { slug: { equals: 'cikcilli' } }, limit: 1, depth: 0, overrideAccess: true, req,
      select: { about: true, lead: true, cons: true, guide: true },
    })) as unknown as { docs: FixDoc[] }
    const d = docs[0]
    if (!d) continue
    const f = CIKCILLI_FIX[locale]
    const [oldTitle, oldText] = OLD_GUIDE_SEA[locale]
    const [newTitle, newText] = DISTRICT_GUIDES.cikcilli[locale].guide[1]
    const data: Record<string, unknown> = {}
    if (d.about === f.about[0]) data.about = f.about[1]
    if (d.lead === f.lead[0]) data.lead = f.lead[1]
    if (d.cons?.some((x) => x.text === f.cons[0])) data.cons = d.cons.map((x) => (x.text === f.cons[0] ? { ...x, text: f.cons[1] } : x))
    if (d.guide?.some((x) => x.text === oldText))
      data.guide = d.guide.map((x) => (x.text === oldText ? { ...x, title: x.title === oldTitle ? newTitle : x.title, text: newText } : x))
    if (!Object.keys(data).length) continue
    await payload.update({ collection: 'districts', id: d.id, locale, data: data as never, overrideAccess: true, req })
    updated++
  }
  return updated
}
