'use client'

import { Button } from '@payloadcms/ui'
import { useState } from 'react'

type Next = { step: string; offset: number } | null

// Блок над панелью админки: загрузить демо-данные прототипа (только для роли «Администратор»).
// Загрузка идёт короткими шагами; при обрыве её можно продолжить с того же места.
export function SeedButton() {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const [resume, setResume] = useState<Next>(null)

  async function run(start: Next) {
    setState('busy')
    setMsg('Начинаю загрузку…')
    let cur = start
    try {
      while (cur) {
        const res = await fetch(`/next/seed?step=${cur.step}&offset=${cur.offset}`, { method: 'POST', credentials: 'include' })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.error || `Ошибка ${res.status}`)
        setMsg(json.message)
        cur = json.next
        setResume(cur)
      }
      setState('done')
    } catch (e) {
      setState('error')
      setResume(cur)
      setMsg(`${e instanceof Error ? e.message : String(e)}. Нажмите «Продолжить» — загрузка продолжится с этого места.`)
    }
  }

  const busy = state === 'busy'
  return (
    <div style={{ border: '1px solid var(--theme-elevation-150)', borderRadius: 8, padding: '16px 20px', marginBottom: 24 }}>
      <h4 style={{ margin: '0 0 6px' }}>Демо-данные</h4>
      <p style={{ margin: '0 0 12px', color: 'var(--theme-elevation-600)' }}>
        Объекты, районы, команда, статьи и отзывы из прототипа. Все данные выдуманные — перед запуском их заменят настоящими.
        Повторная загрузка обновляет демо-записи, дубликатов не будет.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {state === 'error' && resume ? (
          <Button buttonStyle="primary" size="small" margin={false} onClick={() => run(resume)}>Продолжить</Button>
        ) : (
          <Button buttonStyle="secondary" size="small" disabled={busy} margin={false} onClick={() => run({ step: 'media', offset: 0 })}>
            {busy ? 'Загрузка…' : 'Загрузить демо-данные'}
          </Button>
        )}
        <Button
          buttonStyle="subtle"
          size="small"
          disabled={busy}
          margin={false}
          onClick={() => {
            if (window.confirm('Удалить объекты, статьи, команду, районы, отзывы и фото и загрузить демо заново? Заявки и пользователи останутся.')) run({ step: 'reset', offset: 0 })
          }}
        >
          Удалить и загрузить заново
        </Button>
      </div>
      {msg && <p style={{ margin: '10px 0 0', color: state === 'error' ? 'var(--theme-error-500)' : undefined }}>{msg}</p>}
    </div>
  )
}
