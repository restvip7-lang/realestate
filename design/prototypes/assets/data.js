/* Kleo Homes — демо-данные и хранилище прототипа.
   Всё здесь выдумано для показа. Объекты и публикации из админки
   сохраняются в localStorage браузера (ключи kh_*), сервер не нужен. */
(function () {
  // id фото Unsplash или готовая ссылка / загруженный в админке файл (data:)
  const IMG = (id, w = 800) => /^(data:|https?:|blob:)/.test(id || '') ? id : `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

  const TYPES = {
    apartment: 'Квартира', penthouse: 'Пентхаус', villa: 'Вилла',
    duplex: 'Дуплекс', land: 'Земля', commercial: 'Коммерция'
  };

  // Районы Аланьи с запада на восток (по карте владельца, docs/districts.md).
  // pos — км от центра по побережью (минус — запад); inland — район в горах, не у моря.
  // lat/lng — точки OpenStreetMap (Nominatim, 25.09.2026); clat/clng/slope — примерно у берега.
  // x,y — точка на схеме побережья (viewBox 1000×440, KH.COAST); pm — демо €/м².
  // img — реальные фото Аланьи с Unsplash, но не обязательно этого района (иллюстрация).
  const DISTRICTS = [
    { slug: 'avsallar', name: 'Авсаллар', pos: -22, pm: 1600, lat: 36.6353, lng: 31.7498, clat: 36.6353, clng: 31.7498, slope: -0.35, x: 50, y: 92, img: '1593201357902-a707a6c672a4', about: 'Курортный район на западе с широкими песчаными пляжами (Инджекум). Хорош для отдыха и сдачи в аренду летом.' },
    { slug: 'turkler', name: 'Тюрклер', pos: -17, pm: 1500, lat: 36.6024, lng: 31.8154, clat: 36.5999, clng: 31.8139, slope: -0.35, x: 130, y: 116, img: '1736547316493-18e917fc4fdd', about: 'Небольшой посёлок у моря с новыми комплексами и доступными ценами.' },
    { slug: 'payallar', name: 'Паялар', pos: -13, pm: 1550, lat: 36.6122, lng: 31.8599, clat: 36.5985, clng: 31.8570, slope: -0.35, x: 200, y: 112, img: '1628690937744-f501f3559a41', about: 'Спокойный район между Тюрклером и Конаклы: пляжи, отели и новые жилые комплексы.' },
    { slug: 'konakli', name: 'Конаклы', pos: -10, pm: 1750, lat: 36.5859, lng: 31.8904, clat: 36.5834, clng: 31.8889, slope: -0.4, x: 318, y: 118, img: '1656666703820-244b8a6e8922', about: 'Большой жилой район к западу от центра, много семей и резидентов круглый год.' },
    { slug: 'center', name: 'Центр', pos: 0, pm: 2400, lat: 36.5483, lng: 31.9800, clat: 36.5483, clng: 31.9800, slope: -0.6, x: 462, y: 144, img: '1647825531731-c0d1f92e37d3', about: 'Пляж Клеопатры, набережная, крепость и вся городская жизнь в пешей доступности.' },
    { slug: 'tepe', name: 'Тепе', pos: 4, inland: true, pm: 2300, lat: 36.5780, lng: 31.9939, x: 452, y: 58, img: '1663338122129-d70bc4dd0d8e', about: 'Район в горах над центром: виллы и дома с панорамой на город и море, тишина и прохлада летом. До пляжа 3–5 км по серпантину, нужна машина.' },
    { slug: 'cikcilli', name: 'Джикджилли', pos: 3, inland: true, pm: 1800, lat: 36.5476, lng: 32.0287, x: 560, y: 92, img: '1661163090830-b45f31291e3a', about: 'Жилой район на склоне за Оба: школы, рынки, много местных жителей. До моря 1,5–2,5 км.' },
    { slug: 'oba', name: 'Оба', pos: 2, pm: 2100, lat: 36.5363, lng: 32.0436, clat: 36.5338, clng: 32.0421, slope: -0.8, x: 585, y: 138, img: '1666202629981-71704ec80028', about: 'Современный район для жизни: торговый центр, клиники, школы, парки.' },
    { slug: 'tosmur', name: 'Тосмур', pos: 5, pm: 2000, lat: 36.5279, lng: 32.0509, clat: 36.5254, clng: 32.0494, slope: -0.8, x: 640, y: 160, img: '1701787233703-166f9853607d', about: 'Зелёный район у реки Димчай, рядом с Оба и морем.' },
    { slug: 'kestel', name: 'Кестель', pos: 7, pm: 2100, lat: 36.5073, lng: 32.0784, clat: 36.5048, clng: 32.0769, slope: -0.8, x: 690, y: 184, img: '1725637043379-007c9ecab893', about: 'Новые комплексы у моря, развитая набережная, удобно добираться до центра.' },
    { slug: 'mahmutlar', name: 'Махмутлар', pos: 9.5, pm: 1700, lat: 36.4902, lng: 32.0990, clat: 36.4877, clng: 32.0975, slope: -0.8, x: 742, y: 212, img: '1593201281993-814e5066cc76', about: 'Самый большой район для иностранцев: всё на месте, много русскоговорящих соседей.' },
    { slug: 'kargicak', name: 'Каргыджак', pos: 14, pm: 2200, lat: 36.4610, lng: 32.1253, clat: 36.4585, clng: 32.1238, slope: -0.8, x: 810, y: 258, img: '1540996971292-8690d9a73586', about: 'Виллы и комплексы на склонах с видом на море, спокойно и зелено.' },
    { slug: 'demirtas', name: 'Демирташ', pos: 22, pm: 1450, lat: 36.4270, lng: 32.1918, clat: 36.4245, clng: 32.1903, slope: -0.8, x: 880, y: 302, img: '1701336392425-0f7c0cbee1b0', about: 'Тихий посёлок на востоке с пляжами и видами на горы; цены ниже, чем ближе к центру.' },
    { slug: 'gazipasa', name: 'Газипаша', pos: 43, pm: 1300, lat: 36.2683, lng: 32.3175, clat: 36.2658, clng: 32.3160, slope: -0.8, x: 950, y: 340, img: '1713885639308-d953cc619ffd', about: 'Отдельный город рядом с аэропортом GZP: новая марина, спокойная жизнь, самые доступные цены на побережье.' }
  ].map(d => Object.assign(d, { km: Math.abs(d.pos) }));

  // Гид по районам (страницы district.html / districts.html). Тексты — черновик, оценки 1–5 — демо, проверит команда.
  // in — «в каком районе» для заголовков; sc — оценки: life (жить круглый год), rent (сдавать), beach (пляж рядом), infra, quiet (тишина).
  const GUIDE = {
    avsallar: { in: 'Авсалларе', sc: { life: 2, rent: 4, beach: 5, infra: 3, quiet: 4 },
      lead: 'Курортный посёлок на западе Аланьи с одним из лучших песчаных пляжей побережья — Инджекум. Летом здесь оживлённо, зимой тихо.',
      pros: ['Песчаный пляж Инджекум с пологим входом в море', 'Цены ниже, чем ближе к центру', 'Много новых комплексов с бассейнами'],
      cons: ['До центра Аланьи 22 км: нужна машина или автобус', 'Зимой часть кафе и магазинов закрыта'],
      infra: ['Пляж Инджекум', 'Супермаркеты и еженедельный рынок', 'Отели и кафе у моря', 'Автобусы в центр Аланьи'] },
    turkler: { in: 'Тюрклере', sc: { life: 2, rent: 3, beach: 4, infra: 2, quiet: 5 },
      lead: 'Небольшой посёлок между Авсалларом и Паяларом: новые комплексы у моря и спокойная атмосфера.',
      pros: ['Спокойно, мало плотной застройки', 'Доступные цены на новостройки', 'Рядом пляжи и отели Авсаллара'],
      cons: ['Мало инфраструктуры на месте', 'До центра 17 км'],
      infra: ['Пляж и набережная', 'Небольшие магазины и кафе', 'Отели', 'Автобусы в Аланью и Авсаллар'] },
    payallar: { in: 'Паяларе', sc: { life: 2, rent: 3, beach: 4, infra: 2, quiet: 4 },
      lead: 'Тихий район у моря между Тюрклером и Конаклы: пляжи, отели и новые жилые комплексы.',
      pros: ['Тишина и зелень', 'Новые комплексы с бассейнами и охраной', 'До магазинов Конаклы — 3 км'],
      cons: ['Магазины и школы в основном в соседних районах', 'Зимой очень спокойно'],
      infra: ['Пляжи', 'Отели и рестораны', 'Минимаркеты', 'Автобусы в Конаклы и центр'] },
    konakli: { in: 'Конаклы', sc: { life: 4, rent: 4, beach: 4, infra: 4, quiet: 3 },
      lead: 'Большой жилой район в 10 км к западу от центра: много семей и резидентов, которые живут здесь круглый год.',
      pros: ['Жизнь круглый год: магазины, школы и кафе работают зимой', 'Жилые комплексы на любой бюджет', 'Длинная набережная и пляжи'],
      cons: ['До центра 10 км', 'В сезон много туристов'],
      infra: ['Супермаркеты и рынок', 'Школы и детские сады', 'Клиники и аптеки', 'Набережная и пляжи', 'Регулярные автобусы в центр'] },
    center: { in: 'центре Аланьи', sc: { life: 5, rent: 5, beach: 5, infra: 5, quiet: 1 },
      lead: 'Сердце Аланьи: пляж Клеопатры, крепость, порт, набережная и вся городская жизнь в пешей доступности.',
      pros: ['Всё рядом пешком: пляж, рынок, рестораны, госучреждения', 'Самый стабильный спрос на аренду', 'Пляж Клеопатры — один из самых известных в Турции'],
      cons: ['Самые высокие цены за м²', 'Шумно в туристический сезон', 'Мало новостроек, больше вторичного жилья'],
      infra: ['Пляж Клеопатры и восточный пляж', 'Крепость и порт', 'Госучреждения и банки', 'Рынки и торговые улицы', 'Больницы и частные клиники'] },
    tepe: { in: 'Тепе', sc: { life: 3, rent: 2, beach: 1, infra: 2, quiet: 5 },
      lead: 'Район в горах над центром: виллы и дома с панорамой на город и море. Здесь тихо и прохладнее летом.',
      pros: ['Панорамные виды на море и крепость', 'Летом прохладнее, чем внизу', 'Просторные участки и виллы'],
      cons: ['До пляжа 3–5 км по серпантину', 'Без машины жить неудобно'],
      infra: ['Небольшие магазины', 'Кафе с видовыми террасами', 'Дорога в центр за 10–15 минут на машине'] },
    cikcilli: { in: 'Джикджилли', sc: { life: 5, rent: 3, beach: 2, infra: 5, quiet: 3 },
      lead: 'Жилой район на склоне за Оба: школы, рынки и много местных жителей. До моря 1,5–2,5 км.',
      pros: ['Всё для жизни: школы, магазины, клиники', 'Цены ниже, чем у моря', 'Много новых комплексов с бассейнами'],
      cons: ['До моря 1,5–2,5 км: пешком далеко', 'В часы пик много машин'],
      infra: ['Школы и детские сады', 'Торговые центры и супермаркеты', 'Рынок', 'Клиники', 'Спортивные площадки'] },
    oba: { in: 'Оба', sc: { life: 5, rent: 4, beach: 4, infra: 5, quiet: 3 },
      lead: 'Современный район для жизни рядом с центром: торговый центр, клиники, школы и парки.',
      pros: ['Всё для жизни рядом: школы, клиники, магазины', '2 км до центра', 'Популярен у тех, кто живёт в Аланье круглый год'],
      cons: ['Цены выше среднего', 'Плотная застройка у главных улиц'],
      infra: ['Торговый центр', 'Государственная и частные клиники', 'Школы', 'Парки и спортивные площадки', 'Пляж и набережная'] },
    tosmur: { in: 'Тосмуре', sc: { life: 4, rent: 3, beach: 4, infra: 4, quiet: 4 },
      lead: 'Зелёный район у реки Димчай, рядом с Оба и морем.',
      pros: ['Река Димчай и зелень рядом', 'Тише, чем в Оба, но всё близко', 'Хорошее соотношение цены и расположения'],
      cons: ['Меньше новостроек, чем в соседних районах', 'Часть домов далеко от моря'],
      infra: ['Набережная и пляж', 'Рестораны у реки Димчай', 'Супермаркеты', 'Школы в соседнем Оба'] },
    kestel: { in: 'Кестеле', sc: { life: 4, rent: 4, beach: 4, infra: 4, quiet: 3 },
      lead: 'Новые комплексы у моря, развитая набережная и удобная дорога в центр.',
      pros: ['Много новостроек у моря', 'Набережная для прогулок', '7 км до центра'],
      cons: ['Шоссе вдоль моря отделяет часть района от пляжа', 'Меньше магазинов, чем в Махмутларе'],
      infra: ['Пляж и набережная', 'Супермаркеты', 'Кафе и рестораны', 'Автобусы в центр и Махмутлар'] },
    mahmutlar: { in: 'Махмутларе', sc: { life: 5, rent: 4, beach: 4, infra: 5, quiet: 2 },
      lead: 'Самый большой район для иностранцев: всё на месте, много русскоговорящих соседей.',
      pros: ['Всё для жизни: магазины, рынки, клиники, кафе', 'Большое русскоговорящее сообщество', 'Длинная набережная и квартиры на любой бюджет'],
      cons: ['Плотная застройка, много похожих комплексов', '9,5 км до центра'],
      infra: ['Набережная и пляжи', 'Рынки и супермаркеты', 'Клиники и аптеки', 'Школы и детские сады', 'Регулярные автобусы в центр'] },
    kargicak: { in: 'Каргыджаке', sc: { life: 3, rent: 3, beach: 3, infra: 3, quiet: 5 },
      lead: 'Виллы и комплексы на склонах с видом на море: спокойно и зелено.',
      pros: ['Вид на море с большинства участков', 'Тишина и зелень', 'Виллы и пентхаусы премиум-класса'],
      cons: ['Крутые склоны: без машины неудобно', 'Магазины и школы в соседнем Махмутларе'],
      infra: ['Пляжи вдоль шоссе', 'Небольшие магазины', 'Рестораны у моря', 'Махмутлар в 5 км'] },
    demirtas: { in: 'Демирташе', sc: { life: 2, rent: 3, beach: 4, infra: 2, quiet: 5 },
      lead: 'Тихий посёлок на востоке с пляжами и видами на горы; цены ниже, чем ближе к центру.',
      pros: ['Цены ниже среднего по Аланье', 'Пляжи и мало туристов', 'Ближе к аэропорту Газипаша'],
      cons: ['До центра 22 км', 'Мало инфраструктуры зимой'],
      infra: ['Пляжи', 'Магазины и кафе', 'Сельский рынок', 'Автобусы в Аланью и Газипашу'] },
    gazipasa: { in: 'Газипаше', sc: { life: 3, rent: 2, beach: 4, infra: 3, quiet: 5 },
      lead: 'Отдельный город рядом с аэропортом GZP: новая марина, спокойная жизнь и самые доступные цены на побережье.',
      pros: ['Аэропорт Газипаша-Аланья рядом', 'Самые доступные цены на побережье', 'Спокойная жизнь небольшого города'],
      cons: ['До Аланьи 43 км', 'Меньше выбора готового жилья'],
      infra: ['Аэропорт Газипаша-Аланья', 'Марина', 'Городской рынок и магазины', 'Государственная больница', 'Пляжи'] }
  };
  DISTRICTS.forEach(d => Object.assign(d, GUIDE[d.slug]));

  // Схема побережья по карте районов: запад → крепость → восток до Газипаши
  const COAST = 'M0 88 C40 94 70 114 110 126 C160 122 220 122 300 130 C360 134 420 136 452 150 C468 162 476 190 490 204 C502 212 512 196 514 172 C528 152 560 148 592 152 C622 160 652 176 692 196 C732 216 762 240 802 268 C842 292 882 318 922 340 C952 356 976 370 1000 382';
  const MOUNTAINS = ['M0 40 C120 20 220 60 330 36 S560 10 700 44 S900 70 1000 60', 'M0 62 C140 44 250 80 380 58 S600 40 760 76 S930 110 1000 104', 'M380 30 C420 10 480 12 520 34 S470 64 380 30Z'];

  const L = (o) => Object.assign({ deal: 'sale', status: 'published', photos: 12, checked: '24.09.2026', source: 'developer', badges: [], furnished: false, seaView: false, newBuild: false }, o);
  const SEED = [
    L({ id: 1031, type: 'penthouse', district: 'center', title: 'Пентхаус 3+1 с террасой и видом на крепость', rooms: '3+1', area: 140, floor: 6, floors: 6, sea: 350, price: 258500, img: '1600607687939-ce8a6c25118c', badges: ['sea'], seaView: true, furnished: true, source: 'owner' }),
    L({ id: 1030, type: 'apartment', district: 'oba', title: 'Квартира 2+1 с просторной террасой', rooms: '2+1', area: 120, floor: 5, floors: 7, sea: 700, price: 212000, img: '1502672260266-1c1ef2d93688', badges: ['new'], newBuild: true }),
    L({ id: 1029, type: 'apartment', district: 'mahmutlar', title: 'Апартаменты 1+1 на первой линии', rooms: '1+1', area: 60, floor: 2, floors: 8, sea: 50, price: 118000, img: '1522708323590-d24dbb6b0267', badges: ['sea'], seaView: true, furnished: true }),
    L({ id: 1028, type: 'apartment', district: 'kestel', title: 'Квартира 2+1 в новом комплексе у моря', rooms: '2+1', area: 105, floor: 3, floors: 9, sea: 250, price: 189000, img: '1560185007-cde436f6a4d0', badges: ['new'], newBuild: true }),
    L({ id: 1027, type: 'apartment', district: 'center', title: 'Квартира 2+1 с мебелью в центре', rooms: '2+1', area: 90, floor: 3, floors: 5, sea: 600, price: 101000, img: '1560448204-e02f11c3d0e2', furnished: true, source: 'owner' }),
    L({ id: 1026, type: 'duplex', district: 'kargicak', title: 'Дуплекс 3+1 с видом на море', rooms: '3+1', area: 165, floor: 7, floors: 8, sea: 900, price: 239000, img: '1600566753190-17f0baa2a6c3', badges: ['sea'], seaView: true }),
    L({ id: 1025, type: 'apartment', district: 'tosmur', title: 'Студия 1+0 для сдачи в аренду', rooms: '1+0', area: 45, floor: 4, floors: 6, sea: 300, price: 79500, img: '1493809842364-78817add7ffb', furnished: true }),
    L({ id: 1024, type: 'villa', district: 'kargicak', title: 'Вилла 4+1 с бассейном и панорамой моря', rooms: '4+1', area: 225, floor: 3, floors: 3, sea: 900, price: 352000, img: '1512917774080-9991f1c4c750', badges: ['sea'], seaView: true }),
    L({ id: 1023, type: 'apartment', district: 'avsallar', title: 'Квартира 1+1 у песчаного пляжа', rooms: '1+1', area: 58, floor: 1, floors: 5, sea: 200, price: 96000, img: '1484154218962-a197022b5858', badges: ['new'], newBuild: true }),
    L({ id: 1032, type: 'apartment', district: 'mahmutlar', title: 'Квартира 2+1 с видом на море в комплексе с аквапарком', rooms: '2+1', area: 110, floor: 7, floors: 12, sea: 300, price: 169000, img: '1600210492486-724fe5c67fb0', badges: ['sea'], seaView: true, furnished: true }),
    L({ id: 1033, type: 'apartment', district: 'mahmutlar', title: 'Квартира 1+1 в новом комплексе у набережной', rooms: '1+1', area: 62, floor: 3, floors: 10, sea: 150, price: 112000, img: '1586023492125-27b2c045efd7', badges: ['new'], newBuild: true }),
    L({ id: 1034, type: 'penthouse', district: 'mahmutlar', title: 'Пентхаус 3+1 с террасой на крыше', rooms: '3+1', area: 175, floor: 9, floors: 9, sea: 450, price: 245000, img: '1567496898669-ee935f5f647a', badges: ['sea'], seaView: true, source: 'owner' }),
    L({ id: 1035, type: 'apartment', district: 'oba', title: 'Квартира 1+1 рядом с торговым центром', rooms: '1+1', area: 65, floor: 2, floors: 6, sea: 800, price: 128000, img: '1560448204-e02f11c3d0e2', furnished: true, source: 'owner' }),
    L({ id: 1036, type: 'apartment', district: 'oba', title: 'Квартира 3+1 для семьи в комплексе с бассейном', rooms: '3+1', area: 150, floor: 4, floors: 8, sea: 600, price: 268000, img: '1484154218962-a197022b5858', badges: ['new'], newBuild: true }),
    L({ id: 2012, deal: 'rent', type: 'apartment', district: 'mahmutlar', title: 'Квартира 1+1 с мебелью на длительный срок', rooms: '1+1', area: 65, floor: 4, floors: 10, sea: 150, price: 650, img: '1586023492125-27b2c045efd7', furnished: true, rent: { period: 'long', deposit: 650, minTerm: 6, from: '01.10.2026', utilities: false, pets: true } }),
    L({ id: 2011, deal: 'rent', type: 'apartment', district: 'oba', title: 'Квартира 2+1 в комплексе с бассейном', rooms: '2+1', area: 110, floor: 2, floors: 6, sea: 900, price: 900, img: '1600210492486-724fe5c67fb0', furnished: true, rent: { period: 'long', deposit: 900, minTerm: 12, from: '15.10.2026', utilities: false, pets: false } }),
    L({ id: 2010, deal: 'rent', type: 'penthouse', district: 'center', title: 'Пентхаус 3+1 с видом на море', rooms: '3+1', area: 160, floor: 8, floors: 8, sea: 400, price: 1600, img: '1567496898669-ee935f5f647a', badges: ['sea'], seaView: true, furnished: true, rent: { period: 'long', deposit: 3200, minTerm: 12, from: '01.11.2026', utilities: false, pets: false } })
  ];

  // lat/lng районов — точки OpenStreetMap (Nominatim, 25.09.2026); clat/clng — примерно у берега.
  // Точка у берега: смещение вдоль побережья dx (градусы) + расстояние до моря вглубь суши
  const nearCoast = (d, sea, u) => {
    if (d.inland) { const a = u * 6.283; return [d.lat + Math.sin(a) * 0.006, d.lng + Math.cos(a) * 0.008]; }
    const dx = (u - 0.5) * 0.024; return [d.clat + d.slope * dx + (sea || 300) / 111000 * 0.95, d.clng + dx];
  };

  // Дополнительные демо-объекты для каталога (детерминированный генератор, одинаковый при каждой загрузке)
  (function () {
    let seed = 7; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const pick = a => a[Math.floor(r() * a.length)];
    const INT = ['1502672260266-1c1ef2d93688', '1522708323590-d24dbb6b0267', '1560185007-cde436f6a4d0', '1484154218962-a197022b5858', '1586023492125-27b2c045efd7', '1600210492486-724fe5c67fb0', '1567496898669-ee935f5f647a', '1560448204-e02f11c3d0e2', '1493809842364-78817add7ffb', '1600607687939-ce8a6c25118c'];
    const VIL = ['1512917774080-9991f1c4c750', '1600596542815-ffad4c1539a9', '1613490493576-7fde63acd811', '1600585154340-be6161a56a0c', '1600566753190-17f0baa2a6c3'];
    const ROOMS = { apartment: ['1+0', '1+1', '1+1', '2+1', '2+1', '3+1'], penthouse: ['2+1', '3+1', '4+1'], villa: ['3+1', '4+1', '5+1'], duplex: ['3+1', '4+1'] };
    const AREA = { '1+0': 42, '1+1': 58, '2+1': 95, '3+1': 140, '4+1': 200, '5+1': 280 };
    const TITLE = { apartment: ['Квартира {r} в комплексе с бассейном', 'Квартира {r} с видом на горы', 'Квартира {r} рядом с пляжем', 'Квартира {r} с мебелью'], penthouse: ['Пентхаус {r} с террасой на крыше', 'Пентхаус {r} с панорамой моря'], villa: ['Вилла {r} с частным бассейном', 'Вилла {r} с садом и видом на море'], duplex: ['Дуплекс {r} в новом комплексе'] };
    const slugs = DISTRICTS.map(d => d.slug);
    for (let i = 0; i < 52; i++) {
      const rent = i % 5 === 4;
      const type = rent ? pick(['apartment', 'apartment', 'penthouse']) : pick(['apartment', 'apartment', 'apartment', 'penthouse', 'villa', 'duplex']);
      const sl = pick(slugs), d = DISTRICTS.find(x => x.slug === sl);
      const rooms = pick(ROOMS[type]);
      const area = Math.round(AREA[rooms] * (0.85 + r() * 0.35));
      const sea = d.inland ? Math.round((d.slug === 'tepe' ? 3000 + r() * 2000 : 1500 + r() * 1000) / 100) * 100 : type === 'villa' ? 400 + Math.round(r() * 1400) : Math.round((50 + r() * 1500) / 10) * 10;
      const k = (sea < 200 ? 1.18 : sea < 600 ? 1.05 : 0.92) * (type === 'villa' ? 1.1 : type === 'penthouse' ? 1.08 : 1);
      const price = rent ? Math.round(area * (7 + r() * 5) / 10) * 10 : Math.round(d.pm * area * k * (0.9 + r() * 0.2) / 500) * 500;
      const seaView = sea < 400 || r() > (d.inland ? 0.4 : 0.7), newBuild = r() > 0.55, floors = type === 'villa' ? 2 + Math.round(r()) : 5 + Math.round(r() * 7);
      const o = L({ id: (rent ? 2100 : 1100) + i, deal: rent ? 'rent' : 'sale', type, district: d.slug, rooms, area, sea, price,
        title: pick(TITLE[type]).replace('{r}', rooms), floor: type === 'villa' ? floors : 1 + Math.floor(r() * floors), floors,
        img: type === 'villa' ? pick(VIL) : pick(INT), seaView, newBuild, furnished: rent || r() > 0.5, source: r() > 0.7 ? 'owner' : 'developer',
        photos: 6 + Math.floor(r() * 20), checked: `${10 + Math.floor(r() * 15)}.09.2026`,
        lat: 0, lng: 0 });
      [o.lat, o.lng] = nearCoast(d, sea, r());
      if (seaView) o.title = o.title.replace('с видом на горы', 'с видом на море');
      else o.title = o.title.replace('с панорамой моря', 'с видом на горы').replace('с садом и видом на море', 'с садом');
      o.badges = [newBuild && 'new', seaView && 'sea'].filter(Boolean);
      if (rent) o.rent = { period: 'long', deposit: price, minTerm: pick([6, 12]), from: `${1 + Math.floor(r() * 27)}.1${Math.floor(r() * 2)}.2026`, utilities: false, pets: r() > 0.5 };
      SEED.push(o);
    }
  })();

  // Команда: имена вымышленные, фото — стоковые снимки Unsplash «для примера». Заменить на реальных сотрудников
  const TEAM_BASE = [
    { id: 'founder', name: 'Эмре Йылдыз', role: 'Основатель', langs: 'TR · RU · EN', img: '1590735627513-59a186ed0984', exp: 14, areas: ['center', 'oba', 'tepe'],
      spec: 'Стратегия, партнёрства с застройщиками, сложные сделки',
      bio: 'Родился в Аланье, 14 лет в недвижимости. Начинал менеджером у застройщика, в 2019 году основал Kleo Homes, чтобы иностранцам было проще покупать жильё честно и без сюрпризов. Лично ведёт сделки с виллами и объектами премиум-класса.' },
    { id: 'expert1', name: 'Анна Соколова', role: 'Эксперт по недвижимости', langs: 'RU · EN', img: '1573496359142-b8d87734a5a2', exp: 8, areas: ['mahmutlar', 'kestel', 'kargicak'],
      spec: 'Квартиры у моря, покупка удалённо, показы по видео',
      bio: 'Переехала в Аланью в 2017 году и сама прошла путь покупки квартиры. Помогает покупателям из России, Казахстана и Европы выбрать район, проверить объект и провести сделку по доверенности.' },
    { id: 'lawyer', name: 'Мурат Кая', role: 'Юрист', langs: 'TR · RU', img: '1589386417686-0d34b5903d23', exp: 11, areas: [],
      spec: 'Проверка ТАПУ, договоры, ВНЖ и гражданство',
      bio: 'Член коллегии адвокатов Антальи (демо). Проверяет документы по каждому объекту до брони, сопровождает регистрацию ТАПУ и оформление ВНЖ. Пишет в журнал о законах и налогах.' },
    { id: 'expert2', name: 'Елена Демир', role: 'Эксперт по недвижимости', langs: 'RU · TR', img: '1573497019940-1c28c88b4f3e', exp: 6, areas: ['oba', 'cikcilli', 'tosmur'],
      spec: 'Жильё для жизни круглый год, семьи с детьми',
      bio: 'Живёт в Оба с семьёй, знает школы, клиники и районы для постоянной жизни. Подбирает квартиры для тех, кто переезжает в Аланью насовсем.' },
    { id: 'expert3', name: 'Даниэль Мартен', role: 'Эксперт по аренде', langs: 'EN · RU', img: '1614023342667-6f060e9d1e04', exp: 7, areas: ['center', 'konakli', 'avsallar'],
      spec: 'Долгосрочная аренда, доходность, управление арендой',
      bio: 'Отвечает за аренду и управление объектами клиентов. Считает доходность до покупки и находит арендаторов на длительный срок.' },
    { id: 'expert4', name: 'Амина Арслан', role: 'Эксперт по новостройкам', langs: 'RU · EN · TR', img: '1573497491765-dccce02b29df', exp: 5, areas: ['kestel', 'demirtas', 'gazipasa'],
      spec: 'Новостройки и рассрочка от застройщиков',
      bio: 'Работает напрямую с застройщиками-партнёрами: знает сроки сдачи, условия рассрочки и репутацию каждого проекта. Проверяет разрешения на строительство до брони.' }
  ];
  // Чем помогает эксперт и отзывы клиентов о нём — ДЕМО для страниц member.html
  const TEAM_MORE = {
    founder: { help: ['Сделки с виллами и объектами премиум-класса', 'Переговоры о цене с застройщиками и собственниками', 'Покупка нескольких объектов под гражданство', 'Сложные случаи: наследство, доли, перепланировки'],
      reviews: [['Олег и Марина', '07.2026', 'Эмре лично вёл покупку виллы в Тепе: договорился о скидке 18 000 € и нашёл проблему с разрешением на бассейн до сделки.'], ['Stefan', '04.2026', 'Professional and honest. Emre explained every risk before we paid the deposit.']] },
    expert1: { help: ['Подбор квартиры у моря под бюджет и цель', 'Показы по видеосвязи в реальном времени', 'Покупка удалённо по доверенности', 'Сравнение 2–3 районов под ваш образ жизни'],
      reviews: [['Анна и Игорь', '08.2026', 'Купили квартиру в Махмутларе, ни разу не прилетев: Анна показала 6 квартир по видео и честно сказала, где сыро и где шумно.'], ['Дмитрий', '06.2026', 'Спокойно, по делу и без давления. Смета расходов совпала до евро.']] },
    lawyer: { help: ['Проверка ТАПУ, долгов и обременений до брони', 'Договоры с застройщиками и собственниками', 'Регистрация права собственности', 'ВНЖ и гражданство для всей семьи'],
      reviews: [['Светлана', '06.2026', 'Мурат нашёл долг по коммунальным у продавца и добился, чтобы его погасили до сделки.'], ['Азамат', '05.2026', 'Оформили ВНЖ на семью из четырёх человек за 5 недель, все документы подготовили за нас.']] },
    expert2: { help: ['Квартиры для жизни круглый год', 'Выбор района рядом со школами и клиниками', 'Помощь с переездом: коммунальные услуги, страховка, школа', 'Поиск квартир с садом и для семей с детьми'],
      reviews: [['Семья Ковалёвых', '08.2026', 'Елена подсказала, в какой школе есть русскоязычный класс, и подобрала квартиру в 10 минутах от неё.'], ['Ирина', '03.2026', 'Помогла не только купить, но и переехать: свет, вода, интернет — всё за два дня.']] },
    expert3: { help: ['Расчёт доходности до покупки', 'Долгосрочная и сезонная аренда', 'Поиск арендаторов и проверка договоров', 'Управление квартирой, пока вы не в Турции'],
      reviews: [['Markus', '07.2026', 'Daniel found long-term tenants in two weeks and sends a clear monthly report.'], ['Алексей', '02.2026', 'Честно посчитал доходность, без обещаний «10% годовых». Квартира сдаётся с первого месяца.']] },
    expert4: { help: ['Новостройки напрямую от застройщиков-партнёров', 'Беспроцентная рассрочка на 12–36 месяцев', 'Проверка разрешений и репутации застройщика', 'Контроль стройки и приёмка квартиры'],
      reviews: [['Гульнара', '05.2026', 'Амина показала три проекта и объяснила, почему один из них лучше не брать. Купили в рассрочку на 24 месяца.'], ['Павел', '01.2026', 'Каждый месяц присылала фото со стройки, приёмку провели вместе — все замечания исправили до ТАПУ.']] }
  };
  // kind: founder — отдельный блок на странице команды, expert — ведёт объекты, lawyer — юрист; order — порядок на сайте
  TEAM_BASE.forEach((t, i) => Object.assign(t, TEAM_MORE[t.id], { kind: t.id === 'founder' ? 'founder' : t.id === 'lawyer' ? 'lawyer' : 'expert', order: i * 10 }));
  const TEAM_PAGE = {
    title: 'Команда Kleo Homes',
    lead: 'Агентство недвижимости в Алании с 2019 года. Помогаем выбрать, проверить и купить жильё — лично или удалённо — и не пропадаем после сделки.',
    quote: 'Хочу, чтобы покупка квартиры в Турции была такой же понятной, как дома: с честной ценой, проверенными документами и людьми, которые отвечают на звонки после сделки.',
    stats: [['2019', 'год основания'], ['', 'специалистов в команде'], ['RU · EN · TR', 'языки общения'], ['12', 'застройщиков-партнёров']] // пустое значение — посчитать автоматически
  };
  const PHOTOS = {
    office: '1559136555-9303baea8ebd', officeAlt: '1715593949273-09009558300a',
    license: '1638636241638-aef5120c5153', awards: '1578269174936-2709b6aeb913'
  };
  const NOBODY = { id: '', name: 'Kleo Homes', role: 'Агентство недвижимости', langs: 'RU · EN · TR', img: PHOTOS.office, areas: [], help: [], reviews: [] };
  const agentFor = o => { const experts = TEAM.filter(t => t.kind === 'expert'); return experts.length ? experts[(o.id || 0) % experts.length] : TEAM[0] || NOBODY; };
  // сотрудник по имени (с учётом прежних имён после переименования в админке)
  const byName = name => name && TEAM.find(t => t.name === name || (t.aka || []).includes(name));

  const P = (o) => Object.assign({ status: 'published', lang: { ru: true, en: false, tr: false }, author: 'Редакция Kleo Homes' }, o);
  const POSTS = [
    P({ id: 501, kind: 'article', cat: 'Рынок и цены', title: 'Цены на недвижимость в Алании в 2026 году: районы и цена за м²', date: '2026-09-24', mins: 8, img: '1560518883-ce09059eeffa' }),
    P({ id: 502, kind: 'article', cat: 'Законы', title: 'Сколько стоит покупка сверх цены квартиры: налоги, ТАПУ, DASK', date: '2026-09-18', mins: 6, img: '1554224155-6726b3ff858f' }),
    P({ id: 503, kind: 'article', cat: 'Жизнь в Алании', title: 'Махмутлар, Оба или Кестель: где жить круглый год', date: '2026-09-10', mins: 10, img: '1600585154340-be6161a56a0c' }),
    P({ id: 601, kind: 'news', cat: 'Курсы валют', title: 'Курс лиры к евро на 25 сентября 2026 (демо)', date: '2026-09-25', source: 'tcmb.gov.tr', img: '1726820432863-3ebdb3426d8b' }),
    P({ id: 602, kind: 'news', cat: 'ВНЖ и гражданство', title: 'Миграционная служба обновила список открытых районов для ВНЖ (демо)', date: '2026-09-22', source: 'goc.gov.tr', img: '1581553673739-c4906b5d0de8' }),
    P({ id: 603, kind: 'news', cat: 'Новости агентства', title: 'Kleo Homes открывает шоурум в Махмутларе (демо)', date: '2026-09-15', img: '1715593949273-09009558300a' })
  ];

  // ---------- хранилище ----------
  const get = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  // set возвращает false, если браузер не дал записать (закончилось место, приватный режим)
  const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  const setOrThrow = (k, v) => { if (!set(k, v)) throw new Error('storage-full'); };

  // Отзывы об агентстве (ДЕМО). Вместе с отзывами о сотрудниках (TEAM[].reviews) показываются на reviews.html и главной.
  // service: buy — покупка, rent — аренда и управление, docs — ВНЖ и документы, sell — продажа
  const REVIEWS_EXTRA = [
    { who: 'Markus', country: 'Германия', date: '07.2026', rating: 5, service: 'buy', expert: 'expert2', text: 'Показали и минусы объекта, и расходы до брони. Никаких сюрпризов на сделке.' },
    { who: 'Светлана', country: 'Россия', date: '06.2026', rating: 5, service: 'docs', expert: 'lawyer', text: 'Помогли после покупки: подключили свет и воду, оформили страховку и ВНЖ.' },
    { who: 'Ерлан', country: 'Казахстан', date: '09.2026', rating: 5, service: 'buy', expert: 'expert4', text: 'Купили 2+1 в Кестеле в рассрочку на 24 месяца. Застройщика проверили заранее, дом сдали в срок.' },
    { who: 'Ольга', country: 'Беларусь', date: '05.2026', rating: 4, service: 'rent', expert: 'expert3', text: 'Сняли квартиру в Оба на год. Всё быстро и честно, но договор на английском пришлось ждать несколько дней.' },
    { who: 'Jonas', country: 'Швеция', date: '04.2026', rating: 5, service: 'sell', expert: 'founder', text: 'Продали мою квартиру в Тосмуре за два месяца. Фото, видео и показы — без моего участия, я был в Стокгольме.' },
    { who: 'Татьяна', country: 'Россия', date: '03.2026', rating: 5, service: 'buy', expert: 'expert1', text: 'Выбирали между Махмутларом и Каргыджаком. Анна честно сравнила районы и отговорила от квартиры у шумной дороги.' },
    { who: 'Ахмет', country: 'Турция', date: '02.2026', rating: 4, service: 'sell', expert: 'founder', text: 'Продажа прошла быстро и прозрачно. Хотелось бы больше показов в первый месяц, но итоговой ценой доволен.' },
    { who: 'Игорь', country: 'Украина', date: '01.2026', rating: 5, service: 'docs', expert: 'lawyer', text: 'Оформили гражданство за покупку двух квартир. Юрист вёл всё от оценки до паспорта, сроки совпали с обещанными.' }
  ];

  // команда: базовые данные + правки из админки (kh_team); скрытые не показываются на сайте
  function teamAll() {
    const byId = new Map(TEAM_BASE.map(t => [t.id, t]));
    get('kh_team', []).forEach(t => byId.set(t.id, Object.assign({}, byId.get(t.id) || {}, t, { local: true, base: byId.has(t.id) })));
    return [...byId.values()].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  }
  const TEAM = teamAll().filter(t => !t.hidden);
  function saveMember(m) {
    const clean = Object.assign({}, m); delete clean.local; delete clean.base;
    const local = get('kh_team', []).filter(x => x.id !== m.id); local.push(clean); setOrThrow('kh_team', local);
  }
  const resetMember = id => set('kh_team', get('kh_team', []).filter(x => x.id !== id));
  const teamPage = () => Object.assign({}, TEAM_PAGE, get('kh_teampage', {}));
  // все отзывы: о сотрудниках (редактируются в админке «Команда») + об агентстве; без повторов, новые сверху
  const ym = d => { const [m, y] = String(d || '').split('.'); return (+y || 0) * 100 + (+m || 0); };
  function reviews() {
    const SVC = { lawyer: 'docs', expert3: 'rent' };
    const list = TEAM.flatMap(t => (t.reviews || []).map(([who, date, text]) => ({ who, date, text, rating: 5, service: SVC[t.id] || (t.kind === 'lawyer' ? 'docs' : 'buy'), expert: t.id })))
      .concat(REVIEWS_EXTRA.map(r => Object.assign({}, r, { expert: TEAM.some(t => t.id === r.expert) ? r.expert : null })));
    const seen = new Set();
    return list.filter(r => { const k = r.who + r.date; if (seen.has(k)) return false; seen.add(k); return true; }).sort((a, b) => ym(b.date) - ym(a.date));
  }

  function allObjects() {
    const local = get('kh_objects', []);
    const byId = new Map(SEED.map(o => [o.id, o]));
    local.forEach(o => byId.set(o.id, Object.assign({}, byId.get(o.id) || {}, o, { local: true })));
    return [...byId.values()].sort((a, b) => b.id - a.id);
  }
  function saveObject(o) {
    const local = get('kh_objects', []).filter(x => x.id !== o.id);
    local.push(o); setOrThrow('kh_objects', local);
  }
  function nextId(deal) {
    const ids = allObjects().filter(o => o.deal === deal).map(o => o.id);
    return Math.max(deal === 'rent' ? 2000 : 1000, ...ids) + 1;
  }

  function postStatus(p) {
    if (p.status === 'draft') return 'draft';
    return new Date(p.date) > new Date() ? 'scheduled' : 'published';
  }
  function allPosts() {
    const local = get('kh_posts', []);
    const byId = new Map(POSTS.map(p => [p.id, p]));
    local.forEach(p => byId.set(p.id, Object.assign({}, byId.get(p.id) || {}, p, { local: true })));
    return [...byId.values()].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.date.localeCompare(a.date));
  }
  function savePost(p) {
    const local = get('kh_posts', []).filter(x => x.id !== p.id);
    local.push(p); setOrThrow('kh_posts', local);
  }

  // Фото объекта: загруженные в админке или обложка + демо-интерьеры. Одна функция для карточки и страницы,
  // чтобы «N фото» на карточке совпадало с галереей
  const EXTRA = ['1502672260266-1c1ef2d93688', '1522708323590-d24dbb6b0267', '1560185007-cde436f6a4d0', '1484154218962-a197022b5858', '1586023492125-27b2c045efd7', '1600210492486-724fe5c67fb0'];
  function gallery(o, w = 1400) {
    if ((o.gallery || []).length) return o.gallery;
    return [o.cover || IMG(o.img, w)].concat(EXTRA.filter(x => x !== o.img).map(x => IMG(x, w)));
  }

  // Контакты и реквизиты агентства — ВЫДУМАННЫЕ, для прототипа (список замен: docs/demo-data.md).
  // Телефон с кодом 500 в Турции не выдаётся, поэтому ссылка WhatsApp никуда не ведёт.
  const COMPANY = {
    phone: '+90 500 111 11 11', tel: '+905001111111', wa: '905001111111', tg: 'kleohomes',
    email: 'info@kleohomes.com', address: 'Saray Mah., Atatürk Cad. № 11, 07400 Alanya / Antalya',
    hours: 'Пн–сб 9:00–19:00', license: '1111111',
    showroom: 'Barbaros Cad. № 11, Mahmutlar, 07450 Alanya / Antalya',
    legal: 'Kleo Homes Gayrimenkul Ltd. Şti.', taxOffice: 'Alanya', taxNo: '1111111111', verbis: '1111111'
  };

  window.KH = {
    COMPANY, gallery,
    IMG, TYPES, DISTRICTS, SEED, POSTS, TEAM, PHOTOS, agentFor, get, set, COAST, MOUNTAINS,
    aytKm: d => Math.round(125 + d.pos + (d.inland ? 3 : 0)), // аэропорт Анталии ~125 км на запад от центра
    airportKm: d => Math.max(4, Math.round(Math.abs(38 - d.pos))) + (d.inland ? 2 : 0), // аэропорт GZP ~38 км на восток от центра
    member: id => TEAM.find(t => t.id === id),
    teamAll, memberAny: id => teamAll().find(t => t.id === id), byName, saveMember, resetMember, isBaseMember: id => TEAM_BASE.some(t => t.id === id), baseMember: id => TEAM_BASE.find(t => t.id === id),
    reviews, REVIEW_SERVICES: { buy: 'Покупка', rent: 'Аренда и управление', docs: 'ВНЖ и документы', sell: 'Продажа' },
    TEAM_PAGE, teamPage, saveTeamPage: p => setOrThrow('kh_teampage', p), resetTeamPage: () => localStorage.removeItem('kh_teampage'),
    coords: o => { if (o.lat && o.lng && +o.lat > 30) return [+o.lat, +o.lng]; const d = DISTRICTS.find(x => x.slug === o.district) || DISTRICTS[4]; return nearCoast(d, o.sea, (o.id * 9301 + 49297) % 233280 / 233280); },
    district: slug => DISTRICTS.find(d => d.slug === slug) || { name: slug, slug, pm: 0, km: 0 },
    objects: allObjects,
    published: () => allObjects().filter(o => o.status === 'published'),
    saveObject, nextId,
    posts: allPosts,
    livePosts: () => allPosts().filter(p => postStatus(p) === 'published'),
    postStatus, savePost,
    resetDemo: () => { ['kh_objects', 'kh_posts', 'kh_favs', 'kh_team', 'kh_teampage'].forEach(k => localStorage.removeItem(k)); } // пароль админки не сбрасываем
  };
})();
