'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppHeader } from '../../components/shell/AppHeader'
import { AppSidebar } from '../../components/shell/AppSidebar'
import { createClient } from '../../lib/supabase/client'
import { fetchCurrentProfile, type Profile } from '../../lib/profile'
import { UserPlus, Loader2, X, Mail, CheckCircle2, Clock, XCircle, ArrowLeft } from 'lucide-react'

type Member = {
  id: string
  full_name: string
  email: string
  initials: string
  created_at: string
}

type Invitation = {
  id: string
  email: string
  token: string
  status: 'pending' | 'accepted' | 'revoked' | 'expired'
  created_at: string
  expires_at: string
  accepted_at: string | null
}

export default function TeamPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      fetchCurrentProfile(supabase),
      fetch('/api/team').then((r) => r.json()),
      fetch('/api/invitations').then((r) => r.json()),
    ])
      .then(([prof, mem, inv]) => {
        setProfile(prof)
        setMembers(mem)
        setInvitations(inv)
      })
      .catch(() => setError('No se pudo cargar el equipo'))
      .finally(() => setLoading(false))
  }, [])

  async function invite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim() || inviting) return
    setInviting(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setInvitations((prev) => [data, ...prev])
      setSuccess(`Invitación enviada a ${inviteEmail.trim()}`)
      setInviteEmail('')
      setTimeout(() => setSuccess(null), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al invitar')
    } finally {
      setInviting(false)
    }
  }

  async function revoke(id: string) {
    if (!confirm('¿Revocar esta invitación?')) return
    try {
      await fetch(`/api/invitations/${id}`, { method: 'DELETE' })
      setInvitations((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'revoked' } : i)))
    } catch {
      setError('No se pudo revocar')
    }
  }

  const pendingInvites = invitations.filter((i) => i.status === 'pending' && new Date(i.expires_at) > new Date())
  const otherInvites = invitations.filter((i) => !pendingInvites.includes(i))

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
      <AppHeader
        userName={profile?.full_name ?? ''}
        userEmail={profile?.email ?? ''}
        initials={profile?.initials ?? ''}
      />
      <div className="flex items-start">
        <AppSidebar active="settings" />
        <div className="min-w-0 flex-1 px-4 pb-14 pt-6 sm:px-6 md:px-8 md:pt-8" style={{ maxWidth: 900 }}>
          <div className="mb-6">
            <Link href="/settings" className="mb-3 inline-flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]">
              <ArrowLeft size={12} />
              Volver a Configuración
            </Link>
            <h1 className="m-0 mb-1.5 text-[26px] font-bold text-[var(--color-text-primary)]">Equipo</h1>
            <p className="m-0 text-sm text-[var(--color-text-secondary)]">Gestioná los miembros e invitaciones de tu organización.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={24} className="animate-spin text-[var(--color-text-tertiary)]" />
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Invite form */}
              <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-6">
                <h2 className="mb-1 text-base font-semibold text-[var(--color-text-primary)]">Invitar miembro</h2>
                <p className="mb-4 text-sm text-[var(--color-text-secondary)]">Se enviará un email con un link para unirse.</p>
                <form onSubmit={invite} className="flex gap-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="email@ejemplo.com"
                    disabled={inviting}
                    className="flex-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)]"
                  />
                  <button
                    type="submit"
                    disabled={!inviteEmail.trim() || inviting}
                    className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {inviting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                    {inviting ? 'Enviando…' : 'Invitar'}
                  </button>
                </form>
                {error && <p className="mt-3 text-sm text-[var(--color-error)]">{error}</p>}
                {success && (
                  <p className="mt-3 flex items-center gap-1.5 text-sm text-emerald-500">
                    <CheckCircle2 size={14} />
                    {success}
                  </p>
                )}
              </section>

              {/* Members */}
              <section className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)]">
                <div className="border-b border-[var(--color-border)] px-6 py-4">
                  <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Miembros ({members.length})</h2>
                </div>
                {members.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 border-b border-[var(--color-border)] px-6 py-3 last:border-b-0">
                    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-xs font-bold text-[var(--color-primary)]">
                      {m.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-[var(--color-text-primary)]">{m.full_name}</div>
                      <div className="truncate text-xs text-[var(--color-text-tertiary)]">{m.email}</div>
                    </div>
                    {m.id === profile?.id && (
                      <span className="rounded-[var(--radius-full)] bg-[var(--color-bg-tertiary)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
                        Vos
                      </span>
                    )}
                  </div>
                ))}
              </section>

              {/* Pending invitations */}
              {pendingInvites.length > 0 && (
                <section className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)]">
                  <div className="border-b border-[var(--color-border)] px-6 py-4">
                    <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Invitaciones pendientes ({pendingInvites.length})</h2>
                  </div>
                  {pendingInvites.map((inv) => (
                    <div key={inv.id} className="flex items-center gap-3 border-b border-[var(--color-border)] px-6 py-3 last:border-b-0">
                      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                        <Mail size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{inv.email}</div>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
                          <Clock size={11} />
                          Expira {new Date(inv.expires_at).toLocaleDateString('es')}
                        </div>
                      </div>
                      <button
                        onClick={() => revoke(inv.id)}
                        className="rounded-[var(--radius-md)] p-2 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-error)]"
                        aria-label="Revocar"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </section>
              )}

              {/* History */}
              {otherInvites.length > 0 && (
                <section className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)]">
                  <div className="border-b border-[var(--color-border)] px-6 py-4">
                    <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Historial</h2>
                  </div>
                  {otherInvites.slice(0, 10).map((inv) => (
                    <div key={inv.id} className="flex items-center gap-3 border-b border-[var(--color-border)] px-6 py-3 last:border-b-0">
                      <span className={`flex h-8 w-8 flex-none items-center justify-center rounded-full ${
                        inv.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]'
                      }`}>
                        {inv.status === 'accepted' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm text-[var(--color-text-primary)]">{inv.email}</div>
                        <div className="text-xs text-[var(--color-text-tertiary)]">
                          {inv.status === 'accepted' ? 'Aceptada' : inv.status === 'revoked' ? 'Revocada' : 'Expirada'}
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
