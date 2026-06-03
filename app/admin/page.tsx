'use client'
import { useState, useEffect } from 'react'

type Review = {
  id: string
  name: string
  country: string
  rating: number
  review: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

type SiteContent = {
  price: string
  headline1: string
  headline2: string
  subtitle: string
}

const DEFAULTS: SiteContent = {
  price:     '199',
  headline1: 'Opera los mercados',
  headline2: 'con método real',
  subtitle:  'Aprende a operar los mercados financieros con estrategia, disciplina y gestión profesional del riesgo, incluso si empiezas desde cero.',
}

function TradingIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
      <polyline points="2,24 8,14 13,18 20,8 26,12 30,6" stroke="#00FF87" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="24,6 30,6 30,12" stroke="#00FF87" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function Stars({ rating }: { rating: number }) {
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

const SC = {
  pending:  { bg: 'rgba(255,184,0,0.1)',   border: 'rgba(255,184,0,0.3)',   text: '#FFB800' },
  approved: { bg: 'rgba(0,255,135,0.1)',   border: 'rgba(0,255,135,0.3)',   text: '#00FF87' },
  rejected: { bg: 'rgba(255,107,107,0.1)', border: 'rgba(255,107,107,0.3)', text: '#FF6B6B' },
}
const SL = { pending: 'Pendiente', approved: 'Aprobada', rejected: 'Rechazada' }

type SeedReview = { name: string; country: string; initials: string; color: string; stars: number; review: string }

const SEED_DEFAULTS: SeedReview[] = [
  { name: 'Carlos Mendoza',  country: 'Colombia', initials: 'CM', color: '#00FF87', stars: 4, review: 'Llevaba año y medio operando a pérdida sin entender qué fallaba. Con este curso aprendí a leer la estructura del mercado y mis resultados cambiaron por completo en pocas semanas. El módulo de Price Action es oro puro.' },
  { name: 'Valentina Ríos',  country: 'México',   initials: 'VR', color: '#00D4FF', stars: 5, review: 'Lo que más me impactó fue el módulo de gestión de riesgo. Antes arriesgaba el 20% de la cuenta sin pensarlo. Ahora tengo reglas claras y he crecido de forma consistente mes a mes. Totalmente recomendado.' },
  { name: 'Andrés Parra',    country: 'Colombia', initials: 'AP', color: '#FFB800', stars: 5, review: 'Las sesiones en vivo valen todo. Ver a David analizar el mercado en tiempo real mientras explica cada decisión no lo encuentras en ningún otro curso. Aprendí más en un mes que leyendo libros en un año.' },
  { name: 'Laura Gómez',     country: 'Panamá',   initials: 'LG', color: '#FF6B6B', stars: 4, review: 'Al principio me costó entender el Price Action, no voy a mentir. Pero David tiene mucha paciencia y el material está muy bien organizado. Le daría 5 estrellas si hubiera más contenido sobre criptos, pero igual lo recomiendo.' },
  { name: 'Miguel Torres',   country: 'México',   initials: 'MT', color: '#B45FFF', stars: 4, review: 'Tenía conocimientos técnicos pero perdía por mis emociones. El módulo de psicología del trading fue exactamente lo que necesitaba. Hoy opero con una calma y disciplina que antes simplemente no tenía.' },
  { name: 'Daniela Vargas',  country: 'Colombia', initials: 'DV', color: '#00FF87', stars: 5, review: 'Soy abogada y no tenía ningún conocimiento previo de mercados. El curso me llevó de cero a operar con confianza en 3 meses. David explica todo muy claro y el acompañamiento es real, no solo videos grabados.' },
]

type Benefit = { icon: string; title: string; sub: string }
type Module  = { num: string; title: string; desc: string }
type Tab = 'pending' | 'approved' | 'rejected' | 'all' | 'content' | 'seeds' | 'benefits' | 'modules' | 'security'

export default function AdminPage() {
  const [password, setPassword]   = useState('')
  const [authed, setAuthed]       = useState(false)
  const [reviews, setReviews]     = useState<Review[]>([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [tab, setTab]             = useState<Tab>('pending')
  const [busy, setBusy]           = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText]   = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [content, setContent]       = useState<SiteContent>(DEFAULTS)
  const [contentDraft, setContentDraft] = useState<SiteContent>(DEFAULTS)
  const [contentSaving, setContentSaving] = useState(false)
  const [contentSaved, setContentSaved]   = useState(false)

  const DEFAULT_BENEFITS: Benefit[] = [
    { icon: '📈', title: '6 años de experiencia',  sub: 'Trader profesional especializado en Forex, divisas y oro' },
    { icon: '🛡️', title: 'Gestión de riesgo',      sub: 'Protege tu capital con metodología disciplinada y probada' },
    { icon: '🎯', title: 'Price Action real',       sub: 'Lee el mercado como los traders institucionales' },
    { icon: '🔴', title: 'Sesiones en vivo',        sub: 'Acompañamiento real con análisis del mercado en tiempo real' },
  ]
  const DEFAULT_MODULES: Module[] = [
    { num: '01', title: 'Fundamentos del Trading Profesional',    desc: 'Introducción completa al mundo del trading, conceptos esenciales, funcionamiento del mercado Forex, pares de divisas, sesiones de mercado y mentalidad correcta para iniciar.' },
    { num: '02', title: 'Price Action y Lectura del Mercado',      desc: 'Aprende a interpretar gráficos como un trader profesional, identificar estructuras del mercado, zonas clave, soportes, resistencias y movimientos institucionales.' },
    { num: '03', title: 'Trading en Oro (XAU/USD) y Divisas',     desc: 'Estrategias específicas para operar oro y pares de divisas con alta precisión, entendiendo comportamiento, volatilidad y mejores oportunidades de entrada.' },
    { num: '04', title: 'Gestión de Riesgo Profesional',          desc: 'Uno de los pilares más importantes del curso. Aprende a proteger capital, calcular lotajes, controlar pérdidas y operar con disciplina.' },
    { num: '05', title: 'Psicología del Trading y Control Emocional', desc: 'Acompañamiento psicológico enfocado en mentalidad, control emocional, toma de decisiones, manejo del miedo, ansiedad y sobreoperación.' },
    { num: '06', title: 'Trading en Vivo + Ejecución Real',       desc: 'Sesiones en vivo con análisis del mercado en tiempo real, explicación de entradas, salidas y toma de decisiones reales.' },
  ]
  const [benefitsDraft, setBenefitsDraft] = useState<Benefit[]>(DEFAULT_BENEFITS)
  const [benefitsSaving, setBenefitsSaving] = useState(false)
  const [benefitsSaved, setBenefitsSaved]   = useState(false)
  const [modulesDraft, setModulesDraft] = useState<Module[]>(DEFAULT_MODULES)
  const [modulesSaving, setModulesSaving] = useState(false)
  const [modulesSaved, setModulesSaved]   = useState(false)

  const [newPw, setNewPw]           = useState('')
  const [confirmPw, setConfirmPw]   = useState('')
  const [pwStatus, setPwStatus]     = useState<'idle'|'saving'|'ok'|'error'>('idle')

  const [seeds, setSeeds]           = useState<SeedReview[]>(SEED_DEFAULTS)
  const [seedsDraft, setSeedsDraft] = useState<SeedReview[]>(SEED_DEFAULTS)
  const [seedsSaving, setSeedsSaving] = useState(false)
  const [seedsSaved, setSeedsSaved]   = useState(false)

  const fetchReviews = async (pw: string) => {
    setLoading(true); setError('')
    const res = await fetch('/api/admin', { headers: { 'x-admin-password': pw } })
    setLoading(false)
    if (!res.ok) { setError('Contraseña incorrecta'); return }
    setReviews(await res.json())
    setAuthed(true)
  }

  useEffect(() => {
    if (!authed) return
    fetch('/api/content').then(r => r.json()).then((d: SiteContent) => {
      setContent(d); setContentDraft(d)
    }).catch(() => {})
    fetch('/api/content').then(r => r.json()).then((d: any) => {
      if (d.benefits) setBenefitsDraft(d.benefits)
      if (d.modules)  setModulesDraft(d.modules)
      if (d.price) setContentDraft(prev => ({ ...prev, price: d.price, headline1: d.headline1, headline2: d.headline2, subtitle: d.subtitle }))
    }).catch(() => {})
    fetch('/api/seed-reviews').then(r => r.json()).then(d => {
      if (d) { setSeeds(d); setSeedsDraft(d) }
    }).catch(() => {})
  }, [authed])

  const updateReview = async (id: string, payload: { status?: 'approved' | 'rejected'; review?: string }) => {
    setBusy(id)
    await fetch('/api/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ id, ...payload }),
    })
    if (payload.status !== undefined) {
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: payload.status! } : r))
    }
    if (payload.review !== undefined) {
      setReviews(prev => prev.map(r => r.id === id ? { ...r, review: payload.review! } : r))
      setEditingId(null)
    }
    setBusy(null)
  }

  const deleteReview = async (id: string) => {
    setBusy(id)
    await fetch('/api/admin', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ id }),
    })
    setReviews(prev => prev.filter(r => r.id !== id))
    setDeleteConfirm(null)
    setBusy(null)
  }

  const saveBenefits = async () => {
    setBenefitsSaving(true)
    await fetch('/api/content', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify({ benefits: benefitsDraft }) })
    setBenefitsSaving(false); setBenefitsSaved(true); setTimeout(() => setBenefitsSaved(false), 2500)
  }
  const saveModules = async () => {
    setModulesSaving(true)
    await fetch('/api/content', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify({ modules: modulesDraft }) })
    setModulesSaving(false); setModulesSaved(true); setTimeout(() => setModulesSaved(false), 2500)
  }

  const changePassword = async () => {
    if (newPw.length < 6) { setPwStatus('error'); return }
    if (newPw !== confirmPw) { setPwStatus('error'); return }
    setPwStatus('saving')
    const res = await fetch('/api/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ newPassword: newPw }),
    })
    if (res.ok) {
      setPwStatus('ok')
      setNewPw(''); setConfirmPw('')
      setTimeout(() => setPwStatus('idle'), 3000)
    } else {
      setPwStatus('error')
    }
  }

  const saveSeeds = async () => {
    setSeedsSaving(true)
    await fetch('/api/seed-reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify(seedsDraft),
    })
    setSeeds(seedsDraft)
    setSeedsSaving(false)
    setSeedsSaved(true)
    setTimeout(() => setSeedsSaved(false), 2500)
  }

  const saveContent = async () => {
    setContentSaving(true)
    await fetch('/api/content', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify(contentDraft),
    })
    setContent(contentDraft)
    setContentSaving(false)
    setContentSaved(true)
    setTimeout(() => setContentSaved(false), 2500)
  }

  const counts = {
    all: reviews.length,
    pending:  reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
  }

  const visible = tab === 'all' ? reviews
    : tab === 'content' ? []
    : reviews.filter(r => r.status === tab)

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
    padding: '11px 14px', color: 'white', fontSize: 14,
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 8,
  }

  if (!authed) return (
    <div style={{ minHeight: '100vh', background: '#060606', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'var(--ff-body)' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 40 }}>
          <TradingIcon />
          <span style={{ fontFamily: 'var(--ff-display)', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>David Trader Academy</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,255,135,0.15)', borderRadius: 20, padding: 40, boxShadow: '0 0 60px rgba(0,255,135,0.05)' }}>
          <p style={{ fontFamily: 'var(--ff-display)', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 6, textAlign: 'center' }}>Panel Admin</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 32, textAlign: 'center' }}>Gestión de reseñas y contenido</p>
          <label style={labelStyle}>Contraseña</label>
          <input type="password" placeholder="••••••••" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchReviews(password)}
            style={{ ...inputStyle, marginBottom: 16 }} />
          {error && <p style={{ color: '#FF6B6B', fontSize: 13, marginBottom: 14, textAlign: 'center' }}>{error}</p>}
          <button onClick={() => fetchReviews(password)} disabled={loading}
            style={{ width: '100%', background: 'linear-gradient(135deg,#00FF87,#00D96A)', color: '#000', padding: 13, borderRadius: 10, border: 'none', fontFamily: 'var(--ff-display)', fontSize: 15, fontWeight: 800, letterSpacing: '0.05em', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Cargando...' : 'Entrar →'}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#060606', color: 'white', fontFamily: 'var(--ff-body)' }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(6,6,6,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,255,135,0.1)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <TradingIcon />
        <span style={{ fontFamily: 'var(--ff-display)', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Panel Admin</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
          <span style={{ fontSize: 12, color: '#FFB800' }}>⏳ {counts.pending}</span>
          <span style={{ fontSize: 12, color: '#00FF87' }}>✓ {counts.approved}</span>
          <span style={{ fontSize: 12, color: '#FF6B6B' }}>✕ {counts.rejected}</span>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 20px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28, flexWrap: 'wrap' }}>
          {([
            { key: 'pending',  label: 'Pendientes',  count: counts.pending },
            { key: 'all',      label: 'Todas',        count: counts.all },
            { key: 'approved', label: 'Aprobadas',    count: counts.approved },
            { key: 'rejected', label: 'Rechazadas',   count: counts.rejected },
            { key: 'content',  label: 'Contenido',    count: null },
            { key: 'seeds',    label: 'Reseñas Fijas', count: null },
            { key: 'benefits', label: 'Beneficios',    count: null },
            { key: 'modules',  label: 'Módulos',       count: null },
            { key: 'security', label: 'Seguridad',     count: null },
          ] as { key: Tab; label: string; count: number | null }[]).map(({ key, label, count }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '8px 18px', borderRadius: 100, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--ff-display)', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
              background: tab === key
                ? key === 'content' ? 'linear-gradient(135deg,#FFB800,#FF8C00)' : 'linear-gradient(135deg,#00FF87,#00D96A)'
                : 'rgba(255,255,255,0.05)',
              color: tab === key ? '#000' : 'rgba(255,255,255,0.5)',
              transition: 'all 0.2s',
            }}>
              {label}{count !== null && count > 0 ? ` (${count})` : ''}
            </button>
          ))}
        </div>

        {/* ─── TAB CONTENIDO ─── */}
        {tab === 'content' && (
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,184,0,0.2)', borderRadius: 16, padding: 32 }}>
            <p style={{ fontFamily: 'var(--ff-display)', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Editar contenido de la página</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 28, lineHeight: 1.6 }}>
              Los cambios se aplican en tiempo real en la landing page.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Precio */}
              <div>
                <label style={labelStyle}>Precio de lanzamiento (USD)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: 'var(--ff-display)', fontSize: 22, fontWeight: 700, color: 'var(--green)' }}>$</span>
                  <input
                    type="number" value={contentDraft.price}
                    onChange={e => setContentDraft(d => ({ ...d, price: e.target.value }))}
                    style={{ ...inputStyle, width: 140, fontSize: 22, fontFamily: 'var(--ff-display)', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>(precio tachado siempre es $499)</span>
                </div>
              </div>

              {/* Headline línea 1 */}
              <div>
                <label style={labelStyle}>Título — Línea 1 (blanco)</label>
                <input value={contentDraft.headline1}
                  onChange={e => setContentDraft(d => ({ ...d, headline1: e.target.value }))}
                  style={inputStyle} />
              </div>

              {/* Headline línea 2 */}
              <div>
                <label style={labelStyle}>Título — Línea 2 (verde)</label>
                <input value={contentDraft.headline2}
                  onChange={e => setContentDraft(d => ({ ...d, headline2: e.target.value }))}
                  style={{ ...inputStyle, color: '#00FF87' }} />
              </div>

              {/* Subtítulo */}
              <div>
                <label style={labelStyle}>Subtítulo</label>
                <textarea value={contentDraft.subtitle} rows={3}
                  onChange={e => setContentDraft(d => ({ ...d, subtitle: e.target.value }))}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
              </div>

              {/* Preview */}
              <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px' }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Preview</p>
                <p style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(22px,4vw,36px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
                  {contentDraft.headline1}<br />
                  <span style={{ color: '#00FF87' }}>{contentDraft.headline2}</span>
                </p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 12 }}>{contentDraft.subtitle}</p>
                <p style={{ fontFamily: 'var(--ff-display)', fontSize: 28, fontWeight: 700, color: '#00FF87' }}>USD ${contentDraft.price}</p>
              </div>

              <button onClick={saveContent} disabled={contentSaving}
                style={{ background: contentSaved ? 'rgba(0,255,135,0.15)' : 'linear-gradient(135deg,#00FF87,#00D96A)', color: contentSaved ? '#00FF87' : '#000', padding: '13px 32px', borderRadius: 10, border: contentSaved ? '1px solid rgba(0,255,135,0.4)' : 'none', fontFamily: 'var(--ff-display)', fontSize: 15, fontWeight: 800, letterSpacing: '0.05em', cursor: 'pointer', width: 'fit-content', transition: 'all 0.3s', opacity: contentSaving ? 0.6 : 1 }}>
                {contentSaving ? 'Guardando...' : contentSaved ? '✓ Guardado' : 'Guardar cambios →'}
              </button>
            </div>
          </div>
        )}

        {/* ─── TAB BENEFICIOS ─── */}
        {tab === 'benefits' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 22px', marginBottom: 4 }}>
              <p style={{ fontFamily: 'var(--ff-display)', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Lo que obtienes</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Edita los 4 beneficios que aparecen en la sección "Todo en un solo sistema".</p>
            </div>
            {benefitsDraft.map((b, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Fila 1: Ícono + Título */}
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>Ícono</label>
                    <input value={b.icon} onChange={e => setBenefitsDraft(d => d.map((x, j) => j === i ? { ...x, icon: e.target.value } : x))}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px', color: 'white', fontSize: 22, outline: 'none', boxSizing: 'border-box', textAlign: 'center' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>Título</label>
                    <input value={b.title} onChange={e => setBenefitsDraft(d => d.map((x, j) => j === i ? { ...x, title: e.target.value } : x))}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: 'white', fontSize: 14, fontWeight: 600, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                  </div>
                </div>
                {/* Fila 2: Descripción full width */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>Descripción</label>
                  <textarea rows={3} value={b.sub} onChange={e => setBenefitsDraft(d => d.map((x, j) => j === i ? { ...x, sub: e.target.value } : x))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: 'rgba(255,255,255,0.65)', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.7, boxSizing: 'border-box' }} />
                </div>
              </div>
            ))}
            <button onClick={saveBenefits} disabled={benefitsSaving}
              style={{ background: benefitsSaved ? 'rgba(0,255,135,0.15)' : 'linear-gradient(135deg,#00FF87,#00D96A)', color: benefitsSaved ? '#00FF87' : '#000', padding: '13px 32px', borderRadius: 10, border: benefitsSaved ? '1px solid rgba(0,255,135,0.4)' : 'none', fontFamily: 'var(--ff-display)', fontSize: 15, fontWeight: 800, letterSpacing: '0.05em', cursor: 'pointer', width: 'fit-content', opacity: benefitsSaving ? 0.6 : 1, transition: 'all 0.3s' }}>
              {benefitsSaving ? 'Guardando...' : benefitsSaved ? '✓ Guardado' : 'Guardar beneficios →'}
            </button>
          </div>
        )}

        {/* ─── TAB MÓDULOS ─── */}
        {tab === 'modules' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 22px', marginBottom: 4 }}>
              <p style={{ fontFamily: 'var(--ff-display)', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>6 módulos del programa</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Edita el título y descripción de cada módulo. El número no se puede cambiar.</p>
            </div>
            {modulesDraft.map((m, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 22px', display: 'grid', gridTemplateColumns: '48px 1fr', gap: '0 18px', alignItems: 'start' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 28 }}>
                  <span style={{ fontFamily: 'var(--ff-display)', fontSize: 11, fontWeight: 800, color: 'var(--green)', border: '1px solid rgba(0,255,135,0.25)', borderRadius: 6, padding: '4px 8px', background: 'rgba(0,255,135,0.06)' }}>{m.num}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>Título</label>
                    <input value={m.title} onChange={e => setModulesDraft(d => d.map((x, j) => j === i ? { ...x, title: e.target.value } : x))}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '9px 12px', color: 'white', fontSize: 14, fontWeight: 600, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>Descripción</label>
                    <textarea rows={3} value={m.desc} onChange={e => setModulesDraft(d => d.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '9px 12px', color: 'rgba(255,255,255,0.6)', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.65, boxSizing: 'border-box' }} />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={saveModules} disabled={modulesSaving}
              style={{ background: modulesSaved ? 'rgba(0,255,135,0.15)' : 'linear-gradient(135deg,#00FF87,#00D96A)', color: modulesSaved ? '#00FF87' : '#000', padding: '13px 32px', borderRadius: 10, border: modulesSaved ? '1px solid rgba(0,255,135,0.4)' : 'none', fontFamily: 'var(--ff-display)', fontSize: 15, fontWeight: 800, letterSpacing: '0.05em', cursor: 'pointer', width: 'fit-content', opacity: modulesSaving ? 0.6 : 1, transition: 'all 0.3s' }}>
              {modulesSaving ? 'Guardando...' : modulesSaved ? '✓ Guardado' : 'Guardar módulos →'}
            </button>
          </div>
        )}

        {/* ─── TAB SEGURIDAD ─── */}
        {tab === 'security' && (
          <div style={{ maxWidth: 480 }}>
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 28px' }}>
              <p style={{ fontFamily: 'var(--ff-display)', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Cambiar contraseña</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 24, lineHeight: 1.6 }}>La nueva contraseña se usará la próxima vez que inicies sesión.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>Nueva contraseña</label>
                  <input type="password" value={newPw} onChange={e => { setNewPw(e.target.value); setPwStatus('idle') }}
                    placeholder="Mínimo 6 caracteres"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${pwStatus === 'error' ? 'rgba(255,107,107,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, padding: '12px 14px', color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>Confirmar contraseña</label>
                  <input type="password" value={confirmPw} onChange={e => { setConfirmPw(e.target.value); setPwStatus('idle') }}
                    placeholder="Repite la contraseña"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${pwStatus === 'error' ? 'rgba(255,107,107,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, padding: '12px 14px', color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>
                {pwStatus === 'error' && (
                  <p style={{ fontSize: 12, color: '#FF6B6B' }}>
                    {newPw.length < 6 ? 'Mínimo 6 caracteres.' : 'Las contraseñas no coinciden.'}
                  </p>
                )}
                {pwStatus === 'ok' && (
                  <p style={{ fontSize: 12, color: '#00FF87' }}>✓ Contraseña actualizada correctamente.</p>
                )}
                <button onClick={changePassword} disabled={pwStatus === 'saving' || !newPw || !confirmPw}
                  style={{ background: pwStatus === 'ok' ? 'rgba(0,255,135,0.15)' : 'linear-gradient(135deg,#00FF87,#00D96A)', color: pwStatus === 'ok' ? '#00FF87' : '#000', padding: '13px', borderRadius: 10, border: pwStatus === 'ok' ? '1px solid rgba(0,255,135,0.4)' : 'none', fontFamily: 'var(--ff-display)', fontSize: 15, fontWeight: 800, letterSpacing: '0.05em', cursor: 'pointer', opacity: (pwStatus === 'saving' || !newPw || !confirmPw) ? 0.5 : 1, transition: 'all 0.3s' }}>
                  {pwStatus === 'saving' ? 'Guardando...' : pwStatus === 'ok' ? '✓ Actualizada' : 'Cambiar contraseña →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB RESEÑAS FIJAS ─── */}
        {tab === 'seeds' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,184,0,0.15)', borderRadius: 16, padding: '20px 24px', marginBottom: 4 }}>
              <p style={{ fontFamily: 'var(--ff-display)', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Reseñas publicadas en la página</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>Estas 6 reseñas aparecen siempre en la landing page. Edítalas y guarda los cambios.</p>
            </div>

            {seedsDraft.map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '22px 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>Nombre</label>
                    <input value={s.name} onChange={e => setSeedsDraft(d => d.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '9px 12px', color: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>País</label>
                    <input value={s.country} onChange={e => setSeedsDraft(d => d.map((x, j) => j === i ? { ...x, country: e.target.value } : x))}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '9px 12px', color: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>Calificación</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button" onClick={() => setSeedsDraft(d => d.map((x, j) => j === i ? { ...x, stars: n } : x))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill={n <= s.stars ? '#00FF87' : 'rgba(255,255,255,0.12)'} style={{ transition: 'fill 0.15s' }}>
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>Reseña</label>
                  <textarea rows={3} value={s.review} onChange={e => setSeedsDraft(d => d.map((x, j) => j === i ? { ...x, review: e.target.value } : x))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '9px 12px', color: 'rgba(255,255,255,0.7)', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.65, boxSizing: 'border-box' }} />
                </div>
              </div>
            ))}

            <button onClick={saveSeeds} disabled={seedsSaving}
              style={{ background: seedsSaved ? 'rgba(0,255,135,0.15)' : 'linear-gradient(135deg,#00FF87,#00D96A)', color: seedsSaved ? '#00FF87' : '#000', padding: '13px 32px', borderRadius: 10, border: seedsSaved ? '1px solid rgba(0,255,135,0.4)' : 'none', fontFamily: 'var(--ff-display)', fontSize: 15, fontWeight: 800, letterSpacing: '0.05em', cursor: 'pointer', width: 'fit-content', transition: 'all 0.3s', opacity: seedsSaving ? 0.6 : 1 }}>
              {seedsSaving ? 'Guardando...' : seedsSaved ? '✓ Guardado' : 'Guardar reseñas →'}
            </button>
          </div>
        )}

        {/* ─── TAB RESEÑAS ─── */}
        {tab !== 'content' && tab !== 'seeds' && tab !== 'security' && tab !== 'benefits' && tab !== 'modules' && (
          <>
            {visible.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(255,255,255,0.25)', fontSize: 14 }}>
                No hay reseñas en esta categoría.
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {visible.map(r => {
                const sc = SC[r.status]
                const isEditing = editingId === r.id
                const isDeleting = deleteConfirm === r.id

                return (
                  <div key={r.id} style={{
                    background: 'rgba(255,255,255,0.025)',
                    border: `1px solid ${r.status === 'approved' ? 'rgba(0,255,135,0.2)' : r.status === 'rejected' ? 'rgba(255,107,107,0.18)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 14, padding: '22px 24px',
                  }}>
                    {/* Top */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 15 }}>{r.name}</p>
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{r.country}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Stars rating={r.rating} />
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                            {new Date(r.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <span style={{ padding: '5px 14px', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text, flexShrink: 0 }}>
                        {SL[r.status]}
                      </span>
                    </div>

                    {/* Texto / modo edición */}
                    {isEditing ? (
                      <div style={{ marginBottom: 16 }}>
                        <textarea value={editText} rows={4}
                          onChange={e => setEditText(e.target.value)}
                          style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(0,255,135,0.3)', borderRadius: 10, padding: '11px 14px', color: 'white', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.65, boxSizing: 'border-box' }} />
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                          <button onClick={() => updateReview(r.id, { review: editText })} disabled={busy === r.id}
                            style={{ padding: '8px 20px', background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.35)', borderRadius: 8, color: '#00FF87', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                            {busy === r.id ? '...' : '✓ Guardar'}
                          </button>
                          <button onClick={() => setEditingId(null)}
                            style={{ padding: '8px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer' }}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: 16, borderLeft: '2px solid rgba(0,255,135,0.15)', paddingLeft: 14 }}>
                        {r.review}
                      </p>
                    )}

                    {/* Confirmación eliminar */}
                    {isDeleting && (
                      <div style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: 10, padding: '14px 18px', marginBottom: 14 }}>
                        <p style={{ fontSize: 13, color: '#FF6B6B', marginBottom: 12 }}>¿Eliminar esta reseña permanentemente?</p>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => deleteReview(r.id)} disabled={busy === r.id}
                            style={{ padding: '8px 20px', background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.4)', borderRadius: 8, color: '#FF6B6B', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                            {busy === r.id ? '...' : 'Sí, eliminar'}
                          </button>
                          <button onClick={() => setDeleteConfirm(null)}
                            style={{ padding: '8px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer' }}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Acciones */}
                    {!isEditing && !isDeleting && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {r.status === 'pending' && (
                          <>
                            <button onClick={() => updateReview(r.id, { status: 'approved' })} disabled={busy === r.id}
                              style={{ padding: '9px 22px', background: 'rgba(0,255,135,0.08)', border: '1px solid rgba(0,255,135,0.3)', borderRadius: 8, color: '#00FF87', fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: busy === r.id ? 0.5 : 1 }}>
                              ✓ Aprobar
                            </button>
                            <button onClick={() => updateReview(r.id, { status: 'rejected' })} disabled={busy === r.id}
                              style={{ padding: '9px 22px', background: 'rgba(255,107,107,0.07)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: 8, color: '#FF6B6B', fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: busy === r.id ? 0.5 : 1 }}>
                              ✕ Rechazar
                            </button>
                          </>
                        )}
                        {r.status !== 'pending' && (
                          <button onClick={() => updateReview(r.id, { status: r.status === 'approved' ? 'rejected' : 'approved' })} disabled={busy === r.id}
                            style={{ padding: '7px 18px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.35)', fontSize: 12, cursor: 'pointer' }}>
                            {r.status === 'approved' ? '✕ Rechazar' : '✓ Aprobar'}
                          </button>
                        )}
                        <button onClick={() => { setEditingId(r.id); setEditText(r.review) }}
                          style={{ padding: '7px 18px', background: 'rgba(255,184,0,0.07)', border: '1px solid rgba(255,184,0,0.2)', borderRadius: 8, color: '#FFB800', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                          ✎ Editar
                        </button>
                        <button onClick={() => setDeleteConfirm(r.id)}
                          style={{ padding: '7px 18px', background: 'rgba(255,107,107,0.06)', border: '1px solid rgba(255,107,107,0.18)', borderRadius: 8, color: '#FF6B6B', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                          🗑 Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
