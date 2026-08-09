import { useState } from 'react'
import { Check, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '../../components/dashboard/Badge'
import { typeVisual } from '../lib'
import { statusTone, type KnowledgeUnit } from '../data'

const COLUMNS = '30px minmax(180px,2.2fr) 88px 100px 112px 100px 78px 30px'

export function KUTable({
  rows,
  selected,
  onToggleSelect,
  onSelectAll,
  onOpen,
  onEdit,
  onDelete,
}: {
  rows: KnowledgeUnit[]
  selected: Set<string>
  onToggleSelect: (id: string) => void
  onSelectAll: () => void
  onOpen: (unit: KnowledgeUnit) => void
  onEdit: (unit: KnowledgeUnit) => void
  onDelete: (unit: KnowledgeUnit) => void
}) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id))

  return (
    <div className="overflow-x-auto">
      <div
        className="grid min-w-[768px] items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2.5 text-[11px] font-bold tracking-[.04em] text-[var(--color-text-tertiary)]"
        style={{ gridTemplateColumns: COLUMNS }}
      >
        <button
          type="button"
          onClick={onSelectAll}
          aria-label={allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
          className="flex h-[18px] w-[18px] items-center justify-center rounded-[5px]"
          style={{
            background: allSelected ? 'var(--color-primary)' : 'transparent',
            border: `1.5px solid ${allSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
          }}
        >
          <Check size={11} strokeWidth={3.5} className="text-white" style={{ opacity: allSelected ? 1 : 0 }} />
        </button>
        <span>NOMBRE</span>
        <span>TIPO</span>
        <span>ÁREA</span>
        <span>ESTADO</span>
        <span>COMPARTIDA CON</span>
        <span>EDITADA</span>
        <span />
      </div>

      {rows.map((r) => {
        const visual = typeVisual(r.type)
        const isSelected = selected.has(r.id)
        const visibleAvatars = r.shares.slice(0, 3)
        const extra = r.shares.length - visibleAvatars.length

        return (
          <div
            key={r.id}
            onClick={() => onOpen(r)}
            className="grid min-w-[768px] cursor-pointer items-center gap-3 border-b border-[var(--color-border-light)] px-4 py-3 hover:bg-[var(--color-bg-secondary)]"
            style={{ gridTemplateColumns: COLUMNS }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleSelect(r.id)
              }}
              aria-label="Seleccionar"
              className="flex h-[18px] w-[18px] items-center justify-center rounded-[5px]"
              style={{
                background: isSelected ? 'var(--color-primary)' : 'transparent',
                border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
              }}
            >
              <Check size={11} strokeWidth={3.5} className="text-white" style={{ opacity: isSelected ? 1 : 0 }} />
            </button>

            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-[11px] font-bold"
                style={{ background: visual.bg, color: visual.color }}
              >
                {r.typeShort}
              </span>
              <div className="min-w-0">
                <div className="truncate text-[13.5px] font-semibold text-[var(--color-text-primary)]">{r.name}</div>
                <div className="truncate text-[11.5px] text-[var(--color-text-tertiary)]">{r.sub}</div>
              </div>
            </div>

            <span className="text-[12.5px] text-[var(--color-text-secondary)]">{r.type}</span>
            <span className="truncate text-[12.5px] text-[var(--color-text-secondary)]">{r.area}</span>
            <span className="justify-self-start">
              <Badge tone={statusTone[r.status]}>{r.status}</Badge>
            </span>

            <div className="flex items-center">
              {visibleAvatars.map((av, i) => (
                <span
                  key={i}
                  className="-mr-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--color-bg-primary)] bg-[var(--color-bg-tertiary)] text-[9.5px] font-bold text-[var(--color-text-secondary)]"
                >
                  {av.i}
                </span>
              ))}
              {extra > 0 && <span className="ml-3 text-[11.5px] text-[var(--color-text-tertiary)]">+{extra}</span>}
            </div>

            <span className="text-xs text-[var(--color-text-tertiary)]">{r.edited}</span>

            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setOpenMenu(openMenu === r.id ? null : r.id)
                }}
                aria-label="Más acciones"
                className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[var(--color-text-tertiary)] hover:bg-[var(--color-active)]"
              >
                <MoreVertical size={16} />
              </button>
              {openMenu === r.id && (
                <div className="absolute right-0 top-8 z-20 min-w-[140px] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] py-1 shadow-[var(--shadow-lg)]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenMenu(null)
                      onEdit(r)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
                  >
                    <Pencil size={14} /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenMenu(null)
                      onDelete(r)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--color-error)] hover:bg-[var(--color-bg-secondary)]"
                  >
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
