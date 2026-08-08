import { AppHeader } from '../components/shell/AppHeader'
import { AppSidebar } from '../components/shell/AppSidebar'
import { QuickActions } from './components/QuickActions'
import { Invites } from './components/Invites'
import { PendingList } from './components/PendingList'
import { ActivityFeed } from './components/ActivityFeed'
import { AgentsList } from './components/AgentsList'
import { KnowledgeUnitsList } from './components/KnowledgeUnitsList'
import { currentUser } from './data'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
      <AppHeader
        userName={currentUser.userName}
        userEmail={currentUser.userEmail}
        initials={currentUser.initials}
      />

      <div className="flex items-start">
        <AppSidebar active="dashboard" />

        <div className="min-w-0 flex-1 px-8 pb-14 pt-8" style={{ maxWidth: 1200 }}>
          <div className="mb-6">
            <h1 className="m-0 mb-1.5 text-[28px] font-bold text-[var(--color-text-primary)]">
              Hola, {currentUser.firstName}
            </h1>
            <p className="m-0 text-sm text-[var(--color-text-secondary)]">
              Tenés 4 tareas pendientes y 2 invitaciones nuevas.
            </p>
          </div>

          <QuickActions />
          <Invites />

          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
            <PendingList />
            <ActivityFeed />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <AgentsList />
            <KnowledgeUnitsList />
          </div>
        </div>
      </div>
    </div>
  )
}
