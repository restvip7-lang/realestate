import type { ServerProps } from 'payload'

import { SeedButton } from './SeedButton'

// Серверная обёртка: блок «Демо-данные» видит только администратор.
// Каталог заморожен (решение владельца для демо): кнопки загрузки объектов и контента из CRM убраны,
// ночные задачи тоже (vercel.json). Код синхронизации оставлен: StayButton, ContentButton, src/lib/stay-sync.ts.
// Ссылка на SEO-отчёт (закрытые от индексации страницы каталога) — редактору и администратору.
export function SeedBlock({ user }: ServerProps) {
  const role = (user as { role?: string } | undefined)?.role
  if (role !== 'admin' && role !== 'editor') return null
  return (
    <>
      <p>
        <a href="/next/seo-report" target="_blank" rel="noreferrer">SEO-отчёт: какие страницы каталога закрыты от индексации и где нет своего текста</a>
      </p>
      {role === 'admin' && <SeedButton />}
    </>
  )
}
