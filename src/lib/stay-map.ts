// Объект Stay → поля нашего объекта (docs/stay-import.md). Чистые функции, без запросов.
import { FEATURES, ROOMS } from './catalog'
import { type StayObject, termsOf } from './stay'

type Feature = (typeof FEATURES)[number]
type Room = (typeof ROOMS)[number]

/** Районы Stay (term_id) → наши районы (slug). Мелкие посёлки — к ближайшему нашему району. */
const DISTRICTS: Record<number, string> = {
  9: 'avsallar', 242: 'avsallar', 246: 'avsallar', // Авсаллар, Инджекум, Окурджалар
  22: 'turkler', 19: 'payallar', 16: 'konakli',
  240: 'center', 11: 'center', // Центр, Клеопатра
  243: 'tepe', 241: 'tepe', // Тепе, Бекташ
  10: 'cikcilli', 254: 'cikcilli', // Джикджилли, Чиплаклы
  18: 'oba', 21: 'tosmur',
  15: 'kestel', 244: 'kestel', // Кестель, Хасбахче
  17: 'mahmutlar', 14: 'kargicak', 12: 'demirtas',
  6: 'gazipasa', 13: 'gazipasa',
}

/** Инфраструктура Stay (англ. название) → наш справочник FEATURES. */
const AMENITIES: Record<string, Feature> = {
  'open pool': 'Открытый бассейн', 'indoor pool': 'Закрытый бассейн', "children's swimming pool": 'Детский бассейн',
  aquapark: 'Аквапарк', 'wave pool': 'Аквапарк', 'fitness center': 'Фитнес-зал', fitness: 'Фитнес-зал',
  'finnish sauna': 'Финская сауна', 'sauna and steam room': 'Финская сауна', 'turkish hammam': 'Турецкий хамам',
  'roman steam room': 'Паровая баня', jacuzzi: 'Джакузи', 'massage room': 'Массажный кабинет', spa: 'Спа-центр',
  'spa for women': 'Спа-центр', 'tennis court': 'Теннисный корт', 'basketball court': 'Баскетбольная площадка',
  'volleyball court': 'Волейбольная площадка', 'table tennis': 'Настольный теннис', billiards: 'Бильярд',
  bowling: 'Боулинг', cinema: 'Кинотеатр', 'open air cinema': 'Кинотеатр', 'game room': 'Игровая комната',
  playground: 'Детская площадка', "children's play area": 'Детская площадка', 'mini club': 'Мини-клуб',
  'cafe restaurant': 'Кафе / ресторан', 'pool bar': 'Бар у бассейна', market: 'Маркет', salon: 'Парикмахерская',
  'conference hall': 'Конференц-зал', 'green area': 'Зелёная территория', 'jogging track': 'Прогулочные дорожки',
  'recreation area - bbq': 'Зоны барбекю', 'bbq area': 'Зоны барбекю', 'gazebo for relaxation': 'Беседки',
  'private beach': 'Собственный пляж', 'transfer to the beach': 'Шаттл до пляжа', '24 hours security': 'Охрана 24/7',
  'video surveillance 24/7': 'Видеонаблюдение', concierge: 'Консьерж', 'electric generator': 'Генератор',
  'covered parking': 'Крытая парковка', 'open parking': 'Открытая парковка', parking: 'Открытая парковка',
  elevator: 'Лифт', 'satellite tv': 'Спутниковое ТВ', 'wireless internet': 'Wi-Fi на территории',
  'underfloor heating': 'Тёплый пол',
}

const num = (v: unknown) => {
  const n = Number(String(v ?? '').replace(/[^\d.]/g, ''))
  return Number.isFinite(n) && n > 0 ? n : null
}

/** HTML описания Stay → текст с абзацами через пустую строку (так хранится наше описание). */
export function htmlToText(html: string | undefined | null) {
  return (html || '')
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h\d)>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Название из Stay без русской части и «-EN»: «Джакузи/Jacuzzi-EN» → «jacuzzi». */
const plain = (name: string) => (name.includes('/') ? name.split('/').pop()! : name).replace(/-EN$/i, '').trim().toLowerCase()

export type StayDistrict = { id: number; slug: string; lat?: number | null; lng?: number | null; inland?: boolean | null }

export type StayMapped = {
  data: Record<string, unknown> // поля на русском + общие
  en: { title: string; description: string } | null
  photos: string[]
  problems: string[] // что не удалось сопоставить — в отчёт синхронизации
}

export function mapStayObject(o: StayObject, districts: Map<string, StayDistrict>): StayMapped {
  const m = o.post_meta || {}
  const problems: string[] = []

  // район
  const loc = termsOf(o, 'location')
  const slug = loc.map((t) => DISTRICTS[t.term_id]).filter(Boolean).at(-1) ?? loc.map((t) => DISTRICTS[t.term_id]).find(Boolean)
  const district = slug ? districts.get(slug) : undefined
  if (!district) problems.push(`район «${loc.map((t) => t.name).join(' / ') || '—'}» не сопоставлен`)

  // тип и состояние
  const typeName = termsOf(o, 'type')[0]?.name || ''
  const t = typeName.toLowerCase()
  const type = /project/.test(t) ? 'project'
    : /villa|townhouse/.test(t) ? 'villa'
    : /duplex/.test(t) ? 'duplex'
    : /penthouse/.test(t) ? 'penthouse'
    : /land/.test(t) ? 'land'
    : /commercial/.test(t) ? 'commercial'
    : 'apartment'
  if (!typeName) problems.push('нет типа объекта')
  const condition = type === 'project' ? 'construction' : /resale/.test(t) ? 'resale' : /finished/.test(t) ? 'new' : 'resale'

  // сделка
  const offer = termsOf(o, 'offer')[0]?.slug || ''
  const rent = /arend|rent/i.test(offer) || termsOf(o, 'offer').some((x) => /rental/i.test(x.name))
  const short = termsOf(o, 'offer').some((x) => /short/i.test(x.name))

  // планировки: у проекта их несколько
  const layouts = termsOf(o, 'rooms').map((x) => x.name.trim())
  const rooms = (layouts.find((r) => (ROOMS as readonly string[]).includes(r)) as Room | undefined) ?? null
  if (layouts.length && !rooms) problems.push(`планировка ${layouts.join(', ')} не из нашего списка`)

  // вид
  const views = termsOf(o, 'view').map((x) => x.name.toLowerCase())
  const view = views.includes('sea') ? 'sea' : views.some((v) => /mountain|forest/.test(v)) ? 'mountain' : views.includes('yard') ? 'city' : null

  // инфраструктура
  const features = [...new Set(termsOf(o, 'amenities').map((x) => AMENITIES[plain(x.name)]).filter(Boolean))]

  // цена
  const price = num(m.sales_cost)
  const currency = termsOf(o, 'currency')[0]?.name?.toUpperCase() || 'EUR'
  if (!price) problems.push('нет цены')
  const priceData = rent
    ? { price, rent: { period: short ? 'short' : 'long' } }
    : { priceOriginal: price, currency: ['EUR', 'USD', 'GBP', 'TRY'].includes(currency) ? currency : 'EUR' }

  // координат в Stay нет: точка в районе со смещением по ID (стабильная, примерная)
  const u = ((o.ID * 9301 + 49297) % 233280) / 233280
  const sea = num(m.distance_sea)
  const lat = district?.lat != null ? district.lat + (district.inland ? (u - 0.5) * 0.012 : Math.min(sea ?? 300, 3000) / 111000 * 0.6) : null
  const lng = district?.lng != null ? district.lng + (u - 0.5) * 0.02 : null

  const i18n = o.i18n || {}
  const ruTitle = (i18n.post_title?.ru || o.post_title || '').trim()
  const enTitle = (i18n.post_title?.en || '').trim()
  const video = Array.isArray(m.video) ? m.video.find((x) => typeof x === 'string') : typeof m.video === 'string' ? m.video : ''
  const gallery = Array.isArray(m.object_gallery) ? m.object_gallery.filter((x) => typeof x === 'string' && x.startsWith('http')) : []
  if (!gallery.length) problems.push('нет фото')

  return {
    data: {
      deal: rent ? 'rent' : 'sale',
      type,
      condition,
      district: district?.id,
      rooms,
      layouts: layouts.length > 1 ? layouts.join(', ') : null,
      area: num(m.area_square) ?? num(m.area_from),
      areaTo: num(m.area_to),
      year: num(m.year_built),
      floors: num(m.floors_villa),
      sea,
      view,
      citizenship: m.citizenship === 'Y',
      residence: m.residence_permit === 'yes',
      priceFrom: m.price_from === 'Y',
      ...priceData,
      features,
      video: video || null,
      lat,
      lng,
      title: (ruTitle || enTitle).slice(0, 120),
      description: htmlToText(i18n.post_content?.ru || o.post_content),
      status: m.relevance === 'sold' ? 'sold' : 'published',
    },
    en: enTitle ? { title: enTitle.slice(0, 120), description: htmlToText(i18n.post_content?.en) } : null,
    photos: gallery,
    problems,
  }
}
