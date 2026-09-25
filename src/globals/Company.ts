import type { GlobalConfig } from 'payload'

import { adminOnly, anyone } from '@/access'
import { revalidateGlobal } from '@/lib/revalidate'

// Контакты и реквизиты агентства: шапка, подвал, «Контакты», политика, JSON-LD
export const Company: GlobalConfig = {
  slug: 'company',
  label: 'Контакты и реквизиты',
  admin: { group: 'Настройки' },
  access: { read: anyone, update: adminOnly },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', label: 'Телефон (как показывать)', required: true },
        { name: 'whatsapp', type: 'text', label: 'WhatsApp (только цифры)', required: true },
        { name: 'telegram', type: 'text', label: 'Telegram (без @)' },
        { name: 'email', type: 'email', label: 'E-mail', required: true },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'address', type: 'text', label: 'Адрес офиса', required: true },
        { name: 'showroom', type: 'text', label: 'Адрес шоурума' },
      ],
    },
    { name: 'hours', type: 'text', label: 'Часы работы', localized: true },
    {
      type: 'row',
      fields: [
        { name: 'lat', type: 'number', label: 'Офис: широта' },
        { name: 'lng', type: 'number', label: 'Офис: долгота' },
      ],
    },
    {
      name: 'legal',
      type: 'group',
      label: 'Реквизиты',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', label: 'Юр. название' },
            { name: 'license', type: 'text', label: 'Лицензия риелтора (TTYB)' },
            { name: 'verbis', type: 'text', label: 'VERBİS' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'taxOffice', type: 'text', label: 'Налоговая' },
            { name: 'taxNo', type: 'text', label: 'Налоговый номер' },
          ],
        },
      ],
    },
    {
      name: 'social',
      type: 'array',
      label: 'Соцсети',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'network', type: 'select', label: 'Сеть', options: ['instagram', 'youtube', 'facebook', 'vk', 'tiktok', 'telegram'].map((v) => ({ label: v, value: v })) },
            { name: 'url', type: 'text', label: 'Ссылка', required: true },
          ],
        },
      ],
    },
    {
      name: 'isDemo',
      type: 'checkbox',
      label: 'Данные демо (показывать плашку «демо» на сайте)',
      defaultValue: true,
    },
  ],
}
