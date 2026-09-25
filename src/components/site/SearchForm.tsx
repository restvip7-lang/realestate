'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { useRouter } from '@/i18n/navigation'
import { CURRENCY_SYMBOL } from '@/lib/catalog'

import { useMoney } from './Currency'

// Поиск на главной: собирает фильтры и ведёт в каталог /sale или /rent. Бюджет вводится в выбранной валюте.
export function SearchForm({ districts }: { districts: { slug: string; name: string }[] }) {
  const t = useTranslations('search')
  const router = useRouter()
  const { cur, toEur } = useMoney()
  const [deal, setDeal] = useState<'sale' | 'rent'>('sale')
  const [more, setMore] = useState(false)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const id = String(f.get('id') || '').replace(/\D/g, '')
    if (id) return router.push(`/property/${id}`)
    const q = new URLSearchParams()
    for (const k of ['type', 'district', 'rooms', 'sea', 'area']) {
      const v = String(f.get(k) || '').trim()
      if (v) q.set(k, v)
    }
    for (const k of ['min', 'max']) {
      const v = Number(String(f.get(k) || '').replace(/\D/g, ''))
      if (v) q.set(k, String(Math.round(toEur(v))))
    }
    for (const k of ['view', 'furn', 'new', 'cit']) if (f.get(k)) q.set(k, k === 'view' ? 'sea' : '1')
    router.push(`/${deal}${q.size ? `?${q}` : ''}`)
  }

  return (
    <form className="search" role="search" aria-label={t('label')} onSubmit={onSubmit}>
      <div className="tabs" role="tablist" aria-label={t('dealLabel')}>
        {(['sale', 'rent'] as const).map((d) => (
          <button key={d} type="button" role="tab" aria-selected={deal === d} onClick={() => setDeal(d)}>{t(d)}</button>
        ))}
      </div>
      <div className="sfields">
        <div className="fld">
          <label htmlFor="f-type">{t('type')}</label>
          <select id="f-type" name="type">
            <option value="">{t('any')}</option>
            {(['apartment', 'penthouse', 'villa', 'duplex'] as const).map((k) => <option key={k} value={k}>{t(`types.${k}`)}</option>)}
          </select>
        </div>
        <div className="fld">
          <label htmlFor="f-dist">{t('district')}</label>
          <select id="f-dist" name="district">
            <option value="">{t('allDistricts')}</option>
            {districts.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
          </select>
        </div>
        <div className="fld">
          <label htmlFor="f-rooms">{t('rooms')}</label>
          <select id="f-rooms" name="rooms">
            <option value="">{t('anyRooms')}</option>
            <option value="1+0">{t('studio')}</option>
            {['1+1', '2+1', '3+1'].map((r) => <option key={r}>{r}</option>)}
            <option value="4+">{t('fourPlus')}</option>
          </select>
        </div>
        <div className="fld">
          <span className="lbl" id="budget-lbl">{t(deal === 'rent' ? 'budgetRent' : 'budget', { sym: CURRENCY_SYMBOL[cur] })}</span>
          <div className="budget" role="group" aria-labelledby="budget-lbl">
            <input name="min" inputMode="numeric" placeholder={t('from')} aria-label={t('priceFrom')} />
            <input name="max" inputMode="numeric" placeholder={t('to')} aria-label={t('priceTo')} />
          </div>
        </div>
        <button className="btn btn-coral" type="submit">{t('find')}</button>
      </div>
      <div className={`more-f${more ? ' open' : ''}`} id="more-f">
        <div className="fld"><label htmlFor="f-id">{t('id')}</label><input id="f-id" name="id" inputMode="numeric" placeholder={t('idPh')} /></div>
        <div className="fld">
          <label htmlFor="f-sea">{t('sea')}</label>
          <select id="f-sea" name="sea">
            <option value="">{t('any')}</option>
            {[100, 300, 700].map((m) => <option key={m} value={m}>{t('upToM', { m })}</option>)}
            <option value="1000">{t('upTo1km')}</option>
          </select>
        </div>
        <div className="fld"><label htmlFor="f-area">{t('area')}</label><input id="f-area" name="area" inputMode="numeric" placeholder="50" /></div>
        <div className="checks">
          <label className="check"><input type="checkbox" name="view" />{t('seaView')}</label>
          <label className="check"><input type="checkbox" name="furn" />{t('furnished')}</label>
          <label className="check"><input type="checkbox" name="new" />{t('newBuild')}</label>
          <label className="check"><input type="checkbox" name="cit" />{t('citizenship')}</label>
        </div>
      </div>
      <div className="sfoot">
        <button type="button" aria-expanded={more} aria-controls="more-f" onClick={() => setMore(!more)}>{t(more ? 'lessFilters' : 'moreFilters')}</button>
      </div>
    </form>
  )
}
