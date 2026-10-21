'use client'

import { useRowLabel } from '@payloadcms/ui'

// Заголовок свёрнутого раздела гида района в админке — название раздела вместо «Раздел 01».
export function GuideRowLabel() {
  const { data, rowNumber } = useRowLabel<{ title?: string }>()
  return <span>{data?.title || `Раздел ${(rowNumber ?? 0) + 1}`}</span>
}
