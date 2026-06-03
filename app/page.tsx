'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const HOTMART_LINK    = 'https://pay.hotmart.com/Q106062471M'
const INSTAGRAM_LINK  = 'https://www.instagram.com/davidgualdronn'
const YOUTUBE_LINK    = 'https://www.youtube.com/@davidgualdrontrader'

// Energía del audio compartida entre VideoPlayer y StarField
let gAudioEnergy = 0
let gAudioBeat   = 0

// ─── ÍCONOS SOCIALES ─────────────────────────────────────────────────────────
function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  )
}

function YouTubeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

// ─── ÍCONO ────────────────────────────────────────────────────────────────────
function TradingIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <polyline points="2,24 8,14 13,18 20,8 26,12 30,6" stroke="#00FF87" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="24,6 30,6 30,12" stroke="#00FF87" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── STAR FIELD ───────────────────────────────────────────────────────────────
function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const isMobile = window.innerWidth < 768
    const sparks = Array.from({ length: isMobile ? 22 : 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.1 + 0.15,
      baseVy: -(Math.random() * 0.2 + 0.04),
      vy: 0,
      vx: 0,
      opacity: Math.random() * 0.45 + 0.08,
      pulse: Math.random() * Math.PI * 2,
    }))

    type SmokeP = {
      x: number; y: number; vx: number; vy: number
      life: number; decay: number; r: number
      kind: 0 | 1 | 2
    }

    const VX0 = 0.08, VX1 = 0.92
    const VY0 = 0.20, VY1 = 0.68

    const spawnSmoke = (): SmokeP => {
      const side = Math.floor(Math.random() * 4)
      let x = 0, y = 0, vx = 0, vy = 0
      const spd = Math.random() * 0.38 + 0.12
      if (side === 0) {
        x = canvas.width  * (VX0 + Math.random() * (VX1 - VX0))
        y = canvas.height * VY0
        vx = (Math.random() - 0.5) * 0.18; vy = -spd
      } else if (side === 1) {
        x = canvas.width  * (VX0 + Math.random() * (VX1 - VX0))
        y = canvas.height * VY1
        vx = (Math.random() - 0.5) * 0.18; vy = spd
      } else if (side === 2) {
        x = canvas.width  * VX0
        y = canvas.height * (VY0 + Math.random() * (VY1 - VY0))
        vx = -spd; vy = (Math.random() - 0.5) * 0.18
      } else {
        x = canvas.width  * VX1
        y = canvas.height * (VY0 + Math.random() * (VY1 - VY0))
        vx = spd;  vy = (Math.random() - 0.5) * 0.18
      }
      const kind = Math.random() < 0.40 ? 0 : Math.random() < 0.55 ? 1 : 2
      const baseR = kind === 0 ? Math.random() * 0.8 + 0.3
                  : kind === 1 ? Math.random() * 1.2 + 1.2
                  :              Math.random() * 2.5 + 2.5
      return { x, y, vx, vy, life: Math.random(), decay: Math.random() * 0.004 + 0.0015, r: baseR, kind }
    }

    const smoke: SmokeP[] = Array.from({ length: isMobile ? 16 : 44 }, spawnSmoke)

    const nodes = Array.from({ length: isMobile ? 10 : 24 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.8,
      opacity: Math.random() * 0.6 + 0.3,
      pulse: Math.random() * Math.PI * 2,
    }))

    const ATTRACT_DIST = 180
    const REPEL_DIST   = 45
    const MAX_SPEED    = 0.55

    // Throttle a 30fps para no saturar el hilo principal
    const FRAME_MS = 1000 / 30
    let lastFrame = 0

    const draw = (ts: number) => {
      animId = requestAnimationFrame(draw)
      if (ts - lastFrame < FRAME_MS) return
      lastFrame = ts
      if (document.hidden) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const t = performance.now() / 1000

      const videoCX = canvas.width * 0.5
      const buttonX = canvas.width * 0.5
      const buttonY = canvas.height * 0.83

      const energy = gAudioEnergy
      const beat   = gAudioBeat
      gAudioBeat = Math.max(0, gAudioBeat - 0.04)

      nodes.forEach(n => {
        let fx = 0, fy = 0
        nodes.forEach(m => {
          if (n === m) return
          const dx = m.x - n.x
          const dy = m.y - n.y
          const d  = Math.sqrt(dx * dx + dy * dy)
          if (d < REPEL_DIST && d > 0) {
            fx -= (dx / d) * 0.004
            fy -= (dy / d) * 0.004
          } else if (d < ATTRACT_DIST && d > 0) {
            fx += (dx / d) * 0.0006 * (1 - d / ATTRACT_DIST)
            fy += (dy / d) * 0.0006 * (1 - d / ATTRACT_DIST)
          }
        })
        const dbx = buttonX - n.x
        const dby = buttonY - n.y
        const db  = Math.sqrt(dbx * dbx + dby * dby)
        if (db > 70) { fx += (dbx / db) * 0.00045; fy += (dby / db) * 0.00045 }
        if (beat > 0.3) { fx += (Math.random() - 0.5) * beat * 0.06; fy += (Math.random() - 0.5) * beat * 0.06 }
        const maxSpd = MAX_SPEED * (1 + energy * 1.4)
        n.vx = (n.vx + fx) * 0.985
        n.vy = (n.vy + fy) * 0.985
        const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy)
        if (spd > maxSpd) { n.vx = n.vx / spd * maxSpd; n.vy = n.vy / spd * maxSpd }
        n.x += n.vx; n.y += n.vy
        if (n.x < 0) n.x = canvas.width
        if (n.x > canvas.width) n.x = 0
        if (n.y < 0) n.y = canvas.height
        if (n.y > canvas.height) n.y = 0
      })

      sparks.forEach(s => {
        s.vy = s.baseVy * (1 + energy * 2.5 + beat * 1.5)
        s.vx += (videoCX - s.x) * 0.0003
        s.vx *= 0.96
        s.x  += s.vx
        s.y  += s.vy
        if (s.y < -4) { s.y = canvas.height + 4; s.x = Math.random() * canvas.width; s.vx = 0 }
        const a = s.opacity * (0.55 + 0.45 * Math.sin(t * 1.3 + s.pulse)) * (1 + energy * 0.8)
        const r = s.r * (1 + beat * 0.5)
        ctx.beginPath()
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,255,135,${Math.min(a, 1)})`
        ctx.fill()
      })

      smoke.forEach(p => {
        p.vx += (Math.random() - 0.5) * 0.028
        p.vx *= 0.97
        p.vy *= 0.99
        p.x  += p.vx
        p.y  += p.vy
        p.life -= p.decay
        if (p.life <= 0) { Object.assign(p, spawnSmoke()) }

        if (p.kind === 0) {
          const a = p.life * 0.75
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(0,255,135,${a})`
          ctx.fill()
        } else if (p.kind === 1) {
          const a = p.life * 0.55
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(0,255,135,${a})`
          ctx.fill()
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r * 3.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(0,255,135,${a * 0.12})`
          ctx.fill()
        } else {
          const a = p.life * 0.13
          const radius = p.r * (1 + (1 - p.life) * 2.2)
          ctx.beginPath()
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(0,255,135,${a})`
          ctx.fill()
        }
      })

      nodes.forEach(n => {
        const a = n.opacity * (0.6 + 0.4 * Math.sin(t * 0.9 + n.pulse)) * (1 + energy * 0.6)
        const r = n.r * (1 + beat * 0.3)
        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,255,135,${Math.min(a, 1)})`
        ctx.fill()
        ctx.beginPath()
        ctx.arc(n.x, n.y, r * 3.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,255,135,${Math.min(a * 0.06 + beat * 0.04, 0.3)})`
        ctx.fill()
      })

    }
    animId = requestAnimationFrame(draw)

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />
}

// ─── PRICE COUNTER ────────────────────────────────────────────────────────────
function PriceCounter({ targetPrice = 199 }: { targetPrice?: number }) {
  const [val, setVal] = useState(499)
  const [done, setDone] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    started.current = false
    setVal(499)
    setDone(false)
  }, [targetPrice])

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const t0 = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - t0) / 1400, 1)
          setVal(Math.round(499 + (targetPrice - 499) * (1 - Math.pow(1 - p, 3))))
          if (p < 1) requestAnimationFrame(tick)
          else setDone(true)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.4 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [targetPrice])

  return (
    <div ref={ref}>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', letterSpacing: '0.08em', marginBottom: 4 }}>
        USD $499
      </p>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 4 }}>
        <span style={{ fontFamily: 'var(--ff-display)', fontSize: 20, fontWeight: 700, marginTop: 10, color: done ? 'var(--green)' : 'var(--orange)', transition: 'color 0.5s' }}>USD $</span>
        <span style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(64px,12vw,96px)', fontWeight: 700, lineHeight: 1, color: done ? 'var(--green)' : 'var(--orange)', transition: 'color 0.5s' }}>
          {val}
        </span>
      </div>
      {done && (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
          Precio de lanzamiento · Plazas limitadas
        </motion.p>
      )}
    </div>
  )
}

// ─── VIDEO PLAYER ─────────────────────────────────────────────────────────────
function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)  // autoplay funcionó
  const [soundOn, setSoundOn] = useState(false)  // usuario activó sonido

  const activate = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = false
    if (!playing) video.play().catch(() => {})
    setSoundOn(true)
  }

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 14, padding: '1.5px', background: 'rgba(0,255,135,0.04)' }}>
      <div style={{
        position: 'absolute', inset: -1, borderRadius: 15, zIndex: 2,
        border: '1.5px solid rgba(0,255,135,0.35)',
        boxShadow: '0 0 16px rgba(0,255,135,0.22), 0 0 60px rgba(0,255,135,0.06)',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden', background: '#080808' }}>
        <video
          ref={videoRef}
          src="/video_web.mp4"
          loop playsInline muted autoPlay preload="auto"
          onPlay={() => setPlaying(true)}
          controls={soundOn}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />

        {/* Desktop: video autoplaying muted → botón activar sonido */}
        {!soundOn && playing && (
          <button onClick={activate} style={{
            position: 'absolute', bottom: 14, right: 14, zIndex: 3,
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(0,255,135,0.7)',
            borderRadius: 100, padding: '8px 16px', cursor: 'pointer',
            animation: 'ctaGlow 2s ease-in-out infinite',
            boxShadow: '0 0 24px rgba(0,255,135,0.4)',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00FF87" strokeWidth="2.2" strokeLinecap="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
            <span style={{ color: '#00FF87', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em' }}>Activar sonido</span>
          </button>
        )}

        {/* Mobile: video no arranca solo → botón verde de play */}
        {!soundOn && !playing && (
          <button onClick={activate} style={{
            position: 'absolute', inset: 0, zIndex: 3,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.35)', border: 'none', cursor: 'pointer', width: '100%',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg,#00FF87,#00D96A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 48px rgba(0,255,135,0.65), 0 0 0 12px rgba(0,255,135,0.12)',
              animation: 'ctaGlow 2s ease-in-out infinite',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#000">
                <polygon points="6,3 20,12 6,21"/>
              </svg>
            </div>
          </button>
        )}
      </div>
    </div>
  )
}

// ─── REVEAL ───────────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

// ─── SEED REVIEWS ─────────────────────────────────────────────────────────────
const SEED_REVIEWS = [
  { name: 'Carlos Mendoza',   country: 'Colombia', initials: 'CM', color: '#00FF87', stars: 4,
    review: 'Llevaba año y medio operando a pérdida sin entender qué fallaba. Con este curso aprendí a leer la estructura del mercado y mis resultados cambiaron por completo en pocas semanas. El módulo de Price Action es oro puro.' },
  { name: 'Valentina Ríos',   country: 'México',   initials: 'VR', color: '#00D4FF', stars: 5,
    review: 'Lo que más me impactó fue el módulo de gestión de riesgo. Antes arriesgaba el 20% de la cuenta sin pensarlo. Ahora tengo reglas claras y he crecido de forma consistente mes a mes. Totalmente recomendado.' },
  { name: 'Andrés Parra',     country: 'Colombia', initials: 'AP', color: '#FFB800', stars: 5,
    review: 'Las sesiones en vivo valen todo. Ver a David analizar el mercado en tiempo real mientras explica cada decisión no lo encuentras en ningún otro curso. Aprendí más en un mes que leyendo libros en un año.' },
  { name: 'Laura Gómez',      country: 'Panamá',   initials: 'LG', color: '#FF6B6B', stars: 4,
    review: 'Al principio me costó entender el Price Action, no voy a mentir. Pero David tiene mucha paciencia y el material está muy bien organizado. Le daría 5 estrellas si hubiera más contenido sobre criptos, pero igual lo recomiendo.' },
  { name: 'Miguel Torres',    country: 'México',   initials: 'MT', color: '#B45FFF', stars: 4,
    review: 'Tenía conocimientos técnicos pero perdía por mis emociones. El módulo de psicología del trading fue exactamente lo que necesitaba. Hoy opero con una calma y disciplina que antes simplemente no tenía.' },
  { name: 'Daniela Vargas',   country: 'Colombia', initials: 'DV', color: '#00FF87', stars: 5,
    review: 'Soy abogada y no tenía ningún conocimiento previo de mercados. El curso me llevó de cero a operar con confianza en 3 meses. David explica todo muy claro y el acompañamiento es real, no solo videos grabados.' },
]

// ─── STAR SELECTOR ────────────────────────────────────────────────────────────
function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button" onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
          <svg width="28" height="28" viewBox="0 0 24 24"
            fill={(hover || value) >= s ? '#00FF87' : 'rgba(255,255,255,0.1)'} style={{ transition: 'fill 0.15s' }}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </button>
      ))}
    </div>
  )
}

// ─── REVIEW FORM ──────────────────────────────────────────────────────────────
function ReviewForm() {
  const [name, setName]     = useState('')
  const [country, setCountry] = useState('')
  const [rating, setRating] = useState(0)
  const [text, setText]     = useState('')
  const [status, setStatus] = useState<'idle'|'sending'|'success'|'error'>('idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating) return
    setStatus('sending')
    try {
      const res = await fetch('/api/submit-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, country, rating, review: text }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') return (
    <div style={{ textAlign: 'center', padding: '32px 20px' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,255,135,0.1)', border: '1.5px solid rgba(0,255,135,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00FF87" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <p style={{ fontFamily: 'var(--ff-display)', fontSize: 18, fontWeight: 700, color: 'var(--green)', marginBottom: 8 }}>¡Gracias por tu reseña!</p>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>La revisaremos y la publicaremos pronto.</p>
    </div>
  )

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '11px 14px', color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)',
    display: 'block', marginBottom: 8, textTransform: 'uppercase',
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Nombre</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: María R." required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>País</label>
          <input value={country} onChange={e => setCountry(e.target.value)} placeholder="Ej: Colombia" required style={inputStyle} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Calificación</label>
        <StarSelector value={rating} onChange={setRating} />
        {!rating && status !== 'idle' && <p style={{ fontSize: 11, color: '#FF6B6B', marginTop: 4 }}>Selecciona una calificación</p>}
      </div>
      <div>
        <label style={labelStyle}>Tu experiencia</label>
        <textarea value={text} onChange={e => setText(e.target.value)} required rows={4}
          placeholder="Cuéntanos cómo fue tu experiencia con el curso..."
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} />
      </div>
      <button type="submit" disabled={status === 'sending' || !rating}
        style={{ background: 'linear-gradient(135deg,#00FF87,#00D96A)', color: '#000', padding: '14px', borderRadius: 10, border: 'none', fontFamily: 'var(--ff-display)', fontSize: 15, fontWeight: 800, letterSpacing: '0.05em', cursor: 'pointer', opacity: (status === 'sending' || !rating) ? 0.55 : 1, transition: 'opacity 0.2s' }}>
        {status === 'sending' ? 'Enviando...' : 'Enviar reseña →'}
      </button>
      {status === 'error' && <p style={{ textAlign: 'center', fontSize: 13, color: '#FF6B6B' }}>Algo salió mal. Por favor intenta de nuevo.</p>}
    </form>
  )
}

// ─── CTA BUTTON ───────────────────────────────────────────────────────────────
function CtaButton({ text, fullWidth = false }: { text: string; fullWidth?: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <a href={HOTMART_LINK} target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: fullWidth ? 'flex' : 'inline-flex',
        alignItems: 'center', justifyContent: 'center', gap: 12,
        width: fullWidth ? '100%' : 'auto',
        background: hov
          ? 'linear-gradient(135deg, #00FF87 0%, #00FF6A 50%, #00E060 100%)'
          : 'linear-gradient(135deg, #00FF87 0%, #00D96A 100%)',
        color: '#000000',
        padding: '22px 72px',
        fontFamily: 'var(--ff-display)', fontSize: 18, fontWeight: 800,
        letterSpacing: '0.07em', textTransform: 'uppercase',
        textDecoration: 'none', borderRadius: 14,
        transform: hov ? 'translateY(-4px) scale(1.03)' : 'translateY(0) scale(1)',
        boxShadow: hov
          ? '0 28px 72px rgba(0,255,135,0.6), 0 0 0 5px rgba(0,255,135,0.15)'
          : '0 10px 48px rgba(0,255,135,0.45)',
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
        animation: hov ? 'none' : 'ctaGlow 2.5s ease-in-out infinite',
        position: 'relative',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </a>
  )
}

// ─── COUNTDOWN BANNER ────────────────────────────────────────────────────────
function CountdownBanner({ message, endDate, badge }: { message: string; endDate: string; badge: string }) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0, expired: false })

  useEffect(() => {
    const tick = () => {
      const diff = new Date(endDate).getTime() - Date.now()
      if (diff <= 0) { setTime({ h: 0, m: 0, s: 0, expired: true }); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTime({ h, m, s, expired: false })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endDate])

  if (time.expired) return null

  const pad = (n: number) => String(n).padStart(2, '0')
  const unit = (n: number, label: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 38 }}>
      <span style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(18px,3.5vw,24px)', fontWeight: 800, lineHeight: 1, color: '#000' }}>{pad(n)}</span>
      <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', marginTop: 2 }}>{label}</span>
    </div>
  )
  const sep = <span style={{ fontFamily: 'var(--ff-display)', fontSize: 22, fontWeight: 800, color: 'rgba(0,0,0,0.4)', marginTop: -4 }}>:</span>

  return (
    <div style={{ background: 'linear-gradient(90deg,#00FF87,#00D96A)', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(10px,3vw,28px)', flexWrap: 'wrap', position: 'relative', zIndex: 101 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ background: 'rgba(0,0,0,0.12)', borderRadius: 100, padding: '3px 12px', fontSize: 11, fontWeight: 700, color: '#000', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{badge}</span>
        <span style={{ fontSize: 'clamp(12px,2vw,14px)', fontWeight: 700, color: '#000', letterSpacing: '0.02em' }}>{message}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.35)', borderRadius: 10, padding: '6px 14px' }}>
        {unit(time.h, 'hrs')} {sep} {unit(time.m, 'min')} {sep} {unit(time.s, 'seg')}
      </div>
      <a href={HOTMART_LINK} target="_blank" rel="noopener noreferrer"
        style={{ background: '#000', color: '#00FF87', padding: '7px 18px', borderRadius: 8, fontFamily: 'var(--ff-display)', fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', textDecoration: 'none', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        Aprovechar →
      </a>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
type Benefit = { icon: string; title: string; sub: string }
type Module  = { num: string; title: string; desc: string }
type SiteContent = { price: string; headline1: string; headline2: string; subtitle: string; benefits: Benefit[]; modules: Module[] }
const CONTENT_DEFAULTS: SiteContent = {
  price: '199', headline1: 'Opera los mercados', headline2: 'con método real',
  subtitle: 'Aprende a operar los mercados financieros con estrategia, disciplina y gestión profesional del riesgo, incluso si empiezas desde cero.',
  benefits: [
    { icon: '📈', title: '6 años de experiencia',  sub: 'Trader profesional especializado en Forex, divisas y oro' },
    { icon: '🛡️', title: 'Gestión de riesgo',      sub: 'Protege tu capital con metodología disciplinada y probada' },
    { icon: '🎯', title: 'Price Action real',       sub: 'Lee el mercado como los traders institucionales' },
    { icon: '🔴', title: 'Sesiones en vivo',        sub: 'Acompañamiento real con análisis del mercado en tiempo real' },
  ],
  modules: [
    { num: '01', title: 'Fundamentos del Trading Profesional',    desc: 'Introducción completa al mundo del trading, conceptos esenciales, funcionamiento del mercado Forex, pares de divisas, sesiones de mercado y mentalidad correcta para iniciar.' },
    { num: '02', title: 'Price Action y Lectura del Mercado',      desc: 'Aprende a interpretar gráficos como un trader profesional, identificar estructuras del mercado, zonas clave, soportes, resistencias y movimientos institucionales.' },
    { num: '03', title: 'Trading en Oro (XAU/USD) y Divisas',     desc: 'Estrategias específicas para operar oro y pares de divisas con alta precisión, entendiendo comportamiento, volatilidad y mejores oportunidades de entrada.' },
    { num: '04', title: 'Gestión de Riesgo Profesional',          desc: 'Uno de los pilares más importantes del curso. Aprende a proteger capital, calcular lotajes, controlar pérdidas y operar con disciplina.' },
    { num: '05', title: 'Psicología del Trading y Control Emocional', desc: 'Acompañamiento psicológico enfocado en mentalidad, control emocional, toma de decisiones, manejo del miedo, ansiedad y sobreoperación.' },
    { num: '06', title: 'Trading en Vivo + Ejecución Real',       desc: 'Sesiones en vivo con análisis del mercado en tiempo real, explicación de entradas, salidas y toma de decisiones reales.' },
  ],
}

export default function Home() {
  const [navSolid, setNavSolid] = useState(false)
  const [dynamicReviews, setDynamicReviews] = useState<any[]>([])
  const [siteContent, setSiteContent] = useState<SiteContent>(CONTENT_DEFAULTS)
  const [seedOverrides, setSeedOverrides] = useState<any[] | null>(null)
  useEffect(() => {
    fetch('/api/page-data').then(r => r.json()).then(d => {
      if (d.content)    setSiteContent(d.content)
      if (d.reviews)    setDynamicReviews(d.reviews)
      if (d.seedReviews) setSeedOverrides(d.seedReviews)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const h = () => setNavSolid(window.scrollY > 60)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const BENEFITS = siteContent.benefits
  const MODULES  = siteContent.modules

  return (
    <>
      <style>{`
        @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes borderSpin {
          0%   { transform: translate(-50%,-50%) rotate(0deg);   opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translate(-50%,-50%) rotate(360deg); opacity: 0; }
        }
        @keyframes pulseRing {
          0%,100% { opacity: 0.8; }
          50%      { opacity: 0.2; }
        }
        @keyframes ctaGlow {
          0%,100% { box-shadow: 0 10px 48px rgba(0,255,135,0.45); }
          50%      { box-shadow: 0 10px 72px rgba(0,255,135,0.75), 0 0 100px rgba(0,255,135,0.18); }
        }
        .module-card:hover { border-color: rgba(0,255,135,0.28) !important; background: rgba(0,255,135,0.035) !important; box-shadow: inset 3px 0 0 0 rgba(0,255,135,0.55), 0 8px 40px rgba(0,255,135,0.06) !important; }
        .benefit-card:hover { border-color: rgba(0,255,135,0.28) !important; box-shadow: inset 0 3px 0 0 rgba(0,255,135,0.55), 0 8px 30px rgba(0,255,135,0.07) !important; background: rgba(0,255,135,0.04) !important; }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 10, background: navSolid ? 'rgba(6,6,6,0.96)' : 'transparent', backdropFilter: navSolid ? 'blur(16px)' : 'none', borderBottom: navSolid ? '1px solid rgba(255,255,255,0.06)' : 'none', transition: 'all 0.4s' }}>
        <TradingIcon />
        <span style={{ fontFamily: 'var(--ff-display)', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase' }}>David Trader Academy</span>
        <a
          href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer"
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700, letterSpacing: '0.03em', padding: '9px 18px', borderRadius: 100, border: '1px solid rgba(225,48,108,0.4)', background: 'rgba(225,48,108,0.12)', transition: 'all 0.2s', boxShadow: '0 0 18px rgba(225,48,108,0.15)' }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'rgba(225,48,108,0.22)'; el.style.borderColor = 'rgba(225,48,108,0.7)'; el.style.boxShadow = '0 0 28px rgba(225,48,108,0.35)' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'rgba(225,48,108,0.12)'; el.style.borderColor = 'rgba(225,48,108,0.4)'; el.style.boxShadow = '0 0 18px rgba(225,48,108,0.15)' }}
        >
          <InstagramIcon size={16} />
          @davidgualdronn
        </a>
      </nav>

      {/* ══════════════ HERO ══════════════ */}
      <section style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '72px 20px 60px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: '#060606' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'linear-gradient(160deg, #060606 0%, #080e08 50%, #060606 100%)', backgroundSize: '300% 300%', animation: 'gradientShift 18s ease infinite' }} />
        {/* dot grid */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', backgroundImage: 'radial-gradient(rgba(0,255,135,0.055) 1px, transparent 1px)', backgroundSize: '32px 32px', maskImage: 'radial-gradient(ellipse 90% 65% at 50% 25%, black 20%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 90% 65% at 50% 25%, black 20%, transparent 100%)' }} />
        <StarField />
        <div style={{ position: 'absolute', bottom: -60, left: '50%', transform: 'translateX(-50%)', width: '90%', height: 400, background: 'radial-gradient(ellipse at bottom, rgba(0,255,135,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />

        <motion.div
          style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 820, paddingTop: 12 }}
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15, delayChildren: 0.05 } } }}
        >
          {/* eyebrow */}
          <motion.p
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16,1,0.3,1] } } }}
            style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 20 }}
          >
            David Trader Academy
          </motion.p>

          {/* headline */}
          <motion.h1
            variants={{ hidden: { opacity: 0, y: 40, filter: 'blur(12px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.16,1,0.3,1] } } }}
            style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(38px,8.5vw,76px)', fontWeight: 700, lineHeight: 1.06, marginBottom: 18, letterSpacing: '-0.02em' }}
          >
            {siteContent.headline1}<br />
            <span style={{ background: 'linear-gradient(90deg,#00FF87,#00CC6A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {siteContent.headline2}
            </span>
          </motion.h1>

          {/* subtítulo */}
          <motion.p
            variants={{ hidden: { opacity: 0, y: 20, filter: 'blur(6px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.16,1,0.3,1] } } }}
            style={{ fontSize: 'clamp(15px,2.5vw,17px)', color: 'rgba(255,255,255,0.45)', maxWidth: 480, lineHeight: 1.75, margin: '0 auto 40px' }}
          >
            {siteContent.subtitle}
          </motion.p>

          {/* VIDEO */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 48, scale: 0.95, filter: 'blur(8px)' }, visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 1.0, ease: [0.16,1,0.3,1] } } }}
            style={{ marginBottom: 36 }}
          >
            <VideoPlayer />
          </motion.div>

          {/* CTA */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16,1,0.3,1] } } }}
          >
            <CtaButton text="Acceder al curso →" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
              {['Pago 100% seguro', 'Acceso inmediato', 'Plataforma Hotmart'].map((t, i, arr) => (
                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>{t}</span>
                  {i < arr.length - 1 && <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 10 }}>·</span>}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════ STATS ══════════════ */}
      <section style={{ background: 'rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,255,135,0.4), transparent)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,255,135,0.15), transparent)' }} />
        <div className="stats-grid" style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', padding: '0 20px' }}>
          {[['150+', 'Traders formados'], ['6+', 'Años de experiencia'], ['6', 'Módulos profesionales']].map(([n, l], i) => (
            <div key={i} style={{ textAlign: 'center', padding: '36px 12px', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <p className="stat-num" style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(28px,5vw,42px)', fontWeight: 700, color: 'var(--green)', lineHeight: 1 }}>{n}</p>
              <div style={{ width: 22, height: 2, background: 'linear-gradient(90deg,var(--green),var(--green2))', borderRadius: 1, margin: '10px auto 9px' }} />
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ INSTAGRAM ══════════════ */}
      <section style={{ padding: 'clamp(56px,8vw,88px) 20px', background: 'var(--black2)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(225,48,108,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Reveal>
            <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(225,48,108,0.8)', marginBottom: 32 }}>Comunidad activa</p>
          </Reveal>
          <Reveal delay={0.1}>
            <a
              href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 32, padding: 'clamp(28px,4vw,44px) clamp(24px,5vw,52px)', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(225,48,108,0.22)', borderRadius: 20, textDecoration: 'none', flexWrap: 'wrap', transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s', boxShadow: '0 4px 40px rgba(225,48,108,0.06)' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'rgba(225,48,108,0.07)'; el.style.borderColor = 'rgba(225,48,108,0.4)'; el.style.boxShadow = '0 8px 60px rgba(225,48,108,0.18)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'rgba(255,255,255,0.025)'; el.style.borderColor = 'rgba(225,48,108,0.22)'; el.style.boxShadow = '0 4px 40px rgba(225,48,108,0.06)' }}
            >
              {/* Avatar con borde degradado Instagram */}
              <div style={{ flexShrink: 0, width: 'clamp(72px,10vw,96px)', height: 'clamp(72px,10vw,96px)', borderRadius: '50%', background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', padding: 3 }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E1306C' }}>
                  <InstagramIcon size={36} />
                </div>
              </div>

              {/* Texto */}
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <p style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(20px,3.5vw,28px)', fontWeight: 800, color: 'white', letterSpacing: '-0.01em' }}>@davidgualdronn</p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(225,48,108,0.12)', border: '1px solid rgba(225,48,108,0.28)', borderRadius: 100, padding: '4px 12px', fontSize: 11, fontWeight: 600, color: 'rgba(225,48,108,0.9)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#E1306C', display: 'inline-block' }} /> Instagram
                  </span>
                </div>
                <p style={{ fontSize: 'clamp(13px,2vw,15px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: 420 }}>
                  Análisis de mercado diario, señales en vivo, estrategias y el detrás de cámara de un trader profesional
                </p>
              </div>

              {/* Botón */}
              <div className="social-cta-wrap">
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg,#f09433 0%,#dc2743 50%,#bc1888 100%)', color: 'white', padding: 'clamp(13px,2vw,16px) clamp(22px,3vw,36px)', fontFamily: 'var(--ff-display)', fontSize: 'clamp(13px,1.8vw,15px)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', borderRadius: 12, boxShadow: '0 8px 32px rgba(225,48,108,0.35)', whiteSpace: 'nowrap' }}>
                  <InstagramIcon size={16} /> Seguir ahora
                </div>
              </div>
            </a>
          </Reveal>
        </div>
      </section>

      {/* ══════════════ YOUTUBE ══════════════ */}
      <section style={{ padding: 'clamp(56px,8vw,88px) 20px', background: 'var(--black)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(255,0,0,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Reveal>
            <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,68,68,0.85)', marginBottom: 32 }}>Contenido gratuito</p>
          </Reveal>
          <Reveal delay={0.1}>
            <a
              href={YOUTUBE_LINK} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 32, padding: 'clamp(28px,4vw,44px) clamp(24px,5vw,52px)', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,68,68,0.22)', borderRadius: 20, textDecoration: 'none', flexWrap: 'wrap', transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s', boxShadow: '0 4px 40px rgba(255,68,68,0.06)' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'rgba(255,68,68,0.07)'; el.style.borderColor = 'rgba(255,68,68,0.4)'; el.style.boxShadow = '0 8px 60px rgba(255,68,68,0.18)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'rgba(255,255,255,0.025)'; el.style.borderColor = 'rgba(255,68,68,0.22)'; el.style.boxShadow = '0 4px 40px rgba(255,68,68,0.06)' }}
            >
              {/* Avatar YouTube */}
              <div style={{ flexShrink: 0, width: 'clamp(72px,10vw,96px)', height: 'clamp(72px,10vw,96px)', borderRadius: '50%', background: 'linear-gradient(135deg,#FF0000,#CC0000)', padding: 3 }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF4444' }}>
                  <YouTubeIcon size={36} />
                </div>
              </div>

              {/* Texto */}
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <p style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(20px,3.5vw,28px)', fontWeight: 800, color: 'white', letterSpacing: '-0.01em' }}>David Trader Academy</p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,68,68,0.12)', border: '1px solid rgba(255,68,68,0.28)', borderRadius: 100, padding: '4px 12px', fontSize: 11, fontWeight: 600, color: 'rgba(255,68,68,0.9)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF4444', display: 'inline-block' }} /> YouTube
                  </span>
                </div>
                <p style={{ fontSize: 'clamp(13px,2vw,15px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: 420 }}>
                  Clases gratuitas de trading, análisis de mercado y estrategias reales — conoce la metodología antes de comprar
                </p>
              </div>

              {/* Botón */}
              <div className="social-cta-wrap">
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg,#FF0000 0%,#CC0000 100%)', color: 'white', padding: 'clamp(13px,2vw,16px) clamp(22px,3vw,36px)', fontFamily: 'var(--ff-display)', fontSize: 'clamp(13px,1.8vw,15px)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', borderRadius: 12, boxShadow: '0 8px 32px rgba(255,0,0,0.35)', whiteSpace: 'nowrap' }}>
                  <YouTubeIcon size={16} /> Ver canal
                </div>
              </div>
            </a>
          </Reveal>
        </div>
      </section>

      {/* ══════════════ BENEFICIOS ══════════════ */}
      <section style={{ padding: 'clamp(56px,8vw,100px) 20px', background: 'var(--black)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(rgba(0,255,135,0.035) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Reveal>
            <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 16 }}>Lo que obtienes</p>
            <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(28px,5vw,48px)', fontWeight: 700, textAlign: 'center', lineHeight: 1.1, marginBottom: 16 }}>
              Todo en un solo sistema
            </h2>
            <div style={{ width: 48, height: 3, background: 'linear-gradient(90deg,var(--green),var(--green2))', borderRadius: 2, margin: '0 auto 52px' }} />
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
            {BENEFITS.map((b, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="benefit-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '32px 20px', textAlign: 'center', transition: 'border-color 0.3s, box-shadow 0.3s, background 0.3s' }}>
                  <div style={{ width: 62, height: 62, borderRadius: '50%', background: 'rgba(0,255,135,0.08)', border: '1px solid rgba(0,255,135,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: 26 }}>
                    {b.icon}
                  </div>
                  <p style={{ fontFamily: 'var(--ff-display)', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{b.title}</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{b.sub}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3}>
            <div style={{ textAlign: 'center', marginTop: 56 }}>
              <CtaButton text="Quiero empezar ahora →" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════ MÓDULOS ══════════════ */}
      <section style={{ padding: 'clamp(56px,8vw,100px) 20px', background: 'var(--black2)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '60%', height: '40%', background: 'radial-gradient(ellipse, rgba(0,255,135,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Reveal>
            <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 16 }}>Programa completo</p>
            <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(28px,5vw,48px)', fontWeight: 700, textAlign: 'center', lineHeight: 1.1, marginBottom: 16 }}>
              6 módulos profesionales
            </h2>
            <div style={{ width: 48, height: 3, background: 'linear-gradient(90deg,var(--green),var(--green2))', borderRadius: 2, margin: '0 auto 24px' }} />
            {/* pills */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 52 }}>
              {['Actualizaciones continuas', 'Contenido complementario exclusivo'].map(tag => (
                <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(0,255,135,0.07)', border: '1px solid rgba(0,255,135,0.22)', borderRadius: 100, padding: '7px 18px', fontSize: 12, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.03em', fontWeight: 500 }}>
                  <span style={{ color: 'var(--green)', fontSize: 8 }}>✦</span> {tag}
                </span>
              ))}
            </div>
          </Reveal>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {MODULES.map((m, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div
                  className="module-card"
                  style={{
                    position: 'relative',
                    display: 'grid',
                    gridTemplateColumns: '64px 1fr',
                    gap: '0 24px',
                    alignItems: 'start',
                    padding: '28px 32px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 12,
                    overflow: 'hidden',
                    transition: 'border-color 0.3s, background 0.3s, box-shadow 0.3s',
                  }}
                >
                  {/* número watermark */}
                  <div style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--ff-display)', fontSize: 76, fontWeight: 900, color: 'rgba(0,255,135,0.05)', lineHeight: 1, pointerEvents: 'none', userSelect: 'none', letterSpacing: '-0.04em' }}>{m.num}</div>
                  {/* badge número */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 2 }}>
                    <span style={{ fontFamily: 'var(--ff-display)', fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--green)', border: '1px solid rgba(0,255,135,0.25)', borderRadius: 6, padding: '4px 8px', background: 'rgba(0,255,135,0.06)' }}>{m.num}</span>
                  </div>
                  {/* contenido */}
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <p style={{ fontFamily: 'var(--ff-display)', fontSize: 15, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>{m.title}</p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>{m.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ PRECIO ══════════════ */}
      <section style={{ padding: 'clamp(56px,8vw,100px) 20px', background: 'var(--black)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, top: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(255,107,0,0.06), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', marginLeft: -240, marginTop: -240, width: 480, height: 480, borderRadius: '50%', border: '1px solid rgba(0,255,135,0.08)', animation: 'pulseRing 4.5s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', marginLeft: -340, marginTop: -340, width: 680, height: 680, borderRadius: '50%', border: '1px solid rgba(0,255,135,0.05)', animation: 'pulseRing 4.5s ease-in-out infinite', animationDelay: '2.25s', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Reveal>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 20 }}>Únete ahora</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,255,135,0.07)', border: '1px solid rgba(0,255,135,0.22)', borderRadius: 100, padding: '8px 20px', marginBottom: 32, fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)' }}>
              <span style={{ fontSize: 9 }}>◆</span> Precio de lanzamiento · Plazas limitadas
            </div>
            <PriceCounter targetPrice={Number(siteContent.price)} />
            <div style={{ marginTop: 36, marginBottom: 20 }}>
              <CtaButton text="Quiero acceder ahora →" />
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em' }}>Pago 100% seguro · Acceso inmediato</p>
          </Reveal>
        </div>
      </section>

      {/* ══════════════ TESTIMONIOS ══════════════ */}
      <section style={{ padding: 'clamp(56px,8vw,100px) 20px', background: 'var(--black2)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(rgba(0,255,135,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(0,255,135,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Reveal>
            <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(22px,4vw,36px)', fontWeight: 700, textAlign: 'center', lineHeight: 1.15, marginBottom: 16, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'white' }}>
              Lo que dicen nuestros estudiantes
            </h2>
            <div style={{ width: 48, height: 3, background: 'linear-gradient(90deg,var(--green),var(--green2))', borderRadius: 2, margin: '0 auto 52px' }} />
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[...(seedOverrides ?? SEED_REVIEWS), ...dynamicReviews.map((r: any) => ({
              name: r.name, country: r.country,
              initials: r.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
              color: ['#00FF87','#00D4FF','#FFB800','#FF6B6B','#B45FFF'][r.name.charCodeAt(0) % 5],
              stars: r.rating, review: r.review,
            }))].map((t, i) => (
              <Reveal key={i} delay={i * 0.07}>
                <div
                  className="benefit-card"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 16,
                    padding: '28px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    transition: 'border-color 0.3s, box-shadow 0.3s, background 0.3s',
                    height: '100%',
                  }}
                >
                  {/* Estrellas */}
                  <div style={{ display: 'flex', gap: 3 }}>
                    {Array.from({ length: 5 }).map((_, s) => (
                      <svg key={s} width="15" height="15" viewBox="0 0 24 24" fill={s < t.stars ? '#00FF87' : 'rgba(255,255,255,0.12)'}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>

                  {/* Comilla decorativa */}
                  <p style={{ fontSize: 38, lineHeight: 0.5, color: 'rgba(0,255,135,0.2)', fontFamily: 'Georgia, serif', userSelect: 'none' }}>"</p>

                  {/* Review */}
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, flex: 1 }}>{t.review}</p>

                  {/* Autor */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${t.color}18`, border: `1.5px solid ${t.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: 'var(--ff-display)', fontSize: 12, fontWeight: 800, color: t.color }}>{t.initials}</span>
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--ff-display)', fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.85)', lineHeight: 1.2 }}>{t.name}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em', marginTop: 2 }}>Estudiante · {t.country}</p>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(0,255,135,0.07)', border: '1px solid rgba(0,255,135,0.2)', borderRadius: 100, padding: '4px 10px' }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
                      <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600, letterSpacing: '0.06em' }}>Verificado</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Indicador de confianza */}
          <Reveal delay={0.4}>
            <div style={{ marginTop: 48, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'clamp(12px,3vw,32px)', flexWrap: 'nowrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 0 }}>
                <p style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(22px,5vw,32px)', fontWeight: 800, color: 'var(--green)', lineHeight: 1 }}>4.9</p>
                <div style={{ display: 'flex', gap: 2 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="#00FF87">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <p style={{ fontSize: 'clamp(9px,2vw,11px)', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'center' }}>Calificación</p>
              </div>
              <div style={{ width: 1, height: 50, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 0 }}>
                <p style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(22px,5vw,32px)', fontWeight: 800, color: 'var(--green)', lineHeight: 1 }}>150+</p>
                <p style={{ fontSize: 'clamp(9px,2vw,11px)', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'center' }}>Estudiantes</p>
              </div>
              <div style={{ width: 1, height: 50, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 0 }}>
                <p style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(22px,5vw,32px)', fontWeight: 800, color: 'var(--green)', lineHeight: 1 }}>98%</p>
                <p style={{ fontSize: 'clamp(9px,2vw,11px)', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'center' }}>Recomiendan</p>
              </div>
            </div>
          </Reveal>

          {/* Formulario de reseña */}
          <Reveal delay={0.5}>
            <div style={{ marginTop: 56, maxWidth: 560, margin: '56px auto 0' }}>
              <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(0,255,135,0.15)', borderRadius: 20, padding: 'clamp(28px,4vw,44px)' }}>
                <p style={{ fontFamily: 'var(--ff-display)', fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>¿Ya tomaste el curso?</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 28, lineHeight: 1.65 }}>
                  Comparte tu experiencia y ayuda a otros estudiantes a tomar la mejor decisión
                </p>
                <ReviewForm />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: 'clamp(48px,7vw,80px) 20px', background: 'var(--black)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 50% 100%, rgba(0,255,135,0.07), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Reveal>
            <p style={{ fontSize: 'clamp(20px,4vw,32px)', fontFamily: 'var(--ff-display)', fontWeight: 700, marginBottom: 28 }}>
              ¿Listo para operar con método real?
            </p>
            <CtaButton text="Acceder al curso →" />
            <p style={{ marginTop: 16, fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>Pago 100% seguro · Acceso inmediato · Plataforma Hotmart</p>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--black2)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,255,135,0.25), transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TradingIcon size={20} />
          <span style={{ fontFamily: 'var(--ff-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>David Trader Academy</span>
        </div>
        <a
          href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: 11, fontWeight: 500, letterSpacing: '0.04em', transition: 'color 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#E1306C' }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.35)' }}
        >
          <InstagramIcon size={13} />
          @davidgualdronn
        </a>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>© 2026 · Todos los derechos reservados</p>
      </footer>
    </>
  )
}
