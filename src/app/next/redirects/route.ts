import config from '@payload-config'
import { getPayload } from 'payload'

// Включённые редиректы из админки (SEO → Редиректы). Список читает src/proxy.ts и держит в памяти 10 минут.
export const dynamic = 'force-dynamic'

export async function GET() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'redirects',
    where: { active: { equals: true } },
    select: { from: true, to: true, code: true },
    limit: 5000,
    depth: 0,
    pagination: false,
  })
  return Response.json({ items: docs.map((d) => ({ from: d.from, to: d.to, code: Number(d.code) || 308 })) })
}
