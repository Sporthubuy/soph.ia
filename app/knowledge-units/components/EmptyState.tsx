export function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="px-6 py-14 text-center">
      <div className="mb-1.5 text-[15px] font-semibold text-[var(--color-text-primary)]">Sin resultados</div>
      <div className="mb-4.5 text-[13px] text-[var(--color-text-secondary)]">
        Probá con otro término o quitá los filtros aplicados.
      </div>
      <button
        type="button"
        onClick={onReset}
        className="rounded-[var(--radius-md)] border border-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-hover)]"
      >
        Limpiar filtros
      </button>
    </div>
  )
}
