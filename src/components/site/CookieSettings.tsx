'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { type Consent, readConsent, saveConsent } from './consent'

// Настройки cookies на странице политики
export function CookieSettings() {
  const t = useTranslations('cookies')
  const locale = useLocale()
  const [c, setC] = useState<Consent | null>(null)
  const [a, setA] = useState(false)
  const [ads, setAds] = useState(false)
  useEffect(() => {
    const cur = readConsent()
    setC(cur) // eslint-disable-line react-hooks/set-state-in-effect -- значение есть только в браузере
    setA(!!cur?.analytics)
    setAds(!!cur?.ads)
  }, [])
  const save = (analytics: boolean, adsOn: boolean) => {
    setA(analytics)
    setAds(adsOn)
    setC(saveConsent({ analytics, ads: adsOn }))
  }
  return (
    <form className="cset" aria-label={t('settingsLabel')} onSubmit={(e) => { e.preventDefault(); save(a, ads) }}>
      <label><input type="checkbox" checked disabled /><span><b>{t('necessaryTitle')}</b><small>{t('necessaryText')}</small></span></label>
      <label><input type="checkbox" checked={a} onChange={(e) => setA(e.target.checked)} /><span><b>{t('analyticsTitle')}</b><small>{t('analyticsText')}</small></span></label>
      <label><input type="checkbox" checked={ads} onChange={(e) => setAds(e.target.checked)} /><span><b>{t('adsTitle')}</b><small>{t('adsText')}</small></span></label>
      <div className="contacts">
        <button type="submit" className="btn btn-dark btn-sm">{t('save')}</button>
        <button type="button" className="btn btn-line btn-sm" onClick={() => save(true, true)}>{t('allowAll')}</button>
      </div>
      <small className="hint" aria-live="polite">
        {c
          ? t('saved', { date: new Date(c.date).toLocaleString(locale), analytics: t(c.analytics ? 'yes' : 'no'), ads: t(c.ads ? 'yes' : 'no') })
          : t('notChosen')}
      </small>
    </form>
  )
}
