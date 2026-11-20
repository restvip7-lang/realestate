import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Имя сотрудника становится переводимым: в английской версии сайта — латиницей (владелец 20.11.2026).
// Сгенерированная миграция удаляла столбец вместе с данными — переписано: имя копируется во все языковые строки,
// и только потом старый столбец удаляется. Английские имена заполняет миграция english_texts.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "team_locales" ADD COLUMN "name" varchar;
    UPDATE "team_locales" l SET "name" = t."name" FROM "team" t WHERE l."_parent_id" = t."id";
    ALTER TABLE "team_locales" ALTER COLUMN "name" SET NOT NULL;
    ALTER TABLE "team" DROP COLUMN "name";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "team" ADD COLUMN "name" varchar;
    UPDATE "team" t SET "name" = l."name" FROM "team_locales" l WHERE l."_parent_id" = t."id" AND l."_locale" = 'ru';
    ALTER TABLE "team" ALTER COLUMN "name" SET NOT NULL;
    ALTER TABLE "team_locales" DROP COLUMN "name";`)
}
