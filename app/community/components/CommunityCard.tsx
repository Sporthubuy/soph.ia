'use client'

import { Bot, Copy, Download, Network, Loader2 } from 'lucide-react'

type Props = {
  id: string
  kind: 'agent' | 'ku'
  name: string
  description: string | null
  meta: string
  area: string
  author: string
  authorInitials: string
  org?: string | null
  cloneCount: number
  usageCount: number
  tags: string[]
  cloning: boolean
  onClone: () => void
}

export function CommunityCard({
  kind,
  name,
  description,
  meta,
  area,
  author,
  authorInitials,
  org,
  cloneCount,
  usageCount,
  tags,
  cloning,
  onClone,
}: Props) {
  const Icon = kind === 'agent' ? Bot : Network
  const kindLabel = kind === 'agent' ? 'Agente' : 'Knowledge Unit'
  const accentColor = kind === 'agent' ? 'var(--color-secondary)' : 'var(--color-accent)'

  return (
    <div className="group flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] transition-all hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-md)]">
      {/* Header */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <div
          className="flex h-10 w-10 flex-none items-center justify-center rounded-[var(--radius-md)]"
          style={{ background: `color-mix(in srgb, ${accentColor} 15%, transparent)` }}
        >
          <Icon size={20} style={{ color: accentColor }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="m-0 truncate text-[14px] font-bold text-[var(--color-text-primary)]">{name}</h3>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[var(--color-text-tertiary)]">
            <span className="flex-none rounded bg-[var(--color-bg-secondary)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
              {kindLabel}
            </span>
            <span>·</span>
            <span className="truncate">{area}</span>
            {meta && (
              <>
                <span className="flex-none">·</span>
                <span className="truncate">{meta}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="flex-1 px-4 pb-3">
        <p className="m-0 line-clamp-2 text-[12.5px] leading-relaxed text-[var(--color-text-secondary)]">
          {description || 'Sin descripción'}
        </p>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 px-4 pb-3">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[var(--color-bg-secondary)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-tertiary)]"
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="px-1 text-[10px] text-[var(--color-text-tertiary)]">+{tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-3 border-t border-[var(--color-border)] px-4 py-3">
        <div className="flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-[9px] font-bold text-white">
            {authorInitials}
          </div>
          <span className="text-[11px] text-[var(--color-text-secondary)]">{author}</span>
        </div>

        <div className="flex items-center gap-3 ml-auto text-[11px] text-[var(--color-text-tertiary)]">
          <span className="flex items-center gap-1" title="Usos">
            <Download size={11} />
            {cloneCount}
          </span>

          <button
            type="button"
            onClick={onClone}
            disabled={cloning}
            className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:brightness-110 disabled:opacity-60"
          >
            {cloning ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Copy size={12} />
            )}
            {cloning ? 'Clonando…' : 'Clonar'}
          </button>
        </div>
      </div>
    </div>
  )
}
