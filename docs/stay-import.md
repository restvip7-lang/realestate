# Импорт объектов из Stay Portfolio Service

Статус: **исследование API закончено, код не начат** (07.10.2026). Следующий шаг — пробные запросы на чтение с ключами (см. «Доступ»).

## Решения владельца (07.10.2026)
- Объекты агентства ведутся в **Stay Portfolio Service** (админка https://portfolio.stayrepo.com/lbi-admin/, около 1700 объектов). **Stay — главный источник:** объекты добавляют и правят там, сайт сам их забирает.
- Синхронизация **раз в сутки** (Vercel Cron, бесплатный тариф) плюс кнопка «Обновить сейчас» в админке.
- Демо-объекты на сайте после первого импорта убираем (районы, команда, статьи остаются).
- **Только чтение.** В Stay ничего не удаляем и не меняем. Используем только вход и методы получения данных. На нашем сайте до согласования с владельцем ничего не удаляем.

## Доступ
- В облачной среде Claude разрешён домен `portfolio.stayrepo.com` (Network access → Allowed domains).
- Ключи **не пишем в чат и в git**. Владелец кладёт их в переменные среды Claude (для пробных запросов), а позже в Vercel (для работы сайта):
  - `STAY_JWT` — JWT-токен API-пользователя (выдаёт администратор Stay в панели);
  - `STAY_USERNAME` — логин API-пользователя (e-mail);
  - `STAY_PASSWORD` — пароль;
  - `STAY_API_URL` — по умолчанию `https://portfolio.stayrepo.com/ws`.
- Новый API-пользователь работает в **режиме DEMO** с ограничениями. Для настоящих данных его переводят в «реальный режим» по запросу администратору Stay.

## API (по `https://portfolio.stayrepo.com/ws/swagger/swagger.json`, OpenAPI 3.0.1, и руководству `/ws/swagger/howto/`)
Базовый адрес: `https://portfolio.stayrepo.com/ws`. Во **всех** запросах передаётся заголовок `Authorization: Bearer <STAY_JWT>`.

1. **Вход:** `POST /login/auth`, тело `application/x-www-form-urlencoded`: `username`, `password`. Сервер ставит сессионные cookie, их передаём во всех следующих запросах. Ответ `401` — неверный вход.
2. **Ответ любого метода** — `ApiResponse`: `{ status, statusText, messageCode, messageText, result }`.

| Метод | Что даёт |
|---|---|
| `GET /i18n/list` | языки системы (коды ISO 639-1) |
| `GET /taxonomy/list?language=&tcount=` | таксономии (категории). По руководству: `object_type`, `location`, `rooms_layout`, `amenities`, тип сделки |
| `GET /taxonomy/terms/{taxonomy_id}?language=&nopaging=true` | значения таксономии (районы, типы…) |
| `GET /taxonomy/term/{term_id}` | одно значение |
| `GET /meta/fields?language=` | список дополнительных полей (площадь, этаж, до моря, `year_built`, `citizenship` Y/N…) |
| `POST /objects/query` | список объектов по условиям (JSON, см. ниже) |
| `GET /objects/get/{ID}` | объект целиком. Параметры: `i18n=true` (все языки), `object_meta=true` (доп. поля), `featured_image` и `gallery_images` = `thumbnail`/`medium`/`large`/`full`, `object_terms=1,2,3` (id таксономий) |
| `GET /objects/get_i18n?object_id=&language=&title=&excerpt=&content=` | перевод полей |
| `GET /objects/get_meta?object_id=` | доп. поля объекта |
| `GET /objects/get_terms?object_id=&taxonomy_id=&language=` | значения таксономий объекта |
| `GET /objects/featured_image`, `/objects/gallery_images?object_id=&size=` | фото |

**`POST /objects/query`** (как WordPress WP_Query):
- `language`, `keyword`;
- `order` (`ASC` / `DESC`), `orderby` (`modified` по умолчанию, `ID`, `date`, `title`, `meta_value_num` + `meta_key`…);
- `page`, `paged_options.results_per_page` (1–50, по умолчанию 20);
- `tax_query` / `meta_query` — массивы условий с `relation` `AND` / `OR`.

Пример:
```json
{ "orderby": "ID", "order": "ASC", "page": 1, "paged_options": { "results_per_page": 50 },
  "tax_query": { "0": { "taxonomy": "location", "field": "term_id", "terms": 2, "operator": "IN" } } }
```

## Что видно в админке Stay (скриншот владельца)
- Колонки: ID, Ref. No (`RS1395`, `PH523`, `VL251`, `STYE011`…), Title, Object Type, Offer, Location, Price, Active (Y/N), Status (Publish), даты создания и изменения.
- Заголовок есть на EN и RU.
- Типы: Resale Property, Finished Apartment, Villa, Duplex…
- Сделка: For Sale.
- Районы: Cikcilli, Oba, Kestel, Alanya – Center, Avsallar, Mahmutlar, Payallar, Kargicak…
- Цена: EUR.

## План реализации (после пробных запросов — уточнить сопоставление полей)
1. **Миграция:** у `properties` поля `stayId` (уникальный), `refNo`, `syncedAt`. Поля из Stay при синхронизации перезаписываются. Наши поля (эксперт, метки, SEO, заметки) не трогаются.
2. **`src/lib/stay.ts`:**
   - клиент: вход, хранение cookie, `query` постранично по 50, `get/{ID}` с `i18n` + `object_meta` + фото `large`;
   - повтор при сбое;
   - только методы чтения.
3. **`src/lib/stay-map.ts`:**
   - Object Type / Offer / Location → `type` / `deal` / `district`;
   - неизвестный район или тип попадает в отчёт;
   - доп. поля → комнаты, площадь, этаж, до моря, вид, мебель, гражданство;
   - языки ru / en / tr — какие есть в Stay.
4. **Фото:** в Vercel Blob только новые (ключ — id или URL фото в Stay), повторно не скачиваем.
5. **Синхронизация шагами** (как `runSeedStep` в `src/seed/index.ts`, каждый запрос короче 60 с):
   - upsert по `stayId`;
   - пропавшие или неактивные в Stay объекты получают статус «Снят» (без удаления);
   - в конце сброс кэша (`src/lib/revalidate.ts`).
6. **Запуск:**
   - `/next/stay-sync` — Vercel Cron раз в сутки, защита `CRON_SECRET`;
   - кнопка в админке по образцу `src/components/admin/SeedButton.tsx` с отчётом «добавлено / обновлено / снято / ошибки».
7. **Проверка:**
   - локально с подменным сервером по форме реальных ответов;
   - затем на Vercel сверка 3–5 объектов со Stay.
