import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "company" ADD COLUMN "office_photo_id" integer;
  ALTER TABLE "company" ADD COLUMN "license_photo_id" integer;
  ALTER TABLE "company_locales" ADD COLUMN "awards" varchar;
  ALTER TABLE "company" ADD CONSTRAINT "company_office_photo_id_media_id_fk" FOREIGN KEY ("office_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "company" ADD CONSTRAINT "company_license_photo_id_media_id_fk" FOREIGN KEY ("license_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "company_office_photo_idx" ON "company" USING btree ("office_photo_id");
  CREATE INDEX "company_license_photo_idx" ON "company" USING btree ("license_photo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "company" DROP CONSTRAINT "company_office_photo_id_media_id_fk";
  
  ALTER TABLE "company" DROP CONSTRAINT "company_license_photo_id_media_id_fk";
  
  DROP INDEX "company_office_photo_idx";
  DROP INDEX "company_license_photo_idx";
  ALTER TABLE "company" DROP COLUMN "office_photo_id";
  ALTER TABLE "company" DROP COLUMN "license_photo_id";
  ALTER TABLE "company_locales" DROP COLUMN "awards";`)
}
