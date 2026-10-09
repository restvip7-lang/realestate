import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_services_group" AS ENUM('free', 'page');
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"group" "enum_services_group" DEFAULT 'page' NOT NULL,
  	"order" numeric,
  	"cover_id" integer,
  	"remote_cover" varchar,
  	"published" boolean DEFAULT true,
  	"slug" varchar,
  	"external_source_id" varchar,
  	"external_modified" varchar,
  	"external_synced_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "services_locales" (
  	"title" varchar NOT NULL,
  	"excerpt" varchar,
  	"body" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "reviews" ALTER COLUMN "rating" DROP NOT NULL;
  ALTER TABLE "posts" ADD COLUMN "remote_cover" varchar;
  ALTER TABLE "posts" ADD COLUMN "external_source_id" varchar;
  ALTER TABLE "posts" ADD COLUMN "external_modified" varchar;
  ALTER TABLE "posts" ADD COLUMN "external_synced_at" timestamp(3) with time zone;
  ALTER TABLE "_posts_v" ADD COLUMN "version_remote_cover" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_external_source_id" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_external_modified" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_external_synced_at" timestamp(3) with time zone;
  ALTER TABLE "reviews" ADD COLUMN "external_source_id" varchar;
  ALTER TABLE "reviews" ADD COLUMN "external_modified" varchar;
  ALTER TABLE "reviews" ADD COLUMN "external_synced_at" timestamp(3) with time zone;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "services" ADD CONSTRAINT "services_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_locales" ADD CONSTRAINT "services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_cover_idx" ON "services" USING btree ("cover_id");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE UNIQUE INDEX "services_external_external_source_id_idx" ON "services" USING btree ("external_source_id");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE UNIQUE INDEX "services_locales_locale_parent_id_unique" ON "services_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "posts_external_external_source_id_idx" ON "posts" USING btree ("external_source_id");
  CREATE INDEX "_posts_v_version_external_version_external_source_id_idx" ON "_posts_v" USING btree ("version_external_source_id");
  CREATE UNIQUE INDEX "reviews_external_external_source_id_idx" ON "reviews" USING btree ("external_source_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "services" CASCADE;
  DROP TABLE "services_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_services_fk";
  
  DROP INDEX "posts_external_external_source_id_idx";
  DROP INDEX "_posts_v_version_external_version_external_source_id_idx";
  DROP INDEX "reviews_external_external_source_id_idx";
  DROP INDEX "payload_locked_documents_rels_services_id_idx";
  ALTER TABLE "reviews" ALTER COLUMN "rating" SET NOT NULL;
  ALTER TABLE "posts" DROP COLUMN "remote_cover";
  ALTER TABLE "posts" DROP COLUMN "external_source_id";
  ALTER TABLE "posts" DROP COLUMN "external_modified";
  ALTER TABLE "posts" DROP COLUMN "external_synced_at";
  ALTER TABLE "_posts_v" DROP COLUMN "version_remote_cover";
  ALTER TABLE "_posts_v" DROP COLUMN "version_external_source_id";
  ALTER TABLE "_posts_v" DROP COLUMN "version_external_modified";
  ALTER TABLE "_posts_v" DROP COLUMN "version_external_synced_at";
  ALTER TABLE "reviews" DROP COLUMN "external_source_id";
  ALTER TABLE "reviews" DROP COLUMN "external_modified";
  ALTER TABLE "reviews" DROP COLUMN "external_synced_at";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "services_id";
  DROP TYPE "public"."enum_services_group";`)
}
