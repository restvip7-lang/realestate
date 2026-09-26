'use client'

import { useRouter } from '@/i18n/navigation'

// Выпадающий список, который меняет адрес страницы (сортировка на серверных страницах)
export function NavSelect({ label, value, options, className }: { label: string; value: string; options: { value: string; label: string; href: string }[]; className?: string }) {
  const router = useRouter()
  return (
    <label className={className}>
      {label}{' '}
      <select value={value} onChange={(e) => router.push(options.find((o) => o.value === e.target.value)!.href, { scroll: false })}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  )
}
