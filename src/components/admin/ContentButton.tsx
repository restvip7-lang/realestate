'use client'

import { Button } from '@payloadcms/ui'
import { useState } from 'react'

// Блок на главной странице админки: «Обновить новости, отзывы и услуги» из Stay Property (только для администратора).
export function ContentButton() {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function run() {
    setState('busy')
    setMsg('Забираю новости, отзывы и услуги из Stay Property…')
    try {
      // если за один запрос не успели (первая загрузка), повторяем — уже загруженное пропускается
      for (let i = 0; i < 5; i++) {
        const res = await fetch('/next/content-sync', { method: 'POST', credentials: 'include' })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.error || `Ошибка ${res.status}`)
        setMsg(json.message)
        if (json.done) break
      }
      setState('done')
    } catch (e) {
      setState('error')
      setMsg(`${e instanceof Error ? e.message : String(e)}. Попробуйте ещё раз.`)
    }
  }

  return (
    <div style={{ border: '1px solid var(--theme-elevation-150)', borderRadius: 8, padding: '16px 20px', marginBottom: 24 }}>
      <h4 style={{ margin: '0 0 6px' }}>Новости, отзывы и услуги из Stay Property</h4>
      <p style={{ margin: '0 0 12px', color: 'var(--theme-elevation-600)' }}>
        Забираются из admin.stayproperty.com автоматически раз в сутки, а этой кнопкой — сразу. Только чтение: в Stay Property ничего не меняется.
        Тексты и обложки правьте там. Чтобы убрать запись с сайта, снимите её с публикации здесь — синхронизация её обратно не включит.
      </p>
      <Button buttonStyle="secondary" size="small" margin={false} disabled={state === 'busy'} onClick={run}>
        {state === 'busy' ? 'Обновляю…' : 'Обновить новости, отзывы и услуги'}
      </Button>
      {msg && <p style={{ margin: '10px 0 0', color: state === 'error' ? 'var(--theme-error-500)' : undefined }}>{msg}</p>}
    </div>
  )
}
