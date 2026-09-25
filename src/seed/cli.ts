// npm run seed            — загрузить демо-данные в пустую базу
// npm run seed -- --reset — удалить объекты, статьи, команду, районы, отзывы, фото и загрузить заново
import config from '@payload-config'
import { getPayload } from 'payload'

import { seed } from './index'

const payload = await getPayload({ config })
const result = await seed(payload, { reset: process.argv.includes('--reset'), log: (m) => payload.logger.info(m) })
process.exit(result.ok || result.skipped ? 0 : 1)
