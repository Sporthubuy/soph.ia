import { Plus } from 'lucide-react'
import { AppHeader } from '../components/shell/AppHeader'
import { AppSidebar } from '../components/shell/AppSidebar'
import { createClient } from '../lib/supabase/server'
import { fetchCurrentProfile } from '../lib/profile'
import { fetchAgents } from './db'
import { AgentsGrid } from './components/AgentsGrid'

export default async function AgentsPage() {
  const supabase = await createClient()

  let profile = null
  let agents = []
  let dataError: string | null = null

  try {
    ;[profile, agents] = await Promise.all([fetchCurrentProfile(supabase), fetchAgents(supabase)])
  } catch (error) {
    dataError = error instanceof Error ? error.message : 'No pudimos cargar los agentes.'
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
      <AppHeader
        userName={profile?.full_name ?? ''}
        userEmail={profile?.email ?? ''}
        initials={profile?.initials ?? ''}
      />

      <div className="flex items-start">
        <AppSidebar active="agents" />

        <div className="min-w-0 flex-1 px-8 pb-14 pt-8" style={{ maxWidth: 1200 }}>
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="m-0 mb-1.5 text-[28px] font-bold text-[var(--color-text-primary)]">Agentes</h1>
              <p className="m-0 text-sm text-[var(--color-text-secondary)]">
                Tenés {agents.length} agente{agents.length !== 1 ? 's' : ''} creado{agents.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              <Plus size={18} />
              Crear agente
            </button>
          </div>

          {/* Error Message */}
          {dataError && (
            <div className="mb-6 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[rgba(239,68,68,0.06)] px-4 py-3 text-sm text-[var(--color-error)]">
              No pudimos cargar los agentes. <span className="font-medium">{dataError}</span>
            </div>
          )}

          {/* Empty State */}
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
                className="rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Crear primer agente
              </button>
            </div>
          )}

          {/* Agents Grid */}
          {!dataError && agents.length > 0 && <AgentsGrid agents={agents} />}
        </div>
      </div>
    </div>
  )
}
