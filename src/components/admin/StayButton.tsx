'use client'

import { Button } from '@payloadcms/ui'
import { useState } from 'react'

type Cursor = Record<string, unknown> | null

// Блок на главной странице админки: «Обновить объекты из Stay» (только для роли «Администратор»).
// Синхронизация идёт шагами по 50 объектов; при обрыве её можно продолжить с того же места.
export function StayButton({ configured, limit }: { configured: boolean; limit: number | null }) {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const [resume, setResume] = useState<Cursor>(null)

  async function run(start: Cursor) {
    setState('busy')
    setMsg('Подключаюсь к Stay…')
    let cursor = start
    try {
      do {
        const res = await fetch('/next/stay-sync', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cursor ? { cursor } : {}),
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.error || `Ошибка ${res.status}`)
        setMsg(json.message)
        setResume(json.cursor)
        cursor = json.next
      } while (cursor)
      setState('done')
    } catch (e) {
      setState('error')
      setMsg(`${e instanceof Error ? e.message : String(e)}. Нажмите «Продолжить».`)
    }
  }

  return (
    <div style={{ border: '1px solid var(--theme-elevation-150)', borderRadius: 8, padding: '16px 20px', marginBottom: 24 }}>
      <h4 style={{ margin: '0 0 6px' }}>Объекты из Stay Portfolio</h4>
      <p style={{ margin: '0 0 12px', color: 'var(--theme-elevation-600)' }}>
        Объекты Аланьи и Газипаши забираются из Stay автоматически раз в сутки, а этой кнопкой — сразу. Только чтение: в Stay ничего не меняется.
        Объекты из Stay правьте в Stay — заголовок, описание, цена и фото перезапишутся. Эксперт, метки, SEO и заметки остаются нашими.
        {limit ? ` Тестовый режим: только ${limit} самых свежих объектов (STAY_SYNC_LIMIT).` : ''}
      </p>
      {configured ? (
        <Button
          buttonStyle={state === 'error' ? 'primary' : 'secondary'}
          size="small"
          margin={false}
          disabled={state === 'busy'}
          onClick={() => run(state === 'error' ? resume : null)}
        >
          {state === 'busy' ? 'Обновляю…' : state === 'error' ? 'Продолжить' : 'Обновить объекты из Stay'}
        </Button>
      ) : (
        <p style={{ margin: 0 }}>
          Не заданы ключи. В Vercel → Settings → Environment Variables добавьте STAY_TOKEN, STAY_USERNAME, STAY_PASSWORD (и CRON_SECRET для ежедневного запуска), затем Redeploy.
        </p>
      )}
      {msg && <p style={{ margin: '10px 0 0', color: state === 'error' ? 'var(--theme-error-500)' : undefined }}>{msg}</p>}
    </div>
  )
}
