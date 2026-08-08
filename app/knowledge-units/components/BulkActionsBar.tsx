export function BulkActionsBar({
  count,
  onShare,
  onClear,
}: {
  count: number
  onShare: () => void
  onClear: () => void
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--color-border)] bg-[rgba(59,130,246,0.07)] px-4 py-2.5">
      <span className="text-[13px] font-semibold text-[#1D4FD7]">{count} seleccionadas</span>
      <div className="ml-auto flex gap-2">
        <button
          type="button"
          onClick={onShare}
          className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-primary)]"
        >
          Compartir
        </button>
        <button
          type="button"
          disabled
          title="El flujo de aprobación estará disponible próximamente."
          className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-primary)]"
        >
          Aprobar (próximamente)
        </button>
        <button
          type="button"
          disabled
          title="El archivado estará disponible próximamente."
          className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--color-error)]"
        >
          Archivar (próximamente)
        </button>
        <button type="button" onClick={onClear} className="bg-transparent px-2 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)]">
          Cancelar
        </button>
      </div>
    </div>
  )
}
