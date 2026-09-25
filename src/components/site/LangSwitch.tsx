'use client'

import { useLocale } from 'next-intl'
import { useSearchParams } from 'next/navigation'

import { LOCALES } from '@/i18n/locales'
import { Link, usePathname } from '@/i18n/navigation'

export function LangSwitch({ className, label }: { className?: string; label: string }) {
  const locale = useLocale()
  const pathname = usePathname()
  const search = useSearchParams().toString()
  return (
    <div className={`seg ${className ?? ''}`} role="group" aria-label={label}>
      {LOCALES.map((l) => (
        <Link
          key={l}
          href={search ? `${pathname}?${search}` : pathname}
          locale={l}
          aria-current={l === locale ? 'true' : undefined}
          hrefLang={l}
          lang={l}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  )
}
