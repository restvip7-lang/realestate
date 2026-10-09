// Автоперевод объявлений Stay на турецкий (в Stay турецкого текста нет). Решение владельца — docs/stay-import.md.
// Переводим с английского. Нужен ANTHROPIC_API_KEY. Модель можно сменить переменной STAY_TRANSLATE_MODEL
// (например, claude-haiku-4-5 — дешевле). Без ключа или при ошибке переводы не делаем: в TR остаётся английский текст.
import { createHash } from 'node:crypto'

import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import { z } from 'zod'

const MODEL = process.env.STAY_TRANSLATE_MODEL || 'claude-opus-5-5'

const Translation = z.object({ title: z.string(), description: z.string() })

export const translationEnabled = () => !!process.env.ANTHROPIC_API_KEY

/** Отпечаток английского текста: перевод повторяем, только если текст в Stay изменился. */
export const textHash = (t: { title: string; description: string }) =>
  createHash('sha256').update(`${MODEL}\n${t.title}\n${t.description}`).digest('hex').slice(0, 32)

let client: Anthropic | null = null

export async function translateToTurkish(en: { title: string; description: string }) {
  client ??= new Anthropic()
  // Haiku не принимает effort и резервные модели — для неё только формат ответа
  const haiku = MODEL.startsWith('claude-haiku')
  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    // при отказе модели запрос сам переходит на резервную модель (серверная функция API)
    ...(haiku ? {} : { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const }),
    output_config: haiku ? { format: betaZodOutputFormat(Translation) } : { effort: 'low', format: betaZodOutputFormat(Translation) },
    system:
      'You translate real estate listings for an agency in Alanya, Turkey, from English into natural Turkish for Turkish-speaking buyers. ' +
      'Keep every number, price, area, distance, room layout (like 2+1) and proper name exactly as in the source. ' +
      'Use standard Turkish real estate terms (daire, villa, dubleks, çatı dubleksi, site, havuz, denize uzaklık). ' +
      'Keep the paragraph breaks (blank lines). Do not add anything that is not in the source. ' +
      'The title must stay under 120 characters.',
    messages: [{ role: 'user', content: `Title:\n${en.title}\n\nDescription:\n${en.description || '(empty)'}` }],
  })
  if (response.stop_reason === 'refusal' || !response.parsed_output) return null
  const out = response.parsed_output
  return { title: out.title.trim().slice(0, 120), description: en.description ? out.description.trim() : '' }
}
