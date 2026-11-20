import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

import { STAY_REVIEW_PATTERN } from '../lib/rebrand'
import { applyEnglish, fixHomoglyphs } from '../seed/english'
import { hasRows } from '../seed/team-photos'

// Демо на RU и EN (владелец 20.11.2026): под /en не должно быть русского текста и упоминаний прежней компании.
// Только данные: 1) пустые английские тексты сотрудников, страницы «Команда», контактов, демо-статей и пяти объектов
// (src/seed/english.ts), перевод отзывов и тегов статей; 2) кириллические «двойники» латинских букв в английских и турецких текстах объектов
// («construсtion»); 3) скрыть отзывы, где прежняя компания названа кириллицей («СтэйПроперти»).
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // пустая база (первый запуск): демо-данные загрузит сид, он сам вызывает applyEnglish
  if (!(await hasRows(payload, 'team')) && !(await hasRows(payload, 'posts'))) return
  const n = await applyEnglish(payload, req)

  const { rows } = await db.execute(sql`SELECT "id", "title", "description" FROM "properties_locales" WHERE "_locale" IN ('en', 'tr') AND ("title" ~ '[А-Яа-я]' OR "description" ~ '[А-Яа-я]')`)
  let fixed = 0
  for (const r of rows as { id: number; title: string | null; description: string | null }[]) {
    const title = r.title && fixHomoglyphs(r.title), description = r.description && fixHomoglyphs(r.description)
    if (title === r.title && description === r.description) continue
    await db.execute(sql`UPDATE "properties_locales" SET "title" = ${title}, "description" = ${description} WHERE "id" = ${r.id}`)
    fixed++
  }

  const hidden = await db.execute(sql`UPDATE "reviews" SET "published" = false WHERE "published" IS NOT FALSE AND "id" IN (SELECT "_parent_id" FROM "reviews_locales" WHERE "text" ~* ${STAY_REVIEW_PATTERN} OR "who" ~* ${STAY_REVIEW_PATTERN}) RETURNING "id"`)
  payload.logger.info({ msg: `Английские тексты: записей ${n}; исправлено «двойников» букв — ${fixed}; скрыто отзывов — ${hidden.rows?.length ?? 0}` })
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.info({ msg: 'demo_english: английские тексты остаются, их можно править в админке' })
}
