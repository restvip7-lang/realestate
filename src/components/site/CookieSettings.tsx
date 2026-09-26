'use client'

import { useEffect, useState } from 'react'

import { type Consent, readConsent, saveConsent } from './consent'

// Настройки cookies на странице политики
export function CookieSettings() {
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
    <form className="cset" aria-label="Настройки cookies" onSubmit={(e) => { e.preventDefault(); save(a, ads) }}>
      <label><input type="checkbox" checked disabled /><span><b>Необходимые</b><small>Без них сайт не работает, отключить нельзя.</small></span></label>
      <label><input type="checkbox" checked={a} onChange={(e) => setA(e.target.checked)} /><span><b>Аналитика</b><small>Помогает понять, что улучшить на сайте.</small></span></label>
      <label><input type="checkbox" checked={ads} onChange={(e) => setAds(e.target.checked)} /><span><b>Реклама</b><small>Подборки и объявления с объектами, которые вы смотрели.</small></span></label>
      <div className="contacts">
        <button type="submit" className="btn btn-dark btn-sm">Сохранить выбор</button>
        <button type="button" className="btn btn-line btn-sm" onClick={() => save(true, true)}>Разрешить все</button>
      </div>
      <small className="hint" aria-live="polite">
        {c
          ? `Сохранено ${new Date(c.date).toLocaleString('ru-RU')}: аналитика — ${c.analytics ? 'да' : 'нет'}, реклама — ${c.ads ? 'да' : 'нет'}.`
          : 'Вы ещё не делали выбор: работают только необходимые cookies.'}
      </small>
    </form>
  )
}
