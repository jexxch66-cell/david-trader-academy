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

export const DEFAULT_BANNER = {
  active:  false,
  message: '🔥 Oferta de lanzamiento — Solo por tiempo limitado',
  endDate: '',
  badge:   'Precio especial',
}

export async function GET() {
  const res = await kv([['GET', 'site:banner']])
  const data = res?.[0]?.result
  if (!data) return NextResponse.json(DEFAULT_BANNER)
  try { return NextResponse.json(JSON.parse(data)) } catch { return NextResponse.json(DEFAULT_BANNER) }
}

export async function PATCH(req: NextRequest) {
  if (req.headers.get('x-admin-password') !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const body = await req.json()
  await kv([['SET', 'site:banner', JSON.stringify(body)]])
  return NextResponse.json({ ok: true })
}
