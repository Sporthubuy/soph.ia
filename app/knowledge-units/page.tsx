'use client'

import { useMemo, useState } from 'react'
import { AppHeader } from '../components/shell/AppHeader'
import { AppSidebar } from '../components/shell/AppSidebar'
import { Toolbar } from './components/Toolbar'
import { BulkActionsBar } from './components/BulkActionsBar'
import { KUTable } from './components/KUTable'
import { KUGrid } from './components/KUGrid'
import { EmptyState } from './components/EmptyState'
import { DetailDrawer } from './components/DetailDrawer'
import { CreateModal } from './components/CreateModal'
import { ShareModal, type ShareTarget } from './components/ShareModal'
import { areas, currentUser, units as initialUnits, type KnowledgeUnit, type KUStatus } from './data'

export default function KnowledgeUnitsPage() {
  const [units, setUnits] = useState<KnowledgeUnit[]>(initialUnits)
  const [query, setQuery] = useState('')
  const [area, setArea] = useState(areas[0])
  const [sort, setSort] = useState('recent')
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [statusFilter, setStatusFilter] = useState<KUStatus | 'Todas'>('Todas')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [detailUnit, setDetailUnit] = useState<KnowledgeUnit | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null)

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

  function resetFilters() {
    setQuery('')
    setArea(areas[0])
    setStatusFilter('Todas')
  }

  function handleCreate(draft: { name: string; type: string; area: string }) {
    const typeShort = draft.type.slice(0, 3).toUpperCase()
    const newUnit: KnowledgeUnit = {
      id: `ku-${Date.now()}`,
      name: draft.name,
      type: draft.type,
      typeShort,
      area: draft.area,
      status: 'Borrador',
      sub: 'v1 · Borrador',
      edited: 'recién',
      version: 1,
      author: currentUser.userName,
      language: 'Español',
      format: 'Borrador',
      created: 'hoy',
      quality: 0,
      usage: 0,
      usageNote: 'Sin uso todavía',
      tags: [],
      shares: [{ i: currentUser.initials, name: currentUser.userName, scope: 'Autor', role: 'Puede editar' }],
      history: [{ who: currentUser.userName, what: 'creó el borrador', when: 'recién' }],
    }
    setUnits((prev) => [newUnit, ...prev])
    setCreateOpen(false)
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
      <AppHeader userName={currentUser.userName} userEmail={currentUser.userEmail} initials={currentUser.initials} />

      <div className="flex items-start">
        <AppSidebar active="knowledge-units" />

        <div className="flex min-w-0 flex-1 items-start">
          <div className="min-w-0 flex-1 px-7 pb-14 pt-7">
            <div className="mb-5.5 flex flex-wrap items-end gap-4">
              <div className="min-w-[260px] flex-[1_1_280px]">
                <h1 className="m-0 mb-1.5 text-[26px] font-bold text-[var(--color-text-primary)]">Knowledge units</h1>
                <p className="m-0 text-sm text-[var(--color-text-secondary)]">
                  {units.length} unidades · el conocimiento que usan tus agentes.
                </p>
              </div>
              <div className="flex flex-none gap-2.5">
                <button
                  type="button"
                  className="rounded-[var(--radius-md)] border border-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-hover)]"
                >
                  Importar
                </button>
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#001a2f]"
                >
                  Crear knowledge unit
                </button>
              </div>
            </div>

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

              {rows.length === 0 ? (
                <EmptyState onReset={resetFilters} />
              ) : view === 'list' ? (
                <KUTable rows={rows} selected={selected} onToggleSelect={toggleSelect} onOpen={setDetailUnit} />
              ) : (
                <KUGrid rows={rows} onOpen={setDetailUnit} />
              )}

              <div className="flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3 text-xs text-[var(--color-text-tertiary)]">
                <span>{rows.length} de {units.length} knowledge units</span>
                <span>Última sincronización hace 4 minutos</span>
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
