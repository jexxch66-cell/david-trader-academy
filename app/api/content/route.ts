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

async function getAdminPw() {
  const res = await kv([['GET', 'site:admin_pw']])
  return res?.[0]?.result || process.env.ADMIN_PASSWORD || ''
}

export const DEFAULT_BENEFITS = [
  { icon: '📈', title: '6 años de experiencia',  sub: 'Trader profesional especializado en Forex, divisas y oro' },
  { icon: '🛡️', title: 'Gestión de riesgo',      sub: 'Protege tu capital con metodología disciplinada y probada' },
  { icon: '🎯', title: 'Price Action real',       sub: 'Lee el mercado como los traders institucionales' },
  { icon: '🔴', title: 'Sesiones en vivo',        sub: 'Acompañamiento real con análisis del mercado en tiempo real' },
]

export const DEFAULT_MODULES = [
  { num: '01', title: 'Fundamentos del Trading Profesional',    desc: 'Introducción completa al mundo del trading, conceptos esenciales, funcionamiento del mercado Forex, pares de divisas, sesiones de mercado y mentalidad correcta para iniciar.' },
  { num: '02', title: 'Price Action y Lectura del Mercado',      desc: 'Aprende a interpretar gráficos como un trader profesional, identificar estructuras del mercado, zonas clave, soportes, resistencias y movimientos institucionales.' },
  { num: '03', title: 'Trading en Oro (XAU/USD) y Divisas',     desc: 'Estrategias específicas para operar oro y pares de divisas con alta precisión, entendiendo comportamiento, volatilidad y mejores oportunidades de entrada.' },
  { num: '04', title: 'Gestión de Riesgo Profesional',          desc: 'Uno de los pilares más importantes del curso. Aprende a proteger capital, calcular lotajes, controlar pérdidas y operar con disciplina.' },
  { num: '05', title: 'Psicología del Trading y Control Emocional', desc: 'Acompañamiento psicológico enfocado en mentalidad, control emocional, toma de decisiones, manejo del miedo, ansiedad y sobreoperación.' },
  { num: '06', title: 'Trading en Vivo + Ejecución Real',       desc: 'Sesiones en vivo con análisis del mercado en tiempo real, explicación de entradas, salidas y toma de decisiones reales.' },
]

export async function GET() {
  const res = await kv([
    ['GET', 'site:price'],
    ['GET', 'site:headline1'],
    ['GET', 'site:headline2'],
    ['GET', 'site:subtitle'],
    ['GET', 'site:benefits'],
    ['GET', 'site:modules'],
  ])

  const parse = (raw: string | null, def: unknown) => {
    if (!raw) return def
    try { return JSON.parse(raw) } catch { return def }
  }

  return NextResponse.json({
    price:     res?.[0]?.result ?? '199',
    headline1: res?.[1]?.result ?? 'Opera los mercados',
    headline2: res?.[2]?.result ?? 'con método real',
    subtitle:  res?.[3]?.result ?? 'Aprende a operar los mercados financieros con estrategia, disciplina y gestión profesional del riesgo, incluso si empiezas desde cero.',
    benefits:  parse(res?.[4]?.result, DEFAULT_BENEFITS),
    modules:   parse(res?.[5]?.result, DEFAULT_MODULES),
  })
}

export async function PATCH(req: NextRequest) {
  const validPw = await getAdminPw()
  if (req.headers.get('x-admin-password') !== validPw) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const body = await req.json()
  const commands: unknown[][] = []
  if (body.price     !== undefined) commands.push(['SET', 'site:price',     String(body.price)])
  if (body.headline1 !== undefined) commands.push(['SET', 'site:headline1', body.headline1])
  if (body.headline2 !== undefined) commands.push(['SET', 'site:headline2', body.headline2])
  if (body.subtitle  !== undefined) commands.push(['SET', 'site:subtitle',  body.subtitle])
  if (body.benefits  !== undefined) commands.push(['SET', 'site:benefits',  JSON.stringify(body.benefits)])
  if (body.modules   !== undefined) commands.push(['SET', 'site:modules',   JSON.stringify(body.modules)])
  if (commands.length) await kv(commands)
  return NextResponse.json({ ok: true })
}
