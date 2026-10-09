import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { coverOf } from '@/lib/data'
import type { Service } from '@/payload-types'

/** Карточка услуги из Stay Property (оформление как у карточки статьи, .pg .pcard). */
export async function ServiceCard({ s }: { s: Service }) {
  const t = await getTranslations('svc')
  const img = coverOf(s, 'card')
  return (
    <article className="pcard">
      {img ? <Image src={img.src} alt="" width={640} height={360} sizes="(max-width: 760px) 100vw, 400px" unoptimized={img.remote} /> : null}
      <div className="bd">
        <span className="meta-line"><span className="cat">{s.group === 'free' ? t('free') : t('service')}</span></span>
        <h3><Link href={`/services/${s.slug}`}>{s.title}</Link></h3>
        {s.excerpt && <p>{s.excerpt}</p>}
      </div>
    </article>
  )
}
