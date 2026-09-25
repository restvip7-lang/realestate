'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Link } from '@/i18n/navigation'
import { buyCosts, rentCosts, type CostRow } from '@/lib/costs'

import { useMoney } from './Currency'

// Калькулятор расходов: сверх цены (продажа) или при заселении (аренда)
export function Costs({ price, resale, rent }: { price: number; resale: boolean; rent?: { deposit: number; advance?: number; utilities: boolean } }) {
  const t = useTranslations('costs')
  const tt = t as unknown as (key: string, values?: Record<string, number>) => string // ключи строк собираются динамически
  const { fmt } = useMoney()
  const [split, setSplit] = useState(false)
  const [remote, setRemote] = useState(false)
  const row = (r: CostRow) => (
    <tr key={r.key}>
      <td>{tt(`rows.${r.key}`, { n: rent?.advance ?? 1 })}{r.note && <small>{tt(`notes.${r.note}`)}</small>}</td>
      <td className="num">{r.eur ? fmt(r.eur) : t('free')}</td>
    </tr>
  )

  if (rent) {
    const r = rentCosts(price, rent.deposit, rent.advance)
    return (
      <div className="costs">
        <table><caption className="vh">{t('rentCaption')}</caption><tbody>{r.rows.map(row)}</tbody></table>
        <div className="tot"><span>{t('rentTotal')}</span><b>{fmt(r.total)}</b></div>
        <div className="foot"><span>{t(rent.utilities ? 'utilIncluded' : 'utilSeparate')} {t('demoRates')}</span><a href="#view" className="link">{t('toViewing')}</a></div>
      </div>
    )
  }
  const r = buyCosts(price, { resale, split, remote })
  const pct = r.pct.toFixed(1)
  return (
    <div className="costs">
      <div className="opts">
        <label className="check"><input type="checkbox" checked={split} onChange={(e) => setSplit(e.target.checked)} />{t('split')}</label>
        <label className="check"><input type="checkbox" checked={remote} onChange={(e) => setRemote(e.target.checked)} />{t('remote')}</label>
      </div>
      <table><caption className="vh">{t('buyCaption')}</caption><tbody>{r.rows.map(row)}</tbody></table>
      <div className="tot" aria-live="polite"><span>{t('buyTotal', { pct })}</span><b>{fmt(r.total)}</b></div>
      <div className="foot">
        <span>{t('withPrice')} <b>{fmt(price + r.total)}</b>.{resale ? '' : ` ${t('newNote')}`} {t('demoRates')}</span>
        <Link href="/how-to-buy#costs" className="link">{t('how')}</Link>
      </div>
    </div>
  )
}

/** Строка под ценой: «+ ≈ 14 000 € расходы на оформление (5,4%) →» */
export function CostsLine({ price, resale, rent }: { price: number; resale: boolean; rent?: { deposit: number; advance?: number } }) {
  const t = useTranslations('costs')
  const { fmt } = useMoney()
  if (rent) return <a href="#costs" className="extra">{t('rentLine', { sum: fmt(rentCosts(price, rent.deposit, rent.advance).total) })}</a>
  const r = buyCosts(price, { resale })
  return <a href="#costs" className="extra">{t('buyLine', { sum: fmt(r.total), pct: r.pct.toFixed(1) })}</a>
}
