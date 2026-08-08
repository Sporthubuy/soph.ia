'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '../components/Logo'
import { createClient } from '../lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
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

      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      })

      if (authError) {
        setError(
          authError.message === 'User already registered'
            ? 'Ya existe una cuenta con ese email.'
            : authError.message || 'Error al crear la cuenta'
        )
        setLoading(false)
        return
      }

      if (!authData.user) {
        setError('No se pudo crear la cuenta')
        setLoading(false)
        return
      }

      // Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: organizationName.trim(),
          slug: organizationName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-'),
        })
        .select('id')
        .single()

      if (orgError) {
        console.error('Error creating organization:', orgError)
        setError('Error al crear la organización')
        setLoading(false)
        return
      }

      // Create profile
      const initials = fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email: authData.user.email!,
        full_name: fullName.trim(),
        initials,
        organization_id: orgData.id,
      })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        // Profile error is not fatal
      }

      // Link user to organization
      const { error: linkError } = await supabase.from('profiles_organizations').insert({
        profile_id: authData.user.id,
        organization_id: orgData.id,
        role: 'admin',
      })

      if (linkError) {
        console.error('Error linking user to organization:', linkError)
      }

      if (authData.session) {
        // Auto-login on email confirmation
        router.push('/dashboard')
        router.refresh()
        return
      }

      // Show email confirmation message
      setCheckEmail(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  if (checkEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-secondary)] px-4">
        <div className="w-full max-w-[380px] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-7 text-center shadow-[var(--shadow-sm)]">
          <div className="mb-4 flex justify-center">
            <Logo size={32} />
          </div>
          <h1 className="m-0 mb-1.5 text-lg font-bold text-[var(--color-text-primary)]">Revisá tu email</h1>
          <p className="m-0 text-sm text-[var(--color-text-secondary)]">
            Te enviamos un enlace de confirmación a <strong className="font-semibold">{email}</strong>. Confirmá tu cuenta para
            empezar a usar Soph.ia.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-secondary)] px-4 py-10">
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
