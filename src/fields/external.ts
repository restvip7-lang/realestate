import type { Field } from 'payload'

/**
 * Служебная группа «Stay Property»: запись приходит из сервиса контента admin.stayproperty.com
 * (новости, отзывы, услуги — docs/content-import.md). Видна в боковой колонке только у загруженных записей.
 */
export const externalField = (description: string): Field => ({
  name: 'external',
  type: 'group',
  label: 'Stay Property',
  admin: { position: 'sidebar', condition: (data) => !!data?.external?.sourceId, description },
  fields: [
    { name: 'sourceId', type: 'text', label: 'ID в Stay Property', unique: true, index: true, admin: { readOnly: true } },
    { name: 'modified', type: 'text', label: 'Изменён в Stay Property', admin: { readOnly: true } },
    { name: 'syncedAt', type: 'date', label: 'Синхронизирован', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
  ],
})

/** Ссылка на картинку в Stay Property (к нам не копируется). Если загрузить свою обложку, на сайте будет она. */
export const remoteCoverField: Field = {
  name: 'remoteCover',
  type: 'text',
  label: 'Обложка из Stay Property',
  admin: {
    readOnly: true,
    condition: (data) => !!data?.remoteCover,
    description: 'Обновляется при синхронизации. Если загрузить обложку выше, на сайте будет она.',
  },
}
