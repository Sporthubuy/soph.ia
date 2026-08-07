import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Soph.ia — Creá agentes de IA y conocimiento, de forma colaborativa',
  description: 'Soph.ia conecta a tu equipo para construir agentes inteligentes y bases de conocimiento compartidas.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
