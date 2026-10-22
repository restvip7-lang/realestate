import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

import { applyTeamPhotos } from '../seed/team-photos'

// Фото команды в едином стиле (владелец 22.10.2026): заменить демо-фото на новые кадры из src/seed/team.
// Только данные. На Vercel файлы загружаются в Blob при деплое; если не вышло — в логе предупреждение, деплой идёт дальше.
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const n = await applyTeamPhotos(payload, req)
  payload.logger.info({ msg: `Фото команды: заменено ${n}` })
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.info({ msg: 'team_photos: прежние демо-фото остаются в «Медиа», вернуть можно в карточке сотрудника' })
}
