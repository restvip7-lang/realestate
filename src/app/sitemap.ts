import type { MetadataRoute } from 'next'

import { LOCALES } from '@/i18n/locales'
import { sitemapData } from '@/lib/data'
import { propertyPath } from '@/lib/format'
import { SITE_URL } from '@/lib/seo'

// Карта сайта на трёх языках с hreflang; обновляется раз в час
export const revalidate = 3600

const STATIC = ['/', '/sale', '/rent', '/districts', '/team', '/reviews', '/blog', '/news', '/services', '/how-to-buy', '/citizenship', '/residence-permit', '/contacts', '/privacy']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { districts, team, posts, properties } = await sitemapData()
  const paths: { path: string; lastModified?: string; priority: number }[] = [
    ...STATIC.map((path) => ({ path, priority: path === '/' ? 1 : ['/sale', '/rent', '/districts'].includes(path) ? 0.9 : 0.6 })),
    ...districts.filter((d) => d.slug).map((d) => ({ path: `/districts/${d.slug}`, lastModified: d.updatedAt, priority: 0.8 })),
    ...properties.map((p) => ({ path: propertyPath(p), lastModified: p.updatedAt, priority: 0.7 })),
    ...posts.filter((p) => p.slug).map((p) => ({ path: `/${p.kind === 'news' ? 'news' : 'blog'}/${p.slug}`, lastModified: p.updatedAt, priority: 0.5 })),
    ...team.filter((m) => m.slug).map((m) => ({ path: `/team/${m.slug}`, lastModified: m.updatedAt, priority: 0.4 })),
  ]
  return paths.flatMap(({ path, lastModified, priority }) => {
    const p = path === '/' ? '' : path
    const languages = { ...Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}${p}`])), 'x-default': `${SITE_URL}/ru${p}` }
    return LOCALES.map((l) => ({ url: `${SITE_URL}/${l}${p}`, lastModified, priority, alternates: { languages } }))
  })
}
