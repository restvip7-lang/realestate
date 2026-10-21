import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

import { applyDistrictGuides } from '../seed/district-guides'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "districts_guide" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL
  );
  
  ALTER TABLE "districts_guide" ADD CONSTRAINT "districts_guide_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."districts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "districts_guide_order_idx" ON "districts_guide" USING btree ("_order");
  CREATE INDEX "districts_guide_parent_id_idx" ON "districts_guide" USING btree ("_parent_id");
  CREATE INDEX "districts_guide_locale_idx" ON "districts_guide" USING btree ("_locale");`)
  // тексты гидов (черновик, src/seed/district-guides.ts) — только в пустые поля; в новой базе без районов ничего не делает
  const n = await applyDistrictGuides(payload, req)
  payload.logger.info({ msg: `Гиды районов: записано ${n}` })
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "districts_guide" CASCADE;`)
}
