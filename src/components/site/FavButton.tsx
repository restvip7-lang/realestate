'use client'

import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

import { toggleFav, useFavs } from './favs'

const HEART = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z" /></svg>
)

/** ♡ на карточке объекта (variant="card") или кнопка «В избранное» на странице объекта */
export function FavButton({ id, variant = 'card' }: { id: number; variant?: 'card' | 'page' }) {
  const t = useTranslations('favs')
  const on = useFavs().includes(id)
  if (variant === 'page') {
    return (
      <button className="btn btn-line btn-sm" type="button" aria-pressed={on} onClick={() => toggleFav(id)}>
        {on ? `♥ ${t('inFavs')}` : `♡ ${t('add')}`}
      </button>
    )
  }
  return (
    <button className="fav" type="button" aria-pressed={on} aria-label={on ? t('remove') : t('add')} onClick={() => toggleFav(id)}>
      {HEART}
    </button>
  )
}

/** Иконка ♡ со счётчиком в шапке */
export function FavLink() {
  const t = useTranslations('favs')
  const n = useFavs().length
  return (
    <Link className="icon-btn" href="/favorites" aria-label={t('title')}>
      {HEART}
      {n > 0 && <span className="cnt">{n}</span>}
    </Link>
  )
}
