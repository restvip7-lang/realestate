'use client'

// Согласие на cookies (Consent Mode v2 подключим вместе с аналитикой): хранится в браузере
export type Consent = { analytics: boolean; ads: boolean; date: number }
const KEY = 'kh_consent'
export const CONSENT_EVENT = 'kh:consent'

export function readConsent(): Consent | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) || 'null')
  } catch {
    return null
  }
}
export function saveConsent(c: Omit<Consent, 'date'>) {
  const v = { ...c, date: Date.now() }
  try {
    localStorage.setItem(KEY, JSON.stringify(v))
  } catch {}
  window.dispatchEvent(new Event(CONSENT_EVENT))
  return v
}
