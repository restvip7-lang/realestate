// Расходы покупателя сверх цены (ставки ДЕМО, проверит юрист; см. docs/PLAN.md и how-to-buy в прототипе).
// Ключи строк переводятся в словаре costs.rows.*
export type CostRow = { key: string; eur: number; note?: string }

export function buyCosts(price: number, { resale = true, split = false, remote = false } = {}) {
  const rows: CostRow[] = [
    { key: 'tapu', eur: price * (split ? 0.02 : 0.04), note: split ? 'tapuSplit' : 'tapu' },
    { key: 'cadastre', eur: 150, note: 'cadastre' },
    { key: 'valuation', eur: 400, note: 'valuation' },
    { key: 'taxNo', eur: 250 },
    ...(remote ? [{ key: 'poa', eur: 150, note: 'poa' }] : []),
    { key: 'dask', eur: 60, note: 'dask' },
    { key: 'utilities', eur: 150, note: 'utilities' },
    { key: 'agency', eur: resale ? price * 0.024 : 0, note: resale ? 'agency' : 'agencyNew' },
  ]
  const total = rows.reduce((s, r) => s + r.eur, 0)
  return { rows, total, pct: price ? (total / price) * 100 : 0 }
}

export function rentCosts(price: number, deposit: number, advance = 1) {
  const months = Math.max(1, advance || 1)
  const rows: CostRow[] = [
    { key: months > 1 ? 'rentAdvance' : 'rentFirst', eur: price * months },
    { key: 'deposit', eur: deposit, note: 'deposit' },
    { key: 'agencyRent', eur: price, note: 'agencyRent' },
  ]
  return { rows, months, total: rows.reduce((s, r) => s + r.eur, 0) }
}
