import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

// Правка в админке → сайт сразу показывает новые данные: сбрасываем кэш всех страниц всех языков.
// Путь указывается вместе с группой маршрутов (frontend), иначе Next.js его не найдёт.
// Вне Next.js (npm run seed) revalidatePath недоступен — тогда пропускаем (один раз пишем в лог).
let warned = false
async function revalidateSite() {
  try {
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/(frontend)/[locale]', 'layout')
  } catch (err) {
    if (!warned) console.warn('Кэш сайта не сброшен (запуск вне Next.js?):', err instanceof Error ? err.message : err)
    warned = true
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = async ({ doc }) => {
  await revalidateSite()
  return doc
}
export const revalidateAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  await revalidateSite()
  return doc
}
export const revalidateGlobal: GlobalAfterChangeHook = async ({ doc }) => {
  await revalidateSite()
  return doc
}
