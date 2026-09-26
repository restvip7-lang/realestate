'use client'

import { useState } from 'react'

// Вкладки «Продажа / Аренда» на странице района: обе сетки уже отрисованы сервером, переключаем видимость
export function DealTabs({ head, label, tabs, children }: { head: React.ReactNode; label: string; tabs: [string, string]; children: [React.ReactNode, React.ReactNode] }) {
  const [i, setI] = useState(0)
  return (
    <>
      <div className="sec-head">
        {head}
        <div className="dtabs" role="tablist" aria-label={label}>
          {tabs.map((t, k) => (
            <button key={t} type="button" role="tab" aria-selected={i === k} onClick={() => setI(k)}>{t}</button>
          ))}
        </div>
      </div>
      {children.map((c, k) => <div key={k} role="tabpanel" hidden={i !== k}>{c}</div>)}
    </>
  )
}
