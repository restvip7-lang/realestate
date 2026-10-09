// Справочники каталога: одни и те же значения в админке, на сайте и в фильтрах
export const PROPERTY_TYPES = {
  apartment: { ru: 'Квартира', en: 'Apartment', tr: 'Daire', plural: { ru: 'Квартиры', en: 'Apartments', tr: 'Daireler' }, path: 'apartments' },
  penthouse: { ru: 'Пентхаус', en: 'Penthouse', tr: 'Çatı katı', plural: { ru: 'Пентхаусы', en: 'Penthouses', tr: 'Çatı katları' }, path: 'penthouses' },
  villa: { ru: 'Вилла', en: 'Villa', tr: 'Villa', plural: { ru: 'Виллы', en: 'Villas', tr: 'Villalar' }, path: 'villas' },
  duplex: { ru: 'Дуплекс', en: 'Duplex', tr: 'Dubleks', plural: { ru: 'Дуплексы', en: 'Duplexes', tr: 'Dubleksler' }, path: 'duplex' },
  land: { ru: 'Земля', en: 'Land', tr: 'Arsa', plural: { ru: 'Участки', en: 'Land plots', tr: 'Arsalar' }, path: 'land' },
  commercial: { ru: 'Коммерция', en: 'Commercial', tr: 'Ticari', plural: { ru: 'Коммерческая недвижимость', en: 'Commercial property', tr: 'Ticari gayrimenkul' }, path: 'commercial' },
  project: { ru: 'Новый проект', en: 'New project', tr: 'Yeni proje', plural: { ru: 'Новые проекты', en: 'New projects', tr: 'Yeni projeler' }, path: 'projects' },
} as const
export type PropertyType = keyof typeof PROPERTY_TYPES

export const ROOMS = ['1+0', '1+1', '2+1', '3+1', '3+2', '4+1', '4+2', '5+1', '5+2', '6+1', '6+2', '7+1', '7+2', '8+1', '8+2'] as const

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

/** Подписи инфраструктуры на EN/TR (в базе хранится русское значение из FEATURES). */
export const FEATURE_LABELS: Record<(typeof FEATURES)[number], { en: string; tr: string }> = {
  'Открытый бассейн': { en: 'Outdoor pool', tr: 'Açık havuz' },
  'Закрытый бассейн': { en: 'Indoor pool', tr: 'Kapalı havuz' },
  'Детский бассейн': { en: 'Kids’ pool', tr: 'Çocuk havuzu' },
  'Аквапарк': { en: 'Aquapark', tr: 'Aquapark' },
  'Фитнес-зал': { en: 'Gym', tr: 'Fitness salonu' },
  'Финская сауна': { en: 'Sauna', tr: 'Fin saunası' },
  'Турецкий хамам': { en: 'Turkish bath', tr: 'Türk hamamı' },
  'Паровая баня': { en: 'Steam room', tr: 'Buhar odası' },
  'Джакузи': { en: 'Jacuzzi', tr: 'Jakuzi' },
  'Массажный кабинет': { en: 'Massage room', tr: 'Masaj odası' },
  'Спа-центр': { en: 'Spa', tr: 'Spa merkezi' },
  'Теннисный корт': { en: 'Tennis court', tr: 'Tenis kortu' },
  'Баскетбольная площадка': { en: 'Basketball court', tr: 'Basketbol sahası' },
  'Волейбольная площадка': { en: 'Volleyball court', tr: 'Voleybol sahası' },
  'Настольный теннис': { en: 'Table tennis', tr: 'Masa tenisi' },
  'Бильярд': { en: 'Billiards', tr: 'Bilardo' },
  'Боулинг': { en: 'Bowling', tr: 'Bowling' },
  'Кинотеатр': { en: 'Cinema room', tr: 'Sinema salonu' },
  'Игровая комната': { en: 'Game room', tr: 'Oyun odası' },
  'Детская площадка': { en: 'Playground', tr: 'Çocuk oyun alanı' },
  'Мини-клуб': { en: 'Kids’ club', tr: 'Mini kulüp' },
  'Кафе / ресторан': { en: 'Café / restaurant', tr: 'Kafe / restoran' },
  'Бар у бассейна': { en: 'Pool bar', tr: 'Havuz bar' },
  'Маркет': { en: 'Mini market', tr: 'Market' },
  'Парикмахерская': { en: 'Hair salon', tr: 'Kuaför' },
  'Конференц-зал': { en: 'Meeting room', tr: 'Toplantı salonu' },
  'Зелёная территория': { en: 'Landscaped grounds', tr: 'Peyzajlı bahçe' },
  'Прогулочные дорожки': { en: 'Walking paths', tr: 'Yürüyüş yolları' },
  'Зоны барбекю': { en: 'BBQ areas', tr: 'Barbekü alanı' },
  'Беседки': { en: 'Gazebos', tr: 'Kameriyeler' },
  'Собственный пляж': { en: 'Private beach', tr: 'Özel plaj' },
  'Шаттл до пляжа': { en: 'Beach shuttle', tr: 'Plaj servisi' },
  'Охрана 24/7': { en: '24/7 security', tr: '7/24 güvenlik' },
  'Видеонаблюдение': { en: 'CCTV', tr: 'Kamera sistemi' },
  'Консьерж': { en: 'Concierge', tr: 'Konsiyerj' },
  'Генератор': { en: 'Generator', tr: 'Jeneratör' },
  'Крытая парковка': { en: 'Covered parking', tr: 'Kapalı otopark' },
  'Открытая парковка': { en: 'Open parking', tr: 'Açık otopark' },
  'Лифт': { en: 'Lift', tr: 'Asansör' },
  'Спутниковое ТВ': { en: 'Satellite TV', tr: 'Uydu TV' },
  'Wi-Fi на территории': { en: 'Wi-Fi on site', tr: 'Site içi Wi-Fi' },
  'Тёплый пол': { en: 'Underfloor heating', tr: 'Yerden ısıtma' },
  'Кондиционеры': { en: 'Air conditioning', tr: 'Klima' },
  'Встроенная кухня': { en: 'Fitted kitchen', tr: 'Ankastre mutfak' },
  'Солнечный водонагреватель': { en: 'Solar water heater', tr: 'Güneş enerjili su ısıtıcı' },
}
export const featureLabel = (f: string, locale: string) =>
  locale === 'ru' ? f : (FEATURE_LABELS[f as (typeof FEATURES)[number]]?.[locale as 'en' | 'tr'] ?? f)

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
