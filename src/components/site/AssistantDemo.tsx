'use client'

import { useTranslations } from 'next-intl'
import { Assistant } from './Assistant'
import { emptyFilters, type Card, type ChatRequest, type ChatReply, type Filters } from '@/lib/assistant/schema'

const examples: Card[] = [
  { id: 90001, title: '1+1 · Oba', district: 'Oba', price: 115000, rooms: '1+1', area: 58, sea: 700, deal: 'sale', url: '', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=320&q=80' },
  { id: 90002, title: '2+1 · Mahmutlar', district: 'Mahmutlar', price: 138000, rooms: '2+1', area: 92, sea: 450, deal: 'sale', url: '', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=320&q=80' },
  { id: 90003, title: '2+1 · Tosmur', district: 'Tosmur', price: 149000, rooms: '2+1', area: 105, sea: 600, deal: 'sale', url: '', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=320&q=80' },
  { id: 90004, title: '2+1 · Oba', district: 'Oba', price: 900, rooms: '2+1', area: 96, sea: 800, deal: 'rent', url: '', image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=320&q=80' },
]

export function AssistantDemo() {
  const t = useTranslations('assistant')
  function demoReply(input: ChatRequest): ChatReply {
    const messages = input.messages.filter((m) => m.role === 'user').map((m) => m.content)
    const all = messages.join(' ').toLowerCase()
    const latestDeal = [...messages].reverse().find((m) => /куп|buy|satın|аренд|rent|kirala/i.test(m)) || ''
    const deal = /аренд|rent|kirala/i.test(latestDeal) ? 'rent' : /куп|buy|satın/i.test(latestDeal) ? 'sale' : null
    const budget = [...all.matchAll(/(\d[\d\s]*)(?:\s*)(eur|€)/g)].at(-1)
    const maxBudget = budget ? Number(budget[1].replace(/\s/g, '')) : null
    const rooms = [...all.matchAll(/\b(\d\+\d)\b/g)].at(-1)?.[1] || null
    const filters: Filters = { ...emptyFilters, city: 'alanya', deal: deal as Filters['deal'], maxBudget, currency: maxBudget ? 'EUR' : null, rooms }
    const search = !!deal && !!maxBudget
    const cards = search ? examples.filter((p) => p.deal === deal && p.price! <= maxBudget! && (!rooms || p.rooms === rooms)) : []
    const reply = !deal ? t('demoDeal') : !maxBudget ? t('demoBudget') : !rooms ? t('demoRooms') : t('demoReady')
    return { reply, filters, search, cards, total: search ? cards.length : null, notice: null, demo: true, summary: messages.join(' · ').slice(0, 800) }
  }
  return <Assistant demo demoReply={demoReply} />
}
