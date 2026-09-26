import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { POST_CATEGORIES } from '@/lib/catalog'
import { mediaUrl } from '@/lib/data'
import { fmtDate } from '@/lib/format'
import type { Post } from '@/payload-types'

export const postPath = (p: Pick<Post, 'kind' | 'slug'>) => `/${p.kind === 'news' ? 'news' : 'blog'}/${p.slug}`

export async function PostCard({ p }: { p: Post }) {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('journal')
  const tc = await getTranslations('catalogCats')
  const img = mediaUrl(p.cover, 'card')
  const author = p.author && typeof p.author === 'object' ? p.author : null
  const avatar = mediaUrl(author?.photo, 'thumb')
  return (
    <article className="pcard">
      {img ? <Image src={img} alt="" width={640} height={360} sizes="(max-width: 760px) 100vw, 400px" /> : null}
      <div className="bd">
        <span className="meta-line">
          {p.pinned && <span className="pin-tag">{t('pinned')}</span>}
          <span className="cat">{POST_CATEGORIES.some((c) => c.value === p.category) ? tc(p.category) : p.category}</span>
          <span>{fmtDate(p.publishedAt, locale)}</span>
          {p.readingMins ? <span>{t('mins', { n: p.readingMins })}</span> : null}
        </span>
        <h3><Link href={postPath(p)}>{p.title}</Link></h3>
        {p.lead && <p>{p.lead}</p>}
        <span className="by">
          {avatar && <Image src={avatar} alt="" width={56} height={56} />}
          {author?.name ?? t('editorial')}
        </span>
      </div>
    </article>
  )
}
