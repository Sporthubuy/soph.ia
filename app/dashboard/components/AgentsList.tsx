import { Card } from '../../components/dashboard/Card'
import { Badge } from '../../components/dashboard/Badge'
import { agents } from '../data'

export function AgentsList() {
  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="m-0 text-base font-semibold text-[var(--color-text-primary)]">Tus agentes</h2>
        <a href="#" className="text-[13px] font-medium">
          Ver todos
        </a>
      </div>
      <div className="flex flex-col gap-3">
        {agents.map((agent, i) => (
          <Card key={i}>
            <div className="flex items-center gap-3.5">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] text-xs font-bold text-[var(--color-primary)]">
                {agent.tag}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-[var(--color-text-primary)]">{agent.name}</div>
                <div className="text-xs text-[var(--color-text-tertiary)]">{agent.meta}</div>
              </div>
              <Badge tone={agent.tone}>{agent.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
