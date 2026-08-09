'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppHeader } from '../components/shell/AppHeader'
import { AppSidebar } from '../components/shell/AppSidebar'
import { fetchCurrentProfile, type Profile } from '../lib/profile'
import { createClient } from '../lib/supabase/client'
import { CommunityCard } from './components/CommunityCard'
import { Bot, Network, Search, Loader2 } from 'lucide-react'

type AuthorRef = { id: string; full_name: string; initials: string } | null
type OrgRef = { name: string } | null

type CommunityAgent = {
  id: string
  name: string
  description: string | null
  type: string
  model: string
  usage_count: number
  clone_count: number
  tags: string[]
  created_at: string
  author: AuthorRef
  organization: OrgRef
}

type CommunityKU = {
  id: string
  name: string
  type: string
  area: string
  format: string
  tags: string[]
  usage_count: number
  clone_count: number
  created_at: string
  author: AuthorRef
  organization: OrgRef
}

type Tab = 'all' | 'agents' | 'kus'

export default function CommunityPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [agents, setAgents] = useState<CommunityAgent[]>([])
  const [kus, setKUs] = useState<CommunityKU[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('all')
  const [query, setQuery] = useState('')
  const [cloning, setCloning] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const profileData = await fetchCurrentProfile(supabase)
        setProfile(profileData)

        const res = await fetch('/api/community')
        if (!res.ok) throw new Error('Error al cargar la comunidad')
        const data = await res.json()
        setAgents(data.agents ?? [])
        setKUs(data.knowledgeUnits ?? [])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredAgents = useMemo(() => {
    if (!query.trim()) return agents
    const q = query.toLowerCase()
    return agents.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    )
  }, [agents, query])

  const filteredKUs = useMemo(() => {
    if (!query.trim()) return kus
    const q = query.toLowerCase()
    return kus.filter(
      (k) =>
        k.name.toLowerCase().includes(q) ||
        k.area.toLowerCase().includes(q) ||
        k.tags.some((t) => t.toLowerCase().includes(q))
    )
  }, [kus, query])

  async function handleClone(id: string, type: 'agent' | 'ku') {
    setCloning(id)
    try {
      const res = await fetch('/api/community/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al clonar')

      if (type === 'agent') {
        router.push(`/agents/${data.cloned.id}`)
      } else {
        router.push(`/knowledge-units/${data.cloned.id}/edit`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al clonar')
      setCloning(null)
    }
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: 'Todos', count: agents.length + kus.length },
    { key: 'agents', label: 'Agentes', count: agents.length },
    { key: 'kus', label: 'Knowledge Units', count: kus.length },
  ]

  const showAgents = tab === 'all' || tab === 'agents'
  const showKUs = tab === 'all' || tab === 'kus'

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
      <AppHeader
        userName={profile?.full_name ?? ''}
        userEmail={profile?.email ?? ''}
        initials={profile?.initials ?? ''}
      />
      <div className="flex items-start">
        <AppSidebar active="community" />
        <div className="min-w-0 flex-1 px-4 pb-14 pt-6 sm:px-6 md:px-7 md:pt-7">
          {/* Header */}
          <div className="mb-6">
            <h1 className="m-0 mb-1.5 text-[26px] font-bold text-[var(--color-text-primary)]">Comunidad</h1>
            <p className="m-0 text-sm text-[var(--color-text-secondary)]">
              Explorá agentes y knowledge units compartidos por la comunidad. Clonalos a tu workspace y usalos con tu propia IA.
            </p>
          </div>

          {/* Search + Tabs */}
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar en la comunidad…"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] py-2.5 pl-9 pr-3 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)]"
              />
            </div>

            <div className="flex gap-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    tab === t.key
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {t.label}
                  <span className="ml-1.5 opacity-60">{t.count}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[rgba(239,68,68,0.06)] px-4 py-3 text-sm text-[var(--color-error)]">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-[var(--color-text-tertiary)]" />
            </div>
          ) : (
            <>
              {/* Agents Section */}
              {showAgents && filteredAgents.length > 0 && (
                <div className="mb-8">
                  {tab === 'all' && (
                    <div className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                      <Bot size={14} />
                      Agentes ({filteredAgents.length})
                    </div>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredAgents.map((agent) => (
                      <CommunityCard
                        key={agent.id}
                        id={agent.id}
                        kind="agent"
                        name={agent.name}
                        description={agent.description}
                        meta={agent.model}
                        area={agent.type}
                        author={agent.author?.full_name ?? 'Anónimo'}
                        authorInitials={agent.author?.initials ?? '??'}
                        org={agent.organization?.name}
                        cloneCount={agent.clone_count}
                        usageCount={agent.usage_count}
                        tags={agent.tags}
                        cloning={cloning === agent.id}
                        onClone={() => handleClone(agent.id, 'agent')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* KUs Section */}
              {showKUs && filteredKUs.length > 0 && (
                <div className="mb-8">
                  {tab === 'all' && (
                    <div className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                      <Network size={14} />
                      Knowledge Units ({filteredKUs.length})
                    </div>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredKUs.map((ku) => (
                      <CommunityCard
                        key={ku.id}
                        id={ku.id}
                        kind="ku"
                        name={ku.name}
                        description={null}
                        meta={ku.format}
                        area={ku.area}
                        author={ku.author?.full_name ?? 'Anónimo'}
                        authorInitials={ku.author?.initials ?? '??'}
                        org={ku.organization?.name}
                        cloneCount={ku.clone_count}
                        usageCount={ku.usage_count}
                        tags={ku.tags}
                        cloning={cloning === ku.id}
                        onClone={() => handleClone(ku.id, 'ku')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {filteredAgents.length === 0 && filteredKUs.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-20 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-bg-primary)] text-[var(--color-text-tertiary)]">
                    <Search size={24} />
                  </div>
                  <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {query ? 'Sin resultados' : 'Todavía no hay nada publicado'}
                  </div>
                  <div className="max-w-xs text-xs text-[var(--color-text-tertiary)]">
                    {query
                      ? `No encontramos resultados para "${query}". Probá con otros términos.`
                      : 'Compartí tus agentes o knowledge units con la comunidad cambiando su visibilidad a "Toda la comunidad".'}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
