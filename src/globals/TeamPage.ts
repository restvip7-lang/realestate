import type { GlobalConfig } from 'payload'

import { anyone, editorsOnly } from '@/access'
import { revalidateGlobal } from '@/lib/revalidate'

export const TeamPage: GlobalConfig = {
  slug: 'team-page',
  label: 'Страница «Команда»',
  admin: { group: 'Компания' },
  access: { read: anyone, update: editorsOnly },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    { name: 'title', type: 'text', label: 'Заголовок', required: true, localized: true },
    { name: 'lead', type: 'textarea', label: 'Подзаголовок', localized: true },
    {
      name: 'quote',
      type: 'textarea',
      label: 'Цитата основателя',
      localized: true,
      admin: { description: 'Без кавычек. Пусто — цитата не показывается.' },
    },
    {
      name: 'stats',
      type: 'array',
      label: 'Цифры под заголовком',
      maxRows: 4,
      admin: { description: 'Пустое значение — посчитать автоматически (число сотрудников на сайте).' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'value', type: 'text', label: 'Цифра' },
            { name: 'label', type: 'text', label: 'Подпись', localized: true, required: true },
          ],
        },
      ],
    },
  ],
}
