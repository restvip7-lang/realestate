import type { Field } from 'payload'

import { slugify } from '@/lib/slug'

/** Поле slug: если пусто, заполняется из поля `from` (русская версия) при сохранении. */
export const slugField = (from = 'title', opts: { unique?: boolean } = {}): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: opts.unique ?? true,
  label: 'Адрес страницы (slug)',
  admin: {
    position: 'sidebar',
    description: 'Латиницей через дефис. Пусто — заполнится из заголовка.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data, originalDoc }) => {
        if (typeof value === 'string' && value.trim()) return slugify(value)
        const src = data?.[from] ?? originalDoc?.[from]
        const text = typeof src === 'object' && src ? (src.ru ?? Object.values(src)[0]) : src
        return text ? slugify(String(text)) : value
      },
    ],
  },
})
