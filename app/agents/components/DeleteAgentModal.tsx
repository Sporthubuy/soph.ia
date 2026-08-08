'use client'

import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

export function DeleteAgentModal({
  agentId,
  agentName,
  onClose,
  onDeleted,
}: {
  agentId: string
  agentName: string
  onClose: () => void
  onDeleted: () => void
}) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/agents/${agentId}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al eliminar')
      }
      onDeleted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-6 shadow-[var(--shadow-xl)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-[var(--radius-md)] p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)]"
        >
          <X size={18} />
        </button>

        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(239,68,68,0.1)]">
          <AlertTriangle size={20} className="text-[var(--color-error)]" />
        </div>

        <h3 className="mb-2 text-base font-semibold text-[var(--color-text-primary)]">Eliminar agente</h3>
        <p className="mb-5 text-sm text-[var(--color-text-secondary)]">
          ¿Estás seguro de que querés eliminar <strong>{agentName}</strong>? Esta acción no se puede deshacer.
        </p>

        {error && <p className="mb-4 text-[13px] text-[var(--color-error)]">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 rounded-[var(--radius-md)] bg-[var(--color-error)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
