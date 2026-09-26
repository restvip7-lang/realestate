import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

import { routing } from './routing'

type Msgs = { [k: string]: string | Msgs | unknown[] }

// Длинные тексты страниц пишутся сначала по-русски: если ключа нет в en/tr, берём русский (docs/CLAUDE-NOTES.md)
function merge(base: Msgs, over: Msgs): Msgs {
  const out: Msgs = { ...base }
  for (const [k, v] of Object.entries(over)) {
    const b = base[k]
    out[k] = v && typeof v === 'object' && !Array.isArray(v) && b && typeof b === 'object' && !Array.isArray(b) ? merge(b as Msgs, v as Msgs) : v
  }
  return out
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale
  const ru = (await import('./messages/ru.json')).default as Msgs
  const own = locale === 'ru' ? ru : ((await import(`./messages/${locale}.json`)).default as Msgs)
  return { locale, messages: locale === 'ru' ? ru : merge(ru, own) }
})
