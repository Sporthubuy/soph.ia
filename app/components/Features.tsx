import { Bot, Key, Network, Globe, FileText, Search } from 'lucide-react'

const features = [
  {
    icon: Bot,
    title: 'Agentes multi-modelo',
    description: 'Creá agentes con Claude, GPT, Gemini u otros. Cada agente tiene su prompt, temperatura y modelo configurables.',
  },
  {
    icon: Network,
    title: 'Knowledge Units',
    description: 'Organizá conocimiento en unidades versionadas. Subí PDFs, DOCX o escribí contenido directamente.',
  },
  {
    icon: Search,
    title: 'RAG semántico',
    description: 'Los agentes buscan en tus Knowledge Units con embeddings pgvector para dar respuestas basadas en tu conocimiento.',
  },
  {
    icon: Key,
    title: 'Multi-proveedor',
    description: 'Conectá tus propias API keys de OpenAI, Anthropic, Google y más. Sin intermediarios, sin costos extra.',
  },
  {
    icon: Globe,
    title: 'Marketplace comunitario',
    description: 'Compartí agentes y plantillas. Cloná lo que otros publican y adaptalo a tu caso con tus propias keys.',
  },
  {
    icon: FileText,
    title: 'Historial y gobernanza',
    description: 'Cada cambio queda registrado. Control de versiones, estados de aprobación y visibilidad granular.',
  },
]

export function Features() {
  return (
    <div id="caracteristicas" className="px-6 md:px-12 py-24 md:py-[110px] max-w-[1180px] mx-auto">
      <h2 className="mb-3 text-center text-3xl md:text-[36px] font-bold text-[var(--color-primary)]">
        Todo lo que necesitás para trabajar con IA
      </h2>
      <p className="mb-14 text-center text-base text-[var(--color-text-secondary)]">
        Herramientas pensadas para que tu equipo construya, comparta y escale agentes inteligentes.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <div
              key={feature.title}
              className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-5 transition-all hover:border-[var(--color-primary)]/30 hover:shadow-sm"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-bg-secondary)] mb-3">
                <Icon size={18} className="text-[var(--color-secondary)]" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-[var(--color-primary)]">
                {feature.title}
              </h3>
              <p className="text-[13px] leading-[1.55] text-[var(--color-text-secondary)]">
                {feature.description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
