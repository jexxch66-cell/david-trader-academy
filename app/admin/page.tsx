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

function TradingIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
      <polyline points="2,24 8,14 13,18 20,8 26,12 30,6" stroke="#00FF87" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="24,6 30,6 30,12" stroke="#00FF87" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i < rating ? '#00FF87' : 'rgba(255,255,255,0.12)'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  )
}

const STATUS_LABEL = { pending: 'Pendiente', approved: 'Aprobada', rejected: 'Rechazada' }
const STATUS_COLOR = {
  pending:  { bg: 'rgba(255,184,0,0.1)',   border: 'rgba(255,184,0,0.3)',   text: '#FFB800' },
  approved: { bg: 'rgba(0,255,135,0.1)',   border: 'rgba(0,255,135,0.3)',   text: '#00FF87' },
  rejected: { bg: 'rgba(255,107,107,0.1)', border: 'rgba(255,107,107,0.3)', text: '#FF6B6B' },
}

type Tab = 'pending' | 'approved' | 'rejected' | 'all'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed]     = useState(false)
  const [reviews, setReviews]   = useState<Review[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [tab, setTab]           = useState<Tab>('pending')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchReviews = async (pw: string) => {
    setLoading(true); setError('')
    const res = await fetch('/api/admin', { headers: { 'x-admin-password': pw } })
    setLoading(false)
    if (!res.ok) { setError('Contraseña incorrecta'); return }
    setReviews(await res.json())
    setAuthed(true)
  }

  const update = async (id: string, status: 'approved' | 'rejected') => {
    setActionLoading(id)
    await fetch('/api/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ id, status }),
    })
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    setActionLoading(null)
  }

  const counts = {
    all:      reviews.length,
    pending:  reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
  }

  const visible = tab === 'all' ? reviews : reviews.filter(r => r.status === tab)

  if (!authed) return (
    <div style={{
      minHeight: '100vh', background: '#060606',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, fontFamily: 'var(--ff-body)',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 40 }}>
          <TradingIcon />
          <span style={{ fontFamily: 'var(--ff-display)', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>
            David Trader Academy
          </span>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(0,255,135,0.15)',
          borderRadius: 20, padding: 40,
          boxShadow: '0 0 60px rgba(0,255,135,0.05)',
        }}>
          <p style={{ fontFamily: 'var(--ff-display)', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 6, textAlign: 'center' }}>
            Panel Admin
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 32, textAlign: 'center', letterSpacing: '0.04em' }}>
            Gestión de reseñas
          </p>

          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
            Contraseña
          </label>
          <input
            type="password" placeholder="••••••••" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchReviews(password)}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
              padding: '12px 16px', color: 'white', fontSize: 15,
              outline: 'none', marginBottom: 16, boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
          {error && (
            <p style={{ color: '#FF6B6B', fontSize: 13, marginBottom: 14, textAlign: 'center' }}>{error}</p>
          )}
          <button
            onClick={() => fetchReviews(password)} disabled={loading}
            style={{
              width: '100%', background: 'linear-gradient(135deg,#00FF87,#00D96A)',
              color: '#000', padding: '13px', borderRadius: 10, border: 'none',
              fontFamily: 'var(--ff-display)', fontSize: 15, fontWeight: 800,
              letterSpacing: '0.05em', cursor: 'pointer',
              opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s',
            }}
          >
            {loading ? 'Cargando...' : 'Entrar →'}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#060606', color: 'white', fontFamily: 'var(--ff-body)' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(6,6,6,0.95)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0,255,135,0.1)',
        padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <TradingIcon />
        <span style={{ fontFamily: 'var(--ff-display)', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>
          Panel Admin
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
          <span style={{ fontSize: 12, color: '#FFB800' }}>⏳ {counts.pending}</span>
          <span style={{ fontSize: 12, color: '#00FF87' }}>✓ {counts.approved}</span>
          <span style={{ fontSize: 12, color: '#FF6B6B' }}>✕ {counts.rejected}</span>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28, flexWrap: 'wrap' }}>
          {(['pending', 'all', 'approved', 'rejected'] as Tab[]).map(t => {
            const labels = { pending: 'Pendientes', all: 'Todas', approved: 'Aprobadas', rejected: 'Rechazadas' }
            const active = tab === t
            return (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '8px 18px', borderRadius: 100, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--ff-display)', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
                background: active ? 'linear-gradient(135deg,#00FF87,#00D96A)' : 'rgba(255,255,255,0.05)',
                color: active ? '#000' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.2s',
              }}>
                {labels[t]} {counts[t] > 0 && `(${counts[t]})`}
              </button>
            )
          })}
        </div>

        {/* Reviews */}
        {visible.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(255,255,255,0.25)', fontSize: 14 }}>
            No hay reseñas en esta categoría.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visible.map(r => {
            const sc = STATUS_COLOR[r.status]
            return (
              <div key={r.id} style={{
                background: 'rgba(255,255,255,0.025)',
                border: `1px solid ${r.status === 'approved' ? 'rgba(0,255,135,0.2)' : r.status === 'rejected' ? 'rgba(255,107,107,0.18)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 14, padding: '22px 24px',
                transition: 'border-color 0.2s',
              }}>
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 15, color: 'white' }}>
                        {r.name}
                      </p>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em' }}>
                        {r.country}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <StarRow rating={r.rating} />
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.04em' }}>
                        {new Date(r.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <span style={{
                    padding: '5px 14px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text,
                    flexShrink: 0,
                  }}>
                    {STATUS_LABEL[r.status]}
                  </span>
                </div>

                {/* Texto */}
                <p style={{
                  fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75,
                  marginBottom: r.status === 'pending' ? 18 : 0,
                  borderLeft: '2px solid rgba(0,255,135,0.15)',
                  paddingLeft: 14,
                }}>
                  {r.review}
                </p>

                {/* Acciones solo para pendientes */}
                {r.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => update(r.id, 'approved')}
                      disabled={actionLoading === r.id}
                      style={{
                        padding: '9px 24px',
                        background: 'rgba(0,255,135,0.08)',
                        border: '1px solid rgba(0,255,135,0.3)',
                        borderRadius: 8, color: '#00FF87',
                        fontFamily: 'var(--ff-display)', fontWeight: 700,
                        fontSize: 13, cursor: 'pointer', letterSpacing: '0.04em',
                        opacity: actionLoading === r.id ? 0.5 : 1,
                        transition: 'background 0.2s, opacity 0.2s',
                      }}
                    >
                      ✓ Aprobar
                    </button>
                    <button
                      onClick={() => update(r.id, 'rejected')}
                      disabled={actionLoading === r.id}
                      style={{
                        padding: '9px 24px',
                        background: 'rgba(255,107,107,0.07)',
                        border: '1px solid rgba(255,107,107,0.25)',
                        borderRadius: 8, color: '#FF6B6B',
                        fontFamily: 'var(--ff-display)', fontWeight: 700,
                        fontSize: 13, cursor: 'pointer', letterSpacing: '0.04em',
                        opacity: actionLoading === r.id ? 0.5 : 1,
                        transition: 'background 0.2s, opacity 0.2s',
                      }}
                    >
                      ✕ Rechazar
                    </button>
                  </div>
                )}

                {/* Opción de revertir si ya fue procesada */}
                {r.status !== 'pending' && (
                  <button
                    onClick={() => update(r.id, r.status === 'approved' ? 'rejected' : 'approved')}
                    disabled={actionLoading === r.id}
                    style={{
                      marginTop: 14, padding: '7px 18px',
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8, color: 'rgba(255,255,255,0.3)',
                      fontSize: 12, cursor: 'pointer',
                      opacity: actionLoading === r.id ? 0.5 : 1,
                      transition: 'color 0.2s, border-color 0.2s',
                    }}
                  >
                    {r.status === 'approved' ? '✕ Rechazar' : '✓ Aprobar'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
