'use client'

import { createContext, useContext, useSyncExternalStore } from 'react'

import { CURRENCIES, CURRENCY_SYMBOL, type Currency } from '@/lib/catalog'

// Валюта посетителя: цены приходят с сервера в евро, пересчёт — в браузере по курсам из админки.
type Ctx = { cur: Currency; rates: Record<string, number>; setCur: (c: Currency) => void }
const CurrencyCtx = createContext<Ctx>({ cur: 'EUR', rates: { EUR: 1 }, setCur: () => {} })

const KEY = 'kh_cur'
const EVENT = 'kh:currency'

// выбранная валюта живёт в localStorage; на сервере и до гидрации — евро
function readCur(): Currency {
  try {
    const saved = localStorage.getItem(KEY)?.replace(/"/g, '') as Currency | undefined
    return saved && CURRENCIES.includes(saved) ? saved : 'EUR'
  } catch {
    return 'EUR'
  }
}
function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', cb)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('storage', cb)
  }
}

export function CurrencyProvider({ rates, children }: { rates: Record<string, number>; children: React.ReactNode }) {
  const cur = useSyncExternalStore(subscribe, readCur, () => 'EUR' as Currency)
  const setCur = (c: Currency) => {
    try {
      localStorage.setItem(KEY, c)
    } catch {}
    window.dispatchEvent(new Event(EVENT))
  }
  return <CurrencyCtx.Provider value={{ cur, rates, setCur }}>{children}</CurrencyCtx.Provider>
}

export const useCurrency = () => useContext(CurrencyCtx)

export const formatNum = (n: number) => Math.round(n).toLocaleString('ru-RU').replace(/[  ,]/g, ' ')

export function useMoney() {
  const { cur, rates } = useCurrency()
  const rate = rates[cur] || 1
  return {
    cur,
    rate,
    fmt: (eur: number, suffix = '') => `${formatNum(eur * rate)} ${CURRENCY_SYMBOL[cur]}${suffix}`,
    toEur: (v: number) => v / rate,
  }
}

/** Цена в выбранной валюте. На сервере и до загрузки — в евро. */
export function Price({ eur, suffix = '' }: { eur: number; suffix?: string }) {
  const { fmt } = useMoney()
  return <>{fmt(eur, suffix)}</>
}

export function CurrencySelect({ className, label }: { className?: string; label: string }) {
  const { cur, setCur } = useCurrency()
  return (
    <select className={className} aria-label={label} value={cur} onChange={(e) => setCur(e.target.value as Currency)}>
      {CURRENCIES.map((c) => (
        <option key={c} value={c}>
          {CURRENCY_SYMBOL[c]} {c}
        </option>
      ))}
    </select>
  )
}
