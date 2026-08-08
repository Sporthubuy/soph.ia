import { Card } from '../../components/dashboard/Card'
import { invites } from '../data'

export function Invites() {
  if (invites.length === 0) return null

  return (
    <div className="mb-8">
      <div className="mb-3.5 flex items-center gap-2.5">
        <h2 className="m-0 text-base font-semibold text-[var(--color-text-primary)]">Invitaciones</h2>
        <span className="rounded-[var(--radius-full)] bg-[rgba(59,130,246,0.14)] px-2 py-0.5 text-[11px] font-bold text-[#1D4FD7]">
          {invites.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {invites.map((inv, i) => (
          <Card key={i}>
            <div className="flex items-center gap-3.5">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-bg-tertiary)] text-xs font-bold text-[var(--color-text-secondary)]">
                {inv.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm leading-relaxed text-[var(--color-text-primary)]">
                  <strong className="font-semibold">{inv.who}</strong> {inv.what}
                </div>
                <div className="text-xs text-[var(--color-text-tertiary)]">{inv.when}</div>
              </div>
              <div className="flex flex-none gap-2">
                <button
                  type="button"
                  className="rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#001a2f]"
                >
                  Aceptar
                </button>
                <button
                  type="button"
                  className="rounded-[var(--radius-md)] border border-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-hover)]"
                >
                  Más tarde
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
