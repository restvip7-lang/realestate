import type { CollectionConfig } from 'payload'

import { adminOnly, ownByAgent } from '@/access'
import { leadEmail } from '@/lib/lead-email'

// Заявки с сайта. Создаются только сервером (форма → server action), поэтому create закрыт для API.
// Каждая новая заявка уходит письмом на LEADS_EMAIL_TO (позже — ещё и в Telegram).
export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Заявка', plural: 'Заявки' },
  admin: {
    useAsTitle: 'name',
    group: 'Продажи',
    defaultColumns: ['createdAt', 'name', 'phone', 'form', 'property', 'status', 'agent'],
    description: 'Статусы нужны для отчёта по рекламе: какие заявки дошли до просмотра и сделки.',
  },
  defaultSort: '-createdAt',
  access: {
    read: ownByAgent('agent'),
    update: ownByAgent('agent'),
    create: () => false,
    delete: adminOnly,
  },
  hooks: {
    beforeChange: [
      // объект → его агент получает заявку (если агент не выбран — эксперт по тому же правилу, что на сайте)
      async ({ data, operation, req }) => {
        if (operation === 'create' && data.property && !data.agent) {
          const p = await req.payload
            .findByID({ collection: 'properties', id: data.property, depth: 0, req, overrideAccess: true })
            .catch(() => null)
          if (p?.agent) data.agent = typeof p.agent === 'object' ? p.agent.id : p.agent
          else if (p) {
            const { docs } = await req.payload.find({
              collection: 'team',
              where: { and: [{ kind: { equals: 'expert' } }, { hidden: { not_equals: true } }] },
              sort: 'order',
              limit: 100,
              depth: 0,
              req,
            })
            if (docs.length) data.agent = docs[p.id % docs.length].id
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        const to = process.env.LEADS_EMAIL_TO
        if (operation !== 'create' || !to) return
        try {
          await req.payload.sendEmail({ to, ...(await leadEmail(doc, req.payload)) })
        } catch (err) {
          req.payload.logger.error({ err, msg: 'Не удалось отправить письмо о заявке' })
        }
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', label: 'Имя' },
        { name: 'phone', type: 'text', label: 'Телефон / WhatsApp' },
        { name: 'email', type: 'email', label: 'E-mail' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'contactVia',
          type: 'select',
          label: 'Как связаться',
          options: [
            { label: 'WhatsApp', value: 'whatsapp' },
            { label: 'Telegram', value: 'telegram' },
            { label: 'Звонок', value: 'phone' },
            { label: 'E-mail', value: 'email' },
          ],
        },
        {
          name: 'form',
          type: 'select',
          label: 'Форма',
          options: [
            { label: 'Подбор', value: 'pick' },
            { label: 'Просмотр объекта', value: 'viewing' },
            { label: 'Вопрос по объекту', value: 'question' },
            { label: 'Нашли дешевле', value: 'cheaper' },
            { label: 'Смета расходов', value: 'costs' },
            { label: 'Консультация', value: 'consult' },
            { label: 'Продать / сдать', value: 'sell' },
          ],
        },
        { name: 'locale', type: 'text', label: 'Язык сайта' },
      ],
    },
    { name: 'message', type: 'textarea', label: 'Сообщение' },
    { name: 'property', type: 'relationship', relationTo: 'properties', label: 'Объект' },
    { name: 'page', type: 'text', label: 'Страница' },
    {
      name: 'utm',
      type: 'group',
      label: 'Реклама (UTM)',
      admin: { description: 'Откуда пришёл посетитель: заполняется автоматически.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'source', type: 'text', label: 'source' },
            { name: 'medium', type: 'text', label: 'medium' },
            { name: 'campaign', type: 'text', label: 'campaign' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'term', type: 'text', label: 'term' },
            { name: 'content', type: 'text', label: 'content' },
            { name: 'gclid', type: 'text', label: 'gclid / yclid' },
          ],
        },
      ],
    },
    { name: 'consent', type: 'checkbox', label: 'Согласие на обработку данных', admin: { readOnly: true } },
    // боковая колонка
    {
      name: 'status',
      type: 'select',
      label: 'Статус',
      defaultValue: 'new',
      index: true,
      options: [
        { label: 'Новая', value: 'new' },
        { label: 'В работе', value: 'work' },
        { label: 'Просмотр назначен', value: 'viewing' },
        { label: 'Сделка', value: 'deal' },
        { label: 'Отказ', value: 'lost' },
        { label: 'Спам', value: 'spam' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'agent', type: 'relationship', relationTo: 'team', label: 'Ответственный', admin: { position: 'sidebar' } },
    { name: 'notes', type: 'textarea', label: 'Заметки менеджера', admin: { position: 'sidebar' } },
  ],
}
