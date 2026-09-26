'use client'

import { useState } from 'react'

/** «Поделиться»: системное меню телефона, на компьютере — копирование ссылки */
export function ShareButton({ label, done, title }: { label: string; done: string; title: string }) {
  const [ok, setOk] = useState(false)
  const share = async () => {
    const url = location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {}
      return
    }
    await navigator.clipboard?.writeText(url)
    setOk(true)
    setTimeout(() => setOk(false), 2000)
  }
  return <button type="button" className="btn btn-line btn-sm" onClick={share}>{ok ? done : label}</button>
}
