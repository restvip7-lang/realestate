// Цена за м² района — по объектам каталога, а не демо-число из админки (docs/districts.md).
// Главная цифра — медиана по квартирам (квартира, пентхаус, дуплекс): виллы задирают цену там, где их много.
import type { District, Property } from '@/payload-types'

type Sample = Pick<Property, 'deal' | 'price' | 'area' | 'type' | 'priceFrom'>

export const FLAT_TYPES = ['apartment', 'penthouse', 'duplex']
const HOUSING = [...FLAT_TYPES, 'villa']
/** Меньше стольких квартир с ценой — показываем запасное значение из админки */
export const MIN_PM_SAMPLE = 5

/**
 * Объект годится для расчёта €/м²: продажа, жильё, есть цена и площадь, цена не «от».
 * Порог 20 000 € отсекает объявления о продаже, в которых по ошибке стоит месячная аренда (в Stay такие есть).
 */
export const priceSample = (o: Sample) =>
  o.deal !== 'rent' && HOUSING.includes(o.type ?? '') && !o.priceFrom && (o.price ?? 0) >= 20000 && (o.area ?? 0) >= 20

export function median(values: number[]) {
  if (!values.length) return 0
  const a = [...values].sort((x, y) => x - y)
  const m = Math.floor(a.length / 2)
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2
}

/** Медиана €/м² по объектам (уже отобранным priceSample), с округлением до 10 €. */
export const pmOf = (list: Sample[]) => Math.round(median(list.map((o) => (o.price ?? 0) / (o.area || 1))) / 10) * 10

/**
 * Цена за м² района: медиана по квартирам каталога; если квартир мало (Тепе — почти одни виллы) — по всему жилью
 * вместе с виллами; если и его мало — запасное значение из админки.
 */
export function districtPm(d: Pick<District, 'pricePerM2'>, st?: { pm: number; pmN: number; pmAll: number; pmAllN: number } | null) {
  if (st && st.pmN >= MIN_PM_SAMPLE) return { eur: st.pm, n: st.pmN, kind: 'flats' as const }
  if (st && st.pmAllN >= MIN_PM_SAMPLE) return { eur: st.pmAll, n: st.pmAllN, kind: 'all' as const }
  if (d.pricePerM2) return { eur: d.pricePerM2, n: 0, kind: 'manual' as const }
  return null
}
