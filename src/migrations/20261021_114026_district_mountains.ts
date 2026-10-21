import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

import { fixCikcilliTexts } from '../seed/district-guides'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "districts" ADD COLUMN "mountains" boolean;
   UPDATE "districts" SET "mountains" = true WHERE "slug" = 'tepe';`)
  // Джикджилли не в горах (владелец 21.10.2026): заменить старые тексты «на склоне, 1,5–2,5 км», если их не правили
  const n = await fixCikcilliTexts(payload, req)
  payload.logger.info({ msg: `Джикджилли: обновлено текстов (языков) — ${n}` })
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "districts" DROP COLUMN "mountains";`)
}
