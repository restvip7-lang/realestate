// Клиент API Stay Portfolio Service (https://portfolio.stayrepo.com/ws, docs/stay-import.md).
// Только чтение: вход, список объектов, один объект. Ничего в Stay не меняем.
// Ключи — в переменных окружения: STAY_TOKEN (JWT), STAY_USERNAME, STAY_PASSWORD, по желанию STAY_API_URL.

const BASE = (process.env.STAY_API_URL || 'https://portfolio.stayrepo.com/ws').replace(/\/$/, '')

/** Районы Stay, которые берём на сайт: Аланья (2) и Газипаша (6), вместе с вложенными районами. */
export const STAY_LOCATIONS = [2, 6]
/** Справочники, которые запрашиваем вместе с объектом. */
const TERMS = { type: 1, location: 2, amenities: 3, currency: 4, view: 7, rooms: 15, offer: 16 } as const

type Term = { term_id: number; name: string; slug: string; parent: number; translation?: Record<string, string> | null }
type Localized = Partial<Record<'ru' | 'en' | 'sr' | 'tr', string>>

export type StayListItem = { ID: number; post_title: string; post_modified: string; post_status: string }

export type StayObject = {
  ID: number
  post_status: string
  post_modified: string
  i18n?: { post_title?: Localized; post_content?: Localized }
  post_title: string
  post_content: string
  post_meta: Record<string, unknown> & {
    refno?: string
    sales_cost?: string
    price_from?: string
    area_square?: string | null
    area_from?: string | null
    area_to?: string | null
    distance_sea?: string | null
    year_built?: string | null
    citizenship?: string
    residence_permit?: string
    floors_villa?: string
    active?: string
    relevance?: string
    video?: unknown
    object_gallery?: string[] | string
  }
  post_terms: Partial<Record<string, Term[]>>
}

type ApiResponse<T> = { status: number; statusText: string; messageCode: number; messageText: string; result: T }

export class StayError extends Error {}

export function stayConfigured() {
  return !!(process.env.STAY_TOKEN && process.env.STAY_USERNAME && process.env.STAY_PASSWORD)
}

export class StayClient {
  private cookie = ''

  private async call<T>(path: string, init: RequestInit = {}, retry = 2): Promise<T> {
    const headers = new Headers(init.headers)
    headers.set('Authorization', `Bearer ${process.env.STAY_TOKEN}`)
    if (this.cookie) headers.set('Cookie', this.cookie)
    let res: Response
    try {
      res = await fetch(`${BASE}${path}`, { ...init, headers, cache: 'no-store', signal: AbortSignal.timeout(30000) })
    } catch (err) {
      if (retry > 0) return this.call(path, init, retry - 1)
      throw new StayError(`Stay не отвечает (${path}): ${err instanceof Error ? err.message : err}`)
    }
    // сессия Stay держится на cookie: запоминаем всё, что прислал сервер
    const set = res.headers.getSetCookie?.() ?? []
    if (set.length) {
      const jar = new Map(this.cookie.split('; ').filter(Boolean).map((c) => c.split(/=(.*)/s).slice(0, 2) as [string, string]))
      for (const c of set) {
        const [pair] = c.split(';')
        const [k, v] = pair.split(/=(.*)/s)
        if (k) jar.set(k.trim(), v ?? '')
      }
      this.cookie = [...jar].map(([k, v]) => `${k}=${v}`).join('; ')
    }
    const json = (await res.json().catch(() => null)) as ApiResponse<T> | null
    if (res.status >= 500 && retry > 0) return this.call(path, init, retry - 1)
    if (!json || json.status !== 200) {
      throw new StayError(`Stay: ${json?.messageText || res.statusText || res.status} (${path})`)
    }
    return json.result
  }

  async login() {
    if (!stayConfigured()) throw new StayError('Не заданы STAY_TOKEN, STAY_USERNAME и STAY_PASSWORD')
    await this.call('/login/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: process.env.STAY_USERNAME, password: process.env.STAY_PASSWORD }),
    })
  }

  /** Страница списка объектов выбранных районов, свежие изменения первыми. */
  async list(page: number, perPage: number) {
    return this.call<{ total_results: number; total_pages: number; objects: StayListItem[] }>('/objects/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderby: 'modified',
        order: 'DESC',
        page,
        paged_options: { results_per_page: perPage },
        tax_query: { 0: { taxonomy: 'location', field: 'term_id', terms: STAY_LOCATIONS, include_children: true } },
      }),
    })
  }

  /** Объект целиком: переводы, доп. поля, фото (large) и справочники. */
  async get(id: number) {
    const q = new URLSearchParams({
      i18n: 'true',
      object_meta: 'true',
      gallery_images: 'large',
      object_terms: Object.values(TERMS).join(','),
    })
    return this.call<StayObject>(`/objects/get/${id}?${q}`)
  }
}

/** Значения справочника объекта по его названию в TERMS. */
export const termsOf = (o: StayObject, key: keyof typeof TERMS) => o.post_terms[String(TERMS[key])] ?? []
