'use client'

import { ConstellationCanvas } from './ConstellationCanvas'
import { WaitlistForm } from './WaitlistForm'

export function Hero() {
  return (
    <div className="relative overflow-hidden text-center bg-[var(--color-bg-secondary)] px-6 md:px-12 py-24 md:py-[130px]">
      <ConstellationCanvas />
      <div className="relative z-10 max-w-[740px] mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] mb-7">
          <span className="w-[7px] h-[7px] rounded-full bg-[var(--color-accent)] animate-pulse-dot" />
          Próximamente · lista de espera abierta
        </div>

        <h1 className="mb-[22px] text-4xl md:text-[52px] font-bold leading-[1.15] text-[var(--color-primary)]">
          Creá agentes de IA y conocimiento,{' '}
          <span className="text-[var(--color-secondary)]">de forma colaborativa</span>
        </h1>

        <p className="mx-auto mb-9 max-w-[560px] text-lg leading-relaxed text-[var(--color-text-secondary)]">
          Soph.ia conecta a tu equipo para construir agentes inteligentes y bases de conocimiento compartidas: cada aporte se convierte en un nodo, y cada conexión hace más potente a todos los demás.
        </p>

        <WaitlistForm formId="registro" source="hero" />

        <p className="text-[13px] text-[var(--color-text-tertiary)]">
          Sin spam. Solo un aviso cuando abramos el acceso.
        </p>
      </div>
    </div>
  )
}
