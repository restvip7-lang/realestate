import type { CollectionConfig } from 'payload'

import { adminField, adminOnly, isAdmin } from '@/access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Пользователь', plural: 'Пользователи' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role'],
    group: 'Настройки',
  },
  auth: {
    maxLoginAttempts: 5, // после 5 ошибок вход блокируется
    lockTime: 15 * 60 * 1000,
    tokenExpiration: 12 * 60 * 60,
  },
  access: {
    // свою учётную запись видит каждый, чужие — только админ
    read: ({ req }) => (isAdmin({ req }) ? true : req.user ? { id: { equals: req.user.id } } : false),
    create: adminOnly,
    delete: adminOnly,
    update: ({ req }) => (isAdmin({ req }) ? true : req.user ? { id: { equals: req.user.id } } : false),
  },
  hooks: {
    // первый пользователь, созданный на /admin/create-first-user, становится администратором
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', req })
          if (totalDocs === 0) data.role = 'admin'
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', label: 'Имя' },
    {
      name: 'role',
      type: 'select',
      label: 'Роль',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      access: { update: adminField },
      options: [
        { label: 'Администратор — всё', value: 'admin' },
        { label: 'Редактор — объекты, публикации, команда', value: 'editor' },
        { label: 'Агент — только свои объекты и заявки', value: 'agent' },
      ],
    },
    {
      name: 'member',
      type: 'relationship',
      relationTo: 'team',
      label: 'Карточка в «Команде»',
      saveToJWT: true,
      access: { update: adminField },
      admin: { description: 'Для роли «Агент»: какие объекты и заявки ему доступны.' },
    },
  ],
}
