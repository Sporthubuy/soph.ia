import { Link2, X } from 'lucide-react'
import type { Person } from '../data'

export type ShareTarget = { name: string; shares: Person[] }

export function ShareModal({ unit, onClose }: { unit: ShareTarget; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(15,23,42,0.42)] p-8">
      <div className="w-full max-w-[520px] rounded-[var(--radius-lg)] bg-[var(--color-bg-primary)] shadow-[var(--shadow-xl)]">
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-6 py-5">
          <div className="min-w-0 flex-1">
            <div className="text-[17px] font-bold text-[var(--color-text-primary)]">Compartir</div>
            <div className="truncate text-[12.5px] text-[var(--color-text-secondary)]">{unit.name}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-[30px] w-[30px] items-center justify-center rounded-[6px] text-[var(--color-text-tertiary)] hover:bg-[var(--color-hover)]"
          >
            <X size={17} />
          </button>
        </div>

        <div className="flex flex-col gap-4.5 px-6 py-5">
          <p className="m-0 rounded-[var(--radius-md)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-secondary)]">
            La gestión de permisos y enlaces internos estará disponible próximamente.
          </p>

          <div className="flex flex-col gap-3">
            {unit.shares.map((p, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-[var(--color-bg-tertiary)] text-[10.5px] font-bold text-[var(--color-text-secondary)]">
                  {p.i}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-[var(--color-text-primary)]">{p.name}</div>
                  <div className="text-[11.5px] text-[var(--color-text-tertiary)]">{p.scope}</div>
                </div>
                <span className="text-[12.5px] font-medium text-[var(--color-text-secondary)]">{p.role}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3.5 text-[12.5px] text-[var(--color-text-secondary)]">
            <Link2 size={18} className="flex-none" />
            Los permisos actuales se muestran arriba.
          </div>
        </div>

        <div className="flex justify-end gap-2.5 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--radius-md)] border border-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-hover)]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
