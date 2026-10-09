import type { ServerProps } from 'payload'

import { stayConfigured } from '@/lib/stay'
import { syncLimit } from '@/lib/stay-sync'

import { SeedButton } from './SeedButton'
import { StayButton } from './StayButton'

// Серверная обёртка: блоки «Объекты из Stay» и «Демо-данные» видит только администратор
export function SeedBlock({ user }: ServerProps) {
  if ((user as { role?: string } | undefined)?.role !== 'admin') return null
  return (
    <>
      <StayButton configured={stayConfigured()} limit={syncLimit()} />
      <SeedButton />
    </>
  )
}
