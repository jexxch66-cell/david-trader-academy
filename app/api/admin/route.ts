import { NextRequest, NextResponse } from 'next/server'

async function kv(commands: unknown[][]) {
  const url   = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  const res = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  })
  return res.json()
}

async function auth(req: NextRequest) {
  const pw = req.headers.get('x-admin-password')
  const stored = await kv([['GET', 'site:admin_pw']])
  const valid = stored?.[0]?.result || process.env.ADMIN_PASSWORD || ''
  return pw === valid
}

export async function GET(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const res = await kv([['LRANGE', 'review_ids', 0, -1]])
  if (!res) return NextResponse.json([])
  const ids: string[] = res[0]?.result ?? []
  if (!ids.length) return NextResponse.json([])

  const gets = await kv(ids.map(id => ['GET', `review:${id}`]))
  return NextResponse.json(
    (gets ?? [])
      .map((r: { result: string }) => { try { return JSON.parse(r.result) } catch { return null } })
      .filter(Boolean)
  )
}

export async function PATCH(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id, status, review: reviewText } = await req.json()
  const res = await kv([['GET', `review:${id}`]])
  if (!res?.[0]?.result) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const review = JSON.parse(res[0].result)
  if (status !== undefined)     review.status = status
  if (reviewText !== undefined) review.review = reviewText
  await kv([['SET', `review:${id}`, JSON.stringify(review)]])
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await req.json()
  await kv([
    ['LREM', 'review_ids', 0, id],
    ['DEL',  `review:${id}`],
  ])
  return NextResponse.json({ ok: true })
}
