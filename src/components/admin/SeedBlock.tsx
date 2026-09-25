import type { ServerProps } from 'payload'

import { SeedButton } from './SeedButton'

// Серверная обёртка: показывает блок демо-данных только администратору
export function SeedBlock({ user }: ServerProps) {
  if ((user as { role?: string } | undefined)?.role !== 'admin') return null
  return <SeedButton />
}
