'use client'

import React, { useEffect, useState } from 'react'
import { AppHeader } from '../components/shell/AppHeader'
import { AppSidebar } from '../components/shell/AppSidebar'
import { fetchCurrentProfile, type Profile } from '../lib/profile'
import { createClient } from '../lib/supabase/client'
import {
  Crown,
  Loader2,
  Mail,
  MoreHorizontal,
  Plus,
  Shield,
  ShieldCheck,
  Trash2,
  User,
  UserMinus,
  Users,
  X,
} from 'lucide-react'

type TeamMember = {
  id: string
  full_name: string
  email: string
  initials: string
  role: string
  is_owner: boolean
  created_at: string
}

type Invitation = {
  id: string
  email: string
  status: string
  created_at: string
  expires_at: string
}

const ROLE_CONFIG: Record<string, { label: string; icon: typeof User; color: string }> = {
  owner: { label: 'Dueño', icon: Crown, color: 'text-amber-500' },
  admin: { label: 'Admin', icon: ShieldCheck, color: 'text-blue-500' },
  member: { label: 'Miembro', icon: User, color: 'text-[var(--color-text-secondary)]' },
  viewer: { label: 'Lector', icon: Shield, color: 'text-[var(--color-text-tertiary)]' },
}

export default function TeamPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const p = await fetchCurrentProfile(supabase)
        setProfile(p)

        const [membersRes, invitesRes] = await Promise.all([
          fetch('/api/team'),
          fetch('/api/invitations'),
        ])

        if (membersRes.ok) setMembers(await membersRes.json())
        if (invitesRes.ok) {
          const all = await invitesRes.json() as Invitation[]
          setInvitations(all.filter((i) => i.status === 'pending'))
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const isOwner = members.some((m) => m.id === profile?.id && m.is_owner)

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    setError(null)
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al invitar')
      setInvitations((prev) => [data, ...prev])
      setInviteEmail('')
      setInviteOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al invitar')
    } finally {
      setInviting(false)
    }
  }

  async function handleRoleChange(memberId: string, newRole: string) {
    setError(null)
    try {
      const res = await fetch(`/api/team/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al cambiar rol')
      setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cambiar rol')
    }
    setMenuOpen(null)
  }

  async function handleRemoveMember(memberId: string) {
    setError(null)
    try {
      const res = await fetch(`/api/team/${memberId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al remover')
      setMembers((prev) => prev.filter((m) => m.id !== memberId))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al remover miembro')
    }
    setMenuOpen(null)
  }

  async function handleRevokeInvite(inviteId: string) {
    setError(null)
    try {
      const res = await fetch(`/api/invitations/${inviteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al revocar')
      setInvitations((prev) => prev.filter((i) => i.id !== inviteId))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al revocar invitación')
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-UY', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
      <AppHeader
        userName={profile?.full_name ?? ''}
        userEmail={profile?.email ?? ''}
        initials={profile?.initials ?? ''}
      />
      <div className="flex items-start">
        <AppSidebar active="team" />
        <div className="min-w-0 flex-1 px-4 pb-14 pt-6 sm:px-6 md:px-7 md:pt-7">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-end gap-4">
            <div className="min-w-[260px] flex-1">
              <h1 className="m-0 mb-1.5 text-[26px] font-bold text-[var(--color-text-primary)]">Equipo</h1>
              <p className="m-0 text-sm text-[var(--color-text-secondary)]">
                Gestioná los miembros de tu organización, roles e invitaciones.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            >
              <Plus size={16} />
              Invitar
            </button>
          </div>

          {error && (
            <div className="mb-5 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[rgba(239,68,68,0.06)] px-4 py-3 text-sm text-[var(--color-error)]">
              {error}
              <button onClick={() => setError(null)} className="ml-2 text-[var(--color-error)] hover:underline">Cerrar</button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-[var(--color-text-tertiary)]" />
            </div>
          ) : (
            <>
              {/* Members */}
              <div className="mb-8 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)]">
                <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-5 py-3">
                  <Users size={15} className="text-[var(--color-text-tertiary)]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    Miembros ({members.length})
                  </span>
                </div>

                {members.map((member) => {
                  const rc = ROLE_CONFIG[member.role] || ROLE_CONFIG.member
                  const RoleIcon = rc.icon
                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-4 border-b border-[var(--color-border)] px-5 py-3.5 last:border-b-0"
                    >
                      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
                        {member.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                            {member.full_name}
                          </span>
                          {member.id === profile?.id && (
                            <span className="rounded bg-[var(--color-bg-secondary)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-tertiary)]">Vos</span>
                          )}
                        </div>
                        <div className="text-xs text-[var(--color-text-tertiary)]">{member.email}</div>
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs font-semibold ${rc.color}`}>
                        <RoleIcon size={14} />
                        {rc.label}
                      </div>
                      {isOwner && !member.is_owner && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setMenuOpen(menuOpen === member.id ? null : member.id)}
                            className="rounded p-1.5 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          {menuOpen === member.id && (
                            <div className="absolute right-0 top-full z-10 mt-1 w-48 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] shadow-lg">
                              {['admin', 'member', 'viewer']
                                .filter((r) => r !== member.role)
                                .map((r) => (
                                  <button
                                    key={r}
                                    type="button"
                                    onClick={() => handleRoleChange(member.id, r)}
                                    className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
                                  >
                                    {React.createElement(ROLE_CONFIG[r].icon, { size: 13 })}
                                    Cambiar a {ROLE_CONFIG[r].label}
                                  </button>
                                ))}
                              <div className="border-t border-[var(--color-border)]" />
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(member.id)}
                                className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-[var(--color-error)] hover:bg-[rgba(239,68,68,0.06)]"
                              >
                                <UserMinus size={13} />
                                Remover del equipo
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Pending invitations */}
              {invitations.length > 0 && (
                <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)]">
                  <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-5 py-3">
                    <Mail size={15} className="text-[var(--color-text-tertiary)]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                      Invitaciones pendientes ({invitations.length})
                    </span>
                  </div>
                  {invitations.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center gap-4 border-b border-[var(--color-border)] px-5 py-3.5 last:border-b-0"
                    >
                      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full border-2 border-dashed border-[var(--color-border)] text-xs text-[var(--color-text-tertiary)]">
                        <Mail size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                          {invite.email}
                        </div>
                        <div className="text-xs text-[var(--color-text-tertiary)]">
                          Invitado el {formatDate(invite.created_at)} · Expira {formatDate(invite.expires_at)}
                        </div>
                      </div>
                      <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-500">
                        Pendiente
                      </span>
                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => handleRevokeInvite(invite.id)}
                          title="Revocar invitación"
                          className="rounded p-1.5 text-[var(--color-text-tertiary)] hover:bg-[rgba(239,68,68,0.06)] hover:text-[var(--color-error)]"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Invite modal */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Invitar al equipo</h2>
              <button
                onClick={() => { setInviteOpen(false); setInviteEmail('') }}
                className="rounded p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)]"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleInvite}>
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">
                Email
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="nombre@empresa.com"
                required
                className="mb-4 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-focus-ring)]"
              />
              <p className="mb-5 text-xs text-[var(--color-text-tertiary)]">
                Se enviará un email con un link de invitación. Expira en 7 días.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setInviteOpen(false); setInviteEmail('') }}
                  className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={inviting || !inviteEmail.trim()}
                  className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {inviting && <Loader2 size={14} className="animate-spin" />}
                  {inviting ? 'Enviando…' : 'Enviar invitación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
