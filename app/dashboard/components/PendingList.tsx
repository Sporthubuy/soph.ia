import { Card } from '../../components/dashboard/Card'
import { Badge } from '../../components/dashboard/Badge'
import { pending } from '../data'

export function PendingList() {
  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="m-0 text-base font-semibold text-[var(--color-text-primary)]">Tus pendientes</h2>
        <a href="#" className="text-[13px] font-medium">
          Ver todos
        </a>
      </div>
      <Card className="!p-0">
        {pending.map((task, i) => (
          <div
            key={i}
            className="flex items-center gap-3.5 border-b border-[var(--color-border-light)] px-5 py-4 last:border-b-0"
          >
            <span className="h-2 w-2 flex-none rounded-full" style={{ background: task.dot }} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{task.title}</div>
              <div className="text-xs text-[var(--color-text-tertiary)]">{task.meta}</div>
            </div>
            <Badge tone={task.tone}>{task.kind}</Badge>
          </div>
        ))}
      </Card>
    </div>
  )
}
