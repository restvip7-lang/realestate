import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import { runRatesSync } from '@/lib/rates-sync'

// Кнопка «Обновить курсы» в админке (администратор и редактор — как права на «Курсы валют»).
// Ночное обновление идёт вместе с синхронизацией контента: GET /next/content-sync (vercel.json).
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
