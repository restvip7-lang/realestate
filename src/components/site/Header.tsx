import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'

import { Link } from '@/i18n/navigation'
import type { Company } from '@/payload-types'

import { CurrencySelect } from './Currency'
import { FavLink } from './FavButton'
import { LangSwitch } from './LangSwitch'
import { LogoMark } from './Logo'
import { MobileMenu } from './MobileMenu'

const NAV = [
  ['sale', '/sale'],
  ['districts', '/districts'],
  ['services', '/services'],
  ['about', '/team'],
  ['journal', '/blog'],
] as const

export async function Header({ company }: { company: Company }) {
  const t = await getTranslations('nav')
  const langs = <Suspense fallback={<div className="seg" />}><LangSwitch label={t('language')} className="hide-t" /></Suspense>
  return (
    <header className="hdr">
      <div className="wrap">
        <Link href="/" className="logo" aria-label={t('toHome')}>
          <LogoMark />
          <span className="wm"><b>KLEO</b><small>HOMES</small></span>
        </Link>
        <nav className="nav" aria-label={t('mainMenu')}>
          {NAV.map(([k, href]) => (
            <Link key={k} href={href}>{t(k)}</Link>
          ))}
        </nav>
        <div className="hdr-r">
          {langs}
          <CurrencySelect className="cur-sel hide-t" label={t('currency')} />
          <FavLink />
          <a href="#lead" className="btn btn-coral btn-sm hide-m">{t('pick')}</a>
          <MobileMenu openLabel={t('openMenu')} closeLabel={t('closeMenu')} dialogLabel={t('menu')}>
            <nav aria-label={t('mobileMenu')}>
              {NAV.map(([k, href]) => (
                <Link key={k} href={href}>{t(k)}</Link>
              ))}
              <Link href="/contacts">{t('contacts')}</Link>
              <a href="#lead">{t('pick')}</a>
            </nav>
            <div className="mm-row"><span className="lbl">{t('language')}</span><Suspense fallback={null}><LangSwitch label={t('language')} /></Suspense></div>
            <div className="mm-row"><span className="lbl">{t('currency')}</span><CurrencySelect className="cur-sel" label={t('currency')} /></div>
            <div className="contacts">
              <a className="btn btn-wa" href={`https://wa.me/${company.whatsapp}`}>WhatsApp</a>
              {company.telegram && <a className="btn btn-tg" href={`https://t.me/${company.telegram}`}>Telegram</a>}
              <a className="btn btn-line" href={`tel:${company.phone.replace(/[^+\d]/g, '')}`}>{company.phone}</a>
            </div>
          </MobileMenu>
        </div>
      </div>
    </header>
  )
}
