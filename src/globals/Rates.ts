import type { GlobalConfig } from 'payload'

import { anyone, editorsOnly } from '@/access'
import { revalidateGlobal } from '@/lib/revalidate'

// Сколько единиц валюты за 1 €. По ним переключатель валют на сайте пересчитывает цены,
// а цена объекта в долларах или лирах переводится в евро для фильтров.
const rate = (name: string, label: string) => ({ name, type: 'number' as const, label, required: true, min: 0 })

export const Rates: GlobalConfig = {
  slug: 'rates',
  label: 'Курсы валют',
  admin: { group: 'Настройки', description: 'Сколько единиц валюты стоит 1 €.' },
  access: { read: anyone, update: editorsOnly },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'row',
      fields: [rate('USD', '$ USD'), rate('TRY', '₺ TRY'), rate('RUB', '₽ RUB')],
    },
    {
      type: 'row',
      fields: [rate('KZT', '₸ KZT'), rate('GBP', '£ GBP')],
    },
    { name: 'checkedAt', type: 'date', label: 'Курсы обновлены' },
  ],
}
