import { LOCALES } from '@/i18n/locales'
import { indexXml, SITEMAP_TYPES, sitemapEntries, XML } from '@/lib/sitemap'

// Индекс карт сайта: файлы по типу и языку (src/lib/sitemap.ts). Пустые файлы не перечисляем.
export const revalidate = 3600

export async function GET() {
  const all = await sitemapEntries()
  const files = SITEMAP_TYPES.filter((t) => all[t].length).flatMap((t) => {
    const last = all[t].map((e) => e.lastModified).filter(Boolean).sort().pop()
    return LOCALES.map((l) => ({ name: `${t}-${l}.xml`, lastModified: last }))
  })
  return new Response(indexXml(files), { headers: XML })
}
