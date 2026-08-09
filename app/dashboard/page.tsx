import { AppHeader } from '../components/shell/AppHeader'
import { AppSidebar } from '../components/shell/AppSidebar'
import { createClient } from '../lib/supabase/server'
import { fetchCurrentProfile, getFirstName } from '../lib/profile'
import { fetchKnowledgeUnits } from '../knowledge-units/db'
import {
  fetchDashboardStats,
  fetchDashboardAgents,
  fetchDashboardActivity,
  fetchDashboardPending,
} from './data'
import { QuickActions } from './components/QuickActions'
import { Invites } from './components/Invites'
import { PendingList } from './components/PendingList'
import { ActivityFeed } from './components/ActivityFeed'
import { AgentsList } from './components/AgentsList'
import { KnowledgeUnitsList } from './components/KnowledgeUnitsList'

export default async function DashboardPage() {
  const supabase = await createClient()

  let profile = null
  let dataError: string | null = null

  try {
    profile = await fetchCurrentProfile(supabase)
  } catch (error) {
    dataError = error instanceof Error ? error.message : 'No pudimos cargar tu panel en este momento.'
  }

  const [stats, agents, activity, pending, units] = await Promise.all([
    fetchDashboardStats(supabase).catch(() => ({ agentCount: 0, kuCount: 0, pendingCount: 0 })),
    fetchDashboardAgents(supabase).catch(() => []),
    fetchDashboardActivity(supabase).catch(() => []),
    fetchDashboardPending(supabase).catch(() => []),
    fetchKnowledgeUnits(supabase, 3).catch(() => []),
  ])

  const firstName = getFirstName(profile?.full_name)

  const subtitleParts: string[] = []
  if (stats.agentCount > 0) subtitleParts.push(`${stats.agentCount} agente${stats.agentCount !== 1 ? 's' : ''}`)
  if (stats.kuCount > 0) subtitleParts.push(`${stats.kuCount} knowledge unit${stats.kuCount !== 1 ? 's' : ''}`)
  if (pending.length > 0) subtitleParts.push(`${pending.length} pendiente${pending.length !== 1 ? 's' : ''}`)

  const subtitle = subtitleParts.length > 0
    ? `Tenés ${subtitleParts.join(', ')}.`
    : 'Tu espacio de trabajo está listo para empezar.'

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
      <AppHeader
        userName={profile?.full_name ?? ''}
        userEmail={profile?.email ?? ''}
        initials={profile?.initials ?? ''}
      />

      <div className="flex items-start">
        <AppSidebar active="dashboard" />

        <div className="min-w-0 flex-1 px-4 pb-14 pt-6 sm:px-6 md:px-8 md:pt-8" style={{ maxWidth: 1200 }}>
          {dataError ? (
            <div className="mb-6 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[rgba(239,68,68,0.06)] px-4 py-3 text-sm text-[var(--color-error)]">
              No pudimos cargar el panel por completo. Reintentá en unos segundos.{' '}
              <span className="font-medium">{dataError}</span>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="m-0 mb-1.5 text-[28px] font-bold text-[var(--color-text-primary)]">
                  Hola, {firstName}
                </h1>
                <p className="m-0 text-sm text-[var(--color-text-secondary)]">{subtitle}</p>
              </div>

              <QuickActions />
              <Invites />

              <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
                <PendingList pending={pending} />
                <ActivityFeed changes={activity} />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <AgentsList agents={agents} />
                <KnowledgeUnitsList units={units} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
