import type { CollectionConfig } from 'payload'

import { anyone, editorsOnly, adminOnly } from '@/access'
import { revalidateAfterChange, revalidateAfterDelete } from '@/lib/revalidate'

const score = (name: string, label: string) => ({
  name,
  type: 'number' as const,
  label,
  min: 1,
  max: 5,
  admin: { width: '20%' },
})

export const Districts: CollectionConfig = {
  slug: 'districts',
  labels: { singular: 'Район', plural: 'Районы' },
  admin: {
    useAsTitle: 'name',
    group: 'Каталог',
    defaultColumns: ['name', 'slug', 'pricePerM2', 'order'],
    description: 'Районы Аланьи для каталога и страниц /districts/. Порядок — с запада на восток.',
  },
  defaultSort: 'order',
  access: { read: anyone, create: editorsOnly, update: editorsOnly, delete: adminOnly },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', label: 'Название', required: true, localized: true },
        {
          name: 'nameIn',
          type: 'text',
          label: 'Где? («в Махмутларе»)',
          localized: true,
          admin: { description: 'Для заголовков: «Квартиры в Махмутларе».' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'slug', type: 'text', label: 'Адрес (slug)', required: true, unique: true, index: true },
        { name: 'order', type: 'number', label: 'Порядок', defaultValue: 0 },
        { name: 'inland', type: 'checkbox', label: 'В горах, не у моря' },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Описание',
          fields: [
            { name: 'about', type: 'textarea', label: 'Коротко (карточка района)', localized: true },
            { name: 'lead', type: 'textarea', label: 'Вступление на странице района', localized: true },
            {
              name: 'pros',
              type: 'array',
              label: 'Плюсы',
              localized: true,
              fields: [{ name: 'text', type: 'text', required: true }],
            },
            {
              name: 'cons',
              type: 'array',
              label: 'Минусы',
              localized: true,
              fields: [{ name: 'text', type: 'text', required: true }],
            },
            {
              name: 'infra',
              type: 'array',
              label: 'Инфраструктура',
              localized: true,
              fields: [{ name: 'text', type: 'text', required: true }],
            },
            { name: 'image', type: 'upload', relationTo: 'media', label: 'Фото района' },
          ],
        },
        {
          label: 'Цифры и оценки',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'pricePerM2',
                  type: 'number',
                  label: 'Цена за м², €',
                  admin: { description: 'Ориентир для страницы района и калькулятора.' },
                },
                { name: 'pricePerM2Date', type: 'date', label: 'Цена проверена' },
                {
                  name: 'coastKm',
                  type: 'number',
                  label: 'Км от центра по побережью',
                  admin: { description: 'Минус — на запад от центра.' },
                },
              ],
            },
            {
              name: 'scores',
              type: 'group',
              label: 'Оценки 1–5',
              fields: [
                {
                  type: 'row',
                  fields: [
                    score('life', 'Жить круглый год'),
                    score('rent', 'Сдавать'),
                    score('beach', 'Пляж'),
                    score('infra', 'Инфраструктура'),
                    score('quiet', 'Тишина'),
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Карта',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'lat', type: 'number', label: 'Широта' },
                { name: 'lng', type: 'number', label: 'Долгота' },
              ],
            },
            {
              name: 'schema',
              type: 'group',
              label: 'Точка на схеме побережья',
              admin: { description: 'Координаты на рисованной схеме (1000×440) на главной и в гиде.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'x', type: 'number' },
                    { name: 'y', type: 'number' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
