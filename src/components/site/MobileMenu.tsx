'use client'

import { useEffect, useRef, useState } from 'react'

// Кнопка-бургер и выезжающее меню: фокус остаётся внутри, Esc закрывает, прокрутка страницы блокируется
export function MobileMenu({ openLabel, closeLabel, dialogLabel, children }: {
  openLabel: string
  closeLabel: string
  dialogLabel: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const opener = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    panel.current?.querySelector<HTMLElement>('a, button')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'Tab' && panel.current) {
        const f = [...panel.current.querySelectorAll<HTMLElement>('a, button, select')]
        const first = f[0], last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function close() {
    setOpen(false)
    opener.current?.focus()
  }

  return (
    <>
      <button ref={opener} className="icon-btn burger" type="button" aria-label={openLabel} aria-expanded={open} aria-controls="mmenu" onClick={() => setOpen(true)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
      <div className={`mmenu${open ? ' open' : ''}`} id="mmenu" role="dialog" aria-modal="true" aria-label={dialogLabel}>
        <div className="scrim" onClick={close} />
        <div
          className="panel"
          ref={panel}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('nav a, [data-close]')) close()
          }}
        >
          <div className="top">
            <span className="logo" style={{ color: 'var(--ink)' }}><span className="wm"><b>KLEO</b><small style={{ opacity: 1 }}>HOMES</small></span></span>
            <button className="icon-btn" type="button" data-close aria-label={closeLabel}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    </>
  )
}
