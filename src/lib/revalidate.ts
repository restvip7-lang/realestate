import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

// Правка в админке → сайт сразу показывает новые данные (сбрасываем кэш всех страниц всех языков).
// Вне Next.js (npm run seed) revalidatePath недоступен — тогда просто пропускаем.
async function revalidateSite() {
  try {
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/[locale]', 'layout')
  } catch {}
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
