import Link from 'next/link'

export function FinalCTA() {
  return (
    <div className="px-6 md:px-12 pt-24 pb-24 md:pt-[100px] md:pb-[120px] max-w-[820px] mx-auto text-center">
      <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-sm p-4">
        <div className="p-6">
          <h2 className="mb-3.5 text-2xl md:text-[30px] font-bold text-[var(--color-primary)]">
            Empezá a construir hoy
          </h2>
          <p className="mb-7 text-[15px] text-[var(--color-text-secondary)]">
            Creá tu cuenta gratis y armá tus primeros agentes con el conocimiento de tu equipo.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--radius-md)] px-6 py-3.5 text-base bg-[var(--color-primary)] text-white no-underline hover:brightness-110 transition-all"
            >
              Crear cuenta gratis
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--radius-md)] px-6 py-3.5 text-base border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] no-underline hover:bg-[var(--color-hover)] transition-all"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
