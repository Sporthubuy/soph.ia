const faqs = [
  {
    question: '¿Qué es Soph.ia?',
    answer: 'Una plataforma para crear agentes de IA conectados a bases de conocimiento compartidas. Tu equipo sube documentos, crea Knowledge Units y construye agentes que responden con información verificada.',
  },
  {
    question: '¿Necesito saber programar?',
    answer: 'No. Todo se configura desde una interfaz visual: crear agentes, subir documentos, definir prompts y gestionar permisos. Sin código.',
  },
  {
    question: '¿Qué modelos de IA puedo usar?',
    answer: 'Soph.ia soporta múltiples proveedores: OpenAI (GPT), Anthropic (Claude), Google (Gemini) y más. Conectás tus propias API keys y elegís el modelo para cada agente.',
  },
  {
    question: '¿Cómo funciona el marketplace?',
    answer: 'Podés publicar agentes y Knowledge Units para que otros los clonen a su workspace. El contenido se copia, pero cada equipo usa sus propias API keys. Es código cerrado: el prompt del agente no se expone.',
  },
  {
    question: '¿Mis datos están seguros?',
    answer: 'Cada organización tiene su propio espacio aislado con Row-Level Security en PostgreSQL. La visibilidad de cada recurso es configurable: privado, equipo, organización o público.',
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
