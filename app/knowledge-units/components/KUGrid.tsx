import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '../../components/dashboard/Badge'
import { typeVisual } from '../lib'
import { statusTone, type KnowledgeUnit } from '../data'

export function KUGrid({
  rows,
  onOpen,
  onEdit,
  onDelete,
}: {
  rows: KnowledgeUnit[]
  onOpen: (unit: KnowledgeUnit) => void
  onEdit: (unit: KnowledgeUnit) => void
  onDelete: (unit: KnowledgeUnit) => void
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3.5 p-4">
      {rows.map((r) => {
        const visual = typeVisual(r.type)
        const visibleAvatars = r.shares.slice(0, 3)
        const extra = r.shares.length - visibleAvatars.length

        return (
          <div
            key={r.id}
            onClick={() => onOpen(r)}
            className="group cursor-pointer rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4 hover:shadow-[var(--shadow-md)]"
          >
            <div className="mb-3 flex items-center gap-2.5">
              <span
                className="flex h-[34px] w-[34px] items-center justify-center rounded-lg text-[11px] font-bold"
                style={{ background: visual.bg, color: visual.color }}
              >
                {r.typeShort}
              </span>
              <Badge tone={statusTone[r.status]}>{r.status}</Badge>
            </div>
            <div className="mb-1 text-sm font-semibold leading-snug text-[var(--color-text-primary)]">{r.name}</div>
            <div className="mb-3.5 text-xs text-[var(--color-text-tertiary)]">
              {r.area} · {r.edited}
            </div>
            <div className="flex items-center justify-between">
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
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onEdit(r) }}
                  className="rounded p-1 text-[var(--color-text-tertiary)] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[var(--color-bg-secondary)]"
                  aria-label="Editar"
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDelete(r) }}
                  className="rounded p-1 text-[var(--color-text-tertiary)] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-error)]"
                  aria-label="Eliminar"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
