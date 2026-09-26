import { type JSXConvertersFunction, RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { lexicalText } from '@/lib/lexical'
import { slugify } from '@/lib/slug'

type Node = { type: string; tag?: string; children?: Node[] }

export const headingId = (node: unknown) => slugify(lexicalText({ root: node }), 60) || 'section'

/** Подзаголовки h2 для блока «Содержание». */
export function tocOf(doc: unknown): { id: string; text: string }[] {
  const root = (doc as { root?: Node } | null)?.root
  return (root?.children || []).filter((n) => n.type === 'heading' && n.tag === 'h2').map((n) => ({ id: headingId(n), text: lexicalText({ root: n }) }))
}

// у подзаголовков появляются id, чтобы работали ссылки из «Содержания»
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  heading: ({ node, nodesToJSX }) => {
    const Tag = (['h2', 'h3', 'h4'].includes(node.tag) ? node.tag : 'h2') as 'h2'
    return <Tag id={headingId(node)}>{nodesToJSX({ nodes: node.children })}</Tag>
  },
})

export function Prose({ data }: { data: unknown }) {
  if (!data) return null
  return <div className="prose" id="prose"><RichText data={data as SerializedEditorState} converters={converters} disableContainer /></div>
}
