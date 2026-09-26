'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { submitReview, type ReviewInput } from '@/app/(frontend)/actions'
import { Link } from '@/i18n/navigation'

export function ReviewForm({ experts }: { experts: { id: number; name: string }[] }) {
  const t = useTranslations('reviews')
  const tl = useTranslations('lead')
  const [state, setState] = useState<'idle' | 'busy' | 'ok' | 'error'>('idle')
  const [bad, setBad] = useState<Record<string, boolean>>({})
  const [err, setErr] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const get = (k: string) => String(f.get(k) || '').trim()
    const invalid = { who: !get('who'), text: get('text').length < 30, consent: !f.get('consent') }
    setBad(invalid)
    if (Object.values(invalid).some(Boolean)) return
    setState('busy')
    const res = await submitReview({
      who: get('who'), country: get('country'), rating: Number(get('rate')), service: get('service') as ReviewInput['service'],
      expert: Number(get('expert')) || undefined, text: get('text'), consent: true, website: get('website'),
    }).catch(() => ({ ok: false as const, error: 'server' as const }))
    if (res.ok) setState('ok')
    else {
      setState('error')
      setErr(tl(res.error === 'rate' ? 'errRate' : res.error === 'invalid' ? 'errInvalid' : 'errServer'))
    }
  }

  if (state === 'ok') return <div className="lform"><div className="notice ok show" role="status">{t('thanks')}</div></div>
  return (
    <form className="lform" noValidate onSubmit={onSubmit}>
      <div className="row2">
        <div className={`fld${bad.who ? ' invalid' : ''}`}><label htmlFor="r-name">{t('name')}</label><input id="r-name" name="who" required autoComplete="name" maxLength={40} /><span className="err-msg">{tl('errName')}</span></div>
        <div className="fld"><label htmlFor="r-country">{t('country')} <span className="hint">({tl('optional')})</span></label><input id="r-country" name="country" maxLength={30} /></div>
      </div>
      <div className="fld">
        <span className="lbl" id="r-rate-l">{t('rating')}</span>
        <div className="stars-in" role="radiogroup" aria-labelledby="r-rate-l">
          {[5, 4, 3, 2, 1].flatMap((n) => [
            <input key={`i${n}`} type="radio" name="rate" id={`r${n}`} value={n} defaultChecked={n === 5} />,
            <label key={`l${n}`} htmlFor={`r${n}`} title={t('ofFive', { n })}>★</label>,
          ])}
        </div>
      </div>
      <div className="row2">
        <div className="fld">
          <label htmlFor="r-svc">{t('service')}</label>
          <select id="r-svc" name="service">{(['buy', 'rent', 'docs', 'sell'] as const).map((k) => <option key={k} value={k}>{t(`services.${k}`)}</option>)}</select>
        </div>
        <div className="fld">
          <label htmlFor="r-exp">{t('expert')} <span className="hint">({tl('optional')})</span></label>
          <select id="r-exp" name="expert"><option value="">{t('dontRemember')}</option>{experts.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
        </div>
      </div>
      <div className={`fld${bad.text ? ' invalid' : ''}`}>
        <label htmlFor="r-text">{t('text')}</label>
        <textarea id="r-text" name="text" required minLength={30} maxLength={600} placeholder={t('textPh')} />
        <span className="err-msg">{t('errText')}</span>
      </div>
      <div className="hp" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <div className={`fld${bad.consent ? ' invalid' : ''}`}>
        <label className="check"><input type="checkbox" name="consent" required /><span>{t.rich('consent', { link: (c) => <Link href="/privacy" style={{ textDecoration: 'underline' }}>{c}</Link> })}</span></label>
        <span className="err-msg">{tl('errConsent')}</span>
      </div>
      <button className="btn btn-coral" type="submit" disabled={state === 'busy'}>{state === 'busy' ? tl('sending') : t('submit')}</button>
      {state === 'error' && <div className="notice err show" role="alert">{err}</div>}
    </form>
  )
}
