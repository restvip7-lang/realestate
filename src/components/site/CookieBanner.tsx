'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { Link } from '@/i18n/navigation'

import { readConsent, saveConsent } from './consent'

// Баннер согласия на cookies: показывается, пока посетитель не сделал выбор
export function CookieBanner() {
  const t = useTranslations('cookies')
  const [show, setShow] = useState(false)
  useEffect(() => {
    setShow(!readConsent()) // eslint-disable-line react-hooks/set-state-in-effect -- выбор хранится только в браузере
  }, [])
  if (!show) return null
  const pick = (all: boolean) => {
    saveConsent({ analytics: all, ads: all })
    setShow(false)
  }
  return (
    <div className="cookie-bar" role="region" aria-label={t('label')}>
      <p>{t.rich('text', { link: (c) => <Link href="/privacy#cookies">{c}</Link> })}</p>
      <div className="cookie-acts">
        <button type="button" className="btn btn-line btn-sm" onClick={() => pick(false)}>{t('necessary')}</button>
        <button type="button" className="btn btn-coral btn-sm" onClick={() => pick(true)}>{t('all')}</button>
      </div>
    </div>
  )
}
