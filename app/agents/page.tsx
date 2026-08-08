import { AppHeader } from '../components/shell/AppHeader'
import { AppSidebar } from '../components/shell/AppSidebar'
import { createClient } from '../lib/supabase/server'
import { fetchCurrentProfile } from '../lib/profile'
import { fetchAgents } from './db'
import { AgentsPageClient } from './components/AgentsPageClient'

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
        <AgentsPageClient agents={agents} dataError={dataError} />
      </div>
    </div>
  )
}
