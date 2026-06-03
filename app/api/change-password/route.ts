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

async function getCurrentPassword() {
  const res = await kv([['GET', 'site:admin_pw']])
  return res?.[0]?.result || process.env.ADMIN_PASSWORD || ''
}

export async function POST(req: NextRequest) {
  const currentPw = await getCurrentPassword()
  if (req.headers.get('x-admin-password') !== currentPw) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { newPassword } = await req.json()
  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'Contraseña muy corta' }, { status: 400 })
  }
  await kv([['SET', 'site:admin_pw', newPassword]])
  return NextResponse.json({ ok: true })
}
