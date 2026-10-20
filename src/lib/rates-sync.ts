// Курсы валют за 1 € (Настройки → Курсы валют): обновляются раз в сутки из open.er-api.com (бесплатно, без ключа).
// По ним переключатель валют пересчитывает цены на сайте, а цена объекта в долларах, лирах и т. п. переводится в евро.
import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

const SOURCE = 'https://open.er-api.com/v6/latest/EUR'
const CODES = ['USD', 'TRY', 'RUB', 'KZT', 'GBP'] as const

type Source = { result?: string; rates?: Record<string, number> }

/** Курсы сильно отличаются от прошлых (больше чем в 2 раза) — скорее ошибка источника: не записываем. */
const suspicious = (next: number, prev: number) => prev > 0 && (next > prev * 2 || next < prev / 2)

export async function runRatesSync(payload: Payload, fetcher: typeof fetch = fetch) {
  const res = await fetcher(SOURCE, { cache: 'no-store', signal: AbortSignal.timeout(15000) }).catch(() => {
    throw new Error('источник курсов (open.er-api.com) недоступен')
  })
  if (!res.ok) throw new Error(`источник курсов ответил ${res.status}`)
  const json = (await res.json()) as Source
  if (json.result !== 'success' || !json.rates) throw new Error('источник курсов вернул ошибку')

  const old = (await payload.findGlobal({ slug: 'rates', overrideAccess: true })) as unknown as Record<string, number | null>
  const next: Record<string, number> = {}
  for (const code of CODES) {
    const value = Number(json.rates[code])
    if (!Number.isFinite(value) || value <= 0) throw new Error(`в источнике нет курса ${code}`)
    if (suspicious(value, Number(old[code]))) throw new Error(`курс ${code} ${value} слишком отличается от прежнего ${old[code]} — проверьте вручную`)
    next[code] = value >= 10 ? Math.round(value * 100) / 100 : Math.round(value * 10000) / 10000
  }

  // цены продажи, указанные не в евро, — заново в евро (как хук beforeChange в Properties при сохранении).
  // Один запрос: пересчитываются все валюты сразу или ни одна. У объекта валюты только EUR/USD/GBP/TRY.
  await payload.db.drizzle.execute(
    sql`UPDATE properties SET price = round(price_original / CASE currency::text WHEN 'USD' THEN ${next.USD}::numeric WHEN 'GBP' THEN ${next.GBP}::numeric WHEN 'TRY' THEN ${next.TRY}::numeric END)
        WHERE currency::text IN ('USD', 'GBP', 'TRY') AND deal <> 'rent' AND price_original IS NOT NULL`,
  )
  // после записи курсов хук глобала сбрасывает кэш сайта — пересчитанные цены тоже попадут на страницы
  await payload.updateGlobal({ slug: 'rates', overrideAccess: true, data: { ...next, checkedAt: new Date().toISOString() } as never })
  return `Курсы за 1 €: ${CODES.map((c) => `${c} ${next[c]}`).join(', ')}`
}
