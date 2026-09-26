import type { MetadataRoute } from 'next'

import { INDEXABLE, SITE_URL } from '@/lib/seo'

// Пока на сайте демо-данные (SITE_INDEXABLE не равен 1), закрываем всё
export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/next', '/*/favorites'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
