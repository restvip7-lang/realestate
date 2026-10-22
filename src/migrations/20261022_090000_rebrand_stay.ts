import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

import { REBRAND_RULES } from '../lib/rebrand'

// Сайт для демо (владелец 22.10.2026): «Stay Property» в уже загруженных текстах → Kleo Homes,
// отзывы с похвалой Stay Property — скрыть (не удалять). Новые тексты чистит импорт (src/lib/rebrand.ts).
// Схема не меняется — только данные.
const TEXT: [string, string][] = [
  ['properties_locales', 'title'], ['properties_locales', 'description'], ['properties_locales', 'seo_title'], ['properties_locales', 'seo_description'],
  ['posts_locales', 'title'], ['posts_locales', 'lead'], ['posts_locales', 'seo_title'], ['posts_locales', 'seo_description'],
  ['_posts_v_locales', 'version_title'], ['_posts_v_locales', 'version_lead'],
  ['services_locales', 'title'], ['services_locales', 'excerpt'], ['services_locales', 'seo_title'], ['services_locales', 'seo_description'],
]
// тексты статей и услуг — Lexical (jsonb): название встречается только внутри строк, кавычки и спецсимволы замена не вносит
const JSON_COLS: [string, string][] = [['posts_locales', 'body'], ['_posts_v_locales', 'version_body'], ['services_locales', 'body']]

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  for (const [p, r] of REBRAND_RULES) {
    for (const [t, c] of TEXT) {
      await db.execute(sql`UPDATE ${sql.raw(`"${t}"`)} SET ${sql.raw(`"${c}"`)} = regexp_replace(${sql.raw(`"${c}"`)}, ${p}, ${r}, 'gi') WHERE ${sql.raw(`"${c}"`)} ~* ${p}`)
    }
    for (const [t, c] of JSON_COLS) {
      await db.execute(
        sql`UPDATE ${sql.raw(`"${t}"`)} SET ${sql.raw(`"${c}"`)} = regexp_replace(${sql.raw(`"${c}"`)}::text, ${p}, ${r}, 'gi')::jsonb WHERE ${sql.raw(`"${c}"`)}::text ~* ${p}`,
      )
    }
  }
  const hidden = await db.execute(sql`UPDATE "reviews" SET "published" = false WHERE "published" IS NOT FALSE AND "text" ~* 'stay ?property|виктори' RETURNING "id"`)
  payload.logger.info({ msg: `Stay Property → Kleo Homes: тексты обновлены; скрыто отзывов — ${hidden.rows?.length ?? 0}` })
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.info({ msg: 'rebrand_stay: обратного преобразования нет (тексты вернутся при следующем изменении объекта в Stay)' })
}
