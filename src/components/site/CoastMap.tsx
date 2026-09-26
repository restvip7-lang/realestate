import { getTranslations } from 'next-intl/server'

import { getPathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { COAST, MOUNTAINS } from '@/lib/coast'
import type { District } from '@/payload-types'

// Рисованная схема побережья с районами-ссылками. current — выделенный район, labels — у каких районов подписи.
export async function CoastMap({ districts, locale, current, labels, viewBox = '0 0 1000 440', zoom = false, label }: {
  districts: District[]
  locale: Locale
  current?: string
  labels?: string[]
  viewBox?: string
  zoom?: boolean
  label: string
}) {
  const t = await getTranslations('districts')
  return (
    <svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet" role="img" aria-label={label} className={zoom ? 'zoom' : undefined}>
      <defs>
        <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="rgba(0,163,196,.28)" /></pattern>
      </defs>
      <path d={`${COAST} L1000 440 L0 440Z`} fill="url(#dots)" />
      <g fill="none" stroke="rgba(255,255,255,.08)">{MOUNTAINS.map((p) => <path key={p} d={p} />)}</g>
      <path d={COAST} fill="none" stroke="#00A3C4" strokeWidth="1.6" />
      {!zoom && (
        <>
          <text x="330" y="330" fill="rgba(255,255,255,.3)" style={{ font: '500 13px var(--f-body)', letterSpacing: '.3em' }}>{t('mapSea')}</text>
          <text x="40" y="30" fill="rgba(255,255,255,.28)" style={{ font: '500 12px var(--f-body)', letterSpacing: '.3em' }}>{t('mapMountains')}</text>
        </>
      )}
      <text x="930" y="392" fill="rgba(255,255,255,.55)" style={{ font: '600 12px var(--f-body)' }} textAnchor="end">{t('mapAirport')}</text>
      {districts.map((d) => {
        const x = d.schema?.x ?? 0, y = d.schema?.y ?? 0
        const on = d.slug === current
        const showLabel = on || !labels || labels.includes(d.slug)
        const cls = `pin${d.inland ? ' inland' : ''}${on ? ' on' : ''}`
        const inner = (
          <>
            <circle className="dot" cx={x} cy={y} r={on ? 10 : zoom ? 6 : 7} />
            {showLabel && <text x={x} y={y - (on ? 18 : zoom ? 14 : 16)} textAnchor="middle">{d.name}</text>}
          </>
        )
        return on ? (
          <g key={d.slug} className={cls}>{inner}</g>
        ) : (
          <a key={d.slug} className={cls} href={getPathname({ href: `/districts/${d.slug}`, locale })} aria-label={t('mapDistrict', { name: d.name })}>{inner}</a>
        )
      })}
    </svg>
  )
}
