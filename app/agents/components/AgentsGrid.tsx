'use client'

import { useEffect, useState } from 'react'
import { Zap, MoreVertical, Play, Pause, Archive } from 'lucide-react'
import type { Agent } from '../data'

export function AgentsGrid({ agents: initialAgents }: { agents: Agent[] }) {
  const [agents, setAgents] = useState<Agent[]>(initialAgents)
  const [loading, setLoading] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500/10 text-green-600 border-green-200'
      case 'draft':
        return 'bg-gray-500/10 text-gray-600 border-gray-200'
      case 'archived':
        return 'bg-red-500/10 text-red-600 border-red-200'
      default:
        return 'bg-gray-500/10 text-gray-600'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Activo'
      case 'draft':
        return 'Borrador'
      case 'archived':
        return 'Archivado'
      default:
        return status
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => (
        <div
          key={agent.id}
          className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-5 hover:shadow-md transition-shadow"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm font-bold text-white">
                <Zap size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{agent.name}</h3>
                <p className="text-xs text-[var(--color-text-tertiary)]">v{agent.version}</p>
              </div>
            </div>
            <button
              type="button"
              className="p-1 hover:bg-[var(--color-bg-secondary)] rounded"
              aria-label="Más opciones"
            >
              <MoreVertical size={16} className="text-[var(--color-text-tertiary)]" />
            </button>
          </div>

          {/* Description */}
          {agent.description && (
            <p className="text-xs text-[var(--color-text-secondary)] mb-3 line-clamp-2">{agent.description}</p>
          )}

          {/* Status Badge */}
          <div className={`inline-block px-2 py-1 rounded text-xs font-medium border mb-3 ${getStatusColor(agent.status)}`}>
            {getStatusLabel(agent.status)}
          </div>

          {/* Stats */}
          <div className="flex gap-4 py-3 border-t border-b border-[var(--color-border)] mb-3 text-xs">
            <div>
              <p className="text-[var(--color-text-tertiary)]">Uso</p>
              <p className="font-semibold text-[var(--color-text-primary)]">{agent.usage}</p>
            </div>
            <div>
              <p className="text-[var(--color-text-tertiary)]">Modelo</p>
              <p className="font-semibold text-[var(--color-text-primary)] truncate">{agent.model}</p>
            </div>
          </div>

          {/* Author */}
          <div className="flex items-center justify-between text-xs mb-4">
            <span className="text-[var(--color-text-tertiary)]">Por {agent.author}</span>
            <span className="text-[var(--color-text-tertiary)]">{agent.edited}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
            >
              Editar
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]"
              aria-label="Acciones"
            >
              <Play size={14} className="text-[var(--color-text-secondary)]" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
