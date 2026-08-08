'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { Agent, AgentStatus } from '../data'

type AgentFormData = {
  name: string
  description: string
  type: string
  model: string
  status: AgentStatus
}

const AGENT_TYPES = [
  { value: 'assistant', label: 'Asistente' },
  { value: 'classifier', label: 'Clasificador' },
  { value: 'extractor', label: 'Extractor' },
  { value: 'generator', label: 'Generador' },
  { value: 'reviewer', label: 'Revisor' },
]

const MODELS = [
  { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
  { value: 'claude-opus-4-20250514', label: 'Claude Opus 4' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
]

export function AgentModal({
  agent,
  onClose,
  onSaved,
}: {
  agent?: Agent | null
  onClose: () => void
  onSaved: () => void
}) {
  const isEditing = !!agent

  const [form, setForm] = useState<AgentFormData>({
    name: agent?.name ?? '',
    description: agent?.description ?? '',
    type: agent?.type ?? 'assistant',
    model: agent?.model ?? 'claude-sonnet-4-20250514',
    status: agent?.status ?? 'draft',
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateField<K extends keyof AgentFormData>(key: K, value: AgentFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('El nombre es obligatorio.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const url = isEditing ? `/api/agents/${agent!.id}` : '/api/agents'
      const method = isEditing ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al guardar el agente')
      }

      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-6 shadow-[var(--shadow-xl)]">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            {isEditing ? 'Editar agente' : 'Crear agente'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--radius-md)] p-1.5 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)]"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-[var(--color-text-primary)]">
              Nombre del agente
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Ej: Asistente de soporte"
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-disabled)] focus:border-[var(--color-focus-ring)]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-[var(--color-text-primary)]">
              Descripción
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="¿Qué hace este agente?"
              rows={3}
              className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-disabled)] focus:border-[var(--color-focus-ring)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-[12.5px] font-semibold text-[var(--color-text-primary)]">Tipo</label>
              <select
                value={form.type}
                onChange={(e) => updateField('type', e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-focus-ring)]"
              >
                {AGENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[12.5px] font-semibold text-[var(--color-text-primary)]">Modelo</label>
              <select
                value={form.model}
                onChange={(e) => updateField('model', e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-focus-ring)]"
              >
                {MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isEditing && (
            <div>
              <label className="mb-1.5 block text-[12.5px] font-semibold text-[var(--color-text-primary)]">Estado</label>
              <select
                value={form.status}
                onChange={(e) => updateField('status', e.target.value as AgentStatus)}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-focus-ring)]"
              >
                <option value="draft">Borrador</option>
                <option value="published">Activo</option>
                <option value="archived">Archivado</option>
              </select>
            </div>
          )}

          {error && (
            <p className="m-0 text-[13px] text-[var(--color-error)]">{error}</p>
          )}

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear agente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
