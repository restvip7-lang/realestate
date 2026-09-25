import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Company, District } from '@/payload-types'

const FOOT_DISTRICTS = ['mahmutlar', 'oba', 'kestel', 'kargicak', 'center']

export async function Footer({ company, districts }: { company: Company; districts: District[] }) {
  const t = await getTranslations('footer')
  const tel = company.phone.replace(/[^+\d]/g, '')
  const year = new Date().getFullYear()
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="cols">
          <div>
            <span className="logo" style={{ color: '#fff' }}><span className="wm"><b>KLEO</b><small>HOMES</small></span></span>
            <p style={{ marginTop: 14 }}>
              {t('tagline')}
              <br />
              {company.address}
              <br />
              {company.hours}
              {company.legal?.license ? ` · TTYB № ${company.legal.license}` : ''}
            </p>
            <p style={{ marginTop: 10 }}>
              <a href={`tel:${tel}`}>{company.phone}</a>
              <br />
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </p>
            <div className="soc">
              <a href={`https://wa.me/${company.whatsapp}`} aria-label="WhatsApp">WA</a>
              {company.telegram && <a href={`https://t.me/${company.telegram}`} aria-label="Telegram">TG</a>}
              {(company.social || []).map((s) => (
                <a key={s.id} href={s.url} aria-label={s.network || ''}>{(s.network || '').slice(0, 2).toUpperCase()}</a>
              ))}
            </div>
          </div>
          <div>
            <h4>{t('catalog')}</h4>
            <ul>
              <li><Link href="/sale?type=apartment">{t('apartments')}</Link></li>
              <li><Link href="/sale?type=penthouse">{t('penthouses')}</Link></li>
              <li><Link href="/sale?type=villa">{t('villas')}</Link></li>
              <li><Link href="/sale?new=1">{t('newBuilds')}</Link></li>
              <li><Link href="/rent">{t('rent')}</Link></li>
            </ul>
          </div>
          <div>
            <h4>{t('districts')}</h4>
            <ul>
              {FOOT_DISTRICTS.map((slug) => districts.find((d) => d.slug === slug)).filter(Boolean).map((d) => (
                <li key={d!.slug}><Link href={`/districts/${d!.slug}`}>{d!.name}</Link></li>
              ))}
              <li><Link href="/districts">{t('allDistricts')}</Link></li>
            </ul>
          </div>
          <div>
            <h4><Link href="/services">{t('services')}</Link></h4>
            <ul>
              <li><Link href="/how-to-buy">{t('howToBuy')}</Link></li>
              <li><Link href="/citizenship">{t('citizenship')}</Link></li>
              <li><Link href="/residence-permit">{t('residence')}</Link></li>
              <li><Link href="/services#rental">{t('rental')}</Link></li>
            </ul>
          </div>
          <div>
            <h4>{t('company')}</h4>
            <ul>
              <li><Link href="/team">{t('about')}</Link></li>
              <li><Link href="/reviews">{t('reviews')}</Link></li>
              <li><Link href="/blog">{t('articles')}</Link></li>
              <li><Link href="/news">{t('news')}</Link></li>
              <li><Link href="/contacts">{t('contacts')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="bottom">
          <span>© {year} Kleo Homes{company.legal?.name ? ` · ${company.legal.name}` : ''}</span>
          <Link href="/privacy">{t('privacy')}</Link>
          {/* админка — отдельное приложение Payload, переход с полной перезагрузкой */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/admin" rel="nofollow">{t('staff')}</a>
        </div>
      </div>
    </footer>
  )
}
