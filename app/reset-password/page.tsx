'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '../components/Logo'
import { ForceLightMode } from '../components/ForceLightMode'
import { createClient } from '../lib/supabase/client'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [validSession, setValidSession] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setValidSession(!!data.session)
      setChecking(false)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-secondary)] px-4">
      <ForceLightMode />
      <div className="w-full max-w-[380px]">
        <div className="mb-6 flex justify-center">
          <Logo size={32} />
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-7 shadow-[var(--shadow-sm)]">
          {checking ? (
            <div className="flex justify-center py-6">
              <Loader2 size={20} className="animate-spin text-[var(--color-text-tertiary)]" />
            </div>
          ) : !validSession ? (
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(239,68,68,0.1)] text-[var(--color-error)]">
                <AlertCircle size={26} />
              </div>
              <h1 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">Link inválido o expirado</h1>
              <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
                Pedí un link nuevo para restablecer tu contraseña.
              </p>
              <Link
                href="/forgot-password"
                className="inline-block rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Pedir nuevo link
              </Link>
            </div>
          ) : done ? (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 size={26} />
              </div>
              <h1 className="text-lg font-bold text-[var(--color-text-primary)]">Contraseña actualizada</h1>
              <p className="text-sm text-[var(--color-text-secondary)]">Redirigiendo al dashboard…</p>
            </div>
          ) : (
            <>
              <h1 className="mb-1 text-lg font-bold text-[var(--color-text-primary)]">Nueva contraseña</h1>
              <p className="mb-5 text-sm text-[var(--color-text-secondary)]">Elegí una contraseña de al menos 6 caracteres.</p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-semibold text-[var(--color-text-primary)]">Nueva contraseña</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-semibold text-[var(--color-text-primary)]">Repetir contraseña</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmá la contraseña"
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-error)]/30 bg-[rgba(239,68,68,0.06)] px-3 py-2 text-sm text-[var(--color-error)]">
                    <AlertCircle size={14} className="mt-0.5 flex-none" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#001a2f] disabled:opacity-60"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {loading ? 'Guardando…' : 'Guardar contraseña'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
