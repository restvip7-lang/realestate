import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import { runRatesSync } from '@/lib/rates-sync'

// POST — кнопка «Обновить курсы» в админке (администратор и редактор — как права на «Курсы валют»).
// GET — ночной запуск Vercel Cron (vercel.json), заголовок Authorization: Bearer <CRON_SECRET>.
export const dynamic = 'force-dynamic'

export async function POST() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  const role = (user as { role?: string } | null)?.role
  if (role !== 'admin' && role !== 'editor') return Response.json({ error: 'Только для администратора или редактора' }, { status: 403 })
  try {
    return Response.json({ message: await runRatesSync(payload) })
  } catch (err) {
    payload.logger.warn({ msg: `Курсы валют не обновлены: ${err instanceof Error ? err.message : err}` })
    return Response.json({ error: `Курсы не обновлены: ${err instanceof Error ? err.message : err}. Прежние курсы оставлены.` }, { status: 502 })
  }
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return Response.json({ error: 'Нет доступа' }, { status: 401 })
  const payload = await getPayload({ config })
  try {
    const message = await runRatesSync(payload)
    payload.logger.info({ msg: `Курсы cron: ${message}` })
    return Response.json({ message })
  } catch (err) {
    payload.logger.warn({ msg: `Курсы cron: не обновлены — ${err instanceof Error ? err.message : err}` })
    return Response.json({ error: 'Курсы не обновлены, прежние оставлены' }, { status: 502 })
  }
}
