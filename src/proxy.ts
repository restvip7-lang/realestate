import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'

import { HIDDEN_LOCALES, LOCALES } from './i18n/locales'
import { routing } from './i18n/routing'

const intl = createMiddleware(routing)

// Адрес объекта по ТЗ: /{lang}/turkey/alanya/{район}/{сделка}/id{номер} (docs/seo-urls.md)
const PROPERTY = new RegExp(`^/(${LOCALES.join('|')})/turkey/alanya/(?:([a-z0-9-]+)/)?(sale|rent)/id(\\d{1,9})$`)
const INTERNAL = new RegExp(`^/(${LOCALES.join('|')})/property-id(/|$)`)

// Объекты, проданные больше 90 дней назад → 410 Gone. Список из /next/gone, в памяти на 10 минут.
let gone: { ids: Set<number>; at: number } = { ids: new Set(), at: 0 }
async function goneIds(origin: string) {
  if (Date.now() - gone.at < 600_000) return gone.ids
  try {
    const res = await fetch(`${origin}/next/gone`, { signal: AbortSignal.timeout(1500) })
    if (res.ok) gone = { ids: new Set(((await res.json()) as { ids: number[] }).ids), at: Date.now() }
    else gone.at = Date.now() - 540_000 // ошибка — повторим через минуту, страницы открываются как обычно
  } catch {
    gone.at = Date.now() - 540_000
  }
  return gone.ids
}

const GONE_HTML = (locale: string) => {
  const ru = locale === 'ru'
  const home = `/${locale}/turkey/alanya/sale`
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${ru ? 'Объект продан' : 'Property sold'} | Kleo Homes</title><style>body{font:16px/1.5 system-ui,sans-serif;margin:0;display:grid;place-items:center;min-height:100vh;background:#F4F6F8;color:#0E1116}main{max-width:520px;padding:24px;text-align:center}a{color:#E8502E}</style></head><body><main><h1>${ru ? 'Этот объект продан' : 'This property has been sold'}</h1><p>${ru ? 'Он больше не продаётся. Посмотрите похожие варианты в каталоге.' : 'It is no longer on the market. See similar options in the catalogue.'}</p><p><a href="${home}">${ru ? 'Перейти в каталог' : 'Open the catalogue'}</a></p></main></body></html>`
}

// «/» и адреса без языка → /ru/…; админка, API и файлы не трогаем.
// Скрытые языки (сейчас турецкий): старые адреса /tr/… постоянно ведут на ту же страницу /en/…
export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const hidden = HIDDEN_LOCALES.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))
  if (hidden) {
    const url = req.nextUrl.clone()
    url.pathname = `/en${pathname.slice(hidden.length + 1)}`
    return NextResponse.redirect(url, 308)
  }
  // внутренний маршрут страницы объекта снаружи не открывается
  if (INTERNAL.test(pathname)) {
    const url = req.nextUrl.clone()
    url.pathname = `/${pathname.split('/')[1]}/__not-found`
    return NextResponse.rewrite(url)
  }
  const m = pathname.match(PROPERTY)
  if (m) {
    const [, locale, district, deal, id] = m
    if ((await goneIds(req.nextUrl.origin)).has(Number(id))) {
      return new NextResponse(GONE_HTML(locale), { status: 410, headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex' } })
    }
    const url = req.nextUrl.clone()
    url.pathname = `/${locale}/property-id/${id}/${district || '_'}/${deal}`
    return NextResponse.rewrite(url)
  }
  return intl(req)
}

export const config = {
  matcher: ['/((?!api|admin|next|_next|_vercel|.*\\..*).*)'],
}
