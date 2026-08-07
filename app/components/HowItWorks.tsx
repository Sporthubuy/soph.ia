const steps = [
  {
    number: '01',
    title: 'Aportá conocimiento',
    description: 'Cada persona suma documentos, procesos y experiencia propia. Todo se convierte en un nodo dentro de la red compartida.',
  },
  {
    number: '02',
    title: 'Conectá con tu equipo',
    description: 'Los nodos se enlazan entre sí: el conocimiento de una persona potencia directamente los agentes que usan las demás.',
  },
  {
    number: '03',
    title: 'Construyan agentes, juntos',
    description: 'Iteren y mejoren agentes de IA en equipo, con historial de cambios y aportes de todos siempre visibles.',
  },
]

export function HowItWorks() {
  return (
    <div id="como-funciona" className="px-6 md:px-12 py-24 md:py-[110px] max-w-[1180px] mx-auto">
      <h2 className="mb-3 text-center text-3xl md:text-[36px] font-bold text-[var(--color-primary)]">
        Cómo se construye en Soph.ia
      </h2>
      <p className="mb-14 text-center text-base text-[var(--color-text-secondary)]">
        Un proceso pensado para que el conocimiento de cada persona sume, no se pierda.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step) => (
          <div
            key={step.number}
            className="bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 shadow-sm"
          >
            <div className="text-[13px] font-bold text-[var(--color-secondary)] tracking-[0.05em] mb-3">
              {step.number}
            </div>
            <h3 className="mb-2.5 text-[19px] font-semibold text-[var(--color-primary)]">
              {step.title}
            </h3>
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
