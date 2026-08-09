'use client'

import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import type { Agent } from '../data'
import { AgentsGrid } from './AgentsGrid'

export function AgentsPageClient({
  agents,
  dataError,
}: {
  agents: Agent[]
  dataError: string | null
}) {
  const router = useRouter()

  function handleRefresh() {
    router.refresh()
  }

  return (
    <div className="min-w-0 flex-1 px-4 pb-14 pt-6 sm:px-6 md:px-8 md:pt-8" style={{ maxWidth: 1200 }}>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="m-0 mb-1.5 text-[28px] font-bold text-[var(--color-text-primary)]">Agentes</h1>
          <p className="m-0 text-sm text-[var(--color-text-secondary)]">
            Tenés {agents.length} agente{agents.length !== 1 ? 's' : ''} creado{agents.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/agents/new')}
          className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus size={18} />
          Crear agente
        </button>
      </div>

      {dataError && (
        <div className="mb-6 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[rgba(239,68,68,0.06)] px-4 py-3 text-sm text-[var(--color-error)]">
          No pudimos cargar los agentes. <span className="font-medium">{dataError}</span>
        </div>
      )}

      {!dataError && agents.length === 0 && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-bg-secondary)]">
            <Plus size={24} className="text-[var(--color-text-tertiary)]" />
          </div>
          <h3 className="mb-2 text-base font-semibold text-[var(--color-text-primary)]">Sin agentes todavía</h3>
          <p className="mb-6 text-sm text-[var(--color-text-secondary)]">
            Creá tu primer agente de IA para empezar a automatizar tareas.
          </p>
          <button
            type="button"
            onClick={() => router.push('/agents/new')}
            className="rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Crear primer agente
          </button>
        </div>
      )}

      {!dataError && agents.length > 0 && <AgentsGrid agents={agents} onRefresh={handleRefresh} />}
    </div>
  )
}
