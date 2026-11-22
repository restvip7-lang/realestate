import type { CollectionConfig } from 'payload'

import { anyone, editorsOnly } from '@/access'
import { revalidateAfterChange, revalidateAfterDelete } from '@/lib/revalidate'

// SEO разделов каталога (ТЗ, «админка»): свои title, description, H1 и SEO-текст для любой ЧПУ-страницы
// каталога, например /turkey/alanya/mahmutlar/sale/apartments. Пусто — работает шаблон сайта.
export const SeoPages: CollectionConfig = {
  slug: 'seo-pages',
  labels: { singular: 'SEO раздела', plural: 'SEO разделов' },
  admin: {
    useAsTitle: 'path',
    group: 'SEO',
    defaultColumns: ['path', 'title', 'noindex', 'updatedAt'],
    description: 'Заголовки и тексты страниц каталога. Адрес — без языка, как в строке браузера после /ru: /turkey/alanya/mahmutlar/sale/apartments. Отчёт о закрытых от индексации страницах — /next/seo-report.',
  },
  access: { read: anyone, create: editorsOnly, update: editorsOnly, delete: editorsOnly },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
    beforeValidate: [
      // адрес без языка, без параметров и без / на конце
      ({ data }) => {
        if (data?.path) data.path = '/' + String(data.path).trim().replace(/^https?:\/\/[^/]+/, '').replace(/^\/(ru|en|tr)(?=\/|$)/, '').replace(/[?#].*$/, '').replace(/^\/+|\/+$/g, '')
        return data
      },
    ],
  },
  fields: [
    { name: 'path', type: 'text', label: 'Адрес страницы', required: true, unique: true, index: true },
    { name: 'title', type: 'text', label: 'Title', localized: true, maxLength: 70, admin: { description: 'Пусто — шаблон: «Квартиры в Махмутларе | Kleo Homes».' } },
    { name: 'description', type: 'textarea', label: 'Description', localized: true, maxLength: 170 },
    { name: 'h1', type: 'text', label: 'Заголовок H1', localized: true, maxLength: 120 },
    { name: 'text', type: 'textarea', label: 'SEO-текст', localized: true, admin: { description: 'По ТЗ — 1500–3000 знаков. Абзацы разделяйте пустой строкой. Показывается внизу страницы вместо общего текста.' } },
    { name: 'noindex', type: 'checkbox', label: 'Закрыть от индексации', admin: { position: 'sidebar', description: 'Даже если объектов больше порога.' } },
  ],
}
