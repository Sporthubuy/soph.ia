'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '../components/Logo'
import { ForceLightMode } from '../components/ForceLightMode'
import { createClient } from '../lib/supabase/client'
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/reset-password`
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo })
      if (error) throw error
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el email')
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
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 size={26} />
              </div>
              <h1 className="text-lg font-bold text-[var(--color-text-primary)]">Revisá tu email</h1>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Te enviamos un link a <strong className="text-[var(--color-text-primary)]">{email}</strong> para restablecer tu contraseña.
              </p>
              <Link href="/login" className="mt-3 text-sm font-semibold text-[var(--color-primary)]">
                Volver a iniciar sesión
              </Link>
            </div>
          ) : (
            <>
              <h1 className="mb-1 text-lg font-bold text-[var(--color-text-primary)]">Recuperar contraseña</h1>
              <p className="mb-5 text-sm text-[var(--color-text-secondary)]">
                Ingresá tu email y te mandamos un link para crear una nueva.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-semibold text-[var(--color-text-primary)]">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@empresa.com"
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)]"
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
                  disabled={loading || !email.trim()}
                  className="mt-1 flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#001a2f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {loading ? 'Enviando…' : 'Enviar link'}
                </button>
              </form>

              <Link
                href="/login"
                className="mt-5 flex items-center justify-center gap-1.5 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
              >
                <ArrowLeft size={12} />
                Volver a iniciar sesión
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
