// npm run content:sync — забрать новости, отзывы и услуги из Stay Property (как кнопка в админке). Ключи не нужны.
import config from '@payload-config'
import { getPayload } from 'payload'

import { runContentSync } from '@/lib/content-sync'

const payload = await getPayload({ config })
for (let i = 0; i < 5; i++) {
  const res = await runContentSync(payload)
  payload.logger.info(res.message)
  for (const p of res.problems) payload.logger.warn(p)
  if (res.done) break
}
process.exit(0)
