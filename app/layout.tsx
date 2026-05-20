import type { Metadata } from 'next'
import './globals.css'
import SmoothScroll from './SmoothScroll'

export const metadata: Metadata = {
  title: 'Curso Trading Élite — Aprende a operar los mercados',
  description: 'El método profesional que transforma cuentas pequeñas en ingresos consistentes.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  )
}
