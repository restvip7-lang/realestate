import type { CollectionConfig } from 'payload'

import { adminOnly, editorsOnly, isStaff } from '@/access'
import { externalField, remoteCoverField } from '@/fields/external'
import { slugField } from '@/fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '@/lib/revalidate'

// Услуги из Stay Property (docs/content-import.md): страница /services/[slug] и список на /services.
// Основные карточки /services пока написаны в коде страницы; эта коллекция — дополнительные услуги.
export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Услуга', plural: 'Услуги' },
  admin: {
    useAsTitle: 'title',
    group: 'Контент',
    defaultColumns: ['title', 'group', 'published', 'order'],
    description: 'Дополнительные услуги: список на странице «Услуги» и отдельная страница у каждой.',
    preview: (doc, { locale }) => `/${locale || 'ru'}/services/${doc.slug || ''}`,
  },
  defaultSort: 'order',
  access: {
    read: ({ req }) => (isStaff({ req }) ? true : { published: { equals: true } }),
    create: editorsOnly,
    update: editorsOnly,
    delete: adminOnly,
  },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: 'title', type: 'text', label: 'Название', required: true, localized: true, maxLength: 140 },
    {
      type: 'row',
      fields: [
        {
          name: 'group',
          type: 'select',
          label: 'Раздел',
          required: true,
          defaultValue: 'page',
          options: [
            { label: 'Бесплатно для покупателей', value: 'free' },
            { label: 'Услуга', value: 'page' },
          ],
        },
        { name: 'order', type: 'number', label: 'Порядок', admin: { description: 'Меньше — выше в списке.' } },
      ],
    },
    { name: 'excerpt', type: 'textarea', label: 'Кратко', localized: true, maxLength: 400 },
    { name: 'cover', type: 'upload', relationTo: 'media', label: 'Обложка' },
    remoteCoverField,
    { name: 'body', type: 'richText', label: 'Текст', localized: true },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'title', type: 'text', label: 'Title', localized: true, maxLength: 70 },
        { name: 'description', type: 'textarea', label: 'Description', localized: true, maxLength: 170 },
      ],
    },
    { name: 'published', type: 'checkbox', label: 'Показывать на сайте', defaultValue: true, admin: { position: 'sidebar' } },
    slugField('title'),
    externalField('Услуга приходит из Stay Property: название, раздел, текст и обложка перезаписываются при синхронизации, правьте их там. Порядок, публикация и SEO остаются нашими.'),
  ],
}
