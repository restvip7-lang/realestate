'use client'

import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'

import type * as Leaflet from 'leaflet'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { CURRENCY_SYMBOL } from '@/lib/catalog'

import { type CatView, setCatView, useCatView } from './catView'
import { formatNum, useMoney } from './Currency'

export type MapPoint = { id: number; href: string; lat: number; lng: number; eur: number; deal: 'sale' | 'rent'; hint: string; title: string; img: string | null }

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/** Кнопки вида в панели фильтров */
export function ViewButtons() {
  const t = useTranslations('catalog')
  const view = useCatView()
  const btn = (v: CatView, title: string, icon: React.ReactNode) => (
    <button type="button" aria-pressed={view === v} title={title} aria-label={title} onClick={() => setCatView(v)}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">{icon}</svg>
    </button>
  )
  return (
    <div className="views" role="group" aria-label={t('viewsLabel')}>
      {btn('split', t('viewSplit'), <><rect x="3" y="4" width="8" height="16" rx="1" /><path d="M14 4l3 1.5L20 4v16l-3 1.5-3-1.5z" /></>)}
      {btn('list', t('viewList'), <><rect x="3" y="4" width="7" height="7" rx="1" /><rect x="14" y="4" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>)}
      {btn('map', t('viewMap'), <><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" /><path d="M9 4v16M15 6v16" /></>)}
    </div>
  )
}

/** Каталог: колонка списка (children) + карта с ценами. Leaflet грузится только в браузере. */
export function CatalogLayout({ points, children }: { points: MapPoint[]; children: React.ReactNode }) {
  const t = useTranslations('catalog')
  const tc = useTranslations('card')
  const view = useCatView()
  const { rate, cur } = useMoney()
  const box = useRef<HTMLDivElement>(null)
  const map = useRef<{ L: typeof Leaflet; map: Leaflet.Map; cluster: Leaflet.MarkerClusterGroup } | null>(null)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const bounds = useRef<Leaflet.LatLngBounds | null>(null)
  const fitted = useRef(false) // карта была видна, когда подгоняли масштаб

  // создаём карту один раз
  useEffect(() => {
    let off = false
    ;(async () => {
      try {
        const L = (await import('leaflet')).default
        ;(window as unknown as { L: typeof Leaflet }).L = L
        await import('leaflet.markercluster')
        if (off || !box.current || map.current) return
        const m = L.map(box.current, { scrollWheelZoom: true, zoomControl: !window.matchMedia('(max-width: 760px)').matches }).setView([36.545, 31.99], 11)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(m)
        const cluster = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 40, disableClusteringAtZoom: 14 })
        m.addLayer(cluster)
        map.current = { L, map: m, cluster }
        setReady(true)
      } catch {
        setFailed(true)
      }
    })()
    return () => {
      off = true
      map.current?.map.remove()
      map.current = null
    }
  }, [])

  // метки: пересобираем при смене фильтров или валюты
  useEffect(() => {
    const m = map.current
    if (!ready || !m) return
    const sym = CURRENCY_SYMBOL[cur]
    const fmt = (eur: number) => `${formatNum(eur * rate)} ${sym}`
    const short = (p: MapPoint) => {
      const v = p.eur * rate
      if (p.deal === 'rent') return fmt(p.eur)
      return v >= 1e6 ? `${t('mln', { n: (v / 1e6).toFixed(1).replace('.0', '') })} ${sym}` : `${t('k', { n: Math.round(v / 1000) })} ${sym}`
    }
    m.cluster.clearLayers()
    const markers = points.map((p) => {
      const mk = m.L.marker([p.lat, p.lng], {
        icon: m.L.divIcon({ className: 'pm-wrap', html: `<span class="pm ${p.deal}" data-mid="${p.id}">${esc(short(p))}</span>`, iconSize: [0, 0] }),
        title: p.title,
        keyboard: true,
      })
      mk.bindPopup(
        `<div class="pop">${p.img ? `<img src="${esc(p.img)}" alt="">` : ''}<div><span class="hint">${esc(p.hint)}</span><b>${esc(fmt(p.eur) + (p.deal === 'rent' ? tc('perMonth') : ''))}</b><span>${esc(p.title)}</span><a href="${esc(p.href)}">${esc(t('more'))}</a></div></div>`,
        { maxWidth: 240 },
      )
      return mk
    })
    m.cluster.addLayers(markers)
    bounds.current = points.length ? m.L.latLngBounds(points.map((p) => [p.lat, p.lng])) : null
    fitted.current = !!box.current?.clientWidth
    if (bounds.current) m.map.fitBounds(bounds.current, { padding: [40, 40], maxZoom: 14 })
  }, [points, ready, rate, cur, t, tc])

  // колонка карты могла быть скрыта — пересчитать размер
  useEffect(() => {
    const id = setTimeout(() => {
      const m = map.current
      if (!m || !box.current?.clientWidth) return
      m.map.invalidateSize()
      if (!fitted.current && bounds.current) {
        m.map.fitBounds(bounds.current, { padding: [40, 40], maxZoom: 14 })
        fitted.current = true
      }
    }, 50)
    return () => clearTimeout(id)
  }, [view, ready])

  // наведение на карточку подсвечивает метку
  useEffect(() => {
    const hl = (e: Event, on: boolean) => {
      const id = (e.target as HTMLElement).closest<HTMLElement>('[data-pid]')?.dataset.pid
      if (id) document.querySelector(`.pm[data-mid="${id}"]`)?.classList.toggle('hl', on)
    }
    const over = (e: Event) => hl(e, true)
    const out = (e: Event) => hl(e, false)
    document.addEventListener('mouseover', over)
    document.addEventListener('mouseout', out)
    return () => {
      document.removeEventListener('mouseover', over)
      document.removeEventListener('mouseout', out)
    }
  }, [])

  return (
    <>
      <main className={`cat${view === 'list' ? ' list-only' : view === 'map' ? ' map-only' : ''}`}>
        {children}
        <aside className="mapcol" aria-label={t('mapLabel')}>
          <div id="map" ref={box} role="application" aria-label={t('mapLabel')} />
          {failed && <div className="empty" style={{ position: 'absolute', inset: 24, height: 'fit-content' }}>{t('mapFail')}</div>}
        </aside>
      </main>
      <button type="button" className="mob-toggle" onClick={() => setCatView(view === 'map' ? 'split' : 'map')}>
        {view === 'map' ? t('list') : t('map')}
      </button>
    </>
  )
}
