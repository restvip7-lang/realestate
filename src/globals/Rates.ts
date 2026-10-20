import type { GlobalAfterChangeHook, GlobalConfig } from 'payload'

import { anyone, editorsOnly } from '@/access'
import { recalcPrices } from '@/lib/rates-sync'
import { revalidateGlobal } from '@/lib/revalidate'

// Сколько единиц валюты за 1 €. По ним переключатель валют на сайте пересчитывает цены,
// а цена объекта в долларах или лирах переводится в евро для фильтров.
const rate = (name: string, label: string) => ({ name, type: 'number' as const, label, required: true, min: 0 })

// Изменились курсы USD/GBP/TRY (ночью, кнопкой или вручную) → пересчитать цену в евро у объектов в этих валютах
const recalc: GlobalAfterChangeHook = async ({ doc, previousDoc, req }) => {
  const changed = (['USD', 'GBP', 'TRY'] as const).some((c) => doc[c] !== previousDoc?.[c])
  if (!changed) return doc
  try {
    await recalcPrices(req.payload, doc)
  } catch (err) {
    req.payload.logger.error({ err, msg: 'Курсы: цены объектов не пересчитаны' })
  }
  return doc
}

export const Rates: GlobalConfig = {
  slug: 'rates',
  label: 'Курсы валют',
  admin: {
    group: 'Настройки',
    description: 'Сколько единиц валюты стоит 1 €. Обновляются автоматически каждую ночь (open.er-api.com). Ручная правка действует до следующего обновления. Цены объектов в $, £ и ₺ пересчитываются в евро при каждом изменении курсов.',
  },
  access: { read: anyone, update: editorsOnly },
  hooks: { afterChange: [recalc, revalidateGlobal] },
  fields: [
    {
      type: 'row',
      fields: [rate('USD', '$ USD'), rate('TRY', '₺ TRY'), rate('RUB', '₽ RUB')],
    },
    {
      type: 'row',
      fields: [rate('KZT', '₸ KZT'), rate('GBP', '£ GBP')],
    },
    { name: 'checkedAt', type: 'date', label: 'Курсы обновлены', admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'refresh', type: 'ui', admin: { components: { Field: '@/components/admin/RatesButton#RatesButton' } } },
  ],
}
