import { notFound } from 'next/navigation'

// Любой неизвестный адрес внутри языка → страница 404 с шапкой и подвалом сайта
export default function CatchAll() {
  notFound()
}
