// Общая разметка schema.org (JSON-LD) по ТЗ: агентство и сайт с поиском — на каждой странице (layout),
// хлебные крошки и списки — на страницах. У агентства постоянный @id: страницы ссылаются на него, а не повторяют данные.
import { getPathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import type { Company } from '@/payload-types'

import { SITE_URL } from './seo'

export const AGENT_ID = `${SITE_URL}/#agent`
export const WEBSITE_ID = `${SITE_URL}/#website`

export const abs = (href: string, locale: Locale) => `${SITE_URL}${getPathname({ href, locale })}`

/** Kleo Homes как RealEstateAgent. rating — средняя оценка отзывов с сайта (страница «Отзывы»). */
export function agentLd(company: Company, locale: Locale, rating?: { value: number; count: number } | null) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': AGENT_ID,
    name: 'Kleo Homes',
    url: abs('/', locale),
    legalName: company.legal?.name || undefined,
    telephone: company.phone,
    email: company.email,
    address: { '@type': 'PostalAddress', streetAddress: company.address, addressLocality: 'Alanya', addressRegion: 'Antalya', addressCountry: 'TR' },
    ...(company.lat && company.lng ? { geo: { '@type': 'GeoCoordinates', latitude: company.lat, longitude: company.lng } } : {}),
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '09:00', closes: '19:00' }],
    areaServed: { '@type': 'City', name: 'Alanya' },
    sameAs: [company.telegram && `https://t.me/${company.telegram}`, ...(company.social || []).map((s) => s.url)].filter(Boolean),
    ...(rating && rating.count ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: rating.value.toFixed(1), reviewCount: rating.count, bestRating: 5, worstRating: 1 } } : {}),
  }
}

/** WebSite + SearchAction: поиск по сайту ведёт на /search?q=… */
export function websiteLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: 'Kleo Homes',
    url: abs('/', locale),
    inLanguage: locale,
    publisher: { '@id': AGENT_ID },
    potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${abs('/search', locale)}?q={search_term_string}` }, 'query-input': 'required name=search_term_string' },
  }
}

export function breadcrumbLd(items: [name: string, href: string][], locale: Locale) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([name, href], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(href, locale) })) }
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
}
