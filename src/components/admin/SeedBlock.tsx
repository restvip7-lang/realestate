import type { ServerProps } from 'payload'

import { SeedButton } from './SeedButton'

// Серверная обёртка: блок «Демо-данные» видит только администратор.
// Каталог заморожен (решение владельца для демо): кнопки загрузки объектов и контента из CRM убраны,
// ночные задачи тоже (vercel.json). Код синхронизации оставлен: StayButton, ContentButton, src/lib/stay-sync.ts.
export function SeedBlock({ user }: ServerProps) {
  if ((user as { role?: string } | undefined)?.role !== 'admin') return null
  return <SeedButton />
}
