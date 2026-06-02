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

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, country, rating, review } = body

  if (!name?.trim() || !country?.trim() || !rating || !review?.trim()) {
    return NextResponse.json({ error: 'Campos incompletos' }, { status: 400 })
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const entry = JSON.stringify({
    id,
    name:    name.trim(),
    country: country.trim(),
    rating:  Number(rating),
    review:  review.trim(),
    status:  'pending',
    createdAt: new Date().toISOString(),
  })

  await kv([
    ['SET',   `review:${id}`, entry],
    ['LPUSH', 'review_ids',   id],
  ])

  return NextResponse.json({ ok: true })
}
