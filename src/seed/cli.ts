// npm run seed            — загрузить демо-данные (повторный запуск обновит их, дубликатов не будет)
// npm run seed -- --reset — сначала удалить объекты, статьи, команду, районы, отзывы и фото
import config from '@payload-config'
import { getPayload } from 'payload'

import { seedAll } from './index'

const payload = await getPayload({ config })
await seedAll(payload, { reset: process.argv.includes('--reset'), log: (m) => payload.logger.info(m) })
process.exit(0)
