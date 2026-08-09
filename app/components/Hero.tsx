'use client'

import Link from 'next/link'
import { ConstellationCanvas } from './ConstellationCanvas'
import { Bot, Network, Globe } from 'lucide-react'

export function Hero() {
  return (
    <div className="relative overflow-hidden text-center bg-[var(--color-bg-secondary)] px-6 md:px-12 py-24 md:py-[130px]">
      <ConstellationCanvas />
      <div className="relative z-10 max-w-[740px] mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] mb-7">
          <span className="w-[7px] h-[7px] rounded-full bg-[var(--color-success)] animate-pulse-dot" />
          Plataforma activa · acceso abierto
        </div>

        <h1 className="mb-[22px] text-4xl md:text-[52px] font-bold leading-[1.15] text-[var(--color-primary)]">
          Creá agentes de IA y conocimiento,{' '}
          <span className="text-[var(--color-secondary)]">de forma colaborativa</span>
        </h1>

        <p className="mx-auto mb-9 max-w-[560px] text-lg leading-relaxed text-[var(--color-text-secondary)]">
          Soph.ia conecta a tu equipo para construir agentes inteligentes y bases de conocimiento compartidas. Cada aporte se convierte en un nodo, y cada conexión hace más potente a todos los demás.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap mb-8">
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--radius-md)] px-6 py-3.5 text-base bg-[var(--color-primary)] text-white no-underline hover:brightness-110 transition-all"
          >
            Empezar gratis
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--radius-md)] px-6 py-3.5 text-base border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] no-underline hover:bg-[var(--color-hover)] transition-all"
          >
            Iniciar sesión
          </Link>
        </div>

        <div className="flex items-center justify-center gap-6 text-[13px] text-[var(--color-text-tertiary)]">
          <span className="flex items-center gap-1.5">
            <Bot size={14} className="text-[var(--color-secondary)]" />
            Agentes multi-modelo
          </span>
          <span className="flex items-center gap-1.5">
            <Network size={14} className="text-[var(--color-accent)]" />
            Knowledge Units
          </span>
          <span className="flex items-center gap-1.5">
            <Globe size={14} className="text-[var(--color-success)]" />
            Marketplace comunitario
          </span>
        </div>
      </div>
    </div>
  )
}
