import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

export default async function NotFound() {
  const t = await getTranslations('notFound')
  return (
    <main className="wrap" style={{ padding: '80px var(--gut)', textAlign: 'center', display: 'grid', gap: 16, justifyItems: 'center' }}>
      <span className="eyebrow">404</span>
      <h1 style={{ fontSize: 'clamp(26px,3vw,40px)' }}>{t('title')}</h1>
      <p className="hint" style={{ maxWidth: '52ch' }}>{t('text')}</p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/sale" className="btn btn-coral">{t('catalog')}</Link>
        <Link href="/" className="btn btn-line">{t('home')}</Link>
      </div>
    </main>
  )
}
