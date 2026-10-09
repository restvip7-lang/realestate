import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import { runContentSync } from '@/lib/content-sync'

// Синхронизация новостей, отзывов и услуг из Stay Property (docs/content-import.md).
// POST — кнопка в админке (только администратор). GET — ежедневный запуск Vercel Cron (vercel.json),
// заголовок Authorization: Bearer <CRON_SECRET>. Ключи не нужны: сервис отдаёт контент без авторизации.
export const maxDuration = 60
export const dynamic = 'force-dynamic'

const fail = (err: unknown, status = 500) => Response.json({ error: err instanceof Error ? err.message : String(err) }, { status })

export async function POST() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user || (user as { role?: string }).role !== 'admin') return fail('Только для администратора', 403)
  try {
    return Response.json(await runContentSync(payload))
  } catch (err) {
    payload.logger.error({ err, msg: 'Stay Property: ошибка синхронизации контента' })
    return fail(err)
  }
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return fail('Нет доступа', 401)
  const payload = await getPayload({ config })
  try {
    const res = await runContentSync(payload)
    payload.logger.info({ msg: `Stay Property cron: ${res.message}` })
    return Response.json(res)
  } catch (err) {
    payload.logger.error({ err, msg: 'Stay Property cron: ошибка' })
    return fail(err)
  }
}
