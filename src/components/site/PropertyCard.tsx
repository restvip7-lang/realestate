import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { districtOf, mediaUrl } from '@/lib/data'
import { fmtDate, propertyPath, roomsHint, typeName } from '@/lib/format'
import type { Property } from '@/payload-types'

import { Price } from './Currency'
import { FavButton } from './FavButton'

const PIN = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" /></svg>
)

export async function PropertyCard({ p, priority = false }: { p: Property; priority?: boolean }) {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('card')
  const d = districtOf(p)
  const rent = p.deal === 'rent'
  const photos = (p.photos || []).filter((m) => typeof m === 'object')
  const cover = mediaUrl(photos[0], 'card')
  const badges: [string, string][] = []
  if (rent) badges.push(['rent', t('rent')])
  if (p.condition !== 'resale') badges.push(['new', t('newBuild')])
  else if (p.view === 'sea') badges.push(['sea', t('seaView')])
  const floor = p.type === 'villa' ? t('floors', { n: p.floors ?? 1 }) : t('floor', { n: p.floor ?? 1 })
  const title = `${typeName(p.type, locale)} ${p.rooms ?? ''}, ${d?.name ?? ''}`
  return (
    <article className="card">
      <div className="ph">
        {cover ? <Image src={cover} alt={`${title}, ${t('alanya')}`} width={640} height={480} sizes="(max-width: 760px) 100vw, 400px" priority={priority} /> : null}
        <div className="badges">
          {badges.slice(0, 2).map(([c, label]) => <span key={c} className={`badge ${c}`}>{label}</span>)}
        </div>
        <FavButton id={p.id} />
        <span className="photos">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="12" cy="12" r="3" /></svg>
          {t('photos', { n: photos.length })}
        </span>
      </div>
      <div className="bd">
        <span className="loc">{PIN}{d?.name} · {t('alanya')}</span>
        <h3><Link href={propertyPath(p)}>{p.title}</Link></h3>
        <div className="specs">
          <span><abbr title={t(roomsHint(p.rooms).key, roomsHint(p.rooms).values)}>{p.rooms}</abbr></span>
          <span>{p.area} {t('sqm')}</span>
          <span>{floor}</span>
          <span>{t('toSea', { m: p.sea ?? 0 })}</span>
        </div>
        <div className="price-row">
          <span className="price"><Price eur={p.price ?? 0} suffix={rent ? t('perMonth') : ''} /></span>
          <span className="more">{t('more')}</span>
        </div>
        <span className="upd">
          {rent
            ? t('availableFrom', { date: fmtDate(p.rent?.availableFrom, locale) || '—' })
            : <><Price eur={(p.price ?? 0) / (p.area || 1)} suffix={t('perM2')} /> · {t('updated', { date: fmtDate(p.priceCheckedAt, locale) })}</>}
          {' · '}<span className="id">ID {p.id}</span>
        </span>
      </div>
    </article>
  )
}
