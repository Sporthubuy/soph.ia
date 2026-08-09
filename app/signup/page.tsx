'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '../components/Logo'
import { ForceLightMode } from '../components/ForceLightMode'
import { createClient } from '../lib/supabase/client'
import { CheckCircle2 } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [fullName, setFullName] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkEmail, setCheckEmail] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const redirect = searchParams.get('redirect')
      const emailRedirectTo = `${window.location.origin}/auth/callback${
        redirect ? `?next=${encodeURIComponent(redirect)}` : ''
      }`

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            organization_name: organizationName.trim(),
          },
          emailRedirectTo,
        },
      })

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes('already') || signUpError.message.toLowerCase().includes('registered')) {
          setError('Ya existe una cuenta con ese email.')
        } else {
          setError(signUpError.message)
        }
        setLoading(false)
        return
      }

      // If session is null, Supabase requires email confirmation before login
      if (!data.session) {
        setCheckEmail(true)
        return
      }

      const dest = redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/dashboard'
      router.push(dest)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  if (checkEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-secondary)] px-4">
        <ForceLightMode />
        <div className="w-full max-w-[380px] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-7 text-center shadow-[var(--shadow-sm)]">
          <div className="mb-4 flex justify-center">
            <Logo size={32} />
          </div>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 size={26} />
          </div>
          <h1 className="m-0 mb-1.5 text-lg font-bold text-[var(--color-text-primary)]">Revisá tu email</h1>
          <p className="m-0 text-sm text-[var(--color-text-secondary)]">
            Te enviamos un link a <strong className="font-semibold text-[var(--color-text-primary)]">{email}</strong> para confirmar tu cuenta.
          </p>
          <Link href="/login" className="mt-5 inline-block text-sm font-semibold text-[var(--color-primary)]">
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-secondary)] px-4 py-10">
      <ForceLightMode />
      <div className="w-full max-w-[380px]">
        <div className="mb-8 flex justify-center">
          <Logo size={36} />
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-7 shadow-[var(--shadow-sm)]">
          <h1 className="m-0 mb-1.5 text-xl font-bold text-[var(--color-text-primary)]">Creá tu organización</h1>
          <p className="m-0 mb-6 text-sm text-[var(--color-text-secondary)]">Empezá a construir tu knowledge base con Soph.ia.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-[12.5px] font-semibold text-[var(--color-text-primary)]">Tu nombre</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Martín Rivas"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 font-[family-name:var(--font-sans)] text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-focus-ring)]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12.5px] font-semibold text-[var(--color-text-primary)]">Organización</label>
              <input
                type="text"
                required
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Sporthub"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 font-[family-name:var(--font-sans)] text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-focus-ring)]"
              />
            </div>
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
              <label className="mb-1.5 block text-[12.5px] font-semibold text-[var(--color-text-primary)]">Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 font-[family-name:var(--font-sans)] text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-focus-ring)]"
              />
            </div>

            {error && <p className="m-0 text-[13px] text-[var(--color-error)]">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#001a2f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-[var(--color-text-secondary)]">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="font-semibold text-[var(--color-secondary)] no-underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
