import type { Payload } from 'payload'

import type { Lead } from '@/payload-types'

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/** Письмо менеджеру о новой заявке. */
export async function leadEmail(doc: Lead, payload: Payload) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || ''
  const propertyId = typeof doc.property === 'object' ? doc.property?.id : doc.property
  const property = propertyId
    ? await payload.findByID({ collection: 'properties', id: propertyId, depth: 0, overrideAccess: true }).catch(() => null)
    : null
  const rows: [string, unknown][] = [
    ['Имя', doc.name],
    ['Телефон', doc.phone],
    ['E-mail', doc.email],
    ['Связаться', doc.contactVia],
    ['Сообщение', doc.message],
    ['Объект', property ? `№${property.id} · ${property.title}` : ''],
    ['Страница', doc.page],
    ['Реклама', [doc.utm?.source, doc.utm?.medium, doc.utm?.campaign].filter(Boolean).join(' / ')],
  ]
  const html = `<h2>Новая заявка с сайта</h2><table cellpadding="6" style="border-collapse:collapse">${rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="color:#5B6573">${k}</td><td><b>${esc(v)}</b></td></tr>`)
    .join('')}</table><p><a href="${site}/admin/collections/leads/${doc.id}">Открыть заявку в админке</a></p>`
  return {
    subject: `Заявка: ${doc.name || 'без имени'}${property ? ` · объект №${property.id}` : ''}`,
    html,
  }
}
