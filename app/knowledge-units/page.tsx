'use client'

import { useEffect, useMemo, useState } from 'react'
import { AppHeader } from '../components/shell/AppHeader'
import { AppSidebar } from '../components/shell/AppSidebar'
import { createClient } from '../lib/supabase/client'
import { fetchCurrentProfile, type Profile } from '../lib/profile'
import { Toolbar } from './components/Toolbar'
import { BulkActionsBar } from './components/BulkActionsBar'
import { KUTable } from './components/KUTable'
import { KUGrid } from './components/KUGrid'
import { EmptyState } from './components/EmptyState'
import { DetailDrawer } from './components/DetailDrawer'
import { CreateModal } from './components/CreateModal'
import { ShareModal, type ShareTarget } from './components/ShareModal'
import { fetchKnowledgeUnits, createKnowledgeUnit } from './db'
import { areas, type KnowledgeUnit, type KUStatus } from './data'

export default function KnowledgeUnitsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [units, setUnits] = useState<KnowledgeUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [area, setArea] = useState(areas[0])
  const [sort, setSort] = useState('recent')
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [statusFilter, setStatusFilter] = useState<KUStatus | 'Todas'>('Todas')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [detailUnit, setDetailUnit] = useState<KnowledgeUnit | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    async function load() {
      try {
        const [profileData, unitsData] = await Promise.all([
          fetchCurrentProfile(supabase),
          fetchKnowledgeUnits(supabase),
        ])
        if (cancelled) return
        setProfile(profileData)
        setUnits(unitsData)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'No pudimos cargar las knowledge units.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const rows = useMemo(() => {
    let result = units.filter((u) => {
      const matchesQuery =
        query.trim() === '' ||
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.area.toLowerCase().includes(query.toLowerCase()) ||
        u.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      const matchesArea = area === areas[0] || u.area === area
      const matchesStatus = statusFilter === 'Todas' || u.status === statusFilter
      return matchesQuery && matchesArea && matchesStatus
    })

    result = [...result].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'usage') return b.usage - a.usage
      if (sort === 'quality') return b.quality - a.quality
      return 0
    })

    return result
  }, [units, query, area, statusFilter, sort])

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelected((prev) => {
      const allSelected = rows.length > 0 && rows.every((r) => prev.has(r.id))
      if (allSelected) return new Set()
      return new Set(rows.map((r) => r.id))
    })
  }

  function resetFilters() {
    setQuery('')
    setArea(areas[0])
    setStatusFilter('Todas')
  }

  async function handleCreate(draft: { name: string; type: string; area: string }) {
    if (!profile) return
    const supabase = createClient()
    const newUnit = await createKnowledgeUnit(supabase, {
      name: draft.name,
      type: draft.type,
      area: draft.area,
      organizationId: profile.organization_id,
      authorId: profile.id,
    })
    setUnits((prev) => [newUnit, ...prev])
    setCreateOpen(false)
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
      <AppHeader
        userName={profile?.full_name ?? ''}
        userEmail={profile?.email ?? ''}
        initials={profile?.initials ?? ''}
      />

      <div className="flex items-start">
        <AppSidebar active="knowledge-units" />

        <div className="flex min-w-0 flex-1 items-start">
          <div className="min-w-0 flex-1 px-7 pb-14 pt-7">
            <div className="mb-5.5 flex flex-wrap items-end gap-4">
              <div className="min-w-[260px] flex-[1_1_280px]">
                <h1 className="m-0 mb-1.5 text-[26px] font-bold text-[var(--color-text-primary)]">Knowledge units</h1>
                <p className="m-0 text-sm text-[var(--color-text-secondary)]">
                  Creá, aprobá y compartí el conocimiento que alimenta a tus agentes.
                </p>
              </div>
              <div className="flex flex-none gap-2.5">
                <button
                  type="button"
                  disabled
                  title="La importación estará disponible próximamente."
                  className="rounded-[var(--radius-md)] border border-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-hover)]"
                >
                  Importar (próximamente)
                </button>
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  disabled={!profile}
                  className="rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#001a2f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Crear knowledge unit
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-5 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[rgba(239,68,68,0.06)] px-4 py-3 text-sm text-[var(--color-error)]">
                {error}
              </div>
            )}

            <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)]">
              <Toolbar
                query={query}
                onQueryChange={setQuery}
                area={area}
                onAreaChange={setArea}
                areas={areas}
                sort={sort}
                onSortChange={setSort}
                view={view}
                onViewChange={setView}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
              />

              {selected.size > 0 && (
                <BulkActionsBar
                  count={selected.size}
                  onShare={() => {
                    const selectedUnits = units.filter((u) => selected.has(u.id))
                    setShareTarget({
                      name: `${selected.size} elementos seleccionados`,
                      shares: selectedUnits.flatMap((u) => u.shares),
                    })
                  }}
                  onClear={() => setSelected(new Set())}
                />
              )}

              {loading ? (
                <div className="px-6 py-14 text-center text-sm text-[var(--color-text-secondary)]">Cargando…</div>
              ) : rows.length === 0 ? (
                <EmptyState onReset={resetFilters} />
              ) : view === 'list' ? (
                <KUTable rows={rows} selected={selected} onToggleSelect={toggleSelect} onSelectAll={toggleSelectAll} onOpen={setDetailUnit} />
              ) : (
                <KUGrid rows={rows} onOpen={setDetailUnit} />
              )}

              <div className="flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3 text-xs text-[var(--color-text-tertiary)]">
                <span>
                  {rows.length} de {units.length} knowledge units
                </span>
                <span className="hidden sm:inline">Última sincronización hace 4 minutos</span>
              </div>
            </div>
          </div>

          {detailUnit && (
            <DetailDrawer
              unit={detailUnit}
              onClose={() => setDetailUnit(null)}
              onShare={() => setShareTarget({ name: detailUnit.name, shares: detailUnit.shares })}
            />
          )}
        </div>
      </div>

      {createOpen && <CreateModal onClose={() => setCreateOpen(false)} onSave={handleCreate} />}
      {shareTarget && <ShareModal unit={shareTarget} onClose={() => setShareTarget(null)} />}
    </div>
  )
}
