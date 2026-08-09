import { X, Trash2 } from 'lucide-react'
import { Badge } from '../../components/dashboard/Badge'
import { approvalSteps, qualityColor, stepDotColor, typeVisual } from '../lib'
import { statusTone, type KnowledgeUnit } from '../data'

export function DetailDrawer({
  unit,
  onClose,
  onShare,
  onEdit,
  onDelete,
}: {
  unit: KnowledgeUnit
  onClose: () => void
  onShare: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const visual = typeVisual(unit.type)
  const steps = approvalSteps(unit.status, { author: unit.author, edited: unit.edited })

  const meta = [
    { k: 'Área', v: unit.area },
    { k: 'Propietario', v: unit.author },
    { k: 'Última edición', v: unit.edited },
    { k: 'Versión', v: `v${unit.version}` },
    { k: 'Vence', v: unit.expires ?? 'Sin vencimiento' },
    { k: 'Fuente', v: unit.source },
  ]

  return (
    <div className="fixed right-0 top-16 z-50 h-[calc(100vh-64px)] w-[340px] max-w-[92vw] overflow-y-auto border-l border-[var(--color-border)] bg-[var(--color-bg-primary)] shadow-[var(--shadow-xl)]">
      <div className="flex items-start gap-3 border-b border-[var(--color-border-light)] px-5 pb-4 pt-5">
        <span
          className="flex h-10 w-10 flex-none items-center justify-center rounded-[10px] text-xs font-bold"
          style={{ background: visual.bg, color: visual.color }}
        >
          {unit.typeShort}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-bold leading-snug text-[var(--color-text-primary)]">{unit.name}</div>
          <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
            {unit.type} · v{unit.version}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[var(--color-text-tertiary)] hover:bg-[var(--color-hover)]"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-4.5 px-5 py-4.5">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#001a2f]"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={onShare}
            className="rounded-[var(--radius-md)] border border-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-hover)]"
          >
            Compartir
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-[var(--radius-md)] border border-[var(--color-error)]/30 p-2.5 text-[var(--color-error)] hover:bg-[rgba(239,68,68,0.06)]"
            aria-label="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div>
          <div className="mb-2 text-[11px] font-bold tracking-[.05em] text-[var(--color-text-tertiary)]">ESTADO</div>
          <div className="mb-3 flex items-center gap-2">
            <Badge tone={statusTone[unit.status]}>{unit.status}</Badge>
            <span className="text-xs text-[var(--color-text-secondary)]">Editada {unit.edited}</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {steps.map((st, i) => {
              const colors = stepDotColor(st.state)
              return (
                <div key={i} className="flex items-start gap-2.5">
                  <span
                    className="mt-[5px] h-[9px] w-[9px] flex-none rounded-full"
                    style={{ background: colors.dot, boxShadow: `0 0 0 3px ${colors.ring}` }}
                  />
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-semibold" style={{ color: colors.titleColor }}>
                      {st.title}
                    </div>
                    <div className="text-[11.5px] text-[var(--color-text-tertiary)]">{st.meta}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-secondary)] p-3">
            <div className="text-[11px] font-bold tracking-[.05em] text-[var(--color-text-tertiary)]">CALIDAD</div>
            <div className="mt-1 text-xl font-bold text-[var(--color-text-primary)]">{unit.quality}</div>
            <div className="mt-2 h-[5px] rounded-[3px] bg-[var(--color-border)]">
              <div className="h-[5px] rounded-[3px]" style={{ background: qualityColor(unit.quality), width: `${unit.quality}%` }} />
            </div>
          </div>
          <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-secondary)] p-3">
            <div className="text-[11px] font-bold tracking-[.05em] text-[var(--color-text-tertiary)]">USO EN AGENTES</div>
            <div className="mt-1 text-xl font-bold text-[var(--color-text-primary)]">{unit.usage}</div>
            <div className="text-[11.5px] text-[var(--color-text-tertiary)]">{unit.usageNote}</div>
          </div>
        </div>

        <div>
          <div className="mb-2.5 text-[11px] font-bold tracking-[.05em] text-[var(--color-text-tertiary)]">DETALLE</div>
          <div className="flex flex-col gap-2">
            {meta.map((m) => (
              <div key={m.k} className="flex items-baseline gap-3 text-[12.5px]">
                <span className="flex-none basis-[108px] text-[var(--color-text-tertiary)]">{m.k}</span>
                <span className="min-w-0 flex-1 font-medium text-[var(--color-text-primary)]">{m.v}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2.5 text-[11px] font-bold tracking-[.05em] text-[var(--color-text-tertiary)]">ETIQUETAS</div>
          <div className="flex flex-wrap gap-1.5">
            {unit.tags.map((t) => (
              <span key={t} className="rounded-[var(--radius-full)] bg-[var(--color-bg-tertiary)] px-2.5 py-1 text-[11.5px] font-medium text-[var(--color-text-secondary)]">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <div className="text-[11px] font-bold tracking-[.05em] text-[var(--color-text-tertiary)]">COMPARTIDA CON</div>
            <button type="button" onClick={onShare} className="bg-transparent p-0 text-xs font-semibold text-[var(--color-secondary)]">
              Gestionar
            </button>
          </div>
          <div className="flex flex-col gap-2.5">
            {unit.shares.map((sh, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[var(--color-bg-tertiary)] text-[10px] font-bold text-[var(--color-text-secondary)]">
                  {sh.i}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-semibold text-[var(--color-text-primary)]">{sh.name}</div>
                  <div className="text-[11.5px] text-[var(--color-text-tertiary)]">{sh.scope}</div>
                </div>
                <span className="text-[11.5px] font-medium text-[var(--color-text-secondary)]">{sh.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2.5 text-[11px] font-bold tracking-[.05em] text-[var(--color-text-tertiary)]">HISTORIAL</div>
          <div className="flex flex-col gap-3">
            {unit.history.map((h, i) => (
              <div key={i} className="flex gap-2.5">
                <span className="mt-[5px] h-[7px] w-[7px] flex-none rounded-full bg-[var(--color-border)]" />
                <div>
                  <div className="text-[12.5px] leading-relaxed text-[var(--color-text-primary)]">
                    <strong className="font-semibold">{h.who}</strong> {h.what}
                  </div>
                  <div className="text-[11.5px] text-[var(--color-text-tertiary)]">{h.when}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
