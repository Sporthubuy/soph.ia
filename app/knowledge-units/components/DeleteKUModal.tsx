'use client'

import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

export function DeleteKUModal({
  unitId,
  unitName,
  onClose,
  onDeleted,
}: {
  unitId: string
  unitName: string
  onClose: () => void
  onDeleted: () => void
}) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    onDeleted()
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(15,23,42,0.42)] p-8">
      <div className="w-full max-w-[440px] rounded-[var(--radius-lg)] bg-[var(--color-bg-primary)] shadow-[var(--shadow-xl)]">
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(239,68,68,0.1)]">
            <AlertTriangle size={20} className="text-[var(--color-error)]" />
          </div>
          <div className="flex-1">
            <div className="text-[17px] font-bold text-[var(--color-text-primary)]">Eliminar knowledge unit</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-[30px] w-[30px] items-center justify-center rounded-[6px] text-[var(--color-text-tertiary)] hover:bg-[var(--color-hover)]"
          >
            <X size={17} />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-[var(--color-text-secondary)]">
            ¿Estás seguro de que querés eliminar <strong className="font-semibold text-[var(--color-text-primary)]">{unitName}</strong>? Esta acción no se puede deshacer.
          </p>
        </div>

        <div className="flex justify-end gap-2.5 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-[var(--radius-md)] bg-[var(--color-error)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {deleting ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
