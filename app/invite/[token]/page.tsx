'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '../../components/Logo'
import { createClient } from '../../lib/supabase/client'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(!!data.user)
      setUserEmail(data.user?.email ?? null)
      setLoading(false)
    })
  }, [])

  async function accept() {
    setAccepting(true)
    setError(null)
    try {
      const res = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aceptar')
    } finally {
      setAccepting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg-secondary)] px-4">
      <div className="mb-6">
        <Logo />
      </div>

      <div className="w-full max-w-[420px] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-8 shadow-[var(--shadow-sm)]">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <Loader2 size={24} className="animate-spin text-[var(--color-text-tertiary)]" />
            <span className="text-sm text-[var(--color-text-secondary)]">Cargando invitación…</span>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 size={28} />
            </div>
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">¡Bienvenido al equipo!</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">Redirigiendo al dashboard…</p>
          </div>
        ) : !authed ? (
          <div className="text-center">
            <h1 className="mb-2 text-xl font-bold text-[var(--color-text-primary)]">Invitación al equipo</h1>
            <p className="mb-6 text-sm text-[var(--color-text-secondary)]">
              Necesitás iniciar sesión o crear una cuenta con el email al que se envió la invitación.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href={`/login?redirect=/invite/${token}`}
                className="rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Iniciar sesión
              </Link>
              <Link
                href={`/signup?redirect=/invite/${token}`}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text-primary)]"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="mb-2 text-xl font-bold text-[var(--color-text-primary)]">Aceptar invitación</h1>
            <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
              Vas a unirte a un equipo con la cuenta <strong className="text-[var(--color-text-primary)]">{userEmail}</strong>.
            </p>
            <p className="mb-6 rounded-[var(--radius-md)] border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-500">
              Al aceptar vas a salir de tu organización actual y sumarte a la que te invitó.
            </p>

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-error)]/30 bg-[rgba(239,68,68,0.06)] px-3 py-2 text-sm text-[var(--color-error)]">
                <AlertCircle size={14} className="mt-0.5 flex-none" />
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Link
                href="/dashboard"
                className="flex-1 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2.5 text-center text-sm font-semibold text-[var(--color-text-secondary)]"
              >
                Cancelar
              </Link>
              <button
                onClick={accept}
                disabled={accepting}
                className="flex-1 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {accepting ? 'Aceptando…' : 'Aceptar invitación'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
