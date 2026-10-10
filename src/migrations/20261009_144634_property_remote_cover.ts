import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "properties" ADD COLUMN "remote_cover" varchar;
  UPDATE "properties" SET "remote_cover" = "remote_photos"->>0 WHERE jsonb_typeof("remote_photos") = 'array';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "properties" DROP COLUMN "remote_cover";`)
}
