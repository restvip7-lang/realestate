import type { CollectionConfig } from 'payload'

import { anyone, editorsOnly, staffOnly } from '@/access'
import { revalidateAfterChange, revalidateAfterDelete } from '@/lib/revalidate'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Файл', plural: 'Фото и файлы' },
  admin: { group: 'Контент', defaultColumns: ['filename', 'alt', 'updatedAt'] },
  access: { read: anyone, create: staffOnly, update: staffOnly, delete: editorsOnly },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Описание фото (alt)',
      localized: true,
      admin: { description: 'Что на фото, для поисковиков и незрячих: «Гостиная с видом на море».' },
    },
    { name: 'credit', type: 'text', label: 'Источник / автор фото' },
  ],
  upload: {
    mimeTypes: ['image/*', 'application/pdf'],
    focalPoint: true,
    // фото с телефона бывают по 8–12 МБ: храним уменьшенный оригинал и готовые размеры в WebP
    resizeOptions: { width: 2400, withoutEnlargement: true },
    formatOptions: { format: 'webp', options: { quality: 80 } },
    imageSizes: [
      { name: 'thumb', width: 480, formatOptions: { format: 'webp', options: { quality: 72 } } },
      { name: 'card', width: 960, formatOptions: { format: 'webp', options: { quality: 75 } } },
      { name: 'large', width: 1600, formatOptions: { format: 'webp', options: { quality: 78 } } },
    ],
    adminThumbnail: 'thumb',
  },
}
