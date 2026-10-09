// Клиент сервиса контента Stay Property (docs/content-import.md). Только чтение: новости, отзывы, услуги.
// Публичные GET-запросы без авторизации. Если в сервисе включат токен (MIRROR_API_TOKEN), задайте его в CONTENT_API_TOKEN.

export const CONTENT_KINDS = ['news', 'reviews', 'services'] as const
export type ContentKind = (typeof CONTENT_KINDS)[number]

/** Языковой блок записи (`translations.ru` и т. п.). `_origin`: editor — написано редактором, ai — перевод. */
export type ContentText = { title?: string; excerpt?: string; body?: string; category?: string; location?: string; _origin?: string }

export type ContentItem = {
  id: string
  kind: ContentKind
  title: string
  excerpt: string
  body: string
  category: string
  location: string
  published_at: string
  image: string
  enabled: boolean
  source: string
  created_at: string
  updated_at: string
  translations?: Record<string, ContentText>
}

type Page = { items: ContentItem[]; page: number; limit: number; total: number; totalPages: number }

const base = () => (process.env.CONTENT_API_URL || 'https://admin.stayproperty.com').replace(/\/+$/, '')

async function get<T>(path: string): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (process.env.CONTENT_API_TOKEN) headers.Authorization = `Bearer ${process.env.CONTENT_API_TOKEN}`
  let last: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${base()}${path}`, { headers, cache: 'no-store', signal: AbortSignal.timeout(20_000) })
      const type = res.headers.get('content-type') || ''
      if (!res.ok || !type.includes('json')) throw new Error(`Stay Property ${path}: ответ ${res.status}`)
      return (await res.json()) as T
    } catch (err) {
      last = err
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
    }
  }
  throw last instanceof Error ? last : new Error(String(last))
}

/** Все опубликованные записи вида (сервис отдаёт только enabled=true), со всеми языками в `translations`. */
export async function listContent(kind: ContentKind): Promise<ContentItem[]> {
  const out: ContentItem[] = []
  for (let page = 1; page <= 50; page++) {
    const res = await get<Page>(`/api/content/${kind}?page=${page}&limit=100`)
    out.push(...res.items)
    if (page >= res.totalPages || !res.items.length) break
  }
  return out
}
