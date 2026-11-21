import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "properties" ADD COLUMN "closed_at" timestamp(3) with time zone;
  CREATE INDEX "properties_closed_at_idx" ON "properties" USING btree ("closed_at");`)
  // уже проданным и сданным объектам — дата последнего изменения (точной даты продажи в базе нет)
  await db.execute(sql`UPDATE "properties" SET "closed_at" = "updated_at" WHERE "status" IN ('sold', 'rented');`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "properties_closed_at_idx";
  ALTER TABLE "properties" DROP COLUMN "closed_at";`)
}
