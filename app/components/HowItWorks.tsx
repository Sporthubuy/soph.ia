const steps = [
  {
    number: '01',
    title: 'Aportá conocimiento',
    description: 'Subí documentos, guías y procesos. Soph.ia los procesa, indexa y convierte en Knowledge Units listas para ser usadas por agentes de IA.',
  },
  {
    number: '02',
    title: 'Construí agentes',
    description: 'Creá agentes conectados a tus Knowledge Units. Elegí el modelo, definí el prompt y configurá parámetros — todo desde una interfaz visual.',
  },
  {
    number: '03',
    title: 'Compartí con la comunidad',
    description: 'Publicá agentes y plantillas en el marketplace. Cloná lo que otros comparten, conectá tus propias API keys y hacelo tuyo.',
  },
]

export function HowItWorks() {
  return (
    <div id="como-funciona" className="px-6 md:px-12 py-24 md:py-[110px] max-w-[1180px] mx-auto">
      <h2 className="mb-3 text-center text-3xl md:text-[36px] font-bold text-[var(--color-primary)]">
        Cómo funciona Soph.ia
      </h2>
      <p className="mb-14 text-center text-base text-[var(--color-text-secondary)]">
        Tres pasos para que el conocimiento de tu equipo se convierta en agentes útiles.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step) => (
          <div
            key={step.number}
            className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 shadow-sm"
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
