import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_assistant_settings_provider" AS ENUM('openai', 'anthropic');
  CREATE TABLE "assistant_limits" (
    "id" serial PRIMARY KEY NOT NULL,
    "bucket" varchar NOT NULL,
    "hits" numeric NOT NULL,
    "expires" timestamp(3) with time zone NOT NULL
  );

  CREATE TABLE "assistant_settings" (
    "id" serial PRIMARY KEY NOT NULL,
    "enabled" boolean DEFAULT false,
    "provider" "enum_assistant_settings_provider" DEFAULT 'openai' NOT NULL,
    "openai_model" varchar DEFAULT 'gpt-6-astra' NOT NULL,
    "anthropic_model" varchar DEFAULT 'claude-sonnet-5-5' NOT NULL,
    "daily_requests" numeric DEFAULT 100 NOT NULL,
    "openai_key" varchar,
    "anthropic_key" varchar,
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );

  ALTER TABLE "leads" ADD COLUMN "assistant_transcript" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "assistant_limits_id" integer;
  CREATE UNIQUE INDEX "assistant_limits_bucket_idx" ON "assistant_limits" USING btree ("bucket");
  CREATE INDEX "assistant_limits_expires_idx" ON "assistant_limits" USING btree ("expires");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_assistant_limits_fk" FOREIGN KEY ("assistant_limits_id") REFERENCES "public"."assistant_limits"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_assistant_limits_id_idx" ON "payload_locked_documents_rels" USING btree ("assistant_limits_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "assistant_limits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "assistant_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_assistant_limits_fk";
  DROP TABLE "assistant_limits" CASCADE;
  DROP TABLE "assistant_settings" CASCADE;

  DROP INDEX "payload_locked_documents_rels_assistant_limits_id_idx";
  ALTER TABLE "leads" DROP COLUMN "assistant_transcript";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "assistant_limits_id";
  DROP TYPE "public"."enum_assistant_settings_provider";`)
}
