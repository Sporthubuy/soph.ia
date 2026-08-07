'use client'

import { ConstellationCanvas } from './ConstellationCanvas'

export function ConnectionBanner() {
  return (
    <div className="relative overflow-hidden text-center bg-[var(--color-primary)] px-6 md:px-12 py-20 md:py-[120px]">
      <ConstellationCanvas dotColor="rgba(255,255,255,0.6)" lineColor="rgba(255,255,255,0.12)" dotCount={35} />
      <div className="relative z-10 max-w-[640px] mx-auto">
        <h2 className="mb-[18px] text-3xl md:text-[36px] font-bold text-white">
          Cuantas más conexiones, más inteligencia
        </h2>
        <p className="text-base leading-relaxed text-white/75">
          Así crece Soph.ia: no como un modelo aislado, sino como una red viva de conocimiento y agentes que aprenden unos de otros.
        </p>
      </div>
    </div>
  )
}
