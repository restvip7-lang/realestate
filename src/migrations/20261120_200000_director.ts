import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

import { applyDirector } from '../seed/director'

// Директор Григорий Лазарев вместо вымышленного основателя (владелец 20.11.2026). Только данные, src/seed/director.ts.
// Если карточку основателя уже изменили в админке — миграция её не трогает.
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const done = await applyDirector(payload, req)
  payload.logger.info({ msg: done ? 'Директор: карточка обновлена' : 'Директор: карточка уже изменена или её нет — пропущено' })
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.info({ msg: 'director: прежняя карточка не восстанавливается, её можно поправить в админке' })
}
