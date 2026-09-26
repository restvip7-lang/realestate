import { getCompany, sitemapData } from '@/lib/data'
import { INDEXABLE, SITE_URL } from '@/lib/seo'

// Краткое описание сайта для ИИ-ассистентов (llmstxt.org); обновляется раз в час
export const revalidate = 3600

export async function GET() {
  if (!INDEXABLE) return new Response('# Kleo Homes\n\n> Демо-версия сайта, данные вымышлены.\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  const [c, { districts, posts }] = await Promise.all([getCompany('ru'), sitemapData()])
  const u = (p: string) => `${SITE_URL}/ru${p}`
  const lines = [
    '# Kleo Homes',
    '',
    '> Агентство недвижимости в Алании (Турция): продажа и аренда квартир, пентхаусов и вилл, сопровождение сделки, ВНЖ и гражданство. Языки сайта: русский (основной), английский, турецкий.',
    '',
    `Телефон и WhatsApp: ${c.phone}. E-mail: ${c.email}. Адрес: ${c.address}.${c.legal?.license ? ` Лицензия TTYB № ${c.legal.license}.` : ''}`,
    '',
    '## Каталог',
    `- [Продажа](${u('/sale')}): квартиры, пентхаусы, виллы в Алании`,
    `- [Аренда](${u('/rent')}): долгосрочная и сезонная`,
    `- [Районы Алании](${u('/districts')}): цены за м², плюсы и минусы`,
    ...districts.filter((d) => d.slug).map((d) => `- [${d.name}](${u(`/districts/${d.slug}`)})`),
    '',
    '## Покупка',
    `- [Как проходит покупка](${u('/how-to-buy')}): шаги, сроки, расходы сверх цены`,
    `- [Гражданство Турции за недвижимость](${u('/citizenship')})`,
    `- [ВНЖ через покупку недвижимости](${u('/residence-permit')})`,
    `- [Услуги и цены](${u('/services')})`,
    '',
    '## О компании',
    `- [Команда](${u('/team')})`,
    `- [Отзывы](${u('/reviews')})`,
    `- [Контакты](${u('/contacts')})`,
    '',
    '## Статьи',
    ...posts.filter((p) => p.slug && p.kind !== 'news').map((p) => `- [${p.title}](${u(`/blog/${p.slug}`)})`),
    '',
  ]
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
