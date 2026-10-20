'use client'

import { useEffect, useState } from 'react'
import { Button, useFormFields } from '@payloadcms/ui'

export function AssistantKey() {
  const [provider, setProvider] = useState<'openai' | 'anthropic'>('openai')
  const [key, setKey] = useState('')
  const [status, setStatus] = useState<{ openai: boolean; anthropic: boolean; encryptionReady: boolean } | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const model = useFormFields(([fields]) => fields[provider === 'openai' ? 'openaiModel' : 'anthropicModel']?.value) as string
  useEffect(() => {
    fetch('/next/assistant/key').then(async (r) => { if (r.ok) setStatus(await r.json()) }).catch(() => setMessage('Не удалось прочитать статус подключения.'))
  }, [])
  async function save() {
    setBusy(true); setMessage('')
    try {
      const r = await fetch('/next/assistant/key', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider, model, key }) })
      if (!r.ok) throw new Error('connection')
      setKey(''); setStatus((s) => s ? { ...s, [provider]: true } : s)
      setMessage('Ключ сохранён. Доступ к модели подтверждён; генерация ещё не проверена. Сохраните настройки страницы.')
    } catch { setMessage('Не удалось сохранить ключ. Проверьте ключ, API ID модели и настройку шифрования на сервере. Старый ключ сохранён.') }
    finally { setBusy(false) }
  }
  return <section style={{ border: '1px solid var(--theme-elevation-200)', padding: 20, marginBottom: 24 }}>
    <h3>Подключение API</h3>
    <p>OpenAI: {status?.openai ? 'ключ сохранён' : 'не подключён'} · Claude: {status?.anthropic ? 'ключ сохранён' : 'не подключён'}</p>
    {status && !status.encryptionReady && <p>На сервере требуется AI_CREDENTIALS_SECRET. Обратитесь к администратору хостинга.</p>}
    <label>Провайдер ключа <select value={provider} onChange={(e) => setProvider(e.target.value as typeof provider)} disabled={busy}><option value="openai">OpenAI</option><option value="anthropic">Anthropic</option></select></label>
    <p>Проверяем модель: {model}</p>
    <label>Новый API-ключ <input type="password" value={key} onChange={(e) => setKey(e.target.value)} autoComplete="new-password" spellCheck={false} maxLength={512} disabled={busy} style={{ width: '100%', padding: 12, margin: '8px 0' }} /></label>
    <Button type="button" disabled={busy || !key.trim()} onClick={save}>{busy ? 'Проверяю…' : 'Проверить и сохранить ключ'}</Button>
    <p role="status">{message}</p>
    <small>Ключ хранится зашифрованным и не показывается повторно. Смена провайдера не отправляет диалог второму провайдеру автоматически при ошибке.</small>
  </section>
}
