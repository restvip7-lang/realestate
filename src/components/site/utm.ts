'use client'

// UTM-метки и gclid/yclid первого визита: сохраняем на время сессии и отправляем с заявкой
const KEYS = ['source', 'medium', 'campaign', 'term', 'content'] as const
const STORE = 'kh_utm'

export function captureUtm() {
  try {
    const q = new URLSearchParams(location.search)
    const found: Record<string, string> = {}
    KEYS.forEach((k) => q.get(`utm_${k}`) && (found[k] = q.get(`utm_${k}`)!))
    const click = q.get('gclid') || q.get('yclid') || q.get('fbclid')
    if (click) found.gclid = click
    if (Object.keys(found).length && !sessionStorage.getItem(STORE)) sessionStorage.setItem(STORE, JSON.stringify(found))
  } catch {}
}

export function readUtm(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(STORE) || '{}')
  } catch {
    return {}
  }
}
