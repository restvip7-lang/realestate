'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'

type Photo = { src: string; full: string; alt: string }

// Сетка из 5 фото + просмотр всех фото (стрелки, Esc, свайп на телефоне)
export function Gallery({ photos }: { photos: Photo[] }) {
  const t = useTranslations('property')
  const [open, setOpen] = useState<number | null>(null)
  const opener = useRef<HTMLButtonElement | null>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const touch = useRef<number | null>(null)
  const n = photos.length
  const show = (i: number) => setOpen(((i % n) + n) % n)
  const close = useCallback(() => {
    setOpen(null)
    opener.current?.focus()
  }, [])
  const isOpen = open !== null

  useEffect(() => {
    if (!isOpen) return
    closeBtn.current?.focus()
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? i : (i - 1 + n) % n))
      if (e.key === 'ArrowRight') setOpen((i) => (i === null ? i : (i + 1) % n))
      if (e.key === 'Tab') e.preventDefault() // фокус остаётся в просмотре
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [isOpen, n, close])

  if (!n) return null
  return (
    <>
      <div className="gal">
        {photos.slice(0, 5).map((p, i) => (
          <button key={p.src} type="button" aria-label={t('openPhoto', { n: i + 1 })} onClick={(e) => { opener.current = e.currentTarget; show(i) }}>
            <Image src={p.src} alt={p.alt} fill sizes={i ? '(max-width: 760px) 1px, 25vw' : '(max-width: 760px) 100vw, 50vw'} priority={i === 0} />
            {i === 0 && <span className="all">{t('allPhotos', { n })}</span>}
          </button>
        ))}
      </div>
      <div
        className={`lb${open !== null ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={t('photos')}
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current === null || open === null) return
          const dx = e.changedTouches[0].clientX - touch.current
          if (Math.abs(dx) > 40) show(open + (dx < 0 ? 1 : -1))
          touch.current = null
        }}
      >
        {open !== null && (
          // eslint-disable-next-line @next/next/no-img-element -- полноэкранный просмотр: браузер сам выбирает размер
          <img src={photos[open].full} alt={photos[open].alt} />
        )}
        <button ref={closeBtn} className="x" type="button" aria-label={t('close')} onClick={close}>✕</button>
        <button className="pv" type="button" aria-label={t('prev')} onClick={() => open !== null && show(open - 1)}>‹</button>
        <button className="nx" type="button" aria-label={t('next')} onClick={() => open !== null && show(open + 1)}>›</button>
        <span className="cnt">{open !== null ? `${open + 1} / ${n}` : ''}</span>
      </div>
    </>
  )
}
