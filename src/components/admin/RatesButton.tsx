'use client'

import { Button } from '@payloadcms/ui'
import { useState } from 'react'

// Кнопка на странице «Курсы валют»: обновить курсы сейчас, не дожидаясь ночного обновления.
export function RatesButton() {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState(false)

  async function run() {
    setBusy(true)
    setMsg('')
    try {
      const res = await fetch('/next/rates-sync', { method: 'POST', credentials: 'include' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || `Ошибка ${res.status}`)
      setError(false)
      setMsg(`${json.message}. Обновляю страницу…`)
      // форма показывает прежние курсы: перезагрузить, иначе «Сохранить» вернёт старые значения
      setTimeout(() => window.location.reload(), 1500)
    } catch (e) {
      setError(true)
      setMsg(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <Button buttonStyle="secondary" size="small" margin={false} disabled={busy} onClick={run}>
        {busy ? 'Обновляю…' : 'Обновить курсы сейчас'}
      </Button>
      {msg && <p style={{ margin: '10px 0 0', color: error ? 'var(--theme-error-500)' : undefined }}>{msg}</p>}
    </div>
  )
}
