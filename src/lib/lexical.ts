// Минимальная работа с деревом Lexical (формат поля richText в Payload) без DOM:
// текст для подсчёта времени чтения и импорт простого HTML из прототипа (p, h2, h3, ul/ol/li, b/i, a, blockquote).

type Node = { type: string; children?: Node[]; text?: string; [k: string]: unknown }
export type LexicalDoc = { root: Node }

export function lexicalText(doc: unknown): string {
  const walk = (n: Node): string =>
    n.type === 'text' ? String(n.text ?? '') : (n.children ?? []).map(walk).join(n.type === 'root' ? '\n' : ' ')
  const root = (doc as LexicalDoc | null)?.root
  return root ? walk(root).replace(/\s+/g, ' ').trim() : ''
}

const decode = (s: string) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')

const base = { direction: 'ltr' as const, format: '' as const, indent: 0, version: 1 }
const text = (t: string, format = 0): Node => ({ type: 'text', text: decode(t), format, detail: 0, mode: 'normal', style: '', version: 1 })

// инлайновое содержимое: текст, <b>/<strong>, <i>/<em>, <a href>
function inline(html: string, mapHref: (h: string) => string, format = 0): Node[] {
  const out: Node[] = []
  const re = /<(b|strong|i|em|a)(\s[^>]*)?>([\s\S]*?)<\/\1>|<br\s*\/?>/gi
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    if (m.index > last) out.push(text(html.slice(last, m.index).replace(/<[^>]+>/g, ''), format))
    if (m[0].toLowerCase().startsWith('<br')) out.push({ type: 'linebreak', version: 1 })
    else {
      const tag = m[1].toLowerCase()
      if (tag === 'a') {
        const href = /href="([^"]*)"/.exec(m[2] || '')?.[1] || '#'
        out.push({
          ...base,
          type: 'link',
          fields: { linkType: 'custom', url: mapHref(href), newTab: false },
          children: inline(m[3], mapHref, format),
        })
      } else out.push(...inline(m[3], mapHref, format | (tag === 'b' || tag === 'strong' ? 1 : 2)))
    }
    last = m.index + m[0].length
  }
  if (last < html.length) out.push(text(html.slice(last).replace(/<[^>]+>/g, ''), format))
  return out.filter((n) => n.type !== 'text' || n.text)
}

/** HTML прототипа → Lexical. mapHref переписывает ссылки вида district.html?d=oba в адреса нового сайта. */
export function htmlToLexical(html: string, mapHref: (h: string) => string = (h) => h): LexicalDoc {
  const children: Node[] = []
  const re = /<(p|h2|h3|ul|ol|blockquote)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    const tag = m[1].toLowerCase()
    const inner = m[3].trim()
    if (tag === 'p') children.push({ ...base, type: 'paragraph', textFormat: 0, textStyle: '', children: inline(inner, mapHref) })
    else if (tag === 'h2' || tag === 'h3') children.push({ ...base, type: 'heading', tag, children: inline(inner, mapHref) })
    else if (tag === 'blockquote') children.push({ ...base, type: 'quote', children: inline(inner.replace(/<\/?p>/g, ''), mapHref) })
    else {
      const items = [...inner.matchAll(/<li>([\s\S]*?)<\/li>/gi)].map((li, i) => ({
        ...base,
        type: 'listitem',
        value: i + 1,
        children: inline(li[1].trim(), mapHref),
      }))
      children.push({ ...base, type: 'list', listType: tag === 'ol' ? 'number' : 'bullet', start: 1, tag, children: items })
    }
  }
  return { root: { ...base, type: 'root', children } }
}
