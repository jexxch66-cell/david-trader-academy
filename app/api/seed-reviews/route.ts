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

export async function GET() {
  const res = await kv([['GET', 'site:seed_reviews']])
  const data = res?.[0]?.result
  if (!data) return NextResponse.json(null)
  try { return NextResponse.json(JSON.parse(data)) } catch { return NextResponse.json(null) }
}

export async function PATCH(req: NextRequest) {
  if (req.headers.get('x-admin-password') !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const reviews = await req.json()
  await kv([['SET', 'site:seed_reviews', JSON.stringify(reviews)]])
  return NextResponse.json({ ok: true })
}
