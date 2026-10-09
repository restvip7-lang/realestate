import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import { stayConfigured } from '@/lib/stay'
import { newCursor, runStaySync, type StaySyncCursor } from '@/lib/stay-sync'

// Синхронизация объектов из Stay Portfolio (docs/stay-import.md).
// POST — кнопка в админке (только администратор): один шаг за запрос, тело { cursor } → { next, message }.
// GET — ежедневный запуск Vercel Cron (vercel.json), заголовок Authorization: Bearer <CRON_SECRET>:
//        делает столько шагов, сколько успеет за ~50 с (без изменений шаг — 1–2 с, все ~25 страниц успевают);
//        если изменений много и не успел — остальное догонит на следующий день.
export const maxDuration = 60
export const dynamic = 'force-dynamic'

const fail = (err: unknown, status = 500) => Response.json({ error: err instanceof Error ? err.message : String(err) }, { status })

export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user || (user as { role?: string }).role !== 'admin') return fail('Только для администратора', 403)
  if (!stayConfigured()) return fail('Не заданы ключи Stay: STAY_TOKEN, STAY_USERNAME, STAY_PASSWORD (Vercel → Settings → Environment Variables)', 400)
  const body = (await req.json().catch(() => ({}))) as { cursor?: StaySyncCursor }
  try {
    return Response.json(await runStaySync(payload, body.cursor ?? newCursor()))
  } catch (err) {
    payload.logger.error({ err, msg: 'Stay: ошибка синхронизации' })
    return fail(err)
  }
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return fail('Нет доступа', 401)
  if (!stayConfigured()) return fail('Не заданы ключи Stay', 400)
  const payload = await getPayload({ config })
  const started = Date.now()
  let cursor: StaySyncCursor | null = newCursor()
  let message = ''
  try {
    while (cursor && Date.now() - started < 45_000) {
      // каждому шагу — остаток времени до 50 с, чтобы уложиться в лимит функции 60 с
      const res = await runStaySync(payload, cursor, 50_000 - (Date.now() - started))
      cursor = res.next
      message = res.message
    }
    payload.logger.info({ msg: `Stay cron: ${message}` })
    return Response.json({ done: !cursor, message })
  } catch (err) {
    payload.logger.error({ err, msg: 'Stay cron: ошибка' })
    return fail(err)
  }
}
