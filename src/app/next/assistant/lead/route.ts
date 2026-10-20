import { z } from 'zod'
import { payloadClient } from '@/lib/payload'
import { findPublished } from '@/lib/data'
import { localeSchema, messageSchema } from '@/lib/assistant/schema'
import { visitorLimit } from '@/lib/assistant/limits'
import { json, readBody } from '@/lib/assistant/http'

export const runtime = 'nodejs'
const schema = z.object({
  locale: localeSchema, name: z.string().trim().min(1).max(80), phone: z.string().trim().max(40).refine((v) => /^\+?[\d ()-]+$/.test(v) && v.replace(/\D/g, '').length >= 8 && v.replace(/\D/g, '').length <= 15),
  consent: z.literal(true), summary: z.string().max(800), messages: z.array(messageSchema).max(24), ids: z.array(z.number().int().positive()).max(4),
  page: z.string().max(500), website: z.string().max(100).optional(),
  utm: z.object({ source: z.string().max(200).optional(), medium: z.string().max(200).optional(), campaign: z.string().max(200).optional(), term: z.string().max(200).optional(), content: z.string().max(200).optional(), gclid: z.string().max(200).optional() }).optional(),
}).strict()
export async function POST(request: Request) {
  let input
  try { input = schema.parse(await readBody(request, 52000)) } catch { return json({ error: 'invalid' }, 400) }
  if (input.website) return json({ ok: true })
  try {
    const payload = await payloadClient()
    if (!await visitorLimit(payload, request, 'lead')) return json({ error: 'rate' }, 429)
    const { docs } = input.ids.length ? await findPublished(input.locale, { id: { in: input.ids } }, { limit: 4 }) : { docs: [] }
    // Assignment uses the first selected, still-published property. Without a property: first available expert.
    const agents = docs.length ? null : await payload.find({ collection: 'team', where: { and: [{ kind: { equals: 'expert' } }, { hidden: { not_equals: true } }] }, limit: 1, depth: 0, sort: 'order', overrideAccess: false })
    await payload.create({ collection: 'leads', overrideAccess: true, data: {
      name: input.name, phone: input.phone, contactVia: 'whatsapp', consent: true, form: 'consult', locale: input.locale, status: 'new',
      property: docs[0]?.id, agent: agents?.docs[0]?.id, page: input.page, utm: input.utm,
      message: `AI-консультант. Пожелания со слов посетителя:\n${input.summary}\nВыбранные ID: ${input.ids.join(', ') || 'нет'}.\nДоступны на момент заявки: ${docs.map((p) => p.id).join(', ') || 'нет'}.`,
      assistantTranscript: input.messages.map((m) => `${m.role === 'user' ? 'Клиент' : 'ИИ'}: ${m.content}`).join('\n\n'),
    } })
    return json({ ok: true })
  } catch { console.error('assistant: lead could not be saved'); return json({ error: 'unavailable' }, 503) }
}
