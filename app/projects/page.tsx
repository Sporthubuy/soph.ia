'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppHeader } from '../components/shell/AppHeader'
import { AppSidebar } from '../components/shell/AppSidebar'
import { fetchCurrentProfile, type Profile } from '../lib/profile'
import { createClient } from '../lib/supabase/client'
import {
  FolderOpen,
  Loader2,
  Plus,
  Users,
  X,
} from 'lucide-react'

type ProjectMember = {
  id: string
  user_id: string
  role: string
  profile: { id: string; full_name: string; initials: string } | null
}

type Project = {
  id: string
  name: string
  description: string | null
  status: string
  owner_id: string
  created_at: string
  updated_at: string
  owner: { id: string; full_name: string; initials: string } | null
  project_members: ProjectMember[]
}

export default function ProjectsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const p = await fetchCurrentProfile(supabase)
        setProfile(p)
        const res = await fetch('/api/projects')
        if (!res.ok) throw new Error('Error al cargar proyectos')
        setProjects(await res.json())
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear')
      router.push(`/projects/${data.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear proyecto')
      setCreating(false)
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-UY', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
      <AppHeader
        userName={profile?.full_name ?? ''}
        userEmail={profile?.email ?? ''}
        initials={profile?.initials ?? ''}
      />
      <div className="flex items-start">
        <AppSidebar active="projects" />
        <div className="min-w-0 flex-1 px-4 pb-14 pt-6 sm:px-6 md:px-7 md:pt-7">
          <div className="mb-6 flex flex-wrap items-end gap-4">
            <div className="min-w-[260px] flex-1">
              <h1 className="m-0 mb-1.5 text-[26px] font-bold text-[var(--color-text-primary)]">Proyectos</h1>
              <p className="m-0 text-sm text-[var(--color-text-secondary)]">
                Espacios compartidos para construir agentes y knowledge units en equipo.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            >
              <Plus size={16} />
              Nuevo proyecto
            </button>
          </div>

          {error && (
            <div className="mb-5 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[rgba(239,68,68,0.06)] px-4 py-3 text-sm text-[var(--color-error)]">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-[var(--color-text-tertiary)]" />
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-bg-primary)] text-[var(--color-text-tertiary)]">
                <FolderOpen size={28} />
              </div>
              <div>
                <div className="text-sm font-semibold text-[var(--color-text-primary)]">No tenés proyectos todavía</div>
                <div className="mt-1 max-w-xs text-xs text-[var(--color-text-tertiary)]">
                  Creá un proyecto para organizar agentes y KUs con tu equipo. Asigná tareas y construyan juntos.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
              >
                <Plus size={16} />
                Crear primer proyecto
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-5 text-left transition-all hover:border-[var(--color-primary)]/40 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)]/10">
                      <FolderOpen size={20} className="text-[var(--color-primary)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="m-0 truncate text-sm font-bold text-[var(--color-text-primary)]">{project.name}</h3>
                      <div className="text-[11px] text-[var(--color-text-tertiary)]">
                        Actualizado {formatDate(project.updated_at)}
                      </div>
                    </div>
                  </div>

                  {project.description && (
                    <p className="m-0 mb-3 line-clamp-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                      {project.description}
                    </p>
                  )}

                  <div className="mt-auto flex items-center gap-3 pt-3 border-t border-[var(--color-border)]">
                    <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-tertiary)]">
                      <Users size={12} />
                      {project.project_members.length}
                    </div>
                    <div className="flex -space-x-1.5 ml-auto">
                      {project.project_members.slice(0, 4).map((m) => (
                        <div
                          key={m.id}
                          title={m.profile?.full_name}
                          className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--color-bg-primary)] bg-[var(--color-primary)] text-[8px] font-bold text-white"
                        >
                          {m.profile?.initials ?? '??'}
                        </div>
                      ))}
                      {project.project_members.length > 4 && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--color-bg-primary)] bg-[var(--color-bg-tertiary)] text-[8px] font-bold text-[var(--color-text-tertiary)]">
                          +{project.project_members.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Nuevo proyecto</h2>
              <button
                onClick={() => { setCreateOpen(false); setNewName(''); setNewDesc('') }}
                className="rounded p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)]"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">Nombre del proyecto *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: Soporte al cliente"
                  required
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-focus-ring)]"
                />
              </div>
              <div className="mb-5">
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">Descripción</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="¿De qué trata este proyecto? ¿Qué agentes y KUs se van a construir?"
                  rows={3}
                  className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-focus-ring)]"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setCreateOpen(false); setNewName(''); setNewDesc('') }}
                  className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim()}
                  className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {creating && <Loader2 size={14} className="animate-spin" />}
                  {creating ? 'Creando…' : 'Crear proyecto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
