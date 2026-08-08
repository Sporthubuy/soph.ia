import { Card } from '../../components/dashboard/Card'
import { changes } from '../data'

export function ActivityFeed() {
  return (
    <div>
      <h2 className="m-0 mb-3.5 text-base font-semibold text-[var(--color-text-primary)]">Últimos cambios</h2>
      <Card>
        <div className="flex flex-col gap-4">
          {changes.map((c, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-bg-tertiary)] text-[10px] font-bold text-[var(--color-text-secondary)]">
                {c.initials}
              </span>
              <div className="min-w-0">
                <div className="text-[13px] leading-relaxed text-[var(--color-text-primary)]">
                  <strong className="font-semibold">{c.who}</strong> {c.what}
                </div>
                <div className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">{c.when}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
