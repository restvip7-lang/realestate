'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useId, useState } from 'react'

import { submitLead, type LeadInput } from '@/app/(frontend)/actions'
import { Link } from '@/i18n/navigation'

import { captureUtm, readUtm } from './utm'

const CODES = ['+7', '+90', '+49', '+380', '+375', '+44', '+1', '+971']

// Форма «Подберём жильё» — внизу каждой страницы
export function LeadForm({ property }: { property?: number }) {
  const t = useTranslations('lead')
  const locale = useLocale()
  const id = useId()
  const [state, setState] = useState<'idle' | 'busy' | 'ok' | 'error'>('idle')
  const [bad, setBad] = useState<Record<string, boolean>>({})
  const [err, setErr] = useState('')

  useEffect(() => captureUtm(), [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const get = (k: string) => String(f.get(k) || '').trim()
    const phone = `${get('code')} ${get('phone')}`
    const invalid = {
      name: !get('name'),
      phone: get('phone').replace(/\D/g, '').length < 6,
      consent: !f.get('consent'),
    }
    setBad(invalid)
    if (Object.values(invalid).some(Boolean)) {
      e.currentTarget.querySelector<HTMLElement>('.invalid input')?.focus()
      return
    }
    setState('busy')
    const goal = get('goal'), budget = get('budget'), wish = get('wish')
    const res = await submitLead({
      name: get('name'),
      phone,
      contactVia: get('via') as LeadInput['contactVia'],
      message: [goal && `${t('goal')}: ${goal}`, budget && `${t('budget')}: ${budget}`, wish].filter(Boolean).join('\n'),
      form: property ? 'question' : 'pick',
      property,
      page: location.pathname + location.search,
      locale,
      consent: true,
      utm: readUtm(),
      website: get('website'),
    }).catch(() => ({ ok: false as const, error: 'server' as const }))
    if (res.ok) setState('ok')
    else {
      setState('error')
      setErr(t(res.error === 'rate' ? 'errRate' : res.error === 'invalid' ? 'errInvalid' : 'errServer'))
    }
  }

  if (state === 'ok') {
    return (
      <div className="lform">
        <div className="notice ok show" role="status">{t('thanks')}</div>
      </div>
    )
  }

  return (
    <form className="lform" noValidate onSubmit={onSubmit}>
      <div className="row2">
        <div className={`fld${bad.name ? ' invalid' : ''}`}>
          <label htmlFor={`${id}-name`}>{t('name')}</label>
          <input id={`${id}-name`} name="name" required autoComplete="name" maxLength={80} />
          <span className="err-msg">{t('errName')}</span>
        </div>
        <div className="fld">
          <label htmlFor={`${id}-via`}>{t('via')}</label>
          <select id={`${id}-via`} name="via" defaultValue="whatsapp">
            <option value="whatsapp">WhatsApp</option>
            <option value="telegram">Telegram</option>
            <option value="phone">{t('viaPhone')}</option>
            <option value="email">E-mail</option>
          </select>
        </div>
      </div>
      <div className={`fld${bad.phone ? ' invalid' : ''}`}>
        <label htmlFor={`${id}-phone`}>{t('phone')}</label>
        <div className="phone">
          <select name="code" aria-label={t('code')} defaultValue={locale === 'tr' ? '+90' : locale === 'en' ? '+44' : '+7'}>
            {CODES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input id={`${id}-phone`} name="phone" type="tel" required autoComplete="tel-national" placeholder="900 000 00 00" maxLength={20} />
        </div>
        <span className="err-msg">{t('errPhone')}</span>
      </div>
      <div className="row2">
        <div className="fld">
          <label htmlFor={`${id}-goal`}>{t('goal')} <span className="hint">({t('optional')})</span></label>
          <select id={`${id}-goal`} name="goal">
            {(t.raw('goals') as string[]).map((g, i) => <option key={g} value={i ? g : ''}>{g}</option>)}
          </select>
        </div>
        <div className="fld">
          <label htmlFor={`${id}-budget`}>{t('budget')} <span className="hint">({t('optional')})</span></label>
          <select id={`${id}-budget`} name="budget">
            {(t.raw('budgets') as string[]).map((g, i) => <option key={g} value={i ? g : ''}>{g}</option>)}
          </select>
        </div>
      </div>
      <div className="fld">
        <label htmlFor={`${id}-wish`}>{t('wish')} <span className="hint">({t('optional')})</span></label>
        <textarea id={`${id}-wish`} name="wish" placeholder={t('wishPh')} maxLength={2000} />
      </div>
      <div className="hp" aria-hidden="true">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div className={`fld${bad.consent ? ' invalid' : ''}`}>
        <label className="check">
          <input type="checkbox" name="consent" required />
          <span>{t.rich('consent', { link: (c) => <Link href="/privacy" style={{ textDecoration: 'underline' }}>{c}</Link> })}</span>
        </label>
        <span className="err-msg">{t('errConsent')}</span>
      </div>
      <button className="btn btn-coral" type="submit" disabled={state === 'busy'}>{state === 'busy' ? t('sending') : t('submit')}</button>
      {state === 'error' && <div className="notice err show" role="alert">{err}</div>}
    </form>
  )
}
