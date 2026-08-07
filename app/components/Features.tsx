const features = [
  {
    title: 'Conocimiento compartido',
    description: 'Una base común donde cada aporte queda conectado y disponible para todo el equipo.',
  },
  {
    title: 'Agentes reutilizables',
    description: 'Un agente creado por una persona puede adaptarse y reutilizarse en otros equipos.',
  },
  {
    title: 'Historial de aportes',
    description: 'Cada cambio queda registrado: se sabe quién sumó qué, y cuándo.',
  },
  {
    title: 'Comunidad activa',
    description: 'Equipos y personas mejorando agentes en conjunto, no en silos aislados.',
  },
]

export function Features() {
  return (
    <div id="comunidad" className="px-6 md:px-12 py-24 md:py-[110px] max-w-[1180px] mx-auto">
      <h2 className="mb-3 text-center text-3xl md:text-[36px] font-bold text-[var(--color-primary)]">
        Pensado para construir en equipo
      </h2>
      <p className="mb-14 text-center text-base text-[var(--color-text-secondary)]">
        Todo lo que necesitás para que el conocimiento colectivo se vuelva agentes útiles.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-white rounded-[var(--radius-md)] p-4 shadow-md"
          >
            <h3 className="mb-2 text-base font-semibold text-[var(--color-primary)]">
              {feature.title}
            </h3>
            <p className="text-[13px] leading-[1.55] text-[var(--color-text-secondary)]">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
