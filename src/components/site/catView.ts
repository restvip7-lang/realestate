'use client'

import { useSyncExternalStore } from 'react'

// Вид каталога (список и карта / только список / только карта) запоминается в браузере
export type CatView = 'split' | 'list' | 'map'
const KEY = 'kh_view'
const EVENT = 'kh:view'

function read(): CatView {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'list' || v === 'map' ? v : 'split'
  } catch {
    return 'split'
  }
}
function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb)
  return () => window.removeEventListener(EVENT, cb)
}
export function setCatView(v: CatView) {
  try {
    localStorage.setItem(KEY, v)
  } catch {}
  window.dispatchEvent(new Event(EVENT))
}
export const useCatView = () => useSyncExternalStore(subscribe, read, () => 'split' as CatView)
