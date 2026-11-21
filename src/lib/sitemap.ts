// Карта сайта по ТЗ: индекс /sitemap.xml и отдельные файлы по типу и языку (/sitemaps/{тип}-{язык}.xml)
// с hreflang (xhtml:link) у каждого адреса. Обновляется раз в час.
import { LOCALES, type Locale } from '@/i18n/locales'

import { catalogBasePath } from './catalog-params'
import { landingSamples, sitemapData } from './data'
import { propertyPath } from './format'
import { INDEX_MIN, landingMatrix } from './landings'
import { SITE_URL } from './seo'

export const SITEMAP_TYPES = ['pages', 'catalog', 'properties', 'districts', 'posts', 'team', 'services'] as const
export type SitemapType = (typeof SITEMAP_TYPES)[number]
type Entry = { path: string; lastModified?: string; priority: number }

const SALE = catalogBasePath({ deal: 'sale' })
const RENT = catalogBasePath({ deal: 'rent' })
const STATIC = ['/', '/projects', '/districts', '/team', '/reviews', '/about', '/blog', '/blog/news', '/blog/laws', '/blog/area-guides', '/services/due-diligence', '/services', '/how-to-buy', '/citizenship', '/residence-permit', '/contacts', '/privacy']

export async function sitemapEntries(): Promise<Record<SitemapType, Entry[]>> {
  const [{ districts, team, posts, properties, services }, samples] = await Promise.all([sitemapData(), landingSamples()])
  // ЧПУ каталога: только страницы, где не меньше INDEX_MIN объектов (пороги ТЗ); каталог целиком — всегда
  const catalog = landingMatrix(samples, districts.filter((d) => d.slug) as { id: number; slug: string }[])
    .filter((x) => x.n >= INDEX_MIN || x.path === SALE || x.path === RENT)
    .map((x) => ({ path: x.path, priority: x.path === SALE || x.path === RENT ? 0.9 : x.q.district || x.q.type ? 0.8 : 0.85 }))
  return {
    pages: STATIC.map((path) => ({ path, priority: path === '/' ? 1 : ['/projects', '/districts'].includes(path) ? 0.9 : 0.6 })),
    catalog,
    properties: properties.map((p) => ({ path: propertyPath(p, districts.find((d) => d.id === p.district)?.slug), lastModified: p.updatedAt, priority: 0.7 })),
    districts: districts.filter((d) => d.slug).map((d) => ({ path: `/districts/${d.slug}`, lastModified: d.updatedAt, priority: 0.8 })),
    posts: posts.filter((p) => p.slug).map((p) => ({ path: `/${p.kind === 'news' ? 'news' : 'blog'}/${p.slug}`, lastModified: p.updatedAt, priority: 0.5 })),
    team: team.filter((m) => m.slug).map((m) => ({ path: `/team/${m.slug}`, lastModified: m.updatedAt, priority: 0.4 })),
    services: services.filter((x) => x.slug).map((x) => ({ path: `/services/${x.slug}`, lastModified: x.updatedAt, priority: 0.5 })),
  }
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const url = (l: string, path: string) => esc(`${SITE_URL}/${l}${path === '/' ? '' : path}`)

export function urlsetXml(entries: Entry[], locale: Locale) {
  const body = entries
    .map(({ path, lastModified, priority }) => {
      const alt = [...LOCALES.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${url(l, path)}"/>`), `<xhtml:link rel="alternate" hreflang="x-default" href="${url('ru', path)}"/>`].join('')
      return `<url><loc>${url(locale, path)}</loc>${lastModified ? `<lastmod>${new Date(lastModified).toISOString()}</lastmod>` : ''}<priority>${priority}</priority>${alt}</url>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`
}

export function indexXml(files: { name: string; lastModified?: string }[]) {
  const body = files.map((f) => `<sitemap><loc>${esc(`${SITE_URL}/sitemaps/${f.name}`)}</loc>${f.lastModified ? `<lastmod>${new Date(f.lastModified).toISOString()}</lastmod>` : ''}</sitemap>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`
}

export const XML = { 'Content-Type': 'application/xml; charset=utf-8' }
