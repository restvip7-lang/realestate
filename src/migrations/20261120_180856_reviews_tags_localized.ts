import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Отзывы (имя, страна, текст) и теги статей становятся переводимыми: в английской версии — перевод (владелец 20.11.2026).
// Сгенерированная миграция удаляла столбцы вместе с данными — переписано: текущие значения переносятся в русскую версию.
// Английские переводы заполняет миграция demo_english.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE "reviews_locales" (
    "who" varchar NOT NULL,
    "country" varchar,
    "text" varchar NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );
  ALTER TABLE "reviews_locales" ADD CONSTRAINT "reviews_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "reviews_locales_locale_parent_id_unique" ON "reviews_locales" USING btree ("_locale","_parent_id");
  INSERT INTO "reviews_locales" ("who", "country", "text", "_locale", "_parent_id") SELECT "who", "country", "text", 'ru', "id" FROM "reviews";

  ALTER TABLE "posts_texts" ADD COLUMN "locale" "_locales";
  ALTER TABLE "_posts_v_texts" ADD COLUMN "locale" "_locales";
  UPDATE "posts_texts" SET "locale" = 'ru';
  UPDATE "_posts_v_texts" SET "locale" = 'ru';
  CREATE INDEX "posts_texts_locale_parent" ON "posts_texts" USING btree ("locale","parent_id");
  CREATE INDEX "_posts_v_texts_locale_parent" ON "_posts_v_texts" USING btree ("locale","parent_id");

  ALTER TABLE "reviews" DROP COLUMN "who";
  ALTER TABLE "reviews" DROP COLUMN "country";
  ALTER TABLE "reviews" DROP COLUMN "text";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "reviews" ADD COLUMN "who" varchar;
  ALTER TABLE "reviews" ADD COLUMN "country" varchar;
  ALTER TABLE "reviews" ADD COLUMN "text" varchar;
  UPDATE "reviews" r SET "who" = l."who", "country" = l."country", "text" = l."text" FROM "reviews_locales" l WHERE l."_parent_id" = r."id" AND l."_locale" = 'ru';
  ALTER TABLE "reviews" ALTER COLUMN "who" SET NOT NULL;
  ALTER TABLE "reviews" ALTER COLUMN "text" SET NOT NULL;
  DROP TABLE "reviews_locales" CASCADE;
  DELETE FROM "posts_texts" WHERE "locale" IS DISTINCT FROM 'ru';
  DELETE FROM "_posts_v_texts" WHERE "locale" IS DISTINCT FROM 'ru';
  DROP INDEX "posts_texts_locale_parent";
  DROP INDEX "_posts_v_texts_locale_parent";
  ALTER TABLE "posts_texts" DROP COLUMN "locale";
  ALTER TABLE "_posts_v_texts" DROP COLUMN "locale";`)
}
