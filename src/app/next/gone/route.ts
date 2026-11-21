import config from '@payload-config'
import { getPayload } from 'payload'

// Номера объектов, проданных или сданных больше GONE_DAYS дней назад: их адреса отвечают 410 Gone (ТЗ, docs/seo-urls.md).
// Список читает src/proxy.ts и держит в памяти 10 минут.
export const dynamic = 'force-dynamic' // proxy и так держит список в памяти 10 минут
const GONE_DAYS = 90

export async function GET() {
  const payload = await getPayload({ config })
  const before = new Date(Date.now() - GONE_DAYS * 864e5).toISOString()
  const { docs } = await payload.find({
    collection: 'properties',
    where: { and: [{ status: { in: ['sold', 'rented'] } }, { closedAt: { less_than: before } }] },
    select: { status: true },
    limit: 10000,
    depth: 0,
    pagination: false,
    overrideAccess: false,
  })
  return Response.json({ ids: docs.map((d) => d.id) })
}
