// Сайт для демо (владелец 22.10.2026): в текстах из Stay (описания объектов, новости, услуги) название
// «Stay Property» меняем на Kleo Homes. Один список правил — и для импорта (JS), и для миграции (Postgres regexp_replace):
// только простые шаблоны без классов JS-only. Порядок важен: сначала с окончаниями, потом общее.
export const BRAND = 'Kleo Homes'

/** [шаблон, замена]; регистр не важен (STAY PROPERTY, Stay property, StayProperty) */
export const REBRAND_RULES: [string, string][] = [
  // турецкие окончания после апострофа: Kleo Homes читается «Клео Хоумс» → -un/-a/-tan/-ta/-u
  ['Stay ?Property[’\']nin', `${BRAND}’un`],
  ['Stay ?Property[’\']den', `${BRAND}’tan`],
  ['Stay ?Property[’\']de', `${BRAND}’ta`],
  ['Stay ?Property[’\']ye', `${BRAND}’a`],
  ['Stay ?Property[’\']e', `${BRAND}’a`],
  ['Stay ?Property[’\']yi', `${BRAND}’u`],
  // английский: «Stay Property company offers…» → «Kleo Homes offers…», «Stay Property’s Stay Rental department»
  ['Stay ?Property company', BRAND],
  ['Stay Rental', 'rental'],
  ['Stay ?Property[’\']s ', `${BRAND}’ `],
  ['Stay ?Property', BRAND],
]

const compiled = REBRAND_RULES.map(([p, r]) => [new RegExp(p, 'gi'), r] as const)

/** Заменить название Stay Property на Kleo Homes. */
export function rebrand<T extends string | null | undefined>(text: T): T {
  if (!text) return text
  let out: string = text
  for (const [re, r] of compiled) out = out.replace(re, r)
  return out as T
}

/** Упоминает ли текст Stay Property (для отзывов: такие скрываем, а не переписываем — это слова клиентов о другой компании). */
export const mentionsStay = (text?: string | null) => !!text && /stay ?property|виктори/i.test(text)
