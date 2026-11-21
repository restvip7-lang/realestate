import { notFound, permanentRedirect } from 'next/navigation'

import { getPathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { getProperty } from '@/lib/data'
import { propertyPath } from '@/lib/format'

// Старый адрес объекта /property/{номер}-{slug} → адрес по ТЗ …/{район}/{сделка}/id{номер}, 308
export default async function Page({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params
  const id = parseInt(slug, 10)
  const p = Number.isInteger(id) && id > 0 ? await getProperty(id, locale) : null
  if (!p) notFound()
  permanentRedirect(getPathname({ href: propertyPath(p), locale }))
}
