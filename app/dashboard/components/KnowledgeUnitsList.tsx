import { FileText } from 'lucide-react'
import { Card } from '../../components/dashboard/Card'
import { Badge } from '../../components/dashboard/Badge'
import { statusTone, type KnowledgeUnit } from '../../knowledge-units/data'

export function KnowledgeUnitsList({ units }: { units: KnowledgeUnit[] }) {
  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="m-0 text-base font-semibold text-[var(--color-text-primary)]">Tus knowledge units</h2>
        <a href="/knowledge-units" className="text-[13px] font-medium">
          Ver todas
        </a>
      </div>
      <div className="flex flex-col gap-3">
        {units.length === 0 && (
          <p className="m-0 text-sm text-[var(--color-text-secondary)]">Todavía no creaste ninguna knowledge unit.</p>
        )}
        {units.map((unit) => (
          <Card key={unit.id}>
            <div className="flex items-center gap-3.5">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] text-[var(--color-secondary)]">
                <FileText size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-[var(--color-text-primary)]">{unit.name}</div>
                <div className="text-xs text-[var(--color-text-tertiary)]">
                  {unit.area} · {unit.edited}
                </div>
              </div>
              <Badge tone={statusTone[unit.status]}>{unit.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
