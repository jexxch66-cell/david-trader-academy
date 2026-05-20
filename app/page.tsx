'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const HOTMART_LINK = 'https://pay.hotmart.com/TU-LINK-AQUI'

// Energía del audio compartida entre VideoPlayer y StarField
let gAudioEnergy = 0
let gAudioBeat   = 0

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

    const sparks = Array.from({ length: 55 }, () => ({
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

    const smoke: SmokeP[] = Array.from({ length: 44 }, spawnSmoke)

    const nodes = Array.from({ length: 24 }, () => ({
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

    const draw = () => {
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

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />
}

// ─── PRICE COUNTER ────────────────────────────────────────────────────────────
function PriceCounter() {
  const [val, setVal] = useState(499)
  const [done, setDone] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const t0 = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - t0) / 1400, 1)
          setVal(Math.round(499 + (199 - 499) * (1 - Math.pow(1 - p, 3))))
          if (p < 1) requestAnimationFrame(tick)
          else setDone(true)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.4 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

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
const BORDER_WINDOWS = [[0, 9], [45, 50], [57, 61]] as const
const inBorderWindow = (t: number) => BORDER_WINDOWS.some(([a, b]) => t >= a && t <= b)

function VideoPlayer() {
  const videoRef   = useRef<HTMLVideoElement>(null)
  const spinnerRef = useRef<HTMLDivElement>(null)
  const glowRef    = useRef<HTMLDivElement>(null)
  const audioReady = useRef(false)
  const angleRef   = useRef(0)
  const [showControls, setShowControls] = useState(false)
  const hideTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let rafId: number
    const tick = () => {
      const video   = videoRef.current
      const spinner = spinnerRef.current
      if (video && spinner) {
        const t      = video.currentTime
        const active = !video.paused && inBorderWindow(t)
        if (active) {
          angleRef.current = (angleRef.current + 1.4) % 360
          spinner.style.transform = `translate(-50%,-50%) rotate(${angleRef.current}deg)`
        }
        spinner.style.opacity = inBorderWindow(t) ? '1' : '0'
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  const setupAudio = () => {
    if (audioReady.current || !videoRef.current) return
    audioReady.current = true
    try {
      const actx     = new AudioContext()
      const analyser = actx.createAnalyser()
      analyser.fftSize = 128
      analyser.smoothingTimeConstant = 0.75
      const src = actx.createMediaElementSource(videoRef.current)
      src.connect(analyser)
      analyser.connect(actx.destination)
      const data = new Uint8Array(analyser.frequencyBinCount)
      let prevBass = 0
      const loop = () => {
        analyser.getByteFrequencyData(data)
        let bass = 0
        for (let i = 0; i < 6; i++) bass += data[i]
        bass /= (6 * 255)
        gAudioEnergy = bass
        if (bass > prevBass * 1.35 && bass > 0.15) gAudioBeat = Math.min(bass * 1.6, 1)
        prevBass = prevBass * 0.85 + bass * 0.15
        if (glowRef.current) {
          const g = bass * 40
          glowRef.current.style.boxShadow =
            `0 0 ${16 + g}px rgba(0,255,135,${0.22 + bass * 0.5}), 0 0 ${60 + g * 1.5}px rgba(0,255,135,${0.06 + bass * 0.1})`
        }
        requestAnimationFrame(loop)
      }
      loop()
    } catch { /* audio no disponible */ }
  }

  const reveal = () => {
    setShowControls(true)
    setupAudio()
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setShowControls(false), 3000)
  }

  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current) }, [])

  return (
    <div
      onMouseMove={reveal} onTouchStart={reveal} onClick={reveal}
      style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 14, padding: '1.5px', background: 'rgba(0,255,135,0.04)' }}
    >
      <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', overflow: 'hidden', zIndex: 0 }}>
        <div
          ref={spinnerRef}
          style={{
            position: 'absolute', top: '50%', left: '50%',
            width: '160%', height: '160%',
            transform: 'translate(-50%,-50%) rotate(0deg)',
            background: 'conic-gradient(from 0deg, transparent 0deg, rgba(0,255,135,0.9) 40deg, transparent 80deg)',
            opacity: 0,
            transition: 'opacity 0.5s ease',
          }}
        />
      </div>
      <div
        ref={glowRef}
        style={{
          position: 'absolute', inset: -1, borderRadius: 15, zIndex: 2,
          border: '1.5px solid rgba(0,255,135,0.35)',
          boxShadow: '0 0 16px rgba(0,255,135,0.22), 0 0 60px rgba(0,255,135,0.06)',
          pointerEvents: 'none',
          transition: 'box-shadow 0.07s ease',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden', background: '#080808' }}>
        <video
          ref={videoRef}
          src="/video.mp4"
          autoPlay loop playsInline preload="metadata"
          controls={showControls}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
          background: 'radial-gradient(ellipse at center, transparent 42%, rgba(6,6,6,0.65) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
          background: 'linear-gradient(to bottom, rgba(6,6,6,0.32) 0%, transparent 16%, transparent 84%, rgba(6,6,6,0.32) 100%)' }} />
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

// ─── CTA BUTTON ───────────────────────────────────────────────────────────────
function CtaButton({ text, fullWidth = false }: { text: string; fullWidth?: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <a href={HOTMART_LINK} target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: fullWidth ? 'flex' : 'inline-flex',
        alignItems: 'center', justifyContent: 'center', gap: 10,
        width: fullWidth ? '100%' : 'auto',
        background: hov
          ? 'linear-gradient(135deg, #00FF87 0%, #00E87A 100%)'
          : 'linear-gradient(135deg, #00FF87 0%, #00CC6A 100%)',
        color: '#060606',
        padding: '18px 52px',
        fontFamily: 'var(--ff-display)', fontSize: 15, fontWeight: 700,
        letterSpacing: '0.06em', textTransform: 'uppercase',
        textDecoration: 'none', borderRadius: 8,
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov
          ? '0 20px 50px rgba(0,255,135,0.35)'
          : '0 6px 24px rgba(0,255,135,0.2)',
        transition: 'all 0.25s ease',
      }}
    >
      <span style={{ fontSize: 18 }}>▶</span> {text}
    </a>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [navSolid, setNavSolid] = useState(false)
  useEffect(() => {
    const h = () => setNavSolid(window.scrollY > 60)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const BENEFITS = [
    { icon: '📈', title: '6 años de experiencia',  sub: 'Trader profesional especializado en Forex, divisas y oro' },
    { icon: '🛡️', title: 'Gestión de riesgo',      sub: 'Protege tu capital con metodología disciplinada y probada' },
    { icon: '🎯', title: 'Price Action real',       sub: 'Lee el mercado como los traders institucionales' },
    { icon: '🔴', title: 'Sesiones en vivo',        sub: 'Acompañamiento real con análisis del mercado en tiempo real' },
  ]

  const MODULES = [
    {
      num: '01',
      title: 'Fundamentos del Trading Profesional',
      desc: 'Introducción completa al mundo del trading, conceptos esenciales, funcionamiento del mercado Forex, pares de divisas, sesiones de mercado y mentalidad correcta para iniciar.',
    },
    {
      num: '02',
      title: 'Price Action y Lectura del Mercado',
      desc: 'Aprende a interpretar gráficos como un trader profesional, identificar estructuras del mercado, zonas clave, soportes, resistencias y movimientos institucionales.',
    },
    {
      num: '03',
      title: 'Trading en Oro (XAU/USD) y Divisas',
      desc: 'Estrategias específicas para operar oro y pares de divisas con alta precisión, entendiendo comportamiento, volatilidad y mejores oportunidades de entrada.',
    },
    {
      num: '04',
      title: 'Gestión de Riesgo Profesional',
      desc: 'Uno de los pilares más importantes del curso. Aprende a proteger capital, calcular lotajes, controlar pérdidas y operar con disciplina.',
    },
    {
      num: '05',
      title: 'Psicología del Trading y Control Emocional',
      desc: 'Acompañamiento psicológico enfocado en mentalidad, control emocional, toma de decisiones, manejo del miedo, ansiedad y sobreoperación.',
    },
    {
      num: '06',
      title: 'Trading en Vivo + Ejecución Real',
      desc: 'Sesiones en vivo con análisis del mercado en tiempo real, explicación de entradas, salidas y toma de decisiones reales.',
    },
  ]

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
        .module-card:hover { border-color: rgba(0,255,135,0.28) !important; background: rgba(0,255,135,0.035) !important; box-shadow: inset 3px 0 0 0 rgba(0,255,135,0.55), 0 8px 40px rgba(0,255,135,0.06) !important; }
        .benefit-card:hover { border-color: rgba(0,255,135,0.28) !important; box-shadow: inset 0 3px 0 0 rgba(0,255,135,0.55), 0 8px 30px rgba(0,255,135,0.07) !important; background: rgba(0,255,135,0.04) !important; }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 10, background: navSolid ? 'rgba(6,6,6,0.96)' : 'transparent', backdropFilter: navSolid ? 'blur(16px)' : 'none', borderBottom: navSolid ? '1px solid rgba(255,255,255,0.06)' : 'none', transition: 'all 0.4s' }}>
        <TradingIcon />
        <span style={{ fontFamily: 'var(--ff-display)', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase' }}>David Trader Academy</span>
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
            Opera los mercados<br />
            <span style={{ background: 'linear-gradient(90deg,#00FF87,#00CC6A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              con método real
            </span>
          </motion.h1>

          {/* subtítulo */}
          <motion.p
            variants={{ hidden: { opacity: 0, y: 20, filter: 'blur(6px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.16,1,0.3,1] } } }}
            style={{ fontSize: 'clamp(15px,2.5vw,17px)', color: 'rgba(255,255,255,0.45)', maxWidth: 480, lineHeight: 1.75, margin: '0 auto 40px' }}
          >
            Aprende a operar los mercados financieros con estrategia, disciplina y gestión profesional del riesgo — incluso si empiezas desde cero.
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
        {/* anillos decorativos */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', marginLeft: -240, marginTop: -240, width: 480, height: 480, borderRadius: '50%', border: '1px solid rgba(0,255,135,0.08)', animation: 'pulseRing 4.5s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', marginLeft: -340, marginTop: -340, width: 680, height: 680, borderRadius: '50%', border: '1px solid rgba(0,255,135,0.05)', animation: 'pulseRing 4.5s ease-in-out infinite', animationDelay: '2.25s', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Reveal>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 20 }}>Únete ahora</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,255,135,0.07)', border: '1px solid rgba(0,255,135,0.22)', borderRadius: 100, padding: '8px 20px', marginBottom: 32, fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)' }}>
              <span style={{ fontSize: 9 }}>◆</span> Precio de lanzamiento · Plazas limitadas
            </div>
            <PriceCounter />
            <div style={{ marginTop: 36, marginBottom: 20 }}>
              <CtaButton text="Quiero acceder ahora →" />
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em' }}>Pago 100% seguro · Acceso inmediato</p>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--black2)', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,255,135,0.25), transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TradingIcon size={20} />
          <span style={{ fontFamily: 'var(--ff-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>David Trader Academy</span>
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>© 2026 · Todos los derechos reservados</p>
      </footer>
    </>
  )
}
