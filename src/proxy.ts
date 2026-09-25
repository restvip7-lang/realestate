import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'

// «/» и адреса без языка → /ru/…; админка, API и файлы не трогаем
export default createMiddleware(routing)

export const config = {
  matcher: ['/((?!api|admin|next|_next|_vercel|.*\\..*).*)'],
}
