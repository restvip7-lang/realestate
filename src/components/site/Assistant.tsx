'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { Card, ChatReply, ChatRequest } from '@/lib/assistant/schema'
import { captureUtm, readUtm } from './utm'
import './assistant.css'

type Turn = { role: 'user' | 'assistant'; content: string; result?: ChatReply }
type Props = { demo?: boolean; demoReply?: (input: ChatRequest) => ChatReply; whatsapp?: string }

export function Assistant({ demo = false, demoReply, whatsapp }: Props) {
  const t = useTranslations('assistant')
  const locale = useLocale() as ChatRequest['locale']
  const [turns, setTurns] = useState<Turn[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Card[]>([])
  const [handoff, setHandoff] = useState(false)
  const [sent, setSent] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const launcher = useRef<HTMLButtonElement>(null)
  const bottom = useRef<HTMLDivElement>(null)
  const controller = useRef<AbortController | null>(null)
  const sending = useRef(false)
  const latest = [...turns].reverse().find((turn) => !!turn.result)?.result
  const lastResult = turns.at(-1)?.result
  const summary = latest?.summary || turns.filter((m) => m.role === 'user').map((m) => m.content).join('; ').slice(0, 800)

  useEffect(() => { captureUtm(); return () => controller.current?.abort() }, [])
  useEffect(() => { bottom.current?.scrollIntoView({ block: 'nearest' }) }, [turns, busy, handoff])
  function open() { dialog.current?.showModal() }
  function close() { dialog.current?.close(); launcher.current?.focus() }
  function reset() {
    controller.current?.abort(); controller.current = null; sending.current = false
    setTurns([]); setSelected([]); setInput(''); setError(''); setBusy(false); setHandoff(false); setSent(false)
  }
  async function send(text: string) {
    if (!text.trim() || sending.current || turns.length >= 24) return
    const next: Turn[] = [...turns, { role: 'user', content: text.trim().slice(0, 1800) }]
    const request: ChatRequest = { locale, messages: next.map(({ role, content }) => ({ role, content })) }
    const abort = new AbortController(); controller.current = abort; sending.current = true
    setTurns(next); setInput(''); setBusy(true); setError(''); setSent(false)
    try {
      let result: ChatReply
      if (demo && demoReply) result = demoReply(request)
      else {
        const response = await fetch('/next/assistant/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request), signal: AbortSignal.any([abort.signal, AbortSignal.timeout(55000)]) })
        if (!response.ok) throw new Error(response.status === 429 ? 'rate' : 'unavailable')
        result = await response.json()
      }
      if (!abort.signal.aborted) setTurns([...next, { role: 'assistant', content: result.reply, result }])
    } catch (err) {
      if (!abort.signal.aborted) {
        setTurns(next.slice(0, -1)); setInput(text)
        setError(err instanceof Error && err.message === 'rate' ? t('rate') : t('error'))
      }
    } finally {
      if (controller.current === abort) { sending.current = false; setBusy(false) }
    }
  }
  function toggle(card: Card) {
    setSelected((prev) => prev.some((p) => p.id === card.id) ? prev.filter((p) => p.id !== card.id) : prev.length < 4 ? [...prev, card] : prev)
  }
  async function lead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending.current) return
    const fields = new FormData(event.currentTarget)
    if (demo) { setSent(true); return }
    sending.current = true; setBusy(true); setError('')
    try {
      const response = await fetch('/next/assistant/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(20000), body: JSON.stringify({
        locale, name: fields.get('name'), phone: fields.get('phone'), consent: fields.get('consent') === 'on', website: fields.get('website'),
        summary, ids: selected.map((p) => p.id), messages: turns.map(({ role, content }) => ({ role, content })), page: location.pathname, utm: readUtm(),
      }) })
      if (!response.ok) throw new Error('lead')
      setSent(true)
    } catch { setError(t('leadError')) }
    finally { sending.current = false; setBusy(false) }
  }
  const quick = turns.length === 0 ? [t('startBuy'), t('startRent'), t('startUnsure')] : demo && !latest?.filters.deal ? [t('startBuy'), t('startRent')] : demo && !latest?.filters.maxBudget ? (latest?.filters.deal === 'rent' ? ['800 EUR', '1000 EUR', '1500 EUR'] : ['150000 EUR', '200000 EUR', '300000 EUR']) : demo && !latest?.filters.rooms ? ['1+1', '2+1', '3+1'] : []
  return <div className="kh-assistant">
    <button className="kh-assistant-launch" ref={launcher} type="button" onClick={open} aria-haspopup="dialog"><span aria-hidden="true">✦</span> {t('launch')}</button>
    <dialog ref={dialog} aria-labelledby="kh-assistant-title" onClose={() => launcher.current?.focus()}>
      <header><div><span className="kh-assistant-eyebrow">KLEO HOMES · AI</span><h2 id="kh-assistant-title">{t('title')}</h2><p>{t('subtitle')}</p></div><button type="button" onClick={close} aria-label={t('close')}>×</button></header>
      <div className="kh-assistant-toolbar"><span>{demo ? t('demo') : t('disclosure')}</span><button type="button" onClick={reset} disabled={busy}>{t('reset')}</button></div>
      <div className="kh-assistant-scroll">
        {turns.length === 0 && <section className="kh-assistant-welcome"><span className="kh-assistant-orb" aria-hidden="true">✦</span><h3>{t('welcomeTitle')}</h3><p>{t('welcome')}</p><small>{demo ? t('demoPrivacy') : t('privacyHint')}</small></section>}
        <div className="kh-assistant-turns" role="log" aria-live="polite" aria-relevant="additions">
          {turns.map((turn, index) => <div key={index} className={`kh-assistant-turn ${turn.role}`}><small>{turn.role === 'user' ? t('you') : 'Kleo AI'}</small><p>{turn.content}</p></div>)}
          {busy && <p role="status">{t('thinking')}</p>}
        </div>
        {lastResult?.notice && <p className="kh-assistant-notice">{t(`notice_${lastResult.notice}`)}</p>}
        {lastResult?.total != null && <section className="kh-assistant-results"><h3>{lastResult.total ? t('results', { count: lastResult.total }) : t('empty')}</h3><p>{t('verify')}</p>
          {lastResult.cards.map((card) => <article className="kh-assistant-card" key={card.id}>
            {card.image && <Image src={card.image} alt="" width={160} height={112} unoptimized />}
            <div><small>{card.district} · #{card.id}</small><h4>{demo ? card.title : <a href={card.url} target="_blank" rel="noopener noreferrer">{card.title} ↗</a>}</h4>
              <p>{[card.rooms, card.area ? `${card.area} m²` : '', card.sea != null ? t('sea', { distance: card.sea }) : ''].filter(Boolean).join(' · ')}</p>
              <strong>{card.price && card.priceFrom ? `${t('from')} ` : ''}{card.price ? new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(card.price) : t('priceRequest')}{card.deal === 'rent' ? t('month') : ''}</strong>
              <button type="button" aria-pressed={selected.some((p) => p.id === card.id)} onClick={() => toggle(card)} disabled={!selected.some((p) => p.id === card.id) && selected.length >= 4}>{selected.some((p) => p.id === card.id) ? t('selected') : t('select')}</button>
            </div>
          </article>)}
        </section>}
        {quick.length > 0 && !busy && <div className="kh-assistant-chips">{quick.map((text) => <button type="button" key={text} onClick={() => send(text)}>{text}</button>)}</div>}
        {selected.length > 0 && <div className="kh-assistant-selected"><small>{t('selection')}</small>{selected.map((p) => <button type="button" key={p.id} onClick={() => toggle(p)} aria-label={`${t('remove')} ${p.title}`}>#{p.id} ×</button>)}</div>}
        {handoff && <section className="kh-assistant-handoff"><h3>{t('handoffTitle')}</h3><p>{t('handoffHint')}</p>{summary && <blockquote>{summary}</blockquote>}
          {sent ? <p role="status" className="kh-assistant-success">{demo ? t('demoSent') : t('sent')}</p> : <form onSubmit={lead}>
            <label>{t('name')}<input name="name" autoComplete="given-name" required maxLength={80} /></label>
            <label>{t('phone')}<input name="phone" type="tel" autoComplete="tel" required maxLength={40} minLength={8} /></label>
            <label className="kh-assistant-trap" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
            <label className="kh-assistant-consent"><input name="consent" type="checkbox" required /><span>{t('consent')} <a href={`/${locale}/privacy`} target="_blank" rel="noopener noreferrer">{t('policy')}</a></span></label>
            <button type="submit" disabled={busy}>{demo ? t('demoSubmit') : t('submit')}</button>
          </form>}
        </section>}
        {error && <p role="alert" className="kh-assistant-error">{error}</p>}
        {turns.length >= 24 && <p>{t('limit')}</p>}
        <div ref={bottom} />
      </div>
      <footer><form onSubmit={(e) => { e.preventDefault(); void send(input) }}><label className="vh" htmlFor="kh-assistant-input">{t('placeholder')}</label><input id="kh-assistant-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('placeholder')} maxLength={1800} disabled={busy || turns.length >= 24} /><button type="submit" disabled={busy || !input.trim() || turns.length >= 24} aria-label={t('send')}>↑</button></form>
        <div><button type="button" onClick={() => { setHandoff((v) => !v); setError('') }} disabled={busy}>{handoff ? t('back') : t('manager')}</button>{whatsapp && <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>}</div>
      </footer>
    </dialog>
  </div>
}
