import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'

import { HIDDEN_LOCALES } from './i18n/locales'
import { routing } from './i18n/routing'

const intl = createMiddleware(routing)

// «/» и адреса без языка → /ru/…; админка, API и файлы не трогаем.
// Скрытые языки (сейчас турецкий): старые адреса /tr/… постоянно ведут на ту же страницу /en/…
export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const hidden = HIDDEN_LOCALES.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))
  if (hidden) {
    const url = req.nextUrl.clone()
    url.pathname = `/en${pathname.slice(hidden.length + 1)}`
    return NextResponse.redirect(url, 308)
  }
  return intl(req)
}

export const config = {
  matcher: ['/((?!api|admin|next|_next|_vercel|.*\\..*).*)'],
}
