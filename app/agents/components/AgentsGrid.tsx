'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, MoreVertical, Play, Pencil, Trash2 } from 'lucide-react'
import type { Agent } from '../data'
import { AgentModal } from './AgentModal'
import { DeleteAgentModal } from './DeleteAgentModal'

export function AgentsGrid({
  agents: initialAgents,
  onRefresh,
}: {
  agents: Agent[]
  onRefresh: () => void
}) {
  const router = useRouter()
  const [editAgent, setEditAgent] = useState<Agent | null>(null)
  const [deleteAgent, setDeleteAgent] = useState<Agent | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  function getStatusColor(status: string) {
    switch (status) {
      case 'published':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
      case 'draft':
        return 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
      case 'archived':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]'
    }
  }

  function getStatusLabel(status: string) {
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
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {initialAgents.map((agent) => (
          <div
            key={agent.id}
            className="group rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-5 transition-shadow hover:shadow-[var(--shadow-md)]"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{agent.name}</h3>
                  <p className="text-xs text-[var(--color-text-tertiary)]">v{agent.version}</p>
                </div>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenMenu(openMenu === agent.id ? null : agent.id)}
                  className="rounded p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)]"
                  aria-label="Más opciones"
                >
                  <MoreVertical size={16} />
                </button>
                {openMenu === agent.id && (
                  <div className="absolute right-0 top-8 z-20 min-w-[140px] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] py-1 shadow-[var(--shadow-lg)]">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null)
                        setEditAgent(agent)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
                    >
                      <Pencil size={14} /> Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null)
                        setDeleteAgent(agent)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--color-error)] hover:bg-[var(--color-bg-secondary)]"
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {agent.description && (
              <p className="mb-3 line-clamp-2 text-xs text-[var(--color-text-secondary)]">{agent.description}</p>
            )}

            <div className={`mb-3 inline-block rounded border px-2 py-1 text-xs font-medium ${getStatusColor(agent.status)}`}>
              {getStatusLabel(agent.status)}
            </div>

            <div className="mb-3 flex gap-4 border-b border-t border-[var(--color-border)] py-3 text-xs">
              <div>
                <p className="text-[var(--color-text-tertiary)]">Uso</p>
                <p className="font-semibold text-[var(--color-text-primary)]">{agent.usage}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-tertiary)]">Modelo</p>
                <p className="truncate font-semibold text-[var(--color-text-primary)]">{agent.model}</p>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between text-xs">
              <span className="text-[var(--color-text-tertiary)]">Por {agent.author}</span>
              <span className="text-[var(--color-text-tertiary)]">{agent.edited}</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditAgent(agent)}
                className="flex-1 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => router.push(`/agents/${agent.id}/chat`)}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 hover:bg-[var(--color-bg-secondary)]"
                aria-label="Ejecutar"
              >
                <Play size={14} className="text-[var(--color-text-secondary)]" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editAgent && (
        <AgentModal
          agent={editAgent}
          onClose={() => setEditAgent(null)}
          onSaved={() => {
            setEditAgent(null)
            onRefresh()
          }}
        />
      )}

      {deleteAgent && (
        <DeleteAgentModal
          agentId={deleteAgent.id}
          agentName={deleteAgent.name}
          onClose={() => setDeleteAgent(null)}
          onDeleted={() => {
            setDeleteAgent(null)
            onRefresh()
          }}
        />
      )}
    </>
  )
}
