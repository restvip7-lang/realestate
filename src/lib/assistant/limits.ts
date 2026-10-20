import { createHmac } from 'node:crypto'
import type { Payload } from 'payload'

export async function consumeLimit(payload: Payload, bucket: string, limit: number, expires: Date) {
  const result = await payload.db.pool.query(
    `INSERT INTO assistant_limits (bucket, hits, expires) VALUES ($1, 1, $2)
     ON CONFLICT (bucket) DO UPDATE SET hits = assistant_limits.hits + 1
     WHERE assistant_limits.hits < $3 RETURNING hits`, [bucket, expires.toISOString(), limit],
  )
  return result.rows.length === 1
}
export async function visitorLimit(payload: Payload, request: Request, kind: 'chat' | 'lead' | 'key') {
  const secret = process.env.AI_CREDENTIALS_SECRET
  if (!secret) throw new Error('Assistant limits not configured')
  const ip = (request.headers.get(process.env.VERCEL ? 'x-vercel-forwarded-for' : 'x-forwarded-for') || 'local').split(',')[0].trim()
  const hash = createHmac('sha256', secret).update(ip).digest('hex').slice(0, 32)
  const windowMs = 10 * 60 * 1000
  const window = Math.floor(Date.now() / windowMs)
  await payload.db.pool.query('DELETE FROM assistant_limits WHERE expires < NOW()')
  return consumeLimit(payload, `${kind}:${window}:${hash}`, kind === 'chat' ? 20 : 5, new Date((window + 1) * windowMs))
}
