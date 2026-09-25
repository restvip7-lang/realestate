import type { CollectionConfig, Where } from 'payload'

import { adminOnly, editorsOnly, isStaff } from '@/access'
import { slugField } from '@/fields/slug'
import { POST_CATEGORIES, SOURCE_REQUIRED } from '@/lib/catalog'
import { lexicalText } from '@/lib/lexical'
import { revalidateAfterChange, revalidateAfterDelete } from '@/lib/revalidate'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Публикация', plural: 'Статьи и новости' },
  admin: {
    useAsTitle: 'title',
    group: 'Контент',
    defaultColumns: ['title', 'kind', 'category', 'publishedAt', '_status'],
    description: 'Статьи (блог) и новости. Дата в будущем — публикация появится на сайте в этот день.',
    preview: (doc, { locale }) => `/${locale || 'ru'}/${doc.kind === 'news' ? 'news' : 'blog'}/${doc.slug || ''}`,
  },
  defaultSort: '-publishedAt',
  versions: { drafts: true, maxPerDoc: 30 },
  access: {
    // на сайте — только опубликованные, у которых наступила дата публикации
    read: ({ req }) => {
      if (isStaff({ req })) return true
      const where: Where = { and: [{ _status: { equals: 'published' } }, { publishedAt: { less_than_equal: new Date().toISOString() } }] }
      return where
    },
    create: editorsOnly,
    update: editorsOnly,
    delete: adminOnly,
  },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
    beforeChange: [
      ({ data }) => {
        const len = lexicalText(data.body).length
        if (len) data.readingMins = Math.max(1, Math.round(len / 1200))
        return data
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', label: 'Заголовок', required: true, localized: true, maxLength: 140 },
    {
      type: 'row',
      fields: [
        {
          name: 'kind',
          type: 'radio',
          label: 'Тип',
          required: true,
          defaultValue: 'article',
          options: [
            { label: 'Статья', value: 'article' },
            { label: 'Новость', value: 'news' },
          ],
          admin: { layout: 'horizontal' },
        },
        { name: 'category', type: 'select', label: 'Рубрика', required: true, options: [...POST_CATEGORIES] },
      ],
    },
    { name: 'lead', type: 'textarea', label: 'Подзаголовок (лид)', localized: true, maxLength: 320 },
    { name: 'cover', type: 'upload', relationTo: 'media', label: 'Обложка' },
    { name: 'body', type: 'richText', label: 'Текст', localized: true },
    {
      type: 'row',
      fields: [
        {
          name: 'source',
          type: 'text',
          label: 'Источник',
          admin: { description: 'Для новостей о законах, ВНЖ и курсах — обязательно (сайт ведомства).' },
          validate: (value: string | null | undefined, { siblingData }: { siblingData: Record<string, unknown> }) =>
            siblingData?.kind === 'news' && SOURCE_REQUIRED.includes(String(siblingData?.category)) && !value?.trim()
              ? 'Укажите источник новости'
              : true,
        },
        { name: 'reviewedAt', type: 'date', label: 'Проверено юристом' },
      ],
    },
    { name: 'tags', type: 'text', hasMany: true, label: 'Теги' },
    {
      type: 'row',
      fields: [
        { name: 'relatedDistricts', type: 'relationship', relationTo: 'districts', hasMany: true, label: 'Районы в статье' },
        { name: 'relatedProperties', type: 'relationship', relationTo: 'properties', hasMany: true, label: 'Объекты в статье' },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'title', type: 'text', label: 'Title', localized: true, maxLength: 70 },
        { name: 'description', type: 'textarea', label: 'Description', localized: true, maxLength: 170 },
      ],
    },
    // боковая колонка
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Дата публикации',
      required: true,
      index: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'team',
      label: 'Автор',
      admin: { position: 'sidebar', description: 'Пусто — «Редакция Kleo Homes».' },
    },
    { name: 'pinned', type: 'checkbox', label: 'Закрепить наверху', admin: { position: 'sidebar' } },
    slugField('title'),
    { name: 'readingMins', type: 'number', label: 'Минут чтения', admin: { position: 'sidebar', readOnly: true } },
  ],
}
