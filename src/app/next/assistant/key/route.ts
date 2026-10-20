import { z } from 'zod'
import { payloadClient } from '@/lib/payload'
import { encryptCredential } from '@/lib/assistant/credentials'
import { json, readBody } from '@/lib/assistant/http'
import { visitorLimit } from '@/lib/assistant/limits'

export const runtime = 'nodejs'
const schema = z.object({ provider: z.enum(['openai', 'anthropic']), key: z.string().trim().min(20).max(512).regex(/^[\x21-\x7e]+$/), model: z.string().trim().regex(/^[a-zA-Z0-9._:-]{1,80}$/) }).strict()
export async function GET(request: Request) {
  const payload = await payloadClient()
  const { user } = await payload.auth({ headers: request.headers })
  if (user?.role !== 'admin') return json({ error: 'forbidden' }, 403)
  const s = await payload.findGlobal({ slug: 'assistant-settings', overrideAccess: true })
  return json({ openai: !!s.openaiKey, anthropic: !!s.anthropicKey, encryptionReady: !!process.env.AI_CREDENTIALS_SECRET })
}
export async function POST(request: Request) {
  const payload = await payloadClient()
  const { user } = await payload.auth({ headers: request.headers })
  if (user?.role !== 'admin') return json({ error: 'forbidden' }, 403)
  let input: z.infer<typeof schema>
  try { input = schema.parse(await readBody(request, 2000)) } catch { return json({ error: 'invalid' }, 400) }
  try {
    if (!await visitorLimit(payload, request, 'key')) return json({ error: 'rate' }, 429)
    const encrypted = encryptCredential(input.key)
    const anthropic = input.provider === 'anthropic'
    const check = await fetch(`${anthropic ? 'https://api.anthropic.com/v1' : 'https://api.openai.com/v1'}/models/${encodeURIComponent(input.model)}`, {
      headers: anthropic ? { 'x-api-key': input.key, 'anthropic-version': '2023-06-01' } : { Authorization: `Bearer ${input.key}` }, signal: AbortSignal.timeout(15000),
    })
    if (!check.ok) return json({ error: 'connection' }, 400)
    await payload.updateGlobal({ slug: 'assistant-settings', overrideAccess: true, data: anthropic ? { anthropicKey: encrypted } : { openaiKey: encrypted } })
    return json({ ok: true })
  } catch { return json({ error: 'configuration' }, 503) }
}
