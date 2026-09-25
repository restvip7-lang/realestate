import type { CollectionConfig, Condition } from 'payload'

import { adminOnly, isStaff, ownByAgent, staffOnly } from '@/access'
import { slugField } from '@/fields/slug'
import { FEATURES, PROPERTY_STATUS, PROPERTY_TYPES, PUBLIC_STATUSES, ROOMS } from '@/lib/catalog'
import { revalidateAfterChange, revalidateAfterDelete } from '@/lib/revalidate'

const isSale: Condition = (data) => data?.deal !== 'rent'
const isRent: Condition = (data) => data?.deal === 'rent'
const opts = (o: Record<string, string>) => Object.entries(o).map(([value, label]) => ({ value, label }))

export const Properties: CollectionConfig = {
  slug: 'properties',
  labels: { singular: 'Объект', plural: 'Объекты' },
  admin: {
    useAsTitle: 'title',
    group: 'Каталог',
    defaultColumns: ['id', 'title', 'district', 'price', 'status', 'agent', 'updatedAt'],
    listSearchableFields: ['id', 'title', 'complex'],
    pagination: { defaultLimit: 25 },
    preview: (doc, { locale }) => `/${locale || 'ru'}/property/${doc.id}-${doc.slug || ''}`,
  },
  defaultSort: '-id',
  access: {
    read: ({ req }) => (isStaff({ req }) ? true : { status: { in: [...PUBLIC_STATUSES] } }),
    create: staffOnly,
    update: ownByAgent('agent'),
    delete: adminOnly,
  },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
    beforeChange: [
      // продажа: цена в валюте продавца → евро по курсам из «Настройки → Курсы валют»; аренда — цена в месяц, в евро
      async ({ data, req }) => {
        if (data.deal !== 'rent' && data.priceOriginal != null) {
          let rate = 1
          if (data.currency && data.currency !== 'EUR') {
            const rates = (await req.payload.findGlobal({ slug: 'rates', req })) as unknown as Record<string, number>
            rate = rates?.[data.currency] || 1
          }
          data.price = Math.round(data.priceOriginal / rate)
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', label: 'Заголовок', required: true, localized: true, maxLength: 120 },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Основное',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'deal',
                  type: 'radio',
                  label: 'Сделка',
                  required: true,
                  defaultValue: 'sale',
                  options: [
                    { label: 'Продажа', value: 'sale' },
                    { label: 'Аренда', value: 'rent' },
                  ],
                  admin: { layout: 'horizontal' },
                },
                { name: 'type', type: 'select', label: 'Тип', required: true, options: Object.entries(PROPERTY_TYPES).map(([value, t]) => ({ value, label: t.ru })) },
                { name: 'district', type: 'relationship', relationTo: 'districts', label: 'Район', required: true },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'complex', type: 'text', label: 'Комплекс' },
                { name: 'rooms', type: 'select', label: 'Планировка', options: ROOMS.map((r) => ({ label: r, value: r })) },
                { name: 'area', type: 'number', label: 'Площадь, м²', min: 1 },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'floor', type: 'number', label: 'Этаж' },
                { name: 'floors', type: 'number', label: 'Этажей в доме' },
                { name: 'year', type: 'number', label: 'Год постройки' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'sea', type: 'number', label: 'До моря, м', min: 0 },
                { name: 'airport', type: 'number', label: 'До аэропорта, км', min: 0 },
                {
                  name: 'view',
                  type: 'select',
                  label: 'Вид',
                  defaultValue: 'city',
                  options: opts({ city: 'Город / двор', sea: 'Море', mountain: 'Горы', castle: 'Крепость' }),
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'furnished', type: 'select', label: 'Мебель', defaultValue: 'no', options: opts({ no: 'Без мебели', yes: 'С мебелью', partial: 'Частично' }) },
                { name: 'condition', type: 'select', label: 'Состояние', defaultValue: 'resale', options: opts({ resale: 'Вторичка', new: 'Новостройка', construction: 'На этапе строительства' }) },
                { name: 'source', type: 'select', label: 'Источник', defaultValue: 'developer', options: opts({ developer: 'От застройщика', owner: 'От собственника', agency: 'Эксклюзив агентства' }) },
              ],
            },
          ],
        },
        {
          label: 'Цена',
          fields: [
            {
              type: 'row',
              admin: { condition: isSale },
              fields: [
                { name: 'priceOriginal', type: 'number', label: 'Цена', min: 0, admin: { description: 'В валюте продавца. На сайте — в евро по курсу из настроек.' } },
                { name: 'currency', type: 'select', label: 'Валюта', defaultValue: 'EUR', options: ['EUR', 'USD', 'GBP', 'TRY'].map((c) => ({ label: c, value: c })) },
                { name: 'priceCheckedAt', type: 'date', label: 'Цена проверена', admin: { description: 'Показывается на карточке: «цена проверена 24.09.2026».' } },
              ],
            },
            {
              // для продажи считается из priceOriginal, по нему работают фильтры и сортировка
              name: 'price',
              type: 'number',
              label: 'Цена в месяц, €',
              index: true,
              min: 0,
              admin: { condition: isRent },
            },
            {
              name: 'installment',
              type: 'group',
              label: 'Рассрочка',
              admin: { condition: isSale },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'months', type: 'number', label: 'Срок, месяцев' },
                    { name: 'down', type: 'number', label: 'Первый взнос, %' },
                  ],
                },
              ],
            },
            {
              type: 'row',
              admin: { condition: isSale },
              fields: [
                { name: 'bargain', type: 'checkbox', label: 'Торг' },
                { name: 'citizenship', type: 'checkbox', label: 'Под гражданство' },
                { name: 'residence', type: 'checkbox', label: 'Под ВНЖ' },
                { name: 'rentalIncome', type: 'checkbox', label: 'Гарантированный доход от аренды' },
              ],
            },
            {
              name: 'rent',
              type: 'group',
              label: 'Условия аренды',
              admin: { condition: isRent },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'period', type: 'select', label: 'Вид аренды', defaultValue: 'long', options: opts({ long: 'Долгосрочная', short: 'Посуточная', season: 'Сезонная' }) },
                    { name: 'pricePerDay', type: 'number', label: 'Цена за сутки, €' },
                    { name: 'deposit', type: 'number', label: 'Депозит, €' },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'minTerm', type: 'number', label: 'Минимальный срок, мес.' },
                    { name: 'advance', type: 'number', label: 'Предоплата, мес.' },
                    { name: 'availableFrom', type: 'date', label: 'Свободна с' },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'utilities', type: 'checkbox', label: 'Коммунальные включены' },
                    { name: 'pets', type: 'checkbox', label: 'Можно с животными' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Фото и видео',
          fields: [
            {
              name: 'photos',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              label: 'Фото',
              admin: { description: 'Первое фото — обложка. Порядок меняется перетаскиванием.' },
            },
            {
              type: 'row',
              fields: [
                { name: 'video', type: 'text', label: 'Видео (ссылка YouTube)' },
                { name: 'tour', type: 'text', label: '3D-тур (ссылка)' },
              ],
            },
          ],
        },
        {
          label: 'Описание',
          fields: [
            {
              name: 'description',
              type: 'textarea',
              label: 'Описание',
              localized: true,
              admin: { rows: 10, description: 'Абзацы разделяйте пустой строкой. Переключите язык вверху, чтобы добавить EN и TR.' },
            },
            {
              name: 'features',
              type: 'select',
              hasMany: true,
              label: 'Инфраструктура комплекса',
              options: FEATURES.map((f) => ({ label: f, value: f })),
            },
          ],
        },
        {
          label: 'Локация',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'lat', type: 'number', label: 'Широта' },
                { name: 'lng', type: 'number', label: 'Долгота' },
              ],
            },
            {
              name: 'address',
              type: 'text',
              label: 'Точный адрес',
              access: { read: ({ req }) => isStaff({ req }) },
              admin: { description: 'Только для сотрудников, на сайте не показывается.' },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'seo',
              type: 'group',
              label: false,
              fields: [
                { name: 'title', type: 'text', label: 'Title', localized: true, maxLength: 70, admin: { description: 'Пусто — «Заголовок · Район · цена».' } },
                { name: 'description', type: 'textarea', label: 'Description', localized: true, maxLength: 170 },
              ],
            },
          ],
        },
      ],
    },
    // боковая колонка
    {
      name: 'status',
      type: 'select',
      label: 'Статус',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: opts(PROPERTY_STATUS),
      admin: { position: 'sidebar' },
    },
    {
      name: 'agent',
      type: 'relationship',
      relationTo: 'team',
      label: 'Ведёт объект',
      admin: { position: 'sidebar', description: 'Пусто — распределяется между экспертами автоматически.' },
    },
    {
      name: 'labels',
      type: 'select',
      hasMany: true,
      label: 'Метки',
      options: opts({ week: 'Предложение недели', hot: 'Горячее', rec: 'Рекомендуем', excl: 'Эксклюзив' }),
      admin: { position: 'sidebar' },
    },
    slugField('title', { unique: false }),
    {
      name: 'notes',
      type: 'textarea',
      label: 'Заметки для команды',
      access: { read: ({ req }) => isStaff({ req }) },
      admin: { position: 'sidebar', description: 'Контакты собственника, ключи, комиссия. На сайте не видно.' },
    },
  ],
}
