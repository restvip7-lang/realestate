import type { MetadataRoute } from 'next'

import { LOCALES } from '@/i18n/locales'
import { landingSamples, sitemapData } from '@/lib/data'
import { catalogBasePath } from '@/lib/catalog-params'
import { propertyPath } from '@/lib/format'
import { INDEX_MIN, landingMatrix } from '@/lib/landings'
import { SITE_URL } from '@/lib/seo'

// Карта сайта на трёх языках с hreflang; обновляется раз в час
export const revalidate = 3600

const SALE = catalogBasePath({ deal: 'sale' })
const RENT = catalogBasePath({ deal: 'rent' })
const STATIC = ['/', '/projects', '/districts', '/team', '/reviews', '/blog', '/news', '/services', '/how-to-buy', '/citizenship', '/residence-permit', '/contacts', '/privacy']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ districts, team, posts, properties, services }, samples] = await Promise.all([sitemapData(), landingSamples()])
  // ЧПУ каталога: только страницы, где не меньше INDEX_MIN объектов (пороги ТЗ); каталог целиком — всегда
  const catalog = landingMatrix(samples, districts.filter((d) => d.slug) as { id: number; slug: string }[])
    .filter((x) => x.n >= INDEX_MIN || x.path === SALE || x.path === RENT)
    .map((x) => ({ path: x.path, priority: x.path === SALE || x.path === RENT ? 0.9 : x.q.district || x.q.type ? 0.8 : 0.85 }))
  const paths: { path: string; lastModified?: string; priority: number }[] = [
    ...STATIC.map((path) => ({ path, priority: path === '/' ? 1 : ['/projects', '/districts'].includes(path) ? 0.9 : 0.6 })),
    ...catalog,
    ...districts.filter((d) => d.slug).map((d) => ({ path: `/districts/${d.slug}`, lastModified: d.updatedAt, priority: 0.8 })),
    ...properties.map((p) => ({ path: propertyPath(p, districts.find((d) => d.id === p.district)?.slug), lastModified: p.updatedAt, priority: 0.7 })),
    ...posts.filter((p) => p.slug).map((p) => ({ path: `/${p.kind === 'news' ? 'news' : 'blog'}/${p.slug}`, lastModified: p.updatedAt, priority: 0.5 })),
    ...team.filter((m) => m.slug).map((m) => ({ path: `/team/${m.slug}`, lastModified: m.updatedAt, priority: 0.4 })),
    ...services.filter((x) => x.slug).map((x) => ({ path: `/services/${x.slug}`, lastModified: x.updatedAt, priority: 0.5 })),
  ]
  return paths.flatMap(({ path, lastModified, priority }) => {
    const p = path === '/' ? '' : path
    const languages = { ...Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}${p}`])), 'x-default': `${SITE_URL}/ru${p}` }
    return LOCALES.map((l) => ({ url: `${SITE_URL}/${l}${p}`, lastModified, priority, alternates: { languages } }))
  })
}
