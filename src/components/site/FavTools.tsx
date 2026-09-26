'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { useRouter } from '@/i18n/navigation'

import { getFavs, setFavs, toggleFav, useFavs } from './favs'

/** Своё избранное живёт в браузере: переносим список ID в адрес (?my=1&ids=…), чтобы сервер отрисовал карточки. */
export function FavSync({ current }: { current: string }) {
  const router = useRouter()
  const favs = useFavs()
  useEffect(() => {
    const ids = getFavs().join(',')
    if (ids === current) return
    router.replace(ids ? `/favorites?my=1&ids=${ids}` : '/favorites', { scroll: false })
  }, [favs, current, router])
  return null
}

export function FavActions({ ids, shared, wa }: { ids: number[]; shared: boolean; wa: string }) {
  const t = useTranslations('favs')
  const router = useRouter()
  const [msg, setMsg] = useState('')
  const flash = (m: string) => {
    setMsg(m)
    setTimeout(() => setMsg(''), 2000)
  }
  const copy = () => {
    navigator.clipboard?.writeText(`${location.origin}${location.pathname}?ids=${ids.join(',')}`)
    flash(t('copied'))
  }
  return (
    <div className="contacts">
      <a href={wa} className="btn btn-wa btn-sm" target="_blank" rel="noopener">{t('sendWa')}</a>
      <button type="button" className="btn btn-line btn-sm" onClick={copy}>{msg === t('copied') ? msg : t('copy')}</button>
      <button type="button" className="btn btn-line btn-sm" onClick={() => window.print()}>{t('print')}</button>
      {shared ? (
        <button
          type="button"
          className="btn btn-dark btn-sm"
          onClick={() => {
            setFavs([...getFavs(), ...ids])
            flash(t('saved'))
            router.push('/favorites')
          }}
        >
          {msg === t('saved') ? msg : t('save')}
        </button>
      ) : (
        <button type="button" className="btn btn-line btn-sm" onClick={() => confirm(t('clearConfirm')) && setFavs([])}>{t('clear')}</button>
      )}
    </div>
  )
}

export type CmpItem = { id: number; deal: string; chip: string; head: React.ReactNode; cells: React.ReactNode[]; vals: (number | null)[] }

/** Таблица сравнения до 4 объектов; лучшее значение в строке подсвечено (только если тип сделки у всех один). */
export function FavCompare({ items, rows, shared }: { items: CmpItem[]; rows: { label: string; best?: 'min' | 'max' }[]; shared: boolean }) {
  const t = useTranslations('favs')
  const [sel, setSel] = useState<number[]>(() => items.slice(0, 4).map((i) => i.id))
  const [note, setNote] = useState('')
  const picked = sel.map((id) => items.find((i) => i.id === id)).filter((i): i is CmpItem => !!i)
  const cols = picked.length >= 2 ? picked : items.slice(0, 4)
  const sameDeal = cols.every((c) => c.deal === cols[0].deal)
  const pick = (id: number) => {
    const ids = cols.map((c) => c.id)
    if (ids.includes(id)) {
      if (ids.length <= 2) return setNote(t('cmpMin'))
      setSel(ids.filter((x) => x !== id))
    } else {
      if (ids.length >= 4) return setNote(t('cmpMax'))
      setSel([...ids, id])
    }
    setNote('')
  }
  const bestOf = (r: number) => {
    const kind = rows[r].best
    if (!kind || !sameDeal) return null
    const v = cols.map((c) => c.vals[r]).filter((x): x is number => x != null)
    if (v.length < 2) return null
    return kind === 'min' ? Math.min(...v) : Math.max(...v)
  }
  return (
    <>
      <div className="fchips" role="group" aria-label={t('cmpChips')}>
        {items.map((i) => (
          <button key={i.id} type="button" aria-pressed={cols.some((c) => c.id === i.id)} onClick={() => pick(i.id)}>{i.chip}</button>
        ))}
      </div>
      <p className="hint" role="status" style={{ minHeight: 22 }}>{note}</p>
      <div className="cmp-wrap">
        <table className="cmp">
          <caption className="vh">{t('cmpCaption')}</caption>
          <colgroup><col style={{ width: 170 }} />{cols.map((c) => <col key={c.id} />)}</colgroup>
          <thead>
            <tr>
              <td />
              {cols.map((c) => (
                <th key={c.id} scope="col" className="obj">
                  {c.head}
                  {!shared && <><br /><button type="button" className="rm" onClick={() => toggleFav(c.id)}>{t('remove')}</button></>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => {
              const b = bestOf(ri)
              return (
                <tr key={r.label}>
                  <th scope="row">{r.label}</th>
                  {cols.map((c) => <td key={c.id} className={b != null && c.vals[ri] === b ? 'best' : undefined}>{c.cells[ri]}</td>)}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {!sameDeal && <p className="hint" style={{ marginTop: 10 }}>{t('cmpMixed')}</p>}
    </>
  )
}
