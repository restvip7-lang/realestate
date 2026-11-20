import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

import { restoreDirectorPhoto } from '../seed/director'

// Владелец 20.11.2026: «фото верни старое» — у директора снова прежнее фото основателя, описание фото — его имя.
// Только данные (src/seed/director.ts). Фото, выбранное в админке, не трогаем; присланное фото остаётся в «Медиа».
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const done = await restoreDirectorPhoto(payload, req)
  payload.logger.info({ msg: done ? 'Директор: прежнее фото возвращено' : 'Директор: фото уже другое — пропущено' })
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.info({ msg: 'director_old_photo: фото можно сменить в карточке сотрудника' })
}
