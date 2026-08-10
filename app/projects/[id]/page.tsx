'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppHeader } from '../../components/shell/AppHeader'
import { AppSidebar } from '../../components/shell/AppSidebar'
import { fetchCurrentProfile, type Profile } from '../../lib/profile'
import { createClient } from '../../lib/supabase/client'
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Circle,
  Clock,
  Crown,
  FolderOpen,
  Loader2,
  MoreHorizontal,
  Network,
  Pencil,
  Plus,
  Save,
  Trash2,
  User,
  UserPlus,
  Users,
  X,
} from 'lucide-react'

type Member = {
  id: string
  user_id: string
  role: string
  profile: { id: string; full_name: string; initials: string } | null
}

type Task = {
  id: string
  title: string
  description: string | null
  type: string
  status: string
  created_at: string
  updated_at: string
  assigned: { id: string; full_name: string; initials: string } | null
  creator: { id: string; full_name: string; initials: string } | null
}

type Agent = {
  id: string
  name: string
  description: string | null
  type: string | null
  model: string | null
  status: string
}

type KU = {
  id: string
  name: string
  type: string | null
  area: string | null
  status: string
  format: string | null
}

type ProjectDetail = {
  id: string
  name: string
  description: string | null
  status: string
  owner_id: string
  created_at: string
  updated_at: string
  owner: { id: string; full_name: string; initials: string } | null
  project_members: Member[]
  agents: Agent[]
  knowledge_units: KU[]
  tasks: Task[]
}

const TASK_STATUS: Record<string, { label: string; icon: typeof Circle; color: string }> = {
  pending: { label: 'Pendiente', icon: Circle, color: 'text-[var(--color-text-tertiary)]' },
  in_progress: { label: 'En progreso', icon: Clock, color: 'text-[var(--color-warning)]' },
  done: { label: 'Completada', icon: CheckCircle2, color: 'text-[var(--color-success)]' },
}

const TASK_TYPE_LABEL: Record<string, string> = {
  agent: 'Agente',
  ku: 'KU',
  general: 'General',
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [saving, setSaving] = useState(false)

  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskType, setTaskType] = useState('general')
  const [taskAssignee, setTaskAssignee] = useState('')
  const [creatingTask, setCreatingTask] = useState(false)

  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [teamMembers, setTeamMembers] = useState<{ id: string; full_name: string; initials: string }[]>([])
  const [addingMember, setAddingMember] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')

  const [taskMenu, setTaskMenu] = useState<string | null>(null)

  const isOwner = profile?.id === project?.owner_id

  const loadProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}`)
      if (!res.ok) throw new Error('Proyecto no encontrado')
      setProject(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    }
  }, [id])

  useEffect(() => {
    async function init() {
      try {
        const supabase = createClient()
        const p = await fetchCurrentProfile(supabase)
        setProfile(p)
        await loadProject()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [loadProject])

  async function handleSaveInfo() {
    if (!editName.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), description: editDesc.trim() || null }),
      })
      if (!res.ok) throw new Error('Error al guardar')
      await loadProject()
      setEditing(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault()
    if (!taskTitle.trim()) return
    setCreatingTask(true)
    try {
      const res = await fetch(`/api/projects/${id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle.trim(),
          description: taskDesc.trim() || null,
          type: taskType,
          assigned_to: taskAssignee || null,
        }),
      })
      if (!res.ok) throw new Error('Error al crear tarea')
      await loadProject()
      setTaskModalOpen(false)
      setTaskTitle('')
      setTaskDesc('')
      setTaskType('general')
      setTaskAssignee('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setCreatingTask(false)
    }
  }

  async function handleUpdateTaskStatus(taskId: string, status: string) {
    try {
      await fetch(`/api/projects/${id}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      await loadProject()
    } catch {
      setError('Error al actualizar tarea')
    }
    setTaskMenu(null)
  }

  async function handleDeleteTask(taskId: string) {
    try {
      await fetch(`/api/projects/${id}/tasks/${taskId}`, { method: 'DELETE' })
      await loadProject()
    } catch {
      setError('Error al eliminar tarea')
    }
    setTaskMenu(null)
  }

  async function handleLoadTeamForAdd() {
    setAddMemberOpen(true)
    try {
      const res = await fetch('/api/team')
      if (!res.ok) return
      const data = await res.json()
      const existingIds = new Set(project?.project_members.map((m) => m.user_id))
      setTeamMembers(
        (data.members || []).filter((m: { id: string }) => !existingIds.has(m.id))
      )
    } catch {}
  }

  async function handleAddMember() {
    if (!selectedUserId) return
    setAddingMember(true)
    try {
      const res = await fetch(`/api/projects/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: selectedUserId, role: 'editor' }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error')
      }
      await loadProject()
      setAddMemberOpen(false)
      setSelectedUserId('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setAddingMember(false)
    }
  }

  async function handleRemoveMember(userId: string) {
    try {
      await fetch(`/api/projects/${id}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      })
      await loadProject()
    } catch {
      setError('Error al eliminar miembro')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-secondary)]">
        <Loader2 size={28} className="animate-spin text-[var(--color-text-tertiary)]" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
        <FolderOpen size={40} className="text-[var(--color-text-tertiary)]" />
        <div className="text-sm font-semibold">Proyecto no encontrado</div>
        <Link href="/projects" className="text-sm text-[var(--color-primary)] hover:underline">
          Volver a Proyectos
        </Link>
      </div>
    )
  }

  const tasksDone = project.tasks.filter((t) => t.status === 'done').length
  const tasksTotal = project.tasks.length

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
          {/* Back + Header */}
          <div className="mb-6">
            <Link
              href="/projects"
              className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-tertiary)] no-underline hover:text-[var(--color-text-primary)]"
            >
              <ArrowLeft size={14} />
              Proyectos
            </Link>

            {editing ? (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2.5 text-lg font-bold text-[var(--color-text-primary)] outline-none focus:border-[var(--color-focus-ring)]"
                />
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={2}
                  placeholder="Descripción del proyecto..."
                  className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-focus-ring)]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveInfo}
                    disabled={saving || !editName.trim()}
                    className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)]/10">
                  <FolderOpen size={22} className="text-[var(--color-primary)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="m-0 text-xl font-bold text-[var(--color-text-primary)]">{project.name}</h1>
                  {project.description && (
                    <p className="m-0 mt-1 text-sm text-[var(--color-text-secondary)]">{project.description}</p>
                  )}
                </div>
                {isOwner && (
                  <button
                    onClick={() => {
                      setEditName(project.name)
                      setEditDesc(project.description ?? '')
                      setEditing(true)
                    }}
                    className="flex-none rounded-[var(--radius-md)] p-2 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-primary)] hover:text-[var(--color-text-primary)]"
                  >
                    <Pencil size={16} />
                  </button>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="mb-5 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[rgba(239,68,68,0.06)] px-4 py-3 text-sm text-[var(--color-error)]">
              {error}
              <button onClick={() => setError(null)} className="float-right text-[var(--color-error)]">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Stats bar */}
          <div className="mb-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-xs">
              <Users size={14} className="text-[var(--color-text-tertiary)]" />
              <span className="font-semibold">{project.project_members.length}</span>
              <span className="text-[var(--color-text-tertiary)]">miembros</span>
            </div>
            <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-xs">
              <Bot size={14} className="text-[var(--color-text-tertiary)]" />
              <span className="font-semibold">{project.agents.length}</span>
              <span className="text-[var(--color-text-tertiary)]">agentes</span>
            </div>
            <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-xs">
              <Network size={14} className="text-[var(--color-text-tertiary)]" />
              <span className="font-semibold">{project.knowledge_units.length}</span>
              <span className="text-[var(--color-text-tertiary)]">KUs</span>
            </div>
            {tasksTotal > 0 && (
              <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-xs">
                <CheckCircle2 size={14} className="text-[var(--color-success)]" />
                <span className="font-semibold">{tasksDone}/{tasksTotal}</span>
                <span className="text-[var(--color-text-tertiary)]">tareas</span>
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left column: Tasks */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Tasks */}
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Tareas</h2>
                  <button
                    onClick={() => setTaskModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
                  >
                    <Plus size={12} />
                    Nueva tarea
                  </button>
                </div>

                {project.tasks.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[var(--color-text-tertiary)]">
                    No hay tareas todavía. Creá una para organizar el trabajo del equipo.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {project.tasks.map((task) => {
                      const st = TASK_STATUS[task.status] ?? TASK_STATUS.pending
                      const StIcon = st.icon
                      return (
                        <div
                          key={task.id}
                          className="group flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3 hover:bg-[var(--color-bg-secondary)]/50"
                        >
                          <button
                            onClick={() =>
                              handleUpdateTaskStatus(
                                task.id,
                                task.status === 'done' ? 'pending' : task.status === 'pending' ? 'in_progress' : 'done'
                              )
                            }
                            className={`mt-0.5 flex-none ${st.color}`}
                            title={st.label}
                          >
                            <StIcon size={16} />
                          </button>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-medium ${
                                  task.status === 'done'
                                    ? 'line-through text-[var(--color-text-tertiary)]'
                                    : 'text-[var(--color-text-primary)]'
                                }`}
                              >
                                {task.title}
                              </span>
                              <span className="rounded bg-[var(--color-bg-secondary)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-tertiary)]">
                                {TASK_TYPE_LABEL[task.type] ?? task.type}
                              </span>
                            </div>
                            {task.description && (
                              <p className="m-0 mt-1 text-xs text-[var(--color-text-tertiary)]">{task.description}</p>
                            )}
                            <div className="mt-1.5 flex items-center gap-3 text-[10px] text-[var(--color-text-tertiary)]">
                              {task.assigned && (
                                <span className="flex items-center gap-1">
                                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary)] text-[7px] font-bold text-white">
                                    {task.assigned.initials}
                                  </span>
                                  {task.assigned.full_name}
                                </span>
                              )}
                              <span>{new Date(task.created_at).toLocaleDateString('es-UY', { day: 'numeric', month: 'short' })}</span>
                            </div>
                          </div>
                          <div className="relative flex-none">
                            <button
                              onClick={() => setTaskMenu(taskMenu === task.id ? null : task.id)}
                              className="rounded p-1 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 hover:bg-[var(--color-bg-secondary)]"
                            >
                              <MoreHorizontal size={14} />
                            </button>
                            {taskMenu === task.id && (
                              <div className="absolute right-0 top-8 z-10 w-40 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] py-1 shadow-lg">
                                {Object.entries(TASK_STATUS).map(([key, val]) => (
                                  <button
                                    key={key}
                                    onClick={() => handleUpdateTaskStatus(task.id, key)}
                                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
                                  >
                                    <val.icon size={12} className={val.color} />
                                    {val.label}
                                  </button>
                                ))}
                                <div className="my-1 border-t border-[var(--color-border)]" />
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-[var(--color-error)] hover:bg-[var(--color-bg-secondary)]"
                                >
                                  <Trash2 size={12} />
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Agents & KUs */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Agents */}
                <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Agentes</h2>
                    <span className="text-[11px] text-[var(--color-text-tertiary)]">{project.agents.length}</span>
                  </div>
                  {project.agents.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[var(--color-text-tertiary)]">
                      Sin agentes vinculados.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {project.agents.map((agent) => (
                        <Link
                          key={agent.id}
                          href={`/agents/${agent.id}`}
                          className="flex items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 no-underline hover:bg-[var(--color-bg-secondary)]"
                        >
                          <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[var(--color-primary)]/10">
                            <Bot size={14} className="text-[var(--color-primary)]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-semibold text-[var(--color-text-primary)]">{agent.name}</div>
                            <div className="text-[10px] text-[var(--color-text-tertiary)]">{agent.model ?? 'Sin modelo'}</div>
                          </div>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                              agent.status === 'active'
                                ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                                : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)]'
                            }`}
                          >
                            {agent.status === 'active' ? 'Activo' : agent.status === 'draft' ? 'Borrador' : agent.status}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* KUs */}
                <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Knowledge Units</h2>
                    <span className="text-[11px] text-[var(--color-text-tertiary)]">{project.knowledge_units.length}</span>
                  </div>
                  {project.knowledge_units.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[var(--color-text-tertiary)]">
                      Sin KUs vinculadas.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {project.knowledge_units.map((ku) => (
                        <Link
                          key={ku.id}
                          href={`/knowledge-units/${ku.id}`}
                          className="flex items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 no-underline hover:bg-[var(--color-bg-secondary)]"
                        >
                          <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-cyan-500/10">
                            <Network size={14} className="text-cyan-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-semibold text-[var(--color-text-primary)]">{ku.name}</div>
                            <div className="text-[10px] text-[var(--color-text-tertiary)]">
                              {ku.type ?? 'Sin tipo'} {ku.area ? `· ${ku.area}` : ''}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right column: Members */}
            <div className="flex flex-col gap-6">
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Miembros</h2>
                  {isOwner && (
                    <button
                      onClick={handleLoadTeamForAdd}
                      className="flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
                    >
                      <UserPlus size={12} />
                      Agregar
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {project.project_members.map((m) => (
                    <div
                      key={m.id}
                      className="group flex items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-2 hover:bg-[var(--color-bg-secondary)]"
                    >
                      <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-bold text-white">
                        {m.profile?.initials ?? '??'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-xs font-semibold text-[var(--color-text-primary)]">
                            {m.profile?.full_name ?? 'Sin nombre'}
                          </span>
                          {m.role === 'owner' && <Crown size={11} className="flex-none text-amber-500" />}
                          {m.user_id === profile?.id && (
                            <span className="rounded bg-[var(--color-primary)]/10 px-1 py-0.5 text-[9px] font-bold text-[var(--color-primary)]">
                              Vos
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] capitalize text-[var(--color-text-tertiary)]">
                          {m.role === 'owner' ? 'Dueño' : m.role === 'editor' ? 'Editor' : m.role}
                        </div>
                      </div>
                      {isOwner && m.user_id !== profile?.id && (
                        <button
                          onClick={() => handleRemoveMember(m.user_id)}
                          className="flex-none rounded p-1 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 hover:text-[var(--color-error)]"
                          title="Quitar del proyecto"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Project info */}
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-5">
                <h2 className="mb-3 text-sm font-bold text-[var(--color-text-primary)]">Info</h2>
                <div className="flex flex-col gap-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-tertiary)]">Dueño</span>
                    <span className="font-medium text-[var(--color-text-primary)]">{project.owner?.full_name ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-tertiary)]">Estado</span>
                    <span className="font-medium capitalize text-[var(--color-text-primary)]">{project.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-tertiary)]">Creado</span>
                    <span className="font-medium text-[var(--color-text-primary)]">
                      {new Date(project.created_at).toLocaleDateString('es-UY', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create task modal */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Nueva tarea</h2>
              <button
                onClick={() => setTaskModalOpen(false)}
                className="rounded p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)]"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">Título *</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Ej: Crear agente de soporte"
                  required
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-focus-ring)]"
                />
              </div>
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">Descripción</label>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Detalle de la tarea..."
                  rows={2}
                  className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-focus-ring)]"
                />
              </div>
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">Tipo</label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value)}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-focus-ring)]"
                  >
                    <option value="general">General</option>
                    <option value="agent">Agente</option>
                    <option value="ku">Knowledge Unit</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">Asignar a</label>
                  <select
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-focus-ring)]"
                  >
                    <option value="">Sin asignar</option>
                    {project.project_members.map((m) => (
                      <option key={m.user_id} value={m.user_id}>
                        {m.profile?.full_name ?? 'Sin nombre'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingTask || !taskTitle.trim()}
                  className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {creatingTask && <Loader2 size={14} className="animate-spin" />}
                  {creatingTask ? 'Creando…' : 'Crear tarea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add member modal */}
      {addMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Agregar miembro</h2>
              <button
                onClick={() => { setAddMemberOpen(false); setSelectedUserId('') }}
                className="rounded p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)]"
              >
                <X size={18} />
              </button>
            </div>
            {teamMembers.length === 0 ? (
              <div className="py-6 text-center text-xs text-[var(--color-text-tertiary)]">
                Todos los miembros del equipo ya están en el proyecto.
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">Seleccioná un miembro del equipo</label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-focus-ring)]"
                  >
                    <option value="">Elegir...</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setAddMemberOpen(false); setSelectedUserId('') }}
                    className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddMember}
                    disabled={addingMember || !selectedUserId}
                    className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {addingMember && <Loader2 size={14} className="animate-spin" />}
                    Agregar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
