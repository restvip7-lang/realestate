export async function readBody(request: Request, maxBytes = 24000): Promise<unknown> {
  if (request.headers.get('origin') !== new URL(request.url).origin) throw new Error('origin')
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new Error('content-type')
  const reader = request.body?.getReader()
  if (!reader) throw new Error('empty')
  let size = 0
  const chunks: Uint8Array[] = []
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > maxBytes) { await reader.cancel(); throw new Error('size') }
      chunks.push(value)
    }
  } finally { reader.releaseLock() }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}
export const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })
