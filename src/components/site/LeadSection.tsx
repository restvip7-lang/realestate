import { getTranslations } from 'next-intl/server'

import type { Company } from '@/payload-types'

import { LeadForm } from './LeadForm'

export async function LeadSection({ company }: { company: Company }) {
  const t = await getTranslations('lead')
  return (
    <section className="sec lead" id="lead">
      <div className="wrap lead-grid">
        <div className="intro">
          <span className="eyebrow">{t('eyebrow')}</span>
          <h2>{t('title')}</h2>
          <p>{t('intro')}</p>
          <div className="contacts">
            <a href={`https://wa.me/${company.whatsapp}`} className="btn btn-wa">WhatsApp</a>
            {company.telegram && <a href={`https://t.me/${company.telegram}`} className="btn btn-tg">Telegram</a>}
            <a href={`tel:${company.phone.replace(/[^+\d]/g, '')}`} className="btn btn-ghost">{company.phone}</a>
          </div>
        </div>
        <LeadForm />
      </div>
    </section>
  )
}
