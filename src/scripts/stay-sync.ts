// npm run stay:sync — забрать объекты из Stay Portfolio (как кнопка в админке). Нужны STAY_TOKEN, STAY_USERNAME, STAY_PASSWORD.
// STAY_SYNC_LIMIT=50 npm run stay:sync — тестовый режим: только 50 самых свежих объектов.
import config from '@payload-config'
import { getPayload } from 'payload'

import { newCursor, runStaySync, type StaySyncCursor } from '@/lib/stay-sync'

const payload = await getPayload({ config })
let cursor: StaySyncCursor | null = newCursor()
while (cursor) {
  const res = await runStaySync(payload, cursor)
  payload.logger.info(res.message)
  cursor = res.next
}
process.exit(0)
