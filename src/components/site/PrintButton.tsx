'use client'

/** «Скачать PDF»: печать страницы (в диалоге печати — «Сохранить как PDF») */
export function PrintButton({ label, className = 'btn btn-line btn-sm' }: { label: string; className?: string }) {
  return <button type="button" className={className} onClick={() => window.print()}>{label}</button>
}
