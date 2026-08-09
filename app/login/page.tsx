'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '../components/Logo'
import { createClient } from '../lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        if (error.message === 'Invalid login credentials') {
          setError('Email o contraseña incorrectos.')
        } else if (error.message === 'Email not confirmed') {
          setError('Por favor confirma tu email antes de iniciar sesión.')
        } else {
          setError(error.message || 'Error al iniciar sesión')
        }
        setLoading(false)
        return
      }

      const next = searchParams.get('next')
      const destination = next && next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : '/dashboard'
      router.push(destination)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-secondary)] px-4">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 flex justify-center">
          <Logo size={36} />
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-7 shadow-[var(--shadow-sm)]">
          <h1 className="m-0 mb-1.5 text-xl font-bold text-[var(--color-text-primary)]">Iniciá sesión</h1>
          <p className="m-0 mb-6 text-sm text-[var(--color-text-secondary)]">Entrá a tu organización en Soph.ia.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-[12.5px] font-semibold text-[var(--color-text-primary)]">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@empresa.com"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 font-[family-name:var(--font-sans)] text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-focus-ring)]"
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-[12.5px] font-semibold text-[var(--color-text-primary)]">Contraseña</label>
                <Link href="/forgot-password" className="text-xs font-semibold text-[var(--color-secondary)]">
                  Olvidé mi contraseña
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 font-[family-name:var(--font-sans)] text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-focus-ring)]"
              />
            </div>

            {error && <p className="m-0 text-[13px] text-[var(--color-error)]">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#001a2f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-[var(--color-text-secondary)]">
          ¿No tenés cuenta?{' '}
          <Link href="/signup" className="font-semibold text-[var(--color-secondary)] no-underline">
            Creá tu organización
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
