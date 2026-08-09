'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppHeader } from '../../../components/shell/AppHeader'
import { AppSidebar } from '../../../components/shell/AppSidebar'
import { fetchCurrentProfile, type Profile } from '../../../lib/profile'
import { createClient } from '../../../lib/supabase/client'
import {
  ArrowLeft,
  Bot,
  Calendar,
  Copy,
  Download,
  Globe,
  Loader2,
  Network,
  Tag,
  User,
} from 'lucide-react'

type AuthorRef = { id: string; full_name: string; initials: string } | null
type OrgRef = { name: string } | null

type DetailItem = {
  id: string
  name: string
  description: string | null
  type: string
  model?: string
  area?: string
  format?: string
  language?: string
  status: string
  visibility: string
  usage_count: number
  clone_count: number
  tags: string[]
  created_at: string
  updated_at: string
  author: AuthorRef
  organization: OrgRef
}

export default function CommunityDetailPage() {
  const params = useParams<{ type: string; id: string }>()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [item, setItem] = useState<DetailItem | null>(null)
  const [itemType, setItemType] = useState<'agent' | 'ku' | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cloning, setCloning] = useState(false)

  const typeParam = params.type === 'agents' ? 'agent' : params.type === 'kus' ? 'ku' : null

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const p = await fetchCurrentProfile(supabase)
        setProfile(p)

        if (!typeParam) {
          setError('Tipo no válido')
          setLoading(false)
          return
        }

        const res = await fetch(`/api/community/${params.id}?type=${typeParam}`)
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'No encontrado')
        }
        const data = await res.json()
        setItem(data.item)
        setItemType(data.type)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id, typeParam])

  async function handleClone() {
    if (!item || !itemType) return
    setCloning(true)
    try {
      const res = await fetch('/api/community/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, type: itemType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al clonar')

      if (itemType === 'agent') {
        router.push(`/agents/${data.cloned.id}`)
      } else {
        router.push(`/knowledge-units/${data.cloned.id}/edit`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al clonar')
      setCloning(false)
    }
  }

  const isAgent = itemType === 'agent'
  const Icon = isAgent ? Bot : Network
  const accentColor = isAgent ? 'var(--color-secondary)' : 'var(--color-accent)'

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-UY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
      <AppHeader
        userName={profile?.full_name ?? ''}
        userEmail={profile?.email ?? ''}
        initials={profile?.initials ?? ''}
      />
      <div className="flex items-start">
        <AppSidebar active="community" />
        <div className="min-w-0 flex-1 px-4 pb-14 pt-6 sm:px-6 md:px-7 md:pt-7">
          {/* Back */}
          <button
            type="button"
            onClick={() => router.push('/community')}
            className="mb-5 flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <ArrowLeft size={16} />
            Volver a Comunidad
          </button>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-[var(--color-text-tertiary)]" />
            </div>
          )}

          {error && !loading && (
            <div className="rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[rgba(239,68,68,0.06)] px-4 py-3 text-sm text-[var(--color-error)]">
              {error}
            </div>
          )}

          {item && !loading && (
            <div className="mx-auto max-w-3xl">
              {/* Header card */}
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-6">
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-14 w-14 flex-none items-center justify-center rounded-[var(--radius-md)]"
                    style={{ background: `color-mix(in srgb, ${accentColor} 15%, transparent)` }}
                  >
                    <Icon size={28} style={{ color: accentColor }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded bg-[var(--color-bg-secondary)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
                        {isAgent ? 'Agente' : 'Knowledge Unit'}
                      </span>
                      <span className="rounded bg-[var(--color-bg-secondary)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
                        {item.type}
                      </span>
                    </div>
                    <h1 className="m-0 text-[22px] font-bold text-[var(--color-text-primary)]">
                      {item.name}
                    </h1>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-5">
                  <p className="m-0 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {item.description || 'Sin descripción disponible.'}
                  </p>
                </div>

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 rounded-full bg-[var(--color-bg-secondary)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-tertiary)]"
                      >
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Clone CTA */}
                <div className="mt-6 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleClone}
                    disabled={cloning}
                    className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-110 disabled:opacity-60"
                  >
                    {cloning ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Copy size={16} />
                    )}
                    {cloning
                      ? 'Clonando…'
                      : isAgent
                        ? 'Clonar a mi workspace'
                        : 'Clonar como plantilla'}
                  </button>
                  <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
                    <Download size={13} />
                    {item.clone_count} {item.clone_count === 1 ? 'clon' : 'clones'}
                  </span>
                </div>
              </div>

              {/* Details grid */}
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {/* Info card */}
                <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-5">
                  <h3 className="m-0 mb-4 text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    Detalles
                  </h3>
                  <dl className="m-0 space-y-3">
                    {isAgent && item.model && (
                      <div className="flex items-center justify-between">
                        <dt className="text-xs text-[var(--color-text-tertiary)]">Modelo</dt>
                        <dd className="m-0 text-xs font-semibold text-[var(--color-text-primary)]">
                          {item.model}
                        </dd>
                      </div>
                    )}
                    {!isAgent && item.area && (
                      <div className="flex items-center justify-between">
                        <dt className="text-xs text-[var(--color-text-tertiary)]">Área</dt>
                        <dd className="m-0 text-xs font-semibold text-[var(--color-text-primary)]">
                          {item.area}
                        </dd>
                      </div>
                    )}
                    {!isAgent && item.format && (
                      <div className="flex items-center justify-between">
                        <dt className="text-xs text-[var(--color-text-tertiary)]">Formato</dt>
                        <dd className="m-0 text-xs font-semibold text-[var(--color-text-primary)]">
                          {item.format}
                        </dd>
                      </div>
                    )}
                    {!isAgent && item.language && (
                      <div className="flex items-center justify-between">
                        <dt className="text-xs text-[var(--color-text-tertiary)]">Idioma</dt>
                        <dd className="m-0 text-xs font-semibold text-[var(--color-text-primary)]">
                          {item.language}
                        </dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <dt className="text-xs text-[var(--color-text-tertiary)]">Tipo</dt>
                      <dd className="m-0 text-xs font-semibold text-[var(--color-text-primary)]">
                        {item.type}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-xs text-[var(--color-text-tertiary)]">Visibilidad</dt>
                      <dd className="m-0 flex items-center gap-1 text-xs font-semibold text-[var(--color-text-primary)]">
                        <Globe size={11} />
                        Pública
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Author card */}
                <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-5">
                  <h3 className="m-0 mb-4 text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    Publicado por
                  </h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-bold text-white">
                      {item.author?.initials ?? '??'}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {item.author?.full_name ?? 'Anónimo'}
                      </div>
                      {item.organization?.name && (
                        <div className="text-xs text-[var(--color-text-tertiary)]">
                          {item.organization.name}
                        </div>
                      )}
                    </div>
                  </div>
                  <dl className="m-0 space-y-3 border-t border-[var(--color-border)] pt-4">
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                        <Calendar size={11} />
                        Publicado
                      </dt>
                      <dd className="m-0 text-xs font-semibold text-[var(--color-text-primary)]">
                        {formatDate(item.created_at)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                        <Calendar size={11} />
                        Actualizado
                      </dt>
                      <dd className="m-0 text-xs font-semibold text-[var(--color-text-primary)]">
                        {formatDate(item.updated_at)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                        <User size={11} />
                        Usos
                      </dt>
                      <dd className="m-0 text-xs font-semibold text-[var(--color-text-primary)]">
                        {item.usage_count}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Closed source notice */}
              <div className="mt-5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-5 py-4 text-center">
                <p className="m-0 text-xs text-[var(--color-text-tertiary)]">
                  {isAgent
                    ? 'El prompt del sistema no se comparte. Al clonar obtenés una copia funcional en tu workspace.'
                    : 'El contenido completo se incluye al clonar. Podés editarlo libremente en tu workspace.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
