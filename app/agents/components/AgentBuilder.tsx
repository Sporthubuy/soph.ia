'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Bot,
  Save,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Search,
  Globe,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react'
import { MODELS, PROVIDERS, type Provider } from '../../lib/providers'

type AgentDraft = {
  name: string
  description: string
  type: string
  model: string
  prompt: string
  temperature: number
  max_tokens: number
  restrict_to_kus: boolean
  web_search: boolean
  knowledge_unit_ids: string[]
  status: 'draft' | 'published' | 'archived'
}

type KUOption = {
  id: string
  name: string
  type: string
  area: string
  status: string
}

const AGENT_TYPES = [
  { value: 'assistant', label: 'Asistente', hint: 'Responde preguntas conversacionalmente' },
  { value: 'classifier', label: 'Clasificador', hint: 'Categoriza inputs en tipos definidos' },
  { value: 'extractor', label: 'Extractor', hint: 'Extrae datos estructurados de texto' },
  { value: 'generator', label: 'Generador', hint: 'Crea contenido nuevo' },
  { value: 'reviewer', label: 'Revisor', hint: 'Analiza y da feedback' },
]

const PROMPT_PLACEHOLDER = `Ejemplo:

Sos el asistente de soporte de Sporthub. Tu rol es responder preguntas de clientes sobre productos, envíos y devoluciones.

Cómo actuar:
- Sé cordial, breve y profesional
- Usá español rioplatense (vos, che, dale)
- Si no sabés algo, decilo — nunca inventes datos
- Cuando el usuario tenga una queja, empatizá antes de resolver

Restricciones:
- No hagas descuentos ni prometas plazos por fuera de la política
- Escalá a un humano cualquier reclamo legal o de seguridad`

export function AgentBuilder({ agentId }: { agentId?: string }) {
  const router = useRouter()
  const isEditing = !!agentId

  const [draft, setDraft] = useState<AgentDraft>({
    name: '',
    description: '',
    type: 'assistant',
    model: '',
    prompt: '',
    temperature: 0.7,
    max_tokens: 4096,
    restrict_to_kus: false,
    web_search: false,
    knowledge_unit_ids: [],
    status: 'draft',
  })

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [configuredProviders, setConfiguredProviders] = useState<Provider[]>([])
  const [loadingKeys, setLoadingKeys] = useState(true)

  const [kus, setKus] = useState<KUOption[]>([])
  const [loadingKus, setLoadingKus] = useState(true)
  const [kuQuery, setKuQuery] = useState('')

  const [showAdvanced, setShowAdvanced] = useState(false)

  const initialLoadRef = useRef(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/keys').then((r) => r.json()),
      fetch('/api/knowledge-units').then((r) => r.json()),
    ])
      .then(([keys, kusData]) => {
        const providers = (keys as { provider: Provider }[]).map((k) => k.provider)
        setConfiguredProviders(providers)
        setKus(kusData as KUOption[])
        if (!isEditing) {
          const first = MODELS.find((m) => providers.includes(m.provider))
          if (first) setDraft((d) => ({ ...d, model: first.id }))
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoadingKeys(false)
        setLoadingKus(false)
      })
  }, [isEditing])

  useEffect(() => {
    if (!isEditing || !agentId) return
    Promise.all([
      fetch(`/api/agents/${agentId}`).then((r) => r.json()),
      fetch(`/api/agents/${agentId}/knowledge-units`).then((r) => r.json()).catch(() => []),
    ])
      .then(([agent, agentKus]) => {
        setDraft({
          name: agent.name || '',
          description: agent.description || '',
          type: agent.type || 'assistant',
          model: agent.model || '',
          prompt: agent.prompt || '',
          temperature: typeof agent.temperature === 'number' ? agent.temperature : 0.7,
          max_tokens: agent.max_tokens || 4096,
          restrict_to_kus: !!agent.restrict_to_kus,
          web_search: !!agent.web_search,
          knowledge_unit_ids: Array.isArray(agentKus) ? agentKus.map((k: { knowledge_unit_id: string }) => k.knowledge_unit_id) : [],
          status: agent.status || 'draft',
        })
      })
      .catch(() => setError('No se pudo cargar el agente'))
      .finally(() => {
        setLoading(false)
        initialLoadRef.current = false
      })
  }, [agentId, isEditing])

  function update<K extends keyof AgentDraft>(key: K, value: AgentDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
    setDirty(true)
    setSaved(false)
  }

  function toggleKu(id: string) {
    setDraft((prev) => ({
      ...prev,
      knowledge_unit_ids: prev.knowledge_unit_ids.includes(id)
        ? prev.knowledge_unit_ids.filter((k) => k !== id)
        : [...prev.knowledge_unit_ids, id],
    }))
    setDirty(true)
    setSaved(false)
  }

  async function handleSave() {
    if (!draft.name.trim()) {
      setError('Ponele un nombre al agente.')
      return
    }
    if (!draft.model) {
      setError('Elegí un modelo. Necesitás al menos una API key configurada.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const body = {
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        type: draft.type,
        model: draft.model,
        prompt: draft.prompt.trim() || null,
        temperature: draft.temperature,
        max_tokens: draft.max_tokens,
        restrict_to_kus: draft.restrict_to_kus,
        web_search: draft.web_search,
        knowledge_unit_ids: draft.knowledge_unit_ids,
        status: draft.status,
      }

      const url = isEditing ? `/api/agents/${agentId}` : '/api/agents'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Error ${res.status}`)
      }

      const savedAgent = await res.json()
      setDirty(false)
      setSaved(true)

      if (!isEditing) {
        router.push(`/agents/${savedAgent.id}/edit`)
      } else {
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const availableModels = useMemo(
    () => MODELS.filter((m) => configuredProviders.includes(m.provider)),
    [configuredProviders]
  )
  const modelsByProvider = useMemo(
    () =>
      PROVIDERS.filter((p) => configuredProviders.includes(p.id)).map((p) => ({
        ...p,
        models: availableModels.filter((m) => m.provider === p.id),
      })),
    [configuredProviders, availableModels]
  )
  const unavailableProviders = PROVIDERS.filter((p) => !configuredProviders.includes(p.id))
  const noKeysConfigured = !loadingKeys && configuredProviders.length === 0

  const filteredKus = useMemo(() => {
    const q = kuQuery.trim().toLowerCase()
    if (!q) return kus
    return kus.filter((k) => k.name.toLowerCase().includes(q) || k.area.toLowerCase().includes(q))
  }, [kus, kuQuery])

  const selectedCount = draft.knowledge_unit_ids.length

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-secondary)]">
        <Loader2 size={24} className="animate-spin text-[var(--color-text-tertiary)]" />
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-2.5">
        <button
          onClick={() => router.push('/agents')}
          className="rounded-[var(--radius-md)] p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          <Bot size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">
            {isEditing ? draft.name || 'Agente sin nombre' : 'Nuevo agente'}
          </div>
          <div className="truncate text-xs text-[var(--color-text-tertiary)]">
            {isEditing ? `Editando · ${AGENT_TYPES.find((t) => t.value === draft.type)?.label || draft.type}` : 'Configurá tu agente y guardá para empezar a usarlo'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-emerald-500">
              <CheckCircle2 size={14} />
              Guardado
            </span>
          )}
          {dirty && !saving && !saved && (
            <span className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
              <Clock size={14} />
              Sin guardar
            </span>
          )}

          {isEditing && (
            <button
              onClick={() => router.push(`/agents/${agentId}/chat`)}
              className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
            >
              <Sparkles size={13} />
              Probar
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving || noKeysConfigured}
            className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Guardando…' : isEditing ? 'Guardar' : 'Crear agente'}
          </button>
        </div>
      </div>

      {noKeysConfigured && (
        <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2.5">
          <div className="mx-auto flex max-w-4xl items-start gap-2 text-sm text-amber-500">
            <AlertCircle size={16} className="mt-0.5 flex-none" />
            <div>
              <span className="font-medium">No tenés API keys configuradas.</span>{' '}
              <Link href="/settings" className="underline">Andá a Configuración</Link> para agregar tu key de Anthropic, OpenAI o Google.
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="border-b border-[var(--color-error)]/30 bg-[rgba(239,68,68,0.06)] px-4 py-2 text-sm text-[var(--color-error)]">
          {error}
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 md:py-8">
          {/* Basics */}
          <Section title="Información básica">
            <Field label="Nombre" required>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Asistente de Soporte"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-3 text-base font-medium text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-focus-ring)]"
              />
            </Field>

            <Field label="Descripción corta" hint="Aparece en el listado de agentes">
              <input
                type="text"
                value={draft.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="¿Qué hace este agente en una frase?"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-focus-ring)]"
              />
            </Field>

            <Field label="Tipo">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {AGENT_TYPES.map((t) => {
                  const active = draft.type === t.value
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => update('type', t.value)}
                      className={`rounded-[var(--radius-md)] border p-3 text-left transition-colors ${
                        active
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/8'
                          : 'border-[var(--color-border)] bg-[var(--color-bg-primary)] hover:border-[var(--color-primary)]/50'
                      }`}
                    >
                      <div className={`text-sm font-semibold ${active ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'}`}>
                        {t.label}
                      </div>
                      <div className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">{t.hint}</div>
                    </button>
                  )
                })}
              </div>
            </Field>
          </Section>

          {/* Instructions */}
          <Section title="Instrucciones" description="Definí el rol, cómo debe actuar, y cualquier restricción. Estas instrucciones son el system prompt del modelo.">
            <textarea
              value={draft.prompt}
              onChange={(e) => update('prompt', e.target.value)}
              placeholder={PROMPT_PLACEHOLDER}
              rows={14}
              className="w-full resize-y rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4 font-mono text-sm leading-relaxed text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-focus-ring)]"
              style={{ minHeight: 280 }}
            />
            <div className="mt-2 flex items-start gap-1.5 text-xs text-[var(--color-text-tertiary)]">
              <Info size={12} className="mt-0.5 flex-none" />
              <span>Consejo: definí quién es el agente, cómo debe hablar, qué puede y qué no puede hacer.</span>
            </div>
          </Section>

          {/* Model */}
          <Section title="Modelo de IA">
            {noKeysConfigured ? (
              <div className="rounded-[var(--radius-md)] border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-500">
                Configurá una API key en <Link href="/settings" className="underline">Configuración</Link> para elegir un modelo.
              </div>
            ) : (
              <>
                <select
                  value={draft.model}
                  onChange={(e) => update('model', e.target.value)}
                  className="w-full cursor-pointer rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-focus-ring)]"
                >
                  <option value="">Elegí un modelo…</option>
                  {modelsByProvider.map((group) => (
                    <optgroup key={group.id} label={group.name}>
                      {group.models.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {unavailableProviders.length > 0 && (
                  <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
                    Modelos de {unavailableProviders.map((p) => p.name).join(', ')} no disponibles — configurá su key en Configuración.
                  </p>
                )}
              </>
            )}
          </Section>

          {/* Knowledge sources */}
          <Section
            title="Fuentes de conocimiento"
            description="Elegí de dónde saca información el agente para responder."
          >
            <div className="flex flex-col gap-3">
              <ToggleRow
                icon={<BookOpen size={16} />}
                title="Restringir a las Knowledge Units asignadas"
                description="Cuando está activo, el agente solo puede responder usando el contenido de las KUs que le asignes abajo."
                checked={draft.restrict_to_kus}
                onChange={(v) => update('restrict_to_kus', v)}
              />
              <ToggleRow
                icon={<Globe size={16} />}
                title="Búsqueda web"
                description="Deja que el agente busque información actualizada en la web."
                checked={draft.web_search}
                onChange={(v) => update('web_search', v)}
                disabled
                badge="Próximamente"
              />
            </div>

            {/* KU picker */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[var(--color-text-primary)]">Knowledge Units asignadas</div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">
                    {selectedCount === 0 ? 'Ninguna asignada' : `${selectedCount} asignada${selectedCount === 1 ? '' : 's'}`}
                  </div>
                </div>
                {kus.length > 0 && (
                  <div className="relative w-56">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" size={13} />
                    <input
                      type="search"
                      value={kuQuery}
                      onChange={(e) => setKuQuery(e.target.value)}
                      placeholder="Buscar KUs…"
                      className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] py-1.5 pl-8 pr-2.5 text-xs text-[var(--color-text-primary)] outline-none"
                    />
                  </div>
                )}
              </div>

              {loadingKus ? (
                <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-6 text-center text-sm text-[var(--color-text-tertiary)]">
                  Cargando KUs…
                </div>
              ) : kus.length === 0 ? (
                <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-6 text-center">
                  <p className="text-sm text-[var(--color-text-secondary)]">Todavía no tenés knowledge units.</p>
                  <Link href="/knowledge-units" className="mt-1 inline-block text-xs font-semibold text-[var(--color-primary)] underline">
                    Crear la primera
                  </Link>
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)]">
                  {filteredKus.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-[var(--color-text-tertiary)]">Sin resultados para "{kuQuery}"</div>
                  ) : (
                    filteredKus.map((ku) => {
                      const selected = draft.knowledge_unit_ids.includes(ku.id)
                      return (
                        <label
                          key={ku.id}
                          className="flex cursor-pointer items-center gap-3 border-b border-[var(--color-border)] px-4 py-3 last:border-b-0 hover:bg-[var(--color-bg-secondary)]"
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleKu(ku.id)}
                            className="h-4 w-4 accent-[var(--color-primary)]"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{ku.name}</div>
                            <div className="mt-0.5 flex gap-2 text-xs text-[var(--color-text-tertiary)]">
                              <span>{ku.type}</span>
                              <span>·</span>
                              <span>{ku.area}</span>
                              <span>·</span>
                              <span>{ku.status}</span>
                            </div>
                          </div>
                        </label>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          </Section>

          {/* Advanced */}
          <Section title="Ajustes avanzados" collapsible open={showAdvanced} onToggle={() => setShowAdvanced((s) => !s)}>
            {showAdvanced && (
              <div className="flex flex-col gap-5">
                <Field
                  label={`Temperatura: ${draft.temperature.toFixed(1)}`}
                  hint="Más bajo = más determinista. Más alto = más creativo."
                >
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={draft.temperature}
                    onChange={(e) => update('temperature', Number(e.target.value))}
                    className="w-full accent-[var(--color-primary)]"
                  />
                </Field>
                <Field label="Máximo de tokens por respuesta" hint="Cuánto puede escribir el agente en una respuesta.">
                  <input
                    type="number"
                    min="256"
                    max="16384"
                    step="256"
                    value={draft.max_tokens}
                    onChange={(e) => update('max_tokens', Number(e.target.value))}
                    className="w-40 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none"
                  />
                </Field>
                {isEditing && (
                  <Field label="Estado">
                    <select
                      value={draft.status}
                      onChange={(e) => update('status', e.target.value as 'draft' | 'published' | 'archived')}
                      className="w-56 cursor-pointer rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none"
                    >
                      <option value="draft">Borrador</option>
                      <option value="published">Activo</option>
                      <option value="archived">Archivado</option>
                    </select>
                  </Field>
                )}
              </div>
            )}
          </Section>

          <div className="h-24" />
        </div>
      </div>
    </div>
  )
}

function Section({
  title,
  description,
  children,
  collapsible,
  open,
  onToggle,
}: {
  title: string
  description?: string
  children: React.ReactNode
  collapsible?: boolean
  open?: boolean
  onToggle?: () => void
}) {
  return (
    <section className="mb-8 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-6">
      <div
        className={`mb-4 ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={collapsible ? onToggle : undefined}
      >
        <div className="flex items-center gap-2">
          {collapsible && (open ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h2>
        </div>
        {description && <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p>}
      </div>
      {(!collapsible || open) && <div className="flex flex-col gap-5">{children}</div>}
    </section>
  )
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-[var(--color-text-primary)]">
        {label}
        {required && <span className="text-[var(--color-error)]">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-[var(--color-text-tertiary)]">{hint}</p>}
    </div>
  )
}

function ToggleRow({
  icon,
  title,
  description,
  checked,
  onChange,
  disabled,
  badge,
}: {
  icon: React.ReactNode
  title: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  badge?: string
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-[var(--radius-md)] border p-4 ${
        disabled
          ? 'border-[var(--color-border)] bg-[var(--color-bg-secondary)] opacity-70'
          : 'border-[var(--color-border)] bg-[var(--color-bg-primary)]'
      }`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</div>
            {badge && (
              <span className="rounded-[var(--radius-full)] bg-[var(--color-bg-tertiary)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
                {badge}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative h-6 w-11 flex-none rounded-full transition-colors ${
          checked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-bg-tertiary)]'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}
