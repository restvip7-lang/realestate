'use client'

import { Button } from '@payloadcms/ui'
import { useState } from 'react'

// Блок над панелью админки: загрузить демо-данные прототипа (только для роли «Администратор»).
export function SeedButton() {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function run(reset = false) {
    setState('busy')
    setMsg('Загружаю фото и данные, это займёт 1–3 минуты…')
    try {
      const res = await fetch(`/next/seed${reset ? '?reset=1' : ''}`, { method: 'POST', credentials: 'include' })
      const json = await res.json().catch(() => ({}))
      if (res.status === 409) {
        setState('idle')
        if (window.confirm('В базе уже есть объекты. Удалить объекты, статьи, команду, районы, отзывы и фото и загрузить демо заново? Заявки и пользователи останутся.')) return run(true)
        setMsg('')
        return
      }
      if (!res.ok) throw new Error(json.error || `Ошибка ${res.status}`)
      const c = json.counts || {}
      setState('done')
      setMsg(`Готово: объектов ${c.properties}, статей и новостей ${c.posts}, районов ${c.districts}, сотрудников ${c.team}, отзывов ${c.reviews}, фото ${c.media}.`)
    } catch (e) {
      setState('error')
      setMsg(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <div style={{ border: '1px solid var(--theme-elevation-150)', borderRadius: 8, padding: '16px 20px', marginBottom: 24 }}>
      <h4 style={{ margin: '0 0 6px' }}>Демо-данные</h4>
      <p style={{ margin: '0 0 12px', color: 'var(--theme-elevation-600)' }}>
        Объекты, районы, команда, статьи и отзывы из прототипа. Все данные выдуманные — перед запуском их заменят настоящими.
      </p>
      <Button buttonStyle="secondary" size="small" disabled={state === 'busy'} onClick={() => run()} margin={false}>
        {state === 'busy' ? 'Загрузка…' : 'Загрузить демо-данные'}
      </Button>
      {msg && <p style={{ margin: '10px 0 0', color: state === 'error' ? 'var(--theme-error-500)' : undefined }}>{msg}</p>}
    </div>
  )
}
