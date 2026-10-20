import { payloadClient } from '@/lib/payload'
import { getCompany, listDistricts } from '@/lib/data'
import { requestSchema } from '@/lib/assistant/schema'
import { qualify } from '@/lib/assistant/provider'
import { decryptCredential } from '@/lib/assistant/credentials'
import { consumeLimit, visitorLimit } from '@/lib/assistant/limits'
import { json, readBody } from '@/lib/assistant/http'
import { searchProperties } from '@/lib/assistant/search'

export const runtime = 'nodejs'
export const maxDuration = 60
export async function POST(request: Request) {
  let input
  try { input = requestSchema.parse(await readBody(request)) } catch { return json({ error: 'invalid' }, 400) }
  try {
    const payload = await payloadClient()
    const settings = await payload.findGlobal({ slug: 'assistant-settings', overrideAccess: true })
    const provider = settings.provider || 'openai'
    const encrypted = provider === 'openai' ? settings.openaiKey : settings.anthropicKey
    if (!settings.enabled || !encrypted) return json({ error: 'unavailable' }, 503)
    if (!await visitorLimit(payload, request, 'chat')) return json({ error: 'rate' }, 429)
    const day = new Date().toISOString().slice(0, 10)
    if (!await consumeLimit(payload, `daily:${day}`, settings.dailyRequests, new Date(`${day}T23:59:59.999Z`))) return json({ error: 'rate' }, 429)
    const [company, districts] = await Promise.all([getCompany(input.locale), listDistricts(input.locale)])
    const decision = await qualify(input, { provider, model: provider === 'openai' ? settings.openaiModel : settings.anthropicModel, key: decryptCredential(encrypted) }, {
      agency: { phone: company.phone.slice(0, 80), address: company.address.slice(0, 500), hours: company.hours?.slice(0, 200) },
      districts: districts.map((d) => ({ slug: d.slug.slice(0, 80), name: d.name.slice(0, 80) })),
    })
    const result = decision.search ? await searchProperties(input.locale, decision.filters, districts) : { cards: [], total: null, notice: null }
    return json({ ...decision, ...result, demo: false })
  } catch {
    // No prompts, contacts, provider bodies or credentials in logs.
    console.error('assistant: request failed')
    return json({ error: 'unavailable' }, 503)
  }
}
