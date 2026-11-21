// Матрица ЧПУ-страниц каталога: сколько объектов на каждой комбинации район × сделка × тип × признак.
// Нужна для порогов публикации из ТЗ (≥3 — индексируем, 1–2 — noindex, 0 — альтернативы),
// блоков перелинковки и sitemap. Считается по лёгкой выборке landingSamples() (docs/seo-urls.md).
import { POOL_FEATURES, PROPERTY_TYPES, type PropertyType } from './catalog'
import { catalogBasePath, DEALS, LANDING_KEYS, LANDINGS, landingFits, type Deal, type Landing } from './catalog-params'
import type { CatalogQuery, LandingSample } from './data'

/** Порог индексации ЧПУ-страницы. */
export const INDEX_MIN = 3

const FURNISHED = ['yes', 'partial']
const NEW = ['new', 'construction']

/** То же условие, что catalogWhere() в data.ts, только для полей ЧПУ. */
export function sampleMatches(p: LandingSample, q: CatalogQuery, districtId?: number): boolean {
  if (p.deal !== (q.deal || 'sale')) return false
  if (districtId != null && p.district !== districtId) return false
  if (q.type && p.type !== q.type) return false
  if (q.seaView && p.view !== 'sea') return false
  if (q.sea && !(p.sea && p.sea > 0 && p.sea <= q.sea)) return false
  if (q.pool && !(p.features ?? []).some((f) => (POOL_FEATURES as string[]).includes(f))) return false
  if (q.furnished && !FURNISHED.includes(p.furnished ?? '')) return false
  if (q.newBuild && !NEW.includes(p.condition ?? '')) return false
  if (q.citizenship && !p.citizenship) return false
  if (q.pets && !p.rent?.pets) return false
  return true
}

export type LandingPage = { path: string; q: CatalogQuery; n: number }

/** Все ЧПУ-страницы с числом объектов (без номеров страниц). */
export function landingMatrix(samples: LandingSample[], districts: { id: number; slug: string }[]): LandingPage[] {
  const out: LandingPage[] = []
  const types = [undefined, ...(Object.keys(PROPERTY_TYPES) as PropertyType[])]
  for (const deal of DEALS as readonly Deal[]) {
    const byDeal = samples.filter((p) => p.deal === deal)
    for (const d of [undefined, ...districts]) {
      const byD = d ? byDeal.filter((p) => p.district === d.id) : byDeal
      if (d && !byD.length) continue
      for (const type of types) {
        const byT = type ? byD.filter((p) => p.type === type) : byD
        if (type && !byT.length) continue
        for (const f of [undefined, ...LANDING_KEYS] as (Landing | undefined)[]) {
          if (f && !landingFits(f, deal)) continue
          const q: CatalogQuery = { deal, district: d?.slug, type, ...(f ? LANDINGS[f].patch : {}) }
          const n = f ? byT.filter((p) => sampleMatches(p, q)).length : byT.length
          out.push({ path: catalogBasePath(q), q, n })
        }
      }
    }
  }
  return out
}
