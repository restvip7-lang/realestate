import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { type DistrictStat, mediaUrl } from '@/lib/data'
import { districtPm } from '@/lib/district-prices'
import type { District } from '@/payload-types'

import { Price } from './Currency'

export async function DistrictCard({ d, stat }: { d: District; stat?: DistrictStat }) {
  const t = await getTranslations('districts')
  const tcard = await getTranslations('card')
  const img = mediaUrl(d.image, 'card')
  const km = Math.abs(d.coastKm ?? 0)
  const pm = districtPm(d, stat)
  return (
    <article className="dcard">
      {img && <Image src={img} alt="" width={700} height={467} sizes="(max-width: 760px) 100vw, 400px" />}
      <div className="tl">
        {d.inland ? <span className="in">{t('tagInland')}</span> : <span>{t('tagSea')}</span>}
        {(d.scores?.life ?? 0) >= 5 && <span>{t('tagLife')}</span>}
      </div>
      <h3><Link href={`/districts/${d.slug}`}>{d.name}</Link></h3>
      {d.lead && <p className="about">{d.lead}</p>}
      <div className="meta">
        {pm && <span><b><Price eur={pm.eur} suffix={tcard('perM2')} /></b></span>}
        <span>{km ? `${t('km', { n: km })} ${t('toCenter')}` : t('center')}</span>
        <span>{t('onSale', { n: stat?.sale ?? 0 })}</span>
      </div>
    </article>
  )
}
