'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { submitLead } from '@/app/(frontend)/actions'
import { Link } from '@/i18n/navigation'

import { captureUtm, readUtm } from './utm'

// «Записаться на просмотр» на странице объекта
export function ViewForm({ propertyId }: { propertyId: number }) {
  const t = useTranslations('view')
  const tl = useTranslations('lead')
  const locale = useLocale()
  const [state, setState] = useState<'idle' | 'busy' | 'ok' | 'error'>('idle')
  const [bad, setBad] = useState<Record<string, boolean>>({})
  const [err, setErr] = useState('')
  useEffect(() => captureUtm(), [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const get = (k: string) => String(f.get(k) || '').trim()
    const invalid = { name: !get('name'), phone: get('phone').replace(/\D/g, '').length < 8, consent: !f.get('consent') }
    setBad(invalid)
    if (Object.values(invalid).some(Boolean)) return
    setState('busy')
    const res = await submitLead({
      name: get('name'),
      phone: get('phone'),
      message: [`${t('format')}: ${t(get('fmt') === 'video' ? 'video' : 'live')}`, get('date') && `${t('date')}: ${get('date')}`].filter(Boolean).join('\n'),
      form: 'viewing',
      property: propertyId,
      page: location.pathname,
      locale,
      consent: true,
      utm: readUtm(),
      website: get('website'),
    }).catch(() => ({ ok: false as const, error: 'server' as const }))
    if (res.ok) setState('ok')
    else {
      setState('error')
      setErr(tl(res.error === 'rate' ? 'errRate' : res.error === 'invalid' ? 'errInvalid' : 'errServer'))
    }
  }

  return (
    <form className="viewform" id="view" noValidate onSubmit={onSubmit}>
      <h2>{t('title')}</h2>
      {state === 'ok' ? (
        <div className="notice ok" style={{ display: 'block' }} role="status">{t('thanks', { id: propertyId })}</div>
      ) : (
        <>
          <div className="seg2" role="radiogroup" aria-label={t('format')}>
            <label><input type="radio" name="fmt" value="live" defaultChecked /><span>{t('live')}</span></label>
            <label><input type="radio" name="fmt" value="video" /><span>{t('video')}</span></label>
          </div>
          <div className={`fld${bad.name ? ' invalid' : ''}`}><label htmlFor="v-name">{tl('name')}</label><input id="v-name" name="name" required autoComplete="name" maxLength={80} /><span className="err-msg">{tl('errName')}</span></div>
          <div className={`fld${bad.phone ? ' invalid' : ''}`}><label htmlFor="v-phone">{t('phone')}</label><input id="v-phone" name="phone" type="tel" required placeholder="+7 900 000 00 00" autoComplete="tel" maxLength={24} /><span className="err-msg">{t('errPhone')}</span></div>
          <div className="fld"><label htmlFor="v-date">{t('date')} <span className="hint">({tl('optional')})</span></label><input id="v-date" name="date" type="date" /></div>
          <div className="hp" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <div className={`fld${bad.consent ? ' invalid' : ''}`}>
            <label className="check"><input type="checkbox" name="consent" required /><span>{t.rich('consent', { link: (c) => <Link href="/privacy" style={{ textDecoration: 'underline' }}>{c}</Link> })}</span></label>
            <span className="err-msg">{tl('errConsent')}</span>
          </div>
          <button className="btn btn-coral" type="submit" disabled={state === 'busy'}>{state === 'busy' ? tl('sending') : t('submit')}</button>
          {state === 'error' && <div className="notice err" style={{ display: 'block' }} role="alert">{err}</div>}
        </>
      )}
    </form>
  )
}
