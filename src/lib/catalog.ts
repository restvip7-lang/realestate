// Справочники каталога: одни и те же значения в админке, на сайте и в фильтрах
export const PROPERTY_TYPES = {
  apartment: { ru: 'Квартира', en: 'Apartment', tr: 'Daire', plural: { ru: 'Квартиры', en: 'Apartments', tr: 'Daireler' }, path: 'apartments' },
  penthouse: { ru: 'Пентхаус', en: 'Penthouse', tr: 'Çatı katı', plural: { ru: 'Пентхаусы', en: 'Penthouses', tr: 'Çatı katları' }, path: 'penthouses' },
  villa: { ru: 'Вилла', en: 'Villa', tr: 'Villa', plural: { ru: 'Виллы', en: 'Villas', tr: 'Villalar' }, path: 'villas' },
  duplex: { ru: 'Дуплекс', en: 'Duplex', tr: 'Dubleks', plural: { ru: 'Дуплексы', en: 'Duplexes', tr: 'Dubleksler' }, path: 'duplex' },
  land: { ru: 'Земля', en: 'Land', tr: 'Arsa', plural: { ru: 'Участки', en: 'Land plots', tr: 'Arsalar' }, path: 'land' },
  commercial: { ru: 'Коммерция', en: 'Commercial', tr: 'Ticari', plural: { ru: 'Коммерческая недвижимость', en: 'Commercial property', tr: 'Ticari gayrimenkul' }, path: 'commercial' },
} as const
export type PropertyType = keyof typeof PROPERTY_TYPES

export const ROOMS = ['1+0', '1+1', '2+1', '3+1', '3+2', '4+1', '4+2', '5+1', '6+1'] as const

export const PROPERTY_STATUS = {
  published: 'Опубликован',
  draft: 'Черновик',
  reserved: 'Бронь',
  sold: 'Продан',
  rented: 'Сдан',
  hidden: 'Снят',
} as const
/** Статусы, которые видны на сайте (проданные и сданные — с плашкой, без формы просмотра). */
export const PUBLIC_STATUSES = ['published', 'reserved', 'sold', 'rented'] as const

export const FEATURES = [
  'Открытый бассейн', 'Закрытый бассейн', 'Детский бассейн', 'Аквапарк', 'Фитнес-зал', 'Финская сауна', 'Турецкий хамам',
  'Паровая баня', 'Джакузи', 'Массажный кабинет', 'Спа-центр', 'Теннисный корт', 'Баскетбольная площадка',
  'Волейбольная площадка', 'Настольный теннис', 'Бильярд', 'Боулинг', 'Кинотеатр', 'Игровая комната', 'Детская площадка',
  'Мини-клуб', 'Кафе / ресторан', 'Бар у бассейна', 'Маркет', 'Парикмахерская', 'Конференц-зал', 'Зелёная территория',
  'Прогулочные дорожки', 'Зоны барбекю', 'Беседки', 'Собственный пляж', 'Шаттл до пляжа', 'Охрана 24/7', 'Видеонаблюдение',
  'Консьерж', 'Генератор', 'Крытая парковка', 'Открытая парковка', 'Лифт', 'Спутниковое ТВ', 'Wi-Fi на территории',
  'Тёплый пол', 'Кондиционеры', 'Встроенная кухня', 'Солнечный водонагреватель',
] as const

export const POST_CATEGORIES = [
  { value: 'market', label: 'Рынок и цены' },
  { value: 'laws', label: 'Законы' },
  { value: 'residence', label: 'ВНЖ и гражданство' },
  { value: 'life', label: 'Жизнь в Алании' },
  { value: 'rates', label: 'Курсы валют' },
  { value: 'agency', label: 'Новости агентства' },
] as const
/** Для новостей этих рубрик источник обязателен. */
export const SOURCE_REQUIRED = ['laws', 'residence', 'rates']

export const CURRENCIES = ['EUR', 'USD', 'TRY', 'RUB', 'KZT', 'GBP'] as const
export type Currency = (typeof CURRENCIES)[number]
export const CURRENCY_SYMBOL: Record<Currency, string> = { EUR: '€', USD: '$', TRY: '₺', RUB: '₽', KZT: '₸', GBP: '£' }
