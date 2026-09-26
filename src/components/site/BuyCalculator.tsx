'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Link } from '@/i18n/navigation'
import { CURRENCY_SYMBOL } from '@/lib/catalog'
import { buyCosts } from '@/lib/costs'

import { formatNum, useMoney } from './Currency'

// Калькулятор расходов сверх цены: цена вводится в выбранной валюте, расчёт в €, вывод в выбранной валюте
export function BuyCalculator({ articleHref }: { articleHref?: string }) {
  const t = useTranslations('costs')
  const tt = t as unknown as (key: string) => string
  const { cur, rate, fmt } = useMoney()
  const [eur, setEur] = useState(150000)
  const [text, setText] = useState<string | null>(null) // что вводит посетитель (пока поле в фокусе)
  const [resale, setResale] = useState(true)
  const [split, setSplit] = useState(false)
  const [remote, setRemote] = useState(false)
  const r = buyCosts(eur, { resale, split, remote })
  return (
    <div className="calc">
      <form className="box" noValidate onSubmit={(e) => e.preventDefault()}>
        <div className="fld">
          <label htmlFor="c-price">Цена объекта, {CURRENCY_SYMBOL[cur]}</label>
          <input
            id="c-price"
            inputMode="numeric"
            autoComplete="off"
            value={text ?? formatNum(eur * rate)}
            onFocus={(e) => setText(e.target.value)}
            onChange={(e) => {
              setText(e.target.value)
              setEur((Number(e.target.value.replace(/\D/g, '')) || 0) / rate)
            }}
            onBlur={() => setText(null)}
          />
        </div>
        <div className="fld">
          <label htmlFor="c-type">Тип жилья</label>
          <select id="c-type" value={resale ? 'resale' : 'new'} onChange={(e) => setResale(e.target.value === 'resale')}>
            <option value="resale">Вторичка</option>
            <option value="new">Новостройка от застройщика-партнёра</option>
          </select>
        </div>
        <label className="check"><input type="checkbox" checked={split} onChange={(e) => setSplit(e.target.checked)} />{t('split')}</label>
        <label className="check"><input type="checkbox" checked={remote} onChange={(e) => setRemote(e.target.checked)} />{t('remote')}</label>
      </form>
      <div>
        <table className="ptable">
          <caption className="vh">{t('buyCaption')}</caption>
          <thead><tr><th scope="col">Статья</th><th scope="col" className="num">Сумма</th></tr></thead>
          <tbody>
            {r.rows.map((row) => (
              <tr key={row.key}>
                <td>{tt(`rows.${row.key}`)}{row.note && <small>{tt(`notes.${row.note}`)}</small>}</td>
                <td className="num">{row.eur ? fmt(row.eur) : t('free')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="total" aria-live="polite"><span>Итого сверх цены</span><b>{fmt(r.total)} · {r.pct.toFixed(1)}%</b></div>
        <p className="hint" style={{ marginTop: 10 }}>
          {eur ? <>Итого с ценой объекта: <b>{fmt(eur + r.total)}</b>. {t('demoRates')}{articleHref && <> <Link href={articleHref} className="link">Разбор расходов в статье</Link>.</>}</> : 'Введите цену объекта.'}
        </p>
      </div>
    </div>
  )
}
