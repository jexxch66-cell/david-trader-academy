'use client'
import { useState } from 'react'

type Review = {
  id: string
  name: string
  country: string
  rating: number
  review: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed]     = useState(false)
  const [reviews, setReviews]   = useState<Review[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const fetchReviews = async (pw: string) => {
    setLoading(true); setError('')
    const res = await fetch('/api/admin', { headers: { 'x-admin-password': pw } })
    setLoading(false)
    if (!res.ok) { setError('Contraseña incorrecta'); return }
    setReviews(await res.json())
    setAuthed(true)
  }

  const update = async (id: string, status: 'approved' | 'rejected') => {
    await fetch('/api/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ id, status }),
    })
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  const pending  = reviews.filter(r => r.status === 'pending')
  const approved = reviews.filter(r => r.status === 'approved')
  const rejected = reviews.filter(r => r.status === 'rejected')

  if (!authed) return (
    <div style={{ minHeight: '100vh', background: '#060606', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 40, width: '100%', maxWidth: 360, textAlign: 'center' }}>
        <p style={{ fontFamily: 'sans-serif', fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 6 }}>Panel Admin</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 28 }}>David Trader Academy · Reseñas</p>
        <input type="password" placeholder="Contraseña" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchReviews(password)}
          style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '12px 16px', color: 'white', fontSize: 15, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }} />
        {error && <p style={{ color: '#FF6B6B', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button onClick={() => fetchReviews(password)} disabled={loading}
          style={{ width: '100%', background: 'linear-gradient(135deg,#00FF87,#00D96A)', color: '#000', padding: 12, borderRadius: 10, border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
          {loading ? 'Cargando...' : 'Entrar'}
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#060606', padding: '40px 20px', color: 'white', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Panel de Reseñas</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: '#FFB800' }}>⏳ {pending.length} pendientes</span>
            <span style={{ fontSize: 13, color: '#00FF87' }}>✓ {approved.length} aprobadas</span>
            <span style={{ fontSize: 13, color: '#FF6B6B' }}>✕ {rejected.length} rechazadas</span>
          </div>
        </div>

        {reviews.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)', fontSize: 15 }}>
            No hay reseñas todavía.
          </div>
        )}

        {reviews.map(r => (
          <div key={r.id} style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${r.status === 'approved' ? 'rgba(0,255,135,0.3)' : r.status === 'rejected' ? 'rgba(255,107,107,0.25)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 12, padding: 24, marginBottom: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{r.name} · {r.country}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                  {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)} &nbsp;·&nbsp; {new Date(r.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <span style={{
                padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 600,
                background: r.status === 'approved' ? 'rgba(0,255,135,0.1)' : r.status === 'rejected' ? 'rgba(255,107,107,0.1)' : 'rgba(255,184,0,0.1)',
                color:      r.status === 'approved' ? '#00FF87'             : r.status === 'rejected' ? '#FF6B6B'             : '#FFB800',
              }}>
                {r.status === 'approved' ? 'Aprobada' : r.status === 'rejected' ? 'Rechazada' : 'Pendiente'}
              </span>
            </div>

            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: r.status === 'pending' ? 16 : 0 }}>{r.review}</p>

            {r.status === 'pending' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => update(r.id, 'approved')}
                  style={{ padding: '8px 22px', background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.3)', borderRadius: 8, color: '#00FF87', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                  ✓ Aprobar
                </button>
                <button onClick={() => update(r.id, 'rejected')}
                  style={{ padding: '8px 22px', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: 8, color: '#FF6B6B', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                  ✕ Rechazar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
