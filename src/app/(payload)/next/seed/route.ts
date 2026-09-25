import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import { seed } from '@/seed'

// Загрузка демо-данных из админки. Только для администратора.
// POST /next/seed            — в пустую базу
// POST /next/seed?reset=1    — заменить объекты, статьи, команду, районы, отзывы и фото демо-данными
export const maxDuration = 300 // скачивание ~40 фото и нарезка размеров

export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user || (user as { role?: string }).role !== 'admin') {
    return Response.json({ error: 'Только для администратора' }, { status: 403 })
  }
  const reset = new URL(req.url).searchParams.get('reset') === '1'
  try {
    const result = await seed(payload, { reset, log: (m) => payload.logger.info(m) })
    return Response.json(result, { status: result.skipped ? 409 : 200 })
  } catch (err) {
    payload.logger.error({ err, msg: 'Seed: ошибка' })
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
