import type { CollectionConfig } from 'payload'

import { editorsOnly, isStaff } from '@/access'
import { revalidateAfterChange, revalidateAfterDelete } from '@/lib/revalidate'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: { singular: 'Отзыв', plural: 'Отзывы' },
  admin: {
    useAsTitle: 'who',
    group: 'Компания',
    defaultColumns: ['who', 'country', 'date', 'rating', 'service', 'expert', 'published'],
  },
  defaultSort: '-date',
  access: {
    read: ({ req }) => (isStaff({ req }) ? true : { published: { equals: true } }),
    create: editorsOnly,
    update: editorsOnly,
    delete: editorsOnly,
  },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'who', type: 'text', label: 'Имя клиента', required: true },
        { name: 'country', type: 'text', label: 'Страна' },
        {
          name: 'date',
          type: 'date',
          label: 'Дата',
          required: true,
          admin: { date: { pickerAppearance: 'monthOnly', displayFormat: 'MM.yyyy' } },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'rating', type: 'number', label: 'Оценка', min: 1, max: 5, defaultValue: 5, required: true },
        {
          name: 'service',
          type: 'select',
          label: 'Услуга',
          defaultValue: 'buy',
          options: [
            { label: 'Покупка', value: 'buy' },
            { label: 'Аренда и управление', value: 'rent' },
            { label: 'ВНЖ и документы', value: 'docs' },
            { label: 'Продажа', value: 'sell' },
          ],
        },
        { name: 'expert', type: 'relationship', relationTo: 'team', label: 'Сотрудник' },
      ],
    },
    {
      name: 'text',
      type: 'textarea',
      label: 'Текст отзыва',
      required: true,
      admin: { description: 'На языке клиента, без перевода.' },
    },
    { name: 'published', type: 'checkbox', label: 'Показывать на сайте', defaultValue: true },
  ],
}
