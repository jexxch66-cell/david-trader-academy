import { NextResponse } from 'next/server'

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

const parse = (raw: string | null, def: unknown) => {
  if (!raw) return def
  try { return JSON.parse(raw) } catch { return def }
}

const DEFAULT_BENEFITS = [
  { icon: '📈', title: '6 años de experiencia',  sub: 'Trader profesional especializado en Forex, divisas y oro' },
  { icon: '🛡️', title: 'Gestión de riesgo',      sub: 'Protege tu capital con metodología disciplinada y probada' },
  { icon: '🎯', title: 'Price Action real',       sub: 'Lee el mercado como los traders institucionales' },
  { icon: '🔴', title: 'Sesiones en vivo',        sub: 'Acompañamiento real con análisis del mercado en tiempo real' },
]
const DEFAULT_MODULES = [
  { num: '01', title: 'Fundamentos del Trading Profesional',    desc: 'Introducción completa al mundo del trading, conceptos esenciales, funcionamiento del mercado Forex, pares de divisas, sesiones de mercado y mentalidad correcta para iniciar.' },
  { num: '02', title: 'Price Action y Lectura del Mercado',      desc: 'Aprende a interpretar gráficos como un trader profesional, identificar estructuras del mercado, zonas clave, soportes, resistencias y movimientos institucionales.' },
  { num: '03', title: 'Trading en Oro (XAU/USD) y Divisas',     desc: 'Estrategias específicas para operar oro y pares de divisas con alta precisión, entendiendo comportamiento, volatilidad y mejores oportunidades de entrada.' },
  { num: '04', title: 'Gestión de Riesgo Profesional',          desc: 'Uno de los pilares más importantes del curso. Aprende a proteger capital, calcular lotajes, controlar pérdidas y operar con disciplina.' },
  { num: '05', title: 'Psicología del Trading y Control Emocional', desc: 'Acompañamiento psicológico enfocado en mentalidad, control emocional, toma de decisiones, manejo del miedo, ansiedad y sobreoperación.' },
  { num: '06', title: 'Trading en Vivo + Ejecución Real',       desc: 'Sesiones en vivo con análisis del mercado en tiempo real, explicación de entradas, salidas y toma de decisiones reales.' },
]
const DEFAULT_SEEDS = [
  { name: 'Carlos Mendoza',  country: 'Colombia', initials: 'CM', color: '#00FF87', stars: 4, review: 'Llevaba año y medio operando a pérdida sin entender qué fallaba. Con este curso aprendí a leer la estructura del mercado y mis resultados cambiaron por completo en pocas semanas. El módulo de Price Action es oro puro.' },
  { name: 'Valentina Ríos',  country: 'México',   initials: 'VR', color: '#00D4FF', stars: 5, review: 'Lo que más me impactó fue el módulo de gestión de riesgo. Antes arriesgaba el 20% de la cuenta sin pensarlo. Ahora tengo reglas claras y he crecido de forma consistente mes a mes. Totalmente recomendado.' },
  { name: 'Andrés Parra',    country: 'Colombia', initials: 'AP', color: '#FFB800', stars: 5, review: 'Las sesiones en vivo valen todo. Ver a David analizar el mercado en tiempo real mientras explica cada decisión no lo encuentras en ningún otro curso. Aprendí más en un mes que leyendo libros en un año.' },
  { name: 'Laura Gómez',     country: 'Panamá',   initials: 'LG', color: '#FF6B6B', stars: 4, review: 'Al principio me costó entender el Price Action, no voy a mentir. Pero David tiene mucha paciencia y el material está muy bien organizado. Le daría 5 estrellas si hubiera más contenido sobre criptos, pero igual lo recomiendo.' },
  { name: 'Miguel Torres',   country: 'México',   initials: 'MT', color: '#B45FFF', stars: 4, review: 'Tenía conocimientos técnicos pero perdía por mis emociones. El módulo de psicología del trading fue exactamente lo que necesitaba. Hoy opero con una calma y disciplina que antes simplemente no tenía.' },
  { name: 'Daniela Vargas',  country: 'Colombia', initials: 'DV', color: '#00FF87', stars: 5, review: 'Soy abogada y no tenía ningún conocimiento previo de mercados. El curso me llevó de cero a operar con confianza en 3 meses. David explica todo muy claro y el acompañamiento es real, no solo videos grabados.' },
]

export async function GET() {
  // Una sola llamada a Redis con todas las keys necesarias
  const res = await kv([
    ['GET', 'site:price'],
    ['GET', 'site:headline1'],
    ['GET', 'site:headline2'],
    ['GET', 'site:subtitle'],
    ['GET', 'site:benefits'],
    ['GET', 'site:modules'],
    ['GET', 'site:seed_reviews'],
    ['LRANGE', 'review_ids', 0, -1],
  ])

  const ids: string[] = res?.[7]?.result ?? []
  let approvedReviews: unknown[] = []

  if (ids.length) {
    const gets = await kv(ids.map((id: string) => ['GET', `review:${id}`]))
    approvedReviews = (gets ?? [])
      .map((r: { result: string }) => { try { return JSON.parse(r.result) } catch { return null } })
      .filter((r: any) => r?.status === 'approved')
  }

  const response = NextResponse.json({
    content: {
      price:     res?.[0]?.result ?? '199',
      headline1: res?.[1]?.result ?? 'Opera los mercados',
      headline2: res?.[2]?.result ?? 'con método real',
      subtitle:  res?.[3]?.result ?? 'Aprende a operar los mercados financieros con estrategia, disciplina y gestión profesional del riesgo, incluso si empiezas desde cero.',
      benefits:  parse(res?.[4]?.result, DEFAULT_BENEFITS),
      modules:   parse(res?.[5]?.result, DEFAULT_MODULES),
    },
    seedReviews: parse(res?.[6]?.result, null),
    reviews:     approvedReviews,
  })

  response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
  return response
}
