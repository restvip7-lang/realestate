'use server'

import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

export type LeadInput = {
  name: string
  phone: string
  email?: string
  contactVia?: 'whatsapp' | 'telegram' | 'phone' | 'email'
  message?: string
  form: 'pick' | 'viewing' | 'question' | 'cheaper' | 'costs' | 'consult' | 'sell'
  property?: number
  page?: string
  locale?: string
  consent: boolean
  utm?: Partial<Record<'source' | 'medium' | 'campaign' | 'term' | 'content' | 'gclid', string>>
  website?: string // ловушка для ботов: люди это поле не видят
}

const clip = (s: unknown, n: number) => String(s ?? '').trim().slice(0, n)

// простая защита от повторной отправки: не больше 5 заявок с одного IP за 10 минут (в пределах одного сервера)
const recent = new Map<string, number[]>()

export async function submitLead(input: LeadInput): Promise<{ ok: true } | { ok: false; error: 'invalid' | 'rate' | 'server' }> {
  if (input.website) return { ok: true } // бот: делаем вид, что всё хорошо
  const phone = clip(input.phone, 40)
  const digits = phone.replace(/\D/g, '')
  if (!clip(input.name, 80) || digits.length < 8 || digits.length > 15 || !input.consent) return { ok: false, error: 'invalid' }

  const h = await headers()
  const ip = (h.get('x-forwarded-for') || '').split(',')[0].trim() || 'local'
  const now = Date.now()
  const hits = (recent.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000)
  if (hits.length >= 5) return { ok: false, error: 'rate' }
  recent.set(ip, [...hits, now])

  try {
    const payload = await getPayload({ config })
    const utm = Object.fromEntries(Object.entries(input.utm || {}).map(([k, v]) => [k, clip(v, 200)]))
    await payload.create({
      collection: 'leads',
      overrideAccess: true, // публичного create у коллекции нет: заявки попадают только через эту функцию
      data: {
        name: clip(input.name, 80),
        phone,
        email: clip(input.email, 120) || undefined,
        contactVia: input.contactVia,
        message: clip(input.message, 2000),
        form: input.form,
        property: input.property && Number.isInteger(input.property) ? input.property : undefined,
        page: clip(input.page, 500),
        locale: clip(input.locale, 5),
        consent: true,
        utm,
        status: 'new',
      },
    })
    return { ok: true }
  } catch (err) {
    console.error('submitLead', err)
    return { ok: false, error: 'server' }
  }
}
