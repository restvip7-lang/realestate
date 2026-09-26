'use client'

import { useState } from 'react'

export function CopyLink({ label, done }: { label: string; done: string }) {
  const [ok, setOk] = useState(false)
  return (
    <button type="button" className="btn btn-line btn-sm" onClick={() => { navigator.clipboard?.writeText(location.href); setOk(true); setTimeout(() => setOk(false), 2000) }}>
      {ok ? done : label}
    </button>
  )
}
