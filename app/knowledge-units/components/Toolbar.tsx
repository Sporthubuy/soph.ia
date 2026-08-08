import { List, LayoutGrid, Search } from 'lucide-react'
import type { KUStatus } from '../data'

const STATUS_FILTERS: (KUStatus | 'Todas')[] = ['Todas', 'Publicado', 'En revisión', 'Borrador', 'Archivado']

const STATUS_PILL_ACTIVE: Record<KUStatus | 'Todas', { bg: string; color: string; border: string }> = {
  Todas: { bg: 'var(--color-primary)', color: '#fff', border: 'var(--color-primary)' },
  Publicado: { bg: 'rgba(16,185,129,0.14)', color: '#059669', border: 'rgba(16,185,129,0.3)' },
  'En revisión': { bg: 'rgba(245,158,11,0.16)', color: '#B45309', border: 'rgba(245,158,11,0.3)' },
  Borrador: { bg: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)', border: 'var(--color-border)' },
  Archivado: { bg: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)', border: 'var(--color-border)' },
}

const INACTIVE_PILL = { bg: 'var(--color-bg-primary)', color: 'var(--color-text-secondary)', border: 'var(--color-border)' }

export function Toolbar({
  query,
  onQueryChange,
  area,
  onAreaChange,
  areas,
  sort,
  onSortChange,
  view,
  onViewChange,
  statusFilter,
  onStatusFilterChange,
}: {
  query: string
  onQueryChange: (v: string) => void
  area: string
  onAreaChange: (v: string) => void
  areas: string[]
  sort: string
  onSortChange: (v: string) => void
  view: 'list' | 'grid'
  onViewChange: (v: 'list' | 'grid') => void
  statusFilter: KUStatus | 'Todas'
  onStatusFilterChange: (v: KUStatus | 'Todas') => void
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-[var(--color-border)] p-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[200px] max-w-[340px] flex-[1_1_220px]">
          <Search className="pointer-events-none absolute left-[11px] top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" size={15} />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar por nombre, área o etiqueta"
            aria-label="Buscar knowledge units"
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] py-2 pl-[34px] pr-3 font-[family-name:var(--font-sans)] text-[13px] text-[var(--color-text-primary)] outline-none"
          />
        </div>

        <div className="ml-auto flex flex-none flex-wrap items-center gap-2">
          <select
            value={area}
            onChange={(e) => onAreaChange(e.target.value)}
            aria-label="Filtrar por área"
            className="max-w-[160px] cursor-pointer rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2.5 py-[7px] font-[family-name:var(--font-sans)] text-[12.5px] text-[var(--color-text-primary)] outline-none"
          >
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Ordenar"
            className="max-w-[150px] cursor-pointer rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2.5 py-[7px] font-[family-name:var(--font-sans)] text-[12.5px] text-[var(--color-text-primary)] outline-none"
          >
            <option value="recent">Más recientes</option>
            <option value="name">Nombre A–Z</option>
            <option value="usage">Más usadas</option>
            <option value="quality">Mejor calidad</option>
          </select>

          <div className="flex flex-none gap-0.5 rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] p-0.5">
            <button
              type="button"
              onClick={() => onViewChange('list')}
              aria-label="Vista lista"
              className="flex h-7 w-[30px] items-center justify-center rounded-[6px]"
              style={{ background: view === 'list' ? 'var(--color-bg-primary)' : 'transparent' }}
            >
              <List size={15} className={view === 'list' ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]'} />
            </button>
            <button
              type="button"
              onClick={() => onViewChange('grid')}
              aria-label="Vista tarjetas"
              className="flex h-7 w-[30px] items-center justify-center rounded-[6px]"
              style={{ background: view === 'grid' ? 'var(--color-bg-primary)' : 'transparent' }}
            >
              <LayoutGrid size={15} className={view === 'grid' ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]'} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_FILTERS.map((f) => {
          const active = f === statusFilter
          const style = active ? STATUS_PILL_ACTIVE[f] : INACTIVE_PILL
          return (
            <button
              key={f}
              type="button"
              onClick={() => onStatusFilterChange(f)}
              className="rounded-[var(--radius-full)] px-[11px] py-1.5 font-[family-name:var(--font-sans)] text-xs font-semibold"
              style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
            >
              {f}
            </button>
          )
        })}
      </div>
    </div>
  )
}
