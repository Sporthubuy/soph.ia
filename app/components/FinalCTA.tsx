import { WaitlistForm } from './WaitlistForm'

export function FinalCTA() {
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
          <WaitlistForm formId="registro-final" source="final" />
        </div>
      </div>
    </div>
  )
}
