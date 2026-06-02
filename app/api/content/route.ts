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

export const DEFAULTS = {
  price:     '199',
  headline1: 'Opera los mercados',
  headline2: 'con método real',
  subtitle:  'Aprende a operar los mercados financieros con estrategia, disciplina y gestión profesional del riesgo, incluso si empiezas desde cero.',
}

export async function GET() {
  const res = await kv([
    ['GET', 'site:price'],
    ['GET', 'site:headline1'],
    ['GET', 'site:headline2'],
    ['GET', 'site:subtitle'],
  ])
  return NextResponse.json({
    price:     res?.[0]?.result ?? DEFAULTS.price,
    headline1: res?.[1]?.result ?? DEFAULTS.headline1,
    headline2: res?.[2]?.result ?? DEFAULTS.headline2,
    subtitle:  res?.[3]?.result ?? DEFAULTS.subtitle,
  })
}

export async function PATCH(req: NextRequest) {
  if (req.headers.get('x-admin-password') !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const body = await req.json()
  const commands: unknown[][] = []
  if (body.price     !== undefined) commands.push(['SET', 'site:price',     String(body.price)])
  if (body.headline1 !== undefined) commands.push(['SET', 'site:headline1', body.headline1])
  if (body.headline2 !== undefined) commands.push(['SET', 'site:headline2', body.headline2])
  if (body.subtitle  !== undefined) commands.push(['SET', 'site:subtitle',  body.subtitle])
  if (commands.length) await kv(commands)
  return NextResponse.json({ ok: true })
}
