// Тексты из Stay Property → наш формат (docs/content-import.md). Чистые функции, без запросов.
// В сервисе текст обычный (иногда HTML): у новостей часто одной строкой без абзацев,
// у услуг — с мусором после переноса со старого сайта (буквальные «\n», пустые строки, «**», обрывки нумерации).
import { htmlToLexical, type LexicalDoc } from './lexical'
import { htmlToText } from './stay-map'

type Block = { type: 'p' | 'h' | 'li'; text: string; marker?: boolean }

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
const LONG = 700 // абзац длиннее — делим по предложениям
const TARGET = 420 // примерная длина абзаца после деления
const CONTACT_LABEL = /^(телефон|phone|telefon|e-?mail|электронная почта|e-posta)\s*:?$/i

/** Обрезка по границе слова с многоточием. */
export function clip(s: string, max: number) {
  const t = s.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max - 1)
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max * 0.6)).replace(/[\s,;:—–-]+$/, '')}…`
}

/** Длинный абзац без переносов → несколько абзацев по предложениям. */
function splitLong(text: string): string[] {
  if (text.length <= LONG) return [text]
  const sentences = text.split(/(?<=[.!?…])\s+(?=[«"“(]?[\p{Lu}\d])/u)
  const out: string[] = []
  let cur = ''
  for (const s of sentences) {
    cur = cur ? `${cur} ${s}` : s
    if (cur.length >= TARGET) {
      out.push(cur)
      cur = ''
    }
  }
  if (cur) {
    if (out.length && cur.length < 120) out[out.length - 1] += ` ${cur}`
    else out.push(cur)
  }
  return out
}

/** Текст Stay Property → блоки: абзацы, подзаголовки, пункты списка. Повтор заголовка в начале убираем. */
export function textBlocks(raw: string | null | undefined, title = ''): Block[] {
  let s = String(raw ?? '')
  if (/<(p|br|div|li|h\d)\b/i.test(s)) s = htmlToText(s)
  s = s
    .replace(/\\n/g, '\n')
    .replace(/\r\n?/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/\*\*|__/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // ссылки markdown: [текст](url) → текст, пустые исчезают
  const lines = s.split('\n').map((l) => l.replace(/[ \t]+/g, ' ').trim())

  const blocks: Block[] = []
  let head = false // после одиночного «-» или номера идёт заголовок пункта
  for (const line of lines) {
    if (!line || !/[\p{L}\p{N}]/u.test(line)) {
      if (/^[-–•]$/.test(line)) head = true
      continue
    }
    if (/^\d{1,2}[.)]?$/.test(line)) {
      head = true
      continue
    }
    const li = /^[-–•]\s+(.+)$/.exec(line)
    if (li) blocks.push({ type: 'li', text: li[1] })
    else if (head) blocks.push({ type: 'h', text: line, marker: true })
    else if (line.length <= 80 && !/[.,;:…!»"”)]$/.test(line)) blocks.push({ type: 'h', text: line })
    else blocks.push(...splitLong(line).map((text) => ({ type: 'p' as const, text })))
    head = false
  }
  if (blocks.length && title && norm(blocks[0].text) === norm(title)) blocks.shift()
  // в конце страниц услуг — карточки менеджеров старого сайта (имя, «Телефон:», «E-mail», языки): отрезаем
  const contacts = blocks.findIndex((b) => CONTACT_LABEL.test(b.text))
  if (contacts > 0) {
    blocks.splice(contacts)
    // перед ними — подписи кнопок («Заказать обратный звонок», «Задать вопрос») и имя менеджера
    while (blocks.length > 1 && blocks.at(-1)!.text.length < 40 && !/[.!?…»"”)]$/.test(blocks.at(-1)!.text)) blocks.pop()
  }
  // заголовок в самом конце или перед другим обычным заголовком — это короткий абзац
  // (заголовок пункта после «-» или номера остаётся: «Что входит в тур?» → «Встреча в аэропорту»)
  return blocks.map((b, i) =>
    b.type === 'h' && !b.marker && (i === blocks.length - 1 || (blocks[i + 1].type === 'h' && !blocks[i + 1].marker)) ? { type: 'p', text: b.text } : { type: b.type, text: b.text },
  )
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Блоки → поле richText (Lexical) через простой HTML. */
export function blocksToLexical(blocks: Block[]): LexicalDoc {
  let html = ''
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]
    if (b.type === 'li') {
      html += '<ul>'
      for (; i < blocks.length && blocks[i].type === 'li'; i++) html += `<li>${esc(blocks[i].text)}</li>`
      html += '</ul>'
      i--
    } else html += b.type === 'h' ? `<h3>${esc(b.text)}</h3>` : `<p>${esc(b.text)}</p>`
  }
  return htmlToLexical(html)
}

/** Блоки → обычный текст (для полей без форматирования, например отзыва). */
export const blocksToText = (blocks: Block[]) => blocks.map((b) => b.text).join(' ').replace(/\s+/g, ' ').trim()

/** Короткий текст (лид, «кратко»): без повтора заголовка, без лишних пробелов, обрезан по слову. */
export function shortText(raw: string | null | undefined, title: string, max: number) {
  const t = blocksToText(textBlocks(raw, title))
  return t ? clip(t, max) : ''
}
