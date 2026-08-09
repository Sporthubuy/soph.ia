'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Circle, X, ArrowRight, Sparkles } from 'lucide-react'

type Step = {
  key: string
  title: string
  description: string
  href: string
  cta: string
  done: boolean
}

const DISMISS_KEY = 'sophia:onboarding-dismissed'

export function OnboardingChecklist() {
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [steps, setSteps] = useState<Step[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(DISMISS_KEY) === '1') {
      setDismissed(true)
      setLoading(false)
      return
    }

    Promise.all([
      fetch('/api/keys').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/usage').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/invitations').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/team').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([keys, usage, invitations, team]) => {
        const keysCount = Array.isArray(keys) ? keys.length : 0
        const conversationsCount = usage?.totals?.conversations ?? 0
        const kusCount = usage?.totals?.knowledge_units ?? 0
        const agentsCount = usage?.totals?.agents ?? 0
        const invitesCount = Array.isArray(invitations) ? invitations.length : 0
        const teamSize = Array.isArray(team) ? team.length : 0

        setSteps([
          {
            key: 'api-key',
            title: 'Configurá tu API key',
            description: 'Necesitás una key de Anthropic, OpenAI o Google para que tus agentes puedan responder.',
            href: '/settings',
            cta: 'Ir a Configuración',
            done: keysCount > 0,
          },
          {
            key: 'first-ku',
            title: 'Creá tu primera Knowledge Unit',
            description: 'Cargá un documento o escribí conocimiento que después alimente a tus agentes.',
            href: '/knowledge-units',
            cta: 'Crear KU',
            done: kusCount > 0,
          },
          {
            key: 'first-agent',
            title: 'Creá tu primer agente',
            description: 'Definí un asistente con instrucciones propias y las KUs que le den contexto.',
            href: '/agents/new',
            cta: 'Crear agente',
            done: agentsCount > 0,
          },
          {
            key: 'first-chat',
            title: 'Probá una conversación',
            description: 'Chateá con tu agente para ver cómo usa las KUs asignadas.',
            href: '/agents',
            cta: 'Ir a agentes',
            done: conversationsCount > 0,
          },
          {
            key: 'invite-team',
            title: 'Invitá a tu equipo',
            description: 'Sumá compañeros para construir la knowledge base en conjunto.',
            href: '/settings/team',
            cta: 'Invitar',
            done: invitesCount > 0 || teamSize > 1,
          },
        ])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  if (dismissed || loading) return null
  if (steps.length === 0) return null

  const doneCount = steps.filter((s) => s.done).length
  const total = steps.length
  const allDone = doneCount === total
  const percent = Math.round((doneCount / total) * 100)

  return (
    <div className="mb-6 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-primary)]/30 bg-gradient-to-br from-[var(--color-primary)]/8 to-[var(--color-secondary)]/8">
      <div className="flex items-start gap-3 border-b border-[var(--color-primary)]/20 px-5 py-4">
        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
          <Sparkles size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-base font-bold text-[var(--color-text-primary)]">
            {allDone ? '¡Todo listo!' : 'Primeros pasos'}
          </div>
          <div className="text-xs text-[var(--color-text-secondary)]">
            {allDone
              ? 'Terminaste el setup inicial. Podés cerrar esta guía.'
              : `${doneCount} de ${total} completados`}
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-[var(--radius-md)] p-1.5 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-primary)]"
          aria-label="Cerrar guía"
        >
          <X size={16} />
        </button>
      </div>

      <div className="h-1 bg-[var(--color-bg-tertiary)]">
        <div
          className="h-full bg-[var(--color-primary)] transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex flex-col divide-y divide-[var(--color-border)] bg-[var(--color-bg-primary)]/40">
        {steps.map((step) => (
          <div
            key={step.key}
            className={`flex items-center gap-3 px-5 py-3 ${step.done ? 'opacity-60' : ''}`}
          >
            {step.done ? (
              <CheckCircle2 size={20} className="flex-none text-emerald-500" />
            ) : (
              <Circle size={20} className="flex-none text-[var(--color-text-tertiary)]" />
            )}
            <div className="min-w-0 flex-1">
              <div
                className={`text-sm font-semibold text-[var(--color-text-primary)] ${
                  step.done ? 'line-through' : ''
                }`}
              >
                {step.title}
              </div>
              {!step.done && (
                <div className="text-xs text-[var(--color-text-secondary)]">{step.description}</div>
              )}
            </div>
            {!step.done && (
              <Link
                href={step.href}
                className="flex flex-none items-center gap-1 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
              >
                {step.cta}
                <ArrowRight size={12} />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
