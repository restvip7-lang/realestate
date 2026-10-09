import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { districtOf, propertyPhotos } from '@/lib/data'
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
  const photos = propertyPhotos(p, 'card')
  const cover = photos[0]
  const badges: [string, string][] = []
  if (rent) badges.push(['rent', t('rent')])
  if (p.condition !== 'resale') badges.push(['new', t('newBuild')])
  else if (p.view === 'sea') badges.push(['sea', t('seaView')])
  // у объектов из Stay этажа нет — тогда не показываем
  const floor = p.type === 'villa' ? (p.floors ? t('floors', { n: p.floors }) : null) : p.floor ? t('floor', { n: p.floor }) : null
  const title = `${typeName(p.type, locale)} ${p.rooms ?? ''}, ${d?.name ?? ''}`
  return (
    <article className="card" data-pid={p.id}>
      <div className="ph">
        {cover ? <Image src={cover.src} alt={`${title}, ${t('alanya')}`} width={640} height={480} sizes="(max-width: 760px) 100vw, 400px" priority={priority} unoptimized={cover.remote} /> : null}
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
          {p.layouts ? <span>{p.layouts}</span> : p.rooms ? <span><abbr title={t(roomsHint(p.rooms).key, roomsHint(p.rooms).values)}>{p.rooms}</abbr></span> : null}
          {p.area ? <span>{p.areaTo ? `${p.area}–${p.areaTo}` : p.area} {t('sqm')}</span> : null}
          {floor && <span>{floor}</span>}
          {p.sea != null && <span>{t('toSea', { m: p.sea })}</span>}
        </div>
        <div className="price-row">
          <span className="price">{p.priceFrom && `${t('fromPrice')} `}<Price eur={p.price ?? 0} suffix={rent ? t('perMonth') : ''} /></span>
          <span className="more">{t('more')}</span>
        </div>
        <span className="upd">
          {rent
            ? t('availableFrom', { date: fmtDate(p.rent?.availableFrom, locale) || '—' })
            : <>{p.area ? <><Price eur={(p.price ?? 0) / p.area} suffix={t('perM2')} /> · </> : null}{p.priceCheckedAt ? <>{t('updated', { date: fmtDate(p.priceCheckedAt, locale) })} · </> : null}</>}
          {rent && ' · '}<span className="id">ID {p.id}</span>
        </span>
      </div>
    </article>
  )
}
