import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_properties_type" ADD VALUE 'project';
  ALTER TYPE "public"."enum_properties_rooms" ADD VALUE '5+2' BEFORE '6+1';
  ALTER TYPE "public"."enum_properties_rooms" ADD VALUE '6+2';
  ALTER TYPE "public"."enum_properties_rooms" ADD VALUE '7+1';
  ALTER TYPE "public"."enum_properties_rooms" ADD VALUE '7+2';
  ALTER TYPE "public"."enum_properties_rooms" ADD VALUE '8+1';
  ALTER TYPE "public"."enum_properties_rooms" ADD VALUE '8+2';
  ALTER TABLE "properties" ADD COLUMN "area_to" numeric;
  ALTER TABLE "properties" ADD COLUMN "layouts" varchar;
  ALTER TABLE "properties" ADD COLUMN "price_from" boolean;
  ALTER TABLE "properties" ADD COLUMN "remote_photos" jsonb;
  ALTER TABLE "properties" ADD COLUMN "stay_object_id" numeric;
  ALTER TABLE "properties" ADD COLUMN "stay_ref_no" varchar;
  ALTER TABLE "properties" ADD COLUMN "stay_modified" varchar;
  ALTER TABLE "properties" ADD COLUMN "stay_synced_at" timestamp(3) with time zone;
  ALTER TABLE "properties" ADD COLUMN "stay_tr_hash" varchar;
  CREATE UNIQUE INDEX "properties_stay_stay_object_id_idx" ON "properties" USING btree ("stay_object_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "properties" ALTER COLUMN "type" SET DATA TYPE text;
  DROP TYPE "public"."enum_properties_type";
  CREATE TYPE "public"."enum_properties_type" AS ENUM('apartment', 'penthouse', 'villa', 'duplex', 'land', 'commercial');
  ALTER TABLE "properties" ALTER COLUMN "type" SET DATA TYPE "public"."enum_properties_type" USING "type"::"public"."enum_properties_type";
  ALTER TABLE "properties" ALTER COLUMN "rooms" SET DATA TYPE text;
  DROP TYPE "public"."enum_properties_rooms";
  CREATE TYPE "public"."enum_properties_rooms" AS ENUM('1+0', '1+1', '2+1', '3+1', '3+2', '4+1', '4+2', '5+1', '6+1');
  ALTER TABLE "properties" ALTER COLUMN "rooms" SET DATA TYPE "public"."enum_properties_rooms" USING "rooms"::"public"."enum_properties_rooms";
  DROP INDEX "properties_stay_stay_object_id_idx";
  ALTER TABLE "properties" DROP COLUMN "area_to";
  ALTER TABLE "properties" DROP COLUMN "layouts";
  ALTER TABLE "properties" DROP COLUMN "price_from";
  ALTER TABLE "properties" DROP COLUMN "remote_photos";
  ALTER TABLE "properties" DROP COLUMN "stay_object_id";
  ALTER TABLE "properties" DROP COLUMN "stay_ref_no";
  ALTER TABLE "properties" DROP COLUMN "stay_modified";
  ALTER TABLE "properties" DROP COLUMN "stay_synced_at";
  ALTER TABLE "properties" DROP COLUMN "stay_tr_hash";`)
}
