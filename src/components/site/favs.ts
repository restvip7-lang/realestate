'use client'

import { useSyncExternalStore } from 'react'

// Избранное хранится в браузере (как в прототипе): список ID объектов
const KEY = 'kh_favs'
const EVENT = 'kh:favs'
const EMPTY: number[] = []
let cache: { raw: string | null; ids: number[] } = { raw: null, ids: EMPTY }

export function getFavs(): number[] {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(KEY)
  } catch {}
  if (raw === cache.raw) return cache.ids
  let ids: number[] = EMPTY
  try {
    const v = JSON.parse(raw || '[]')
    if (Array.isArray(v)) ids = v.map(Number).filter((n) => Number.isInteger(n) && n > 0)
  } catch {}
  cache = { raw, ids }
  return ids
}
function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', cb)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('storage', cb)
  }
}
export function setFavs(ids: number[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...new Set(ids)]))
  } catch {}
  window.dispatchEvent(new Event(EVENT))
}
export function toggleFav(id: number) {
  const ids = getFavs()
  setFavs(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id])
}
export const useFavs = () => useSyncExternalStore(subscribe, getFavs, () => EMPTY)
