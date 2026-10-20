import '@fontsource-variable/onest'
import '@fontsource-variable/unbounded'
import '@fontsource-variable/jetbrains-mono'
import '@/app/(frontend)/styles/base.css'
import './preview.css'
import { notFound } from 'next/navigation'
import { isLocale } from '@/i18n/locales'

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale) || process.env.NODE_ENV === 'production') notFound()
  return <html lang={locale}><body>{children}</body></html>
}
