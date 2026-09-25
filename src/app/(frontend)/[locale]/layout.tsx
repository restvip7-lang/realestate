import '@fontsource-variable/onest'
import '@fontsource-variable/unbounded'
import '@fontsource-variable/jetbrains-mono'
import '../styles/base.css'
import '../styles/site.css'

import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { CurrencyProvider } from '@/components/site/Currency'
import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'
import { LeadSection } from '@/components/site/LeadSection'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { getCompany, getRates, listDistricts } from '@/lib/data'
import { INDEXABLE, SITE_URL } from '@/lib/seo'

export const revalidate = 600

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t('homeTitle'), template: '%s | Kleo Homes' },
    description: t('homeDescription'),
    robots: INDEXABLE ? undefined : { index: false, follow: false },
  }
}

export const viewport: Viewport = { themeColor: '#0E1116', width: 'device-width', initialScale: 1 }

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const [company, rates, districts, t] = await Promise.all([getCompany(locale), getRates(), listDistricts(locale), getTranslations('nav')])
  const tm = await getTranslations('meta')

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <CurrencyProvider rates={rates}>
            {company.isDemo && <div className="demo-strip">{tm('demo')}</div>}
            {locale !== 'ru' && <div className="i18n-note">{tm('translationNote')}</div>}
            <Header company={company} />
            {children}
            <LeadSection company={company} />
            <Footer company={company} districts={districts} />
            <nav className="mbar" aria-label={t('quick')}>
              <Link href="/sale">{t('sale')}</Link>
              <a href="#lead" className="pick">{t('pickShort')}</a>
              <a href={`https://wa.me/${company.whatsapp}`} className="wa">WhatsApp</a>
            </nav>
          </CurrencyProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
