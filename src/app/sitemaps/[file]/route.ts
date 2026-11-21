import { isLocale } from '@/i18n/locales'
import { SITEMAP_TYPES, type SitemapType, sitemapEntries, urlsetXml, XML } from '@/lib/sitemap'

// Одна карта сайта: /sitemaps/{тип}-{язык}.xml, например catalog-ru.xml (src/lib/sitemap.ts)
export const revalidate = 3600

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params
  const m = file.match(/^([a-z]+)-([a-z]{2})\.xml$/)
  if (!m || !SITEMAP_TYPES.includes(m[1] as SitemapType) || !isLocale(m[2])) return new Response('Not found', { status: 404 })
  const entries = (await sitemapEntries())[m[1] as SitemapType]
  return new Response(urlsetXml(entries, m[2]), { headers: XML })
}
