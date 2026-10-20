import { payloadClient } from '@/lib/payload'
import { Assistant } from './Assistant'

export async function AssistantLoader({ whatsapp }: { whatsapp: string }) {
  let enabled = false
  try {
    const settings = await (await payloadClient()).findGlobal({ slug: 'assistant-settings', overrideAccess: true })
    const key = settings.provider === 'anthropic' ? settings.anthropicKey : settings.openaiKey
    enabled = !!settings.enabled && !!key
  } catch { return null }
  return enabled ? <Assistant whatsapp={whatsapp} /> : null
}
