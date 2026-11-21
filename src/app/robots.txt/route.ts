import { CATALOG_BASE } from '@/lib/catalog-params'
import { INDEXABLE, SITE_URL } from '@/lib/seo'

// robots.txt по ТЗ: ИИ-боты разрешены явно, для Яндекса — Clean-param (метки рекламы и параметры фильтров каталога).
// Пока на сайте демо-данные (SITE_INDEXABLE не равен 1), закрываем всё.
export const revalidate = 3600

const AI_BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'YandexAdditional']
const DISALLOW = ['/admin', '/api', '/next', '/*/favorites', '/*/search', '/*/property-id/']
// параметры, не меняющие содержимое для индекса: метки рекламы и фильтры каталога сверх ЧПУ
const UTM = 'utm_source&utm_medium&utm_campaign&utm_term&utm_content&gclid&yclid&fbclid&ysclid'
const FILTERS = 'rooms&min&max&sea&area&view&furn&new&cit&floor&owner&video&pets&pool&sort'

export function GET() {
  if (!INDEXABLE) return text('User-agent: *\nDisallow: /\n')
  const rules = (ua: string) => [`User-agent: ${ua}`, 'Allow: /', ...DISALLOW.map((d) => `Disallow: ${d}`)].join('\n')
  const body = [
    rules('*'),
    '',
    // ИИ-ассистентам сайт открыт так же, как поисковикам (ТЗ)
    ...AI_BOTS.map((b) => rules(b) + '\n'),
    rules('Yandex'),
    `Clean-param: ${UTM}`,
    `Clean-param: ${FILTERS} /*${CATALOG_BASE}/`,
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
  ].join('\n')
  return text(body + '\n')
}

const text = (s: string) => new Response(s, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
