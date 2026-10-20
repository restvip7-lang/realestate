import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { districtOf, propertyPhotos } from '@/lib/data'
import { propertyPath } from '@/lib/format'
import type { Property } from '@/payload-types'

import { Price } from './Currency'
import { FavButton } from './FavButton'

/** Срок сдачи проекта: «Сдача 2026» (год сдачи в Stay — поле year; сдан ли дом, Stay не сообщает). */
export async function handover(year: number | null | undefined) {
  if (!year) return null
  return (await getTranslations('projects'))('handover', { year })
}

// Карточка новостройки в разделе /projects: планировки, площади «от–до», цена «от», срок сдачи.
export async function ProjectCard({ p, priority = false }: { p: Property; priority?: boolean }) {
  const t = await getTranslations('projects')
  const tc = await getTranslations('card')
  const d = districtOf(p)
  const photos = propertyPhotos(p, 'card')
  const cover = photos[0]
  const when = await handover(p.year)
  return (
    <article className="card prj" data-pid={p.id}>
      <div className="ph">
        {cover ? <Image src={cover.src} alt={t('coverAlt', { title: p.title, district: d?.name ?? '' })} width={640} height={480} sizes="(max-width: 760px) 100vw, 400px" priority={priority} unoptimized={cover.remote} /> : null}
        <div className="badges">
          {when && <span className="badge new">{when}</span>}
          {p.citizenship && <span className="badge">{t('citizenship')}</span>}
        </div>
        <FavButton id={p.id} />
        <span className="photos">{tc('photos', { n: photos.length })}</span>
      </div>
      <div className="bd">
        <span className="loc">{d?.slug === 'gazipasa' ? d.name : <>{d?.name} · {tc('alanya')}</>}</span>
        <h3><Link href={propertyPath(p)}>{p.title}</Link></h3>
        <div className="specs">
          {p.layouts ? <span>{p.layouts}</span> : p.rooms ? <span>{p.rooms}</span> : null}
          {p.area ? <span>{p.areaTo ? `${p.area}–${p.areaTo}` : p.area} {tc('sqm')}</span> : null}
          {p.sea != null && <span>{tc('toSea', { m: p.sea })}</span>}
        </div>
        <div className="price-row">
          <span className="price">{p.price ? <>{p.priceFrom && `${tc('fromPrice')} `}<Price eur={p.price} /></> : tc('priceOnRequest')}</span>
          <span className="more">{tc('more')}</span>
        </div>
        <span className="upd">
          {p.installment?.months ? <>{t('installment')} · </> : null}
          {(p.features?.length ?? 0) > 0 && <>{t('features', { n: p.features!.length })} · </>}
          <span className="id">ID {p.id}</span>
        </span>
      </div>
    </article>
  )
}
