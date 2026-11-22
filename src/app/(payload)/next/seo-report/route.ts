import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import { landingSamples, listDistricts } from '@/lib/data'
import { INDEX_MIN, landingMatrix } from '@/lib/landings'

// Отчёт для менеджера (ТЗ, «админка»): какие страницы каталога закрыты от индексации и почему.
// Открывается из админки: /next/seo-report (редактор или администратор).
export const dynamic = 'force-dynamic'

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

export async function GET() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  const role = (user as { role?: string } | null)?.role
  if (role !== 'admin' && role !== 'editor') return new Response('Только для редактора или администратора', { status: 403 })

  const [samples, districts, seo] = await Promise.all([
    landingSamples(),
    listDistricts('ru'),
    payload.find({ collection: 'seo-pages', limit: 1000, depth: 0, pagination: false, select: { path: true, noindex: true, title: true, text: true } }),
  ])
  const matrix = landingMatrix(samples, districts)
  const own = new Map(seo.docs.map((d) => [d.path, d]))
  const few = matrix.filter((x) => x.n > 0 && x.n < INDEX_MIN).sort((a, b) => a.path.localeCompare(b.path))
  const manual = seo.docs.filter((d) => d.noindex)
  const open = matrix.filter((x) => x.n >= INDEX_MIN && !own.get(x.path)?.noindex)
  const noText = open.filter((x) => !own.get(x.path)?.text)

  const link = (p: string) => `<a href="/ru${esc(p)}" target="_blank">${esc(p)}</a>`
  const rows = (items: string[]) => (items.length ? `<ul>${items.map((x) => `<li>${x}</li>`).join('')}</ul>` : '<p class="muted">Нет</p>')
  const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>SEO-отчёт | Kleo Homes</title>
<style>body{font:15px/1.5 system-ui,sans-serif;margin:0 auto;max-width:960px;padding:24px 16px;color:#0E1116}h1{font-size:24px}h2{font-size:18px;margin-top:32px}li{margin:2px 0}.muted{color:#5B6573}a{color:#E8502E}code{background:#F4F6F8;padding:1px 4px;border-radius:4px}</style></head><body>
<h1>SEO-отчёт по каталогу</h1>
<p class="muted">Порог из ТЗ: от ${INDEX_MIN} объектов страница индексируется, 1–${INDEX_MIN - 1} — открыта, но закрыта от поисковиков (noindex), 0 — показывает альтернативы и не попадает в sitemap. Свои заголовки и тексты задаются в админке: SEO → SEO разделов.</p>
<p>Всего ЧПУ-страниц с объектами: <b>${matrix.filter((x) => x.n > 0).length}</b>, индексируются: <b>${open.length}</b>.</p>
<h2>Закрыты вручную в админке (${manual.length})</h2>
${rows(manual.map((d) => `${link(d.path)} — <a href="/admin/collections/seo-pages/${d.id}">изменить</a>`))}
<h2>Мало объектов: noindex (${few.length})</h2>
${rows(few.map((x) => `${link(x.path)} — ${x.n} шт.`))}
<h2>Индексируются, но без своего SEO-текста (${noText.length})</h2>
<p class="muted">На них показан общий текст. По ТЗ — 1500–3000 знаков на раздел.</p>
${rows(noText.map((x) => `${link(x.path)} — ${x.n} шт.`))}
<p class="muted">Страницы с фильтрами в параметрах (<code>?rooms=2+1</code>, сортировка) всегда noindex с canonical на раздел.</p>
</body></html>`
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } })
}
