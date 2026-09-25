'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { Link, useRouter } from '@/i18n/navigation'
import { CURRENCY_SYMBOL } from '@/lib/catalog'
import { catalogQueryString } from '@/lib/catalog-params'
import type { CatalogQuery } from '@/lib/data'

import { useMoney } from './Currency'

type Props = { q: CatalogQuery; districts: { slug: string; name: string }[] }

// Панель фильтров каталога (сверху) и шторка «Фильтры» (на телефоне и для редких параметров).
// Любое изменение меняет адрес страницы; список пересчитывает сервер.
export function CatalogFilters({ q, districts }: Props) {
  const t = useTranslations('catalog')
  const ts = useTranslations('search')
  const router = useRouter()
  const { cur, rate } = useMoney()
  const [sheet, setSheet] = useState(false)
  const deal = q.deal || 'sale'
  const go = (patch: Partial<CatalogQuery>, d = deal) => router.push(`/${d}${catalogQueryString({ ...q, page: undefined, deal: d }, patch)}`, { scroll: false })
  const shown = (eur?: number) => (eur ? String(Math.round(eur * rate)) : '')
  const toEur = (v: string) => {
    const n = Number(v.replace(/\D/g, ''))
    return n ? Math.round(n / rate) : undefined
  }
  const extra = [q.sea, q.area, q.seaView, q.furnished, q.newBuild, q.citizenship].filter(Boolean).length

  const panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!sheet) return
    document.body.style.overflow = 'hidden'
    panel.current?.querySelector<HTMLElement>('button, input, select')?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSheet(false)
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [sheet])

  const priceInputs = (cls?: string) => (
    <div className={cls}>
      <input key={`min-${cur}-${q.min}`} inputMode="numeric" placeholder={t('priceFrom')} aria-label={ts('priceFrom')} defaultValue={shown(q.min)}
        onBlur={(e) => toEur(e.target.value) !== q.min && go({ min: toEur(e.target.value) })}
        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), (e.target as HTMLInputElement).blur())} />
      <input key={`max-${cur}-${q.max}`} inputMode="numeric" placeholder={ts('to')} aria-label={ts('priceTo')} defaultValue={shown(q.max)}
        onBlur={(e) => toEur(e.target.value) !== q.max && go({ max: toEur(e.target.value) })}
        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), (e.target as HTMLInputElement).blur())} />
    </div>
  )

  return (
    <>
      <form className="fbar" role="search" aria-label={t('filtersLabel')} onSubmit={(e) => e.preventDefault()}>
        <div className="wrap">
          <div className="dealsw" role="group" aria-label={ts('dealLabel')}>
            {(['sale', 'rent'] as const).map((d) => (
              <Link key={d} href={`/${d}`} aria-pressed={deal === d} role="button">{ts(d)}</Link>
            ))}
          </div>
          <select className="hide-m" aria-label={ts('type')} value={q.type || ''} onChange={(e) => go({ type: e.target.value || undefined })}>
            <option value="">{t('anyType')}</option>
            {(['apartment', 'penthouse', 'villa', 'duplex'] as const).map((k) => <option key={k} value={k}>{t(`typesPlural.${k}`)}</option>)}
          </select>
          <select className="hide-m" aria-label={ts('district')} value={q.district || ''} onChange={(e) => go({ district: e.target.value || undefined })}>
            <option value="">{ts('allDistricts')}</option>
            {districts.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
          </select>
          <select className="hide-t" aria-label={ts('rooms')} value={q.rooms || ''} onChange={(e) => go({ rooms: e.target.value || undefined })}>
            <option value="">{ts('rooms')}</option>
            {['1+0', '1+1', '2+1', '3+1'].map((r) => <option key={r}>{r}</option>)}
            <option value="4+">{ts('fourPlus')}</option>
          </select>
          {priceInputs('price-in hide-t')}
          <button type="button" className="fbtn" aria-controls="sheet" aria-expanded={sheet} onClick={() => setSheet(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
            {t('filters')} {extra > 0 && <span className="n">{extra}</span>}
          </button>
        </div>
      </form>

      <div className={`sheet${sheet ? ' open' : ''}`} id="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-t">
        <div className="scrim" onClick={() => setSheet(false)} />
        <div className="panel" ref={panel}>
          <div className="ph">
            <h2 id="sheet-t">{t('filters')}</h2>
            <button type="button" className="icon-btn" aria-label={t('closeFilters')} style={{ borderColor: 'var(--line)' }} onClick={() => setSheet(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          <div className="pb">
            <div className="fld"><span className="lbl">{ts('type')}</span>
              <div className="opt">
                {(['apartment', 'penthouse', 'villa', 'duplex'] as const).map((k) => (
                  <label key={k}><input type="radio" name="s-type" checked={q.type === k} onChange={() => go({ type: k })} onClick={() => q.type === k && go({ type: undefined })} />{t(`typesPlural.${k}`)}</label>
                ))}
              </div>
            </div>
            <div className="fld">
              <label htmlFor="s-district">{ts('district')}</label>
              <select id="s-district" value={q.district || ''} onChange={(e) => go({ district: e.target.value || undefined })}>
                <option value="">{ts('allDistricts')}</option>
                {districts.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
              </select>
            </div>
            <div className="fld"><span className="lbl">{ts('rooms')}</span>
              <div className="opt">
                {['1+0', '1+1', '2+1', '3+1', '4+'].map((r) => (
                  <label key={r}><input type="radio" name="s-rooms" checked={q.rooms === r} onChange={() => go({ rooms: r })} onClick={() => q.rooms === r && go({ rooms: undefined })} />{r === '4+' ? '4+1…' : r}</label>
                ))}
              </div>
            </div>
            <div className="fld"><span className="lbl">{ts(deal === 'rent' ? 'budgetRent' : 'budget', { sym: CURRENCY_SYMBOL[cur] })}</span>{priceInputs('row')}</div>
            <div className="row">
              <div className="fld">
                <label htmlFor="s-sea">{ts('sea')}</label>
                <select id="s-sea" value={q.sea || ''} onChange={(e) => go({ sea: Number(e.target.value) || undefined })}>
                  <option value="">{ts('any')}</option>
                  {[100, 300, 700].map((m) => <option key={m} value={m}>{ts('upToM', { m })}</option>)}
                  <option value="1000">{ts('upTo1km')}</option>
                </select>
              </div>
              <div className="fld">
                <label htmlFor="s-area">{ts('area')}</label>
                <input id="s-area" inputMode="numeric" key={`area-${q.area}`} defaultValue={q.area || ''} onBlur={(e) => go({ area: Number(e.target.value.replace(/\D/g, '')) || undefined })} />
              </div>
            </div>
            <div className="fld"><span className="lbl">{t('features')}</span>
              <div className="feats-f">
                <label className="check"><input type="checkbox" checked={!!q.seaView} onChange={(e) => go({ seaView: e.target.checked })} />{ts('seaView')}</label>
                <label className="check"><input type="checkbox" checked={!!q.furnished} onChange={(e) => go({ furnished: e.target.checked })} />{ts('furnished')}</label>
                <label className="check"><input type="checkbox" checked={!!q.newBuild} onChange={(e) => go({ newBuild: e.target.checked })} />{ts('newBuild')}</label>
                {deal === 'sale' && <label className="check"><input type="checkbox" checked={!!q.citizenship} onChange={(e) => go({ citizenship: e.target.checked })} />{ts('citizenship')}</label>}
              </div>
            </div>
          </div>
          <div className="pf">
            <Link href={`/${deal}`} className="btn btn-line" onClick={() => setSheet(false)}>{t('reset')}</Link>
            <button type="button" className="btn btn-coral" onClick={() => setSheet(false)}>{t('show')}</button>
          </div>
        </div>
      </div>
    </>
  )
}

export function SortSelect({ q }: { q: CatalogQuery }) {
  const t = useTranslations('catalog')
  const router = useRouter()
  const deal = q.deal || 'sale'
  return (
    <>
      <label className="vh" htmlFor="sort">{t('sort')}</label>
      <select id="sort" value={q.sort || 'new'} onChange={(e) => router.push(`/${deal}${catalogQueryString({ ...q, page: undefined }, { sort: e.target.value as CatalogQuery['sort'] })}`, { scroll: false })}>
        {(['new', 'cheap', 'expensive', 'sea'] as const).map((s) => <option key={s} value={s}>{t(`sorts.${s}`)}</option>)}
      </select>
    </>
  )
}
