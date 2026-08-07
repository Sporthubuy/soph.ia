'use client'

export function FinalCTA() {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
  }

  return (
    <div className="px-6 md:px-12 pt-24 pb-24 md:pt-[100px] md:pb-[120px] max-w-[820px] mx-auto text-center">
      <div className="bg-white rounded-[var(--radius-md)] shadow-md p-4">
        <div className="p-6">
          <h2 className="mb-3.5 text-2xl md:text-[30px] font-bold text-[var(--color-primary)]">
            Sumate a la lista de espera
          </h2>
          <p className="mb-7 text-[15px] text-[var(--color-text-secondary)]">
            Te avisamos apenas Soph.ia esté lista para que empieces a construir con tu equipo.
          </p>
          <form id="registro-final" onSubmit={handleSubmit} className="flex gap-3 justify-center flex-wrap">
            <input
              type="text"
              name="name"
              placeholder="Tu nombre"
              className="w-[200px] px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-[var(--radius-md)] bg-white text-[var(--color-text-primary)] outline-none focus:border-[var(--color-secondary)] transition-colors"
            />
            <input
              type="email"
              name="email"
              placeholder="tu@empresa.com"
              className="w-[240px] px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-[var(--radius-md)] bg-white text-[var(--color-text-primary)] outline-none focus:border-[var(--color-secondary)] transition-colors"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--radius-md)] cursor-pointer transition-colors px-5 py-3 text-base bg-[var(--color-primary)] text-white hover:bg-[#1e293b]"
            >
              Quiero acceso anticipado
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
