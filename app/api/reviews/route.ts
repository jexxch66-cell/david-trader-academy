import { NextResponse } from 'next/server'

async function kv(commands: unknown[][]) {
  const url   = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  const res = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
    next: { revalidate: 60 },
  })
  return res.json()
}

export async function GET() {
  const res = await kv([['LRANGE', 'review_ids', 0, -1]])
  if (!res) return NextResponse.json([])

  const ids: string[] = res[0]?.result ?? []
  if (!ids.length) return NextResponse.json([])

  const gets = await kv(ids.map(id => ['GET', `review:${id}`]))
  if (!gets) return NextResponse.json([])

  const approved = gets
    .map((r: { result: string }) => { try { return JSON.parse(r.result) } catch { return null } })
    .filter((r: any) => r?.status === 'approved')

  return NextResponse.json(approved)
}
