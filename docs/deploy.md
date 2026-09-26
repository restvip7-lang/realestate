# Деплой на Vercel

Сайт и админка — одно приложение Next.js + Payload, хостинг Vercel. База — Neon Postgres (через Vercel Marketplace), фото — Vercel Blob.

## Что уже настроено (Claude, 25.09.2026)
- Проект Vercel **kleo-homes** (`prj_OpbUVJDNddddjKZSIJzTi8ZXXcZ7`), аккаунт anuar07, фреймворк Next.js.
- Переменные окружения: `PAYLOAD_SECRET` (случайная строка, зашифрована), `NEXT_PUBLIC_SITE_URL=https://kleo-homes.vercel.app`.
- Хранилище фото **kleo-homes-media** (Vercel Blob, Франкфурт) подключено к проекту, `BLOB_READ_WRITE_TOKEN` добавлен автоматически.
- Сборка на Vercel: скрипт `vercel-build` из `package.json` — сначала `payload migrate` (применяет новые миграции), потом `next build`.

## Сделано 25.09.2026 вечером
- Владелец подключил GitHub (Settings → Git) и создал базу Neon **neon-almond-marble** (Free, Frankfurt), префикс переменных `DATABASE` → `DATABASE_URL`.
- Claude запустил первый деплой `main` (слияние PR #7): сборка и миграции прошли, сайт — https://kleo-homes.vercel.app
- Функции перенесены в регион **fra1** (Франкфурт, рядом с базой), проект пересобран.
- Защита «Vercel Authentication» оставлена только для превью; основной адрес открыт для всех (админка закрыта паролем Payload).
- ⏳ Владелец: создать первого пользователя на /admin и нажать «Загрузить демо-данные».
- Ограничение: у Claude нет доступа к логам сборки и к vercel.app из песочницы — проверку сайта делает владелец с телефона.

## Что делает владелец (один раз)
1. **Подключить GitHub.** Vercel → проект kleo-homes → Settings → Git → Connect Git Repository → GitHub → установить приложение Vercel для аккаунта `restvip7-lang` (достаточно доступа к репозиторию `realestate`) → выбрать `restvip7-lang/realestate`. Production Branch — `main`.
2. **Создать базу.** Vercel → Storage → Create Database → **Neon** (Serverless Postgres) → регион Frankfurt (`eu-central-1`) → бесплатный план → Connect Project → kleo-homes, все окружения (Production, Preview, Development). Интеграция сама добавит `DATABASE_URL`.
3. **Запустить деплой.** После слияния PR с этапом 2 Vercel соберёт `main` сам. До слияния: Deployments → Create Deployment → ветка `claude/modest-hamilton-62z9bd`.
4. **Первый вход.** Открыть https://kleo-homes.vercel.app/admin → создать первого пользователя (он получает роль «Администратор»).
5. **Демо-данные.** На главной странице админки нажать «Загрузить демо-данные» (1–3 минуты: скачивает ~40 фото с Unsplash в Blob). Сайт: https://kleo-homes.vercel.app/ru

## Важно
- **Тариф Hobby — только для некоммерческих проектов.** Для тестов подходит; перед запуском сайта агентства нужен Pro (около 20 $ в месяц за участника) или другой хостинг.
- Пока в «Контактах и реквизитах» стоит галочка «Данные демо», на сайте висит плашка «Демо-версия». Сайт закрыт от поисковиков, пока в Vercel не добавлена переменная `SITE_INDEXABLE=1` (включать только с реальными данными и доменом).
- Превью-деплои других веток используют ту же базу и тоже применяют миграции. Миграции только добавляем, уже применённые не меняем.
- Письма о заявках: добавить в Vercel `LEADS_EMAIL_TO` (куда слать) и SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`). Без SMTP заявки всё равно сохраняются в админке («Продажи → Заявки»), а письмо только пишется в лог.
- `/sitemap.xml`, `/robots.txt`, `/llms.txt` строятся сами из базы (раз в час). Пока нет `SITE_INDEXABLE=1`, robots.txt закрывает весь сайт. После включения добавить сайт и `sitemap.xml` в Google Search Console и Яндекс Вебмастер.
- Свой домен: Vercel → Settings → Domains, затем поменять `NEXT_PUBLIC_SITE_URL`.

## Проверка после деплоя
- `/ru`, `/ru/sale`, `/ru/rent`, `/ru/property/1031` открываются, фото грузятся из `*.public.blob.vercel-storage.com`.
- Заявка с главной появляется в админке «Заявки» с UTM (проверить с `?utm_source=test`).
- Правка объекта в админке сразу видна на сайте.
