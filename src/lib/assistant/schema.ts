import { z } from 'zod'

export const localeSchema = z.enum(['ru', 'en', 'tr'])
export const messageSchema = z.object({ role: z.enum(['user', 'assistant']), content: z.string().trim().min(1).max(1800) }).strict()
export const requestSchema = z.object({
  locale: localeSchema,
  messages: z.array(messageSchema).min(1).max(24),
}).strict().refine((v) => v.messages.at(-1)?.role === 'user', 'Last message must be from user')
  .refine((v) => v.messages.reduce((n, m) => n + m.content.length, 0) <= 18000, 'Conversation too long')

export const filtersSchema = z.object({
  deal: z.enum(['sale', 'rent']).nullable(),
  city: z.string().max(80).nullable(),
  district: z.string().max(80).nullable(),
  type: z.enum(['apartment', 'penthouse', 'villa', 'duplex', 'land', 'commercial', 'project']).nullable(),
  rooms: z.string().regex(/^\d\+\d$/).nullable(),
  minBudget: z.number().min(0).max(1000000000).nullable(),
  maxBudget: z.number().positive().max(1000000000).nullable(),
  currency: z.enum(['EUR', 'USD', 'TRY', 'RUB', 'GBP', 'KZT']).nullable(),
  sea: z.number().min(0).max(100000).nullable(),
  furnished: z.boolean().nullable(),
  purpose: z.string().max(180).nullable(),
  timing: z.string().max(180).nullable(),
}).strict()
export const decisionSchema = z.object({
  reply: z.string().min(1).max(1200),
  search: z.boolean(),
  filters: filtersSchema,
  summary: z.string().max(800),
}).strict()
export type Filters = z.infer<typeof filtersSchema>
export type Decision = z.infer<typeof decisionSchema>
export type ChatRequest = z.infer<typeof requestSchema>
export type Card = { id: number; title: string; url: string; image: string | null; district: string; price: number | null; priceFrom?: boolean; rooms: string | null; area: number | null; sea: number | null; deal: 'sale' | 'rent' }
export type ChatReply = Decision & { cards: Card[]; total: number | null; notice: 'currency' | 'location' | 'budget' | null; demo: boolean }
export const emptyFilters: Filters = { deal: null, city: null, district: null, type: null, rooms: null, minBudget: null, maxBudget: null, currency: null, sea: null, furnished: null, purpose: null, timing: null }

// Catalogue covers Alanya and Gazipaşa (a separate town, stored as our district `gazipasa`).
const CITIES: Record<string, string | null> = { alanya: null, alania: null, 'алания': null, 'аланья': null, gazipasa: 'gazipasa', 'газипаша': 'gazipasa' }
const cityKey = (city: string) => city.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').trim()
/** District slug implied by the city (Gazipaşa), or null for Alanya / no city. */
export const cityDistrict = (city: string | null) => (city ? (CITIES[cityKey(city)] ?? null) : null)

// Independent of the provider: never silently discard a location or convert an unknown currency.
export function searchBounds(f: Filters, rates: Record<string, number>) {
  if (!f.deal || (f.minBudget != null && f.maxBudget != null && f.minBudget > f.maxBudget)) return { error: 'budget' as const }
  if (f.city && !(cityKey(f.city) in CITIES)) return { error: 'location' as const }
  const hasBudget = f.minBudget != null || f.maxBudget != null
  const rate = f.currency ? rates[f.currency] : undefined
  if (hasBudget && (!rate || !Number.isFinite(rate) || rate <= 0)) return { error: 'currency' as const }
  return { min: f.minBudget == null ? undefined : Math.ceil(f.minBudget / rate!), max: f.maxBudget == null ? undefined : Math.floor(f.maxBudget / rate!) }
}
