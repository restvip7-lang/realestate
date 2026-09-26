import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import { runSeedStep, SEED_STEPS, type SeedStep } from '@/seed'

// Загрузка демо-данных из админки, по одному короткому шагу за запрос (только для администратора).
// POST /next/seed?step=media&offset=6 → { next: { step, offset } | null, message }
// Кнопка в админке вызывает этот адрес, пока next не станет null. Первый шаг — media (или reset для полной замены).
export const maxDuration = 60

export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user || (user as { role?: string }).role !== 'admin') {
    return Response.json({ error: 'Только для администратора' }, { status: 403 })
  }
  const q = new URL(req.url).searchParams
  const step = (q.get('step') || 'media') as SeedStep
  if (!SEED_STEPS.includes(step)) return Response.json({ error: 'Неизвестный шаг' }, { status: 400 })
  const offset = Math.max(0, Number(q.get('offset')) || 0)
  try {
    return Response.json(await runSeedStep(payload, step, offset))
  } catch (err) {
    payload.logger.error({ err, msg: `Seed: ошибка на шаге ${step}` })
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
