'use client'

import { useState, useEffect } from 'react'
import { X, AlertCircle } from 'lucide-react'
import type { Agent, AgentStatus } from '../data'
import { MODELS, PROVIDERS, type Provider } from '../../lib/providers'

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
    model: agent?.model ?? '',
    status: agent?.status ?? 'draft',
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [configuredProviders, setConfiguredProviders] = useState<Provider[]>([])
  const [loadingKeys, setLoadingKeys] = useState(true)

  useEffect(() => {
    fetch('/api/keys')
      .then((res) => res.json())
      .then((keys: { provider: Provider }[]) => {
        const providers = keys.map((k) => k.provider)
        setConfiguredProviders(providers)
        if (!isEditing && !form.model) {
          const firstAvailable = MODELS.find((m) => providers.includes(m.provider))
          if (firstAvailable) setForm((prev) => ({ ...prev, model: firstAvailable.id }))
        }
      })
      .catch(() => {})
      .finally(() => setLoadingKeys(false))
  }, [])

  function updateField<K extends keyof AgentFormData>(key: K, value: AgentFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const availableModels = MODELS.filter((m) => configuredProviders.includes(m.provider))
  const unavailableProviders = PROVIDERS.filter((p) => !configuredProviders.includes(p.id))
  const noKeysConfigured = configuredProviders.length === 0 && !loadingKeys

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('El nombre es obligatorio.')
      return
    }
    if (!form.model) {
      setError('Seleccioná un modelo. Necesitás configurar al menos una API key en Configuración.')
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

  const modelsByProvider = PROVIDERS
    .filter((p) => configuredProviders.includes(p.id))
    .map((p) => ({
      ...p,
      models: MODELS.filter((m) => m.provider === p.id),
    }))

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

          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-[var(--color-text-primary)]">Tipo</label>
            <select
              value={form.type}
              onChange={(e) => updateField('type', e.target.value)}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-focus-ring)]"
            >
              {AGENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-[var(--color-text-primary)]">
              Modelo de IA
            </label>
            {noKeysConfigured ? (
              <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-300">
                <AlertCircle size={16} className="mt-0.5 flex-none" />
                <div>
                  <p className="m-0 font-medium">No tenés API keys configuradas</p>
                  <p className="m-0 mt-1 text-xs text-amber-300/70">
                    Andá a Configuración &gt; API Keys para agregar tu key de Anthropic, OpenAI o Google.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <select
                  value={form.model}
                  onChange={(e) => updateField('model', e.target.value)}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-focus-ring)]"
                >
                  {modelsByProvider.map((group) => (
                    <optgroup key={group.id} label={group.name}>
                      {group.models.map((m) => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {unavailableProviders.length > 0 && (
                  <p className="mt-1.5 text-xs text-[var(--color-text-tertiary)]">
                    Modelos de {unavailableProviders.map((p) => p.name).join(', ')} no disponibles — configurá la key en Configuración.
                  </p>
                )}
              </>
            )}
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
              disabled={saving || noKeysConfigured}
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
