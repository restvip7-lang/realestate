// Переводы демо-данных на EN/TR для загрузки (seed). Русские тексты — в prototype-data.json.
// Названия объектов собираются из частей: «Квартира 2+1 с видом на море» → тип + комнаты + уточнение.

type Loc = 'en' | 'tr'
type Pair = Record<Loc, string>

export const DISTRICTS_I18N: Record<string, { name: Pair; about: Pair }> = {
  avsallar: { name: { en: 'Avsallar', tr: 'Avsallar' }, about: { en: 'A resort area in the west with wide sandy beaches (Incekum). Good for holidays and summer rentals.', tr: 'Batıda geniş kumsallara (İncekum) sahip tatil bölgesi. Tatil ve yazlık kiralama için uygun.' } },
  turkler: { name: { en: 'Türkler', tr: 'Türkler' }, about: { en: 'A small seaside village with new complexes and affordable prices.', tr: 'Yeni siteleri ve uygun fiyatlarıyla deniz kenarında küçük bir yerleşim.' } },
  payallar: { name: { en: 'Payallar', tr: 'Payallar' }, about: { en: 'A quiet area between Türkler and Konaklı: beaches, hotels and new residential complexes.', tr: 'Türkler ile Konaklı arasında sakin bir bölge: plajlar, oteller ve yeni konut siteleri.' } },
  konakli: { name: { en: 'Konaklı', tr: 'Konaklı' }, about: { en: 'A large residential area west of the centre with many families and year-round residents.', tr: 'Merkezin batısında, aileler ve yıl boyu yaşayanlarla dolu büyük bir yerleşim bölgesi.' } },
  center: { name: { en: 'City centre', tr: 'Merkez' }, about: { en: 'Cleopatra Beach, the promenade, the castle and all of city life within walking distance.', tr: 'Kleopatra Plajı, sahil yolu, kale ve tüm şehir hayatı yürüme mesafesinde.' } },
  tepe: { name: { en: 'Tepe', tr: 'Tepe' }, about: { en: 'A hillside area above the centre: villas and houses with views over the city and sea, quiet and cool in summer. The beach is 3–5 km down a winding road, a car is needed.', tr: 'Merkezin üzerinde dağlık bir bölge: şehir ve deniz manzaralı villalar, yazın sessiz ve serin. Plaj virajlı yoldan 3–5 km, araç gerekir.' } },
  cikcilli: { name: { en: 'Cikcilli', tr: 'Cikcilli' }, about: { en: 'A residential area on the slope behind Oba: schools, markets and many local residents. 1.5–2.5 km to the sea.', tr: 'Oba’nın arkasındaki yamaçta yerleşim bölgesi: okullar, pazarlar, çok sayıda yerel halk. Denize 1,5–2,5 km.' } },
  oba: { name: { en: 'Oba', tr: 'Oba' }, about: { en: 'A modern area for everyday life: shopping mall, clinics, schools and parks.', tr: 'Yaşam için modern bölge: alışveriş merkezi, klinikler, okullar, parklar.' } },
  tosmur: { name: { en: 'Tosmur', tr: 'Tosmur' }, about: { en: 'A green area by the Dim river, close to Oba and the sea.', tr: 'Dimçay kıyısında, Oba’ya ve denize yakın yeşil bir bölge.' } },
  kestel: { name: { en: 'Kestel', tr: 'Kestel' }, about: { en: 'New seaside complexes, a developed promenade and easy access to the centre.', tr: 'Deniz kenarında yeni siteler, gelişmiş sahil yolu, merkeze kolay ulaşım.' } },
  mahmutlar: { name: { en: 'Mahmutlar', tr: 'Mahmutlar' }, about: { en: 'The largest area for international buyers: everything nearby and many Russian-speaking neighbours.', tr: 'Yabancılar için en büyük bölge: her şey yakında, çok sayıda Rusça konuşan komşu.' } },
  kargicak: { name: { en: 'Kargıcak', tr: 'Kargıcak' }, about: { en: 'Villas and complexes on green hillsides with sea views, calm and quiet.', tr: 'Deniz manzaralı yeşil yamaçlarda villalar ve siteler, sakin ve huzurlu.' } },
  demirtas: { name: { en: 'Demirtaş', tr: 'Demirtaş' }, about: { en: 'A quiet village in the east with beaches and mountain views; prices are lower than closer to the centre.', tr: 'Doğuda plajları ve dağ manzarasıyla sakin bir köy; fiyatlar merkeze yakın bölgelerden düşük.' } },
  gazipasa: { name: { en: 'Gazipaşa', tr: 'Gazipaşa' }, about: { en: 'A separate town next to GZP airport: a new marina, a relaxed pace and the most affordable prices on the coast.', tr: 'GZP havalimanının yanında ayrı bir ilçe: yeni marina, sakin yaşam, sahildeki en uygun fiyatlar.' } },
}

const TYPES: Record<string, Pair> = {
  Квартира: { en: 'Apartment', tr: 'daire' },
  Апартаменты: { en: 'Apartment', tr: 'daire' },
  Студия: { en: 'Studio', tr: 'stüdyo daire' },
  Пентхаус: { en: 'Penthouse', tr: 'çatı dubleksi' },
  Вилла: { en: 'Villa', tr: 'villa' },
  Дуплекс: { en: 'Duplex', tr: 'dubleks' },
}

// уточнение в названии: EN — после типа, TR — перед («Deniz manzaralı 2+1 daire»)
const SUFFIX: Record<string, Pair> = {
  '': { en: '', tr: '' },
  'с террасой и видом на крепость': { en: 'with a terrace and castle view', tr: 'Teraslı ve kale manzaralı' },
  'с просторной террасой': { en: 'with a large terrace', tr: 'Geniş teraslı' },
  'на первой линии': { en: 'on the seafront', tr: 'Denize sıfır' },
  'в новом комплексе у моря': { en: 'in a new complex by the sea', tr: 'Denize yakın yeni sitede' },
  'с мебелью в центре': { en: 'furnished, in the centre', tr: 'Merkezde eşyalı' },
  'с видом на море': { en: 'with sea view', tr: 'Deniz manzaralı' },
  'для сдачи в аренду': { en: 'for rental income', tr: 'Kiraya uygun' },
  'с бассейном и панорамой моря': { en: 'with a pool and panoramic sea view', tr: 'Havuzlu, panoramik deniz manzaralı' },
  'у песчаного пляжа': { en: 'near a sandy beach', tr: 'Kumsala yakın' },
  'с видом на море в комплексе с аквапарком': { en: 'with sea view in a complex with an aquapark', tr: 'Aquaparklı sitede deniz manzaralı' },
  'в новом комплексе у набережной': { en: 'in a new complex by the promenade', tr: 'Sahil yoluna yakın yeni sitede' },
  'с террасой на крыше': { en: 'with a roof terrace', tr: 'Çatı teraslı' },
  'рядом с торговым центром': { en: 'near a shopping mall', tr: 'AVM yakınında' },
  'для семьи в комплексе с бассейном': { en: 'for a family, in a complex with a pool', tr: 'Aile için havuzlu sitede' },
  'с мебелью на длительный срок': { en: 'furnished, long-term', tr: 'Uzun dönem eşyalı' },
  'в комплексе с бассейном': { en: 'in a complex with a pool', tr: 'Havuzlu sitede' },
  'рядом с пляжем': { en: 'near the beach', tr: 'Plaja yakın' },
  'с мебелью': { en: 'furnished', tr: 'Eşyalı' },
  'с частным бассейном': { en: 'with a private pool', tr: 'Özel havuzlu' },
  'в новом комплексе': { en: 'in a new complex', tr: 'Yeni sitede' },
  'с садом': { en: 'with a garden', tr: 'Bahçeli' },
  'с видом на горы': { en: 'with mountain view', tr: 'Dağ manzaralı' },
  'с панорамой моря': { en: 'with panoramic sea view', tr: 'Panoramik deniz manzaralı' },
}

/** Перевод названия объекта или null, если такого шаблона нет (тогда остаётся русское). */
export function titleI18n(ru: string, loc: Loc): string | null {
  const m = ru.match(/^(\S+) (\d\+\d)\s*(.*)$/)
  if (!m || !TYPES[m[1]] || !(m[3] in SUFFIX)) return null
  const [, type, rooms, rest] = m
  const t = TYPES[type][loc], s = SUFFIX[rest][loc]
  if (loc === 'en') return [t, rooms, s].filter(Boolean).join(' ')
  const tr = [s, rooms, t].filter(Boolean).join(' ')
  return tr.charAt(0).toUpperCase() + tr.slice(1)
}

/** Описание по тем же данным, что и русское демо-описание. */
export function descriptionI18n(p: { type: string; rooms?: string | null; area?: number | null; sea?: number | null }, district: string, loc: Loc): string {
  const bedrooms = Number((p.rooms || '1+1').split('+')[0])
  const type = { apartment: { en: 'Apartment', tr: 'Daire' }, penthouse: { en: 'Penthouse', tr: 'Çatı dubleksi' }, villa: { en: 'Villa', tr: 'Villa' }, duplex: { en: 'Duplex', tr: 'Dubleks' } }[p.type as 'apartment']?.[loc] ?? p.type
  const about = DISTRICTS_I18N[district]?.about[loc] ?? ''
  const name = DISTRICTS_I18N[district]?.name[loc] ?? district
  if (loc === 'en') {
    const rooms = bedrooms > 0 ? `${bedrooms} bedroom${bedrooms > 1 ? 's' : ''}` : 'open-plan studio'
    return `Demo description. ${type} ${p.rooms}, ${p.area} m² in ${name}. Living room with kitchen, ${rooms}, balcony. Complex with a pool and security, about ${p.sea} m to the sea.\n\n${about}`
  }
  const rooms = bedrooms > 0 ? `${bedrooms} yatak odası` : 'stüdyo plan'
  return `Demo açıklama. ${name} bölgesinde ${p.area} m² ${p.rooms} ${type.toLowerCase()}. Mutfaklı salon, ${rooms}, balkon. Havuzlu ve güvenlikli site, denize yaklaşık ${p.sea} m.\n\n${about}`
}
