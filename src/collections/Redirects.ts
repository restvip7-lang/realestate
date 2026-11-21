import type { CollectionConfig } from 'payload'

import { adminOnly, editorsOnly } from '@/access'

// Менеджер редиректов (ТЗ, «админка»): старый адрес → новый. Применяется в src/proxy.ts (список в памяти до 10 минут).
export const Redirects: CollectionConfig = {
  slug: 'redirects',
  labels: { singular: 'Редирект', plural: 'Редиректы' },
  admin: {
    useAsTitle: 'from',
    group: 'SEO',
    defaultColumns: ['from', 'to', 'code', 'active', 'updatedAt'],
    description: 'Старый адрес → новый. «Откуда» — путь с языком или без: /ru/old-page или /old-page (тогда для всех языков). Изменения начинают работать в течение 10 минут.',
  },
  access: { read: editorsOnly, create: editorsOnly, update: editorsOnly, delete: adminOnly },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.from) data.from = '/' + String(data.from).trim().replace(/^https?:\/\/[^/]+/, '').replace(/[?#].*$/, '').replace(/^\/+|\/+$/g, '')
        if (data?.to) data.to = String(data.to).trim()
        return data
      },
    ],
  },
  fields: [
    { name: 'from', type: 'text', label: 'Откуда', required: true, unique: true, index: true },
    { name: 'to', type: 'text', label: 'Куда', required: true, admin: { description: 'Путь на сайте (/ru/turkey/alanya/sale) или полный адрес https://…' } },
    { name: 'code', type: 'select', label: 'Код', defaultValue: '308', required: true, options: [{ label: '308 — навсегда', value: '308' }, { label: '307 — временно', value: '307' }], admin: { position: 'sidebar' } },
    { name: 'active', type: 'checkbox', label: 'Включён', defaultValue: true, admin: { position: 'sidebar' } },
  ],
}
