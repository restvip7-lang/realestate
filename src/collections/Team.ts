import type { CollectionConfig } from 'payload'

import { adminOnly, editorsOnly, isStaff } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '@/lib/revalidate'

export const Team: CollectionConfig = {
  slug: 'team',
  labels: { singular: 'Сотрудник', plural: 'Команда' },
  admin: {
    useAsTitle: 'name',
    group: 'Компания',
    defaultColumns: ['name', 'role', 'kind', 'hidden', 'order'],
    description: 'Порядок в списке = порядок на странице «Команда». Скрытые не показываются на сайте, их объекты распределяются между экспертами.',
  },
  defaultSort: 'order',
  access: {
    read: ({ req }) => (isStaff({ req }) ? true : { hidden: { not_equals: true } }),
    create: editorsOnly,
    update: editorsOnly,
    delete: adminOnly,
  },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', label: 'Имя и фамилия', required: true },
        { name: 'role', type: 'text', label: 'Должность', required: true, localized: true },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'kind',
          type: 'select',
          label: 'Кто это',
          required: true,
          defaultValue: 'expert',
          options: [
            { label: 'Основатель', value: 'founder' },
            { label: 'Эксперт (ведёт объекты)', value: 'expert' },
            { label: 'Юрист', value: 'lawyer' },
          ],
        },
        { name: 'langs', type: 'text', label: 'Языки', admin: { placeholder: 'RU · EN · TR' } },
        { name: 'exp', type: 'number', label: 'Опыт, лет', min: 0 },
      ],
    },
    { name: 'photo', type: 'upload', relationTo: 'media', label: 'Фото' },
    {
      name: 'areas',
      type: 'relationship',
      relationTo: 'districts',
      hasMany: true,
      label: 'Районы',
    },
    { name: 'spec', type: 'text', label: 'Специализация', localized: true },
    { name: 'bio', type: 'textarea', label: 'О себе', localized: true },
    {
      name: 'help',
      type: 'array',
      label: 'Чем поможет',
      localized: true,
      fields: [{ name: 'text', type: 'text', required: true }],
    },
    {
      type: 'collapsible',
      label: 'Контакты для клиентов',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'phone', type: 'text', label: 'Телефон' },
            { name: 'whatsapp', type: 'text', label: 'WhatsApp (цифры, с кодом страны)' },
            { name: 'telegram', type: 'text', label: 'Telegram (без @)' },
            { name: 'email', type: 'email', label: 'E-mail' },
          ],
        },
      ],
    },
    slugField('name'),
    { name: 'order', type: 'number', label: 'Порядок', defaultValue: 100, admin: { position: 'sidebar' } },
    { name: 'hidden', type: 'checkbox', label: 'Скрыть с сайта', admin: { position: 'sidebar' } },
    {
      name: 'reviews',
      type: 'join',
      collection: 'reviews',
      on: 'expert',
      label: 'Отзывы о сотруднике',
      admin: { defaultColumns: ['who', 'date', 'rating'] },
    },
  ],
}
