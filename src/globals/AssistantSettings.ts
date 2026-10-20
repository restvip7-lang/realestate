import type { GlobalConfig } from 'payload'
import { adminOnly } from '@/access'
import { revalidateGlobal } from '@/lib/revalidate'

export const AssistantSettings: GlobalConfig = {
  slug: 'assistant-settings',
  label: 'ИИ-консультант',
  admin: { group: 'Настройки' },
  access: { read: adminOnly, update: adminOnly },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    { name: 'enabled', type: 'checkbox', label: 'Включить помощника', defaultValue: false },
    { name: 'provider', type: 'select', label: 'Активный провайдер', defaultValue: 'openai', required: true, options: [{ label: 'OpenAI (GPT)', value: 'openai' }, { label: 'Anthropic (Claude)', value: 'anthropic' }] },
    { name: 'openaiModel', type: 'text', label: 'Модель OpenAI', defaultValue: 'gpt-6-astra', required: true, maxLength: 80, admin: { description: 'API ID модели с Responses API и Structured Outputs. Для GPT-6 Astra используется reasoning low.' } },
    { name: 'anthropicModel', type: 'text', label: 'Модель Claude', defaultValue: 'claude-sonnet-5-5', required: true, maxLength: 80, admin: { description: 'API ID модели с поддержкой Structured Outputs.' } },
    { name: 'dailyRequests', type: 'number', label: 'Максимум запросов к ИИ в сутки (UTC)', defaultValue: 100, min: 1, max: 10000, required: true, admin: { description: 'Общий лимит для сайта, включая неудачные обращения. Это лимит запросов, не точный бюджет в деньгах.' } },
    { name: 'connection', type: 'ui', admin: { components: { Field: '@/components/admin/AssistantKey#AssistantKey' } } },
    { name: 'openaiKey', type: 'textarea', admin: { hidden: true }, access: { read: () => false, update: () => false } },
    { name: 'anthropicKey', type: 'textarea', admin: { hidden: true }, access: { read: () => false, update: () => false } },
  ],
}
