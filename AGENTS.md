# Правила для ИИ-агентов (Claude и ChatGPT/Codex)

Этот репозиторий ведут два ИИ-агента и человек. Файлы `AGENTS.md` и `CLAUDE.md` должны совпадать. Меняешь один — сразу скопируй изменения во второй.

## Проект
Сайт агентства недвижимости в Алании (Турция): каталог объектов, админка для менеджера по объектам, SEO, реклама. Языки: RU (основной), EN, TR.
Сначала прочитай `HANDOFF.md`: там журнал сделанного и следующие шаги. Полный план лежит в `docs/PLAN.md`, бриф — в `docs/brief.md`.
Закончил работу — допиши запись в начало `HANDOFF.md`.

## Стек
- Next.js 16 (App Router) + Payload CMS 3.90 в одном приложении, TypeScript strict. Next 16 отличается от прежних версий (например, `middleware` → `proxy.ts`): прежде чем писать код, сверяйся с `node_modules/next/dist/docs/`.
- PostgreSQL: локально Docker (`docker compose up -d db`), в продакшене Neon через Vercel. Схема меняется только миграциями (`src/migrations`).
- Хостинг: Vercel (сайт и админка), фото в Vercel Blob. Подключение и переменные описаны в `docs/deploy.md`.
- next-intl, маршруты с языковым префиксом: `/ru/...`, `/en/...`, `/tr/...`.
- Стили: CSS прототипа, перенесённый в `src/app/(frontend)/styles/` (токены — CSS-переменные в `base.css`). Tailwind пока не подключён: см. `docs/CLAUDE-NOTES.md`.

## Как работаем вдвоём
1. Перед началом работы открой `docs/TASKS.md`, возьми свободную задачу и впиши в неё свою метку: `[claude]` или `[gpt]`.
2. Работай в своей ветке: `claude/<задача>` или `gpt/<задача>`. В `main` напрямую не коммить.
3. Коммиты маленькие и понятные, сообщения на русском или английском в повелительном наклонении.
4. Не редактируй файлы, которые другой агент сейчас меняет в своей задаче. Если без этого никак, оставь заметку в `docs/TASKS.md`.
5. Уже применённые миграции БД не переписывай, только добавляй новые.
6. Решения по дизайну, текстам и SEO записывай в `docs/`, а не только в чат.
7. Никаких секретов в git: ключи хранятся в `.env` (пример в `.env.example`).

## Файлы обмена между ИИ
- `docs/GPT-IDEAS.md` — предложения и результаты проверок ChatGPT. Пишет **только ChatGPT**, Claude читает.
- `docs/CLAUDE-NOTES.md` — ответы и предложения Claude. Пишет **только Claude**, ChatGPT читает.
- Новые записи добавляются сверху: дата · тема · статус (`предложение` / `в работе` / `принято` / `отклонено`). У каждого варианта отмечено, что уже проверено ✅ и что ещё требует проверки ⏳; даётся ссылка на запись в файле собеседника.
- Чужой файл обмена не редактируем. Окончательные решения переносим в тематические файлы (`docs/brand.md` и т. п.) только после согласования с владельцем.
- Начиная работу, прочитай `HANDOFF.md` и файл обмена собеседника.

## Общая папка и git worktree
Основная папка общая: если в ней переключить ветку, она переключится у обоих. Поэтому:
- основная папка остаётся на `main` (или на ветке, которую выбрал владелец); чужую ветку не переключай и чужие незакоммиченные файлы не трогай;
- для своей задачи создавай отдельную рабочую копию: `git worktree add ../RealEstate-<агент> -b <агент>/<задача> main`;
- перед коммитом проверь `git branch` и `git status`.

## Структура
```
src/app/(frontend)/[locale]/   публичный сайт (главная, /sale, /rent, /property/[id-slug])
src/app/(frontend)/styles/     CSS, перенесённый из прототипов
src/app/(payload)/             админка Payload (/admin), REST API (/api), загрузка демо (/next/seed)
src/collections/, src/globals/ коллекции и глобалы Payload
src/components/site/           компоненты сайта; src/components/admin/ — дополнения админки
src/lib/                       данные для страниц (data.ts), SEO, форматирование, расходы
src/i18n/                      языки, маршрутизация, словари messages/{ru,en,tr}.json
src/migrations/                миграции БД (только добавлять новые)
src/seed/                      импорт демо-данных прототипа (prototype-data.json)
design/prototypes/             HTML-прототипы (GitHub Pages)
docs/                          план, бриф, дизайн-система, тексты, SEO, деплой
```

## Стиль кода
- Компоненты оформляем как функции, по умолчанию серверные; `"use client"` пишем только там, где без него не обойтись.
- Цвета, отступы и шрифты берутся только из токенов (`docs/design-system.md` = CSS-переменные в `styles/base.css`).
- Каждая публичная страница задаёт `generateMetadata` через `pageMeta()` из `src/lib/seo.ts` (title, description, canonical, hreflang).
- Картинки подключаем только через `next/image`.
- Данные на страницы берём только через `src/lib/data.ts`: там запросы с правами посетителя (`overrideAccess: false`), черновики и служебные поля на сайт не попадают.
- Тексты интерфейса — в `src/i18n/messages/{ru,en,tr}.json`, набор ключей во всех трёх файлах одинаковый.
- Изменил коллекцию или поле → `npm run migrate:create -- <имя>`, потом `npm run migrate`, `npm run generate:types`; миграцию коммитим вместе с кодом.

## Прототипы
- Онлайн: https://restvip7-lang.github.io/realestate/ — GitHub Pages, обновляется автоматически после слияния в `main` (`.github/workflows/pages.yml`). Страницы закрыты от поисковиков (noindex).
- Локально: `python -m http.server 8765` в папке `design/prototypes`, затем http://localhost:8765/

## Команды
Первый запуск: `cp .env.example .env` (заполнить `PAYLOAD_SECRET`), `docker compose up -d db`, `npm install`, `npm run migrate`, `npm run seed`, `npm run dev`. Затем открыть http://localhost:3000/admin и создать первого пользователя: он станет администратором.
- `npm run dev`: сайт на http://localhost:3000/ru, админка на /admin
- `npm run build`: сборка, перед мержем она должна проходить (вместе с `npm run typecheck` и `npm run lint`)
- `npm run migrate` / `npm run migrate:create -- <имя>`: применить / создать миграцию
- `npm run seed` (`-- --reset` — заменить данные): загрузить демо-данные прототипа; то же самое делает кнопка на главной странице админки
- `node scripts/export-prototype-data.mjs`: обновить `src/seed/prototype-data.json` после правок демо-данных в прототипе
- `npm run generate:types`, `npm run generate:importmap`: после изменения коллекций или компонентов админки

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
