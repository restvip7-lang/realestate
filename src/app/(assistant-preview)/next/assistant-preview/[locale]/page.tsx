import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { AssistantDemo } from '@/components/site/AssistantDemo'
import { isLocale } from '@/i18n/locales'
import ru from '@/i18n/messages/ru.json'
import en from '@/i18n/messages/en.json'
import tr from '@/i18n/messages/tr.json'

export const dynamic = 'force-dynamic'
export function generateMetadata(): Metadata { return { title: 'Kleo Homes · Assistant preview', robots: { index: false, follow: false } } }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale) || process.env.NODE_ENV === 'production') notFound()
  const messages = { ru, en, tr }[locale]
  const t = messages.assistant
  return <NextIntlClientProvider locale={locale} messages={{ assistant: t }}>
    <main className="assistant-preview">
      <nav><b>KLEO<span> HOMES</span></b><div>{['ru', 'en', 'tr'].map((l) => <a key={l} aria-current={l === locale ? 'page' : undefined} href={`/next/assistant-preview/${l}`}>{l.toUpperCase()}</a>)}</div></nav>
      <section><p className="eyebrow">ALANYA · PERSONAL PROPERTY ASSISTANT</p><h1>{t.previewTitle}</h1><p className="assistant-preview-intro">{t.previewIntro}</p><span className="assistant-preview-label">{t.demo}</span>
        <div className="assistant-preview-steps"><article><span>01</span><h2>{t.previewStep1}</h2><p>{t.previewText1}</p></article><article><span>02</span><h2>{t.previewStep2}</h2><p>{t.previewText2}</p></article><article><span>03</span><h2>{t.previewStep3}</h2><p>{t.previewText3}</p></article></div>
        <p className="assistant-preview-tip">↘ {t.previewTip}</p>
      </section>
      <footer>OpenAI / Anthropic · RU / EN / TR · Kleo Homes</footer>
    </main>
    <AssistantDemo />
  </NextIntlClientProvider>
}
