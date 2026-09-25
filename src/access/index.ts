import type { Access, FieldAccess, Where } from 'payload'

import type { User } from '@/payload-types'

// Роли: admin — всё; editor — объекты, публикации, районы, команда, отзывы, заявки;
// agent — только свои объекты и свои заявки (сотрудник привязан к пользователю через users.member)
export type Role = 'admin' | 'editor' | 'agent'

const role = (user: unknown): Role | null => ((user as User | null)?.role as Role) ?? null

export const isAdmin = ({ req }: { req: { user: unknown } }) => role(req.user) === 'admin'
export const isEditor = ({ req }: { req: { user: unknown } }) => ['admin', 'editor'].includes(role(req.user) ?? '')
export const isStaff = ({ req }: { req: { user: unknown } }) => !!role(req.user)

export const adminOnly: Access = isAdmin
export const editorsOnly: Access = isEditor
export const staffOnly: Access = isStaff
export const anyone: Access = () => true
export const adminField: FieldAccess = ({ req }) => role(req.user) === 'admin'

const memberId = (user: unknown) => {
  const m = (user as User | null)?.member
  return m && typeof m === 'object' ? m.id : m
}

/** Редактор и админ — всё; агент — только документы, где поле `field` указывает на его карточку в «Команде». */
export const ownByAgent =
  (field: string): Access =>
  ({ req }) => {
    const r = role(req.user)
    if (r === 'admin' || r === 'editor') return true
    if (r === 'agent') {
      const id = memberId(req.user)
      return id ? ({ [field]: { equals: id } } as Where) : false
    }
    return false
  }
