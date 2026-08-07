const faqs = [
  {
    question: '¿Qué es Soph.ia?',
    answer: 'Una plataforma para crear agentes de IA y conocimiento de forma colaborativa entre equipos y personas.',
  },
  {
    question: '¿Cuándo abre el acceso?',
    answer: 'Estamos en etapa previa al lanzamiento. Quienes se suman a la lista son los primeros en probarla.',
  },
  {
    question: '¿Necesito saber programar?',
    answer: 'No. Soph.ia está pensada para que cualquier persona del equipo pueda aportar conocimiento y construir agentes.',
  },
]

export function FAQ() {
  return (
    <div id="faq" className="px-6 md:px-12 py-24 md:py-[110px] max-w-[760px] mx-auto">
      <h2 className="mb-10 text-center text-2xl md:text-[32px] font-bold text-[var(--color-primary)]">
        Preguntas frecuentes
      </h2>
      <div>
        {faqs.map((faq, idx) => (
          <div key={faq.question}>
            <h3 className="mb-2 text-[17px] font-semibold text-[var(--color-primary)]">
              {faq.question}
            </h3>
            <p className="text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
              {faq.answer}
            </p>
            {idx < faqs.length - 1 && (
              <hr className="border-t border-[var(--color-border)] my-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
