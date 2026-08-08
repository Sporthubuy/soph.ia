'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Moon, Globe, Lock, LogOut, Save } from 'lucide-react'
import { AppHeader } from '../components/shell/AppHeader'
import { AppSidebar } from '../components/shell/AppSidebar'
import { createClient } from '../lib/supabase/client'
import { fetchCurrentProfile, type Profile } from '../lib/profile'
import { applyTheme, type Theme } from '../lib/useTheme'

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [userSettings, setUserSettings] = useState({
    theme: 'dark',
    language: 'es',
    timezone: 'America/Montevideo',
    email_notifications: true,
    show_in_profile: true,
  })

  const [orgSettings, setOrgSettings] = useState({
    theme: 'dark',
    language: 'es',
    timezone: 'America/Montevideo',
    notifications_enabled: true,
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }

      try {
        const profileData = await fetchCurrentProfile(supabase)
        if (!profileData) throw new Error('No pudimos cargar tu perfil.')
        setProfile(profileData)

        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          if (data.user) setUserSettings((prev) => ({ ...prev, ...data.user }))
          if (data.org) setOrgSettings((prev) => ({ ...prev, ...data.org }))
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Error al cargar configuración')
      }

      setLoading(false)
    }

    load()
  }, [router])

  async function handleSaveUserSettings() {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'user', ...userSettings }),
      })

      if (!response.ok) throw new Error('Error al guardar configuración')

      applyTheme(userSettings.theme as Theme)
      setMessage('Configuración de usuario guardada')
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.replace('/login')
    } catch (error) {
      setMessage('Error al cerrar sesión')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
        <AppHeader userName={profile?.full_name ?? ''} userEmail={profile?.email ?? ''} initials={profile?.initials ?? ''} />
        <div className="flex">
          <AppSidebar active="settings" />
          <div className="flex-1 p-8">Cargando configuración…</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
      <AppHeader userName={profile?.full_name ?? ''} userEmail={profile?.email ?? ''} initials={profile?.initials ?? ''} />

      <div className="flex items-start">
        <AppSidebar active="settings" />

        <div className="min-w-0 flex-1 px-8 pb-14 pt-8" style={{ maxWidth: 1200 }}>
          <div className="mb-6">
            <h1 className="m-0 mb-1.5 text-[28px] font-bold text-[var(--color-text-primary)]">Configuración</h1>
            <p className="m-0 text-sm text-[var(--color-text-secondary)]">Personaliza tu experiencia en Soph.ia</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* User Settings */}
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-6">
              <div className="mb-6 flex items-center gap-2">
                <Globe size={20} className="text-[var(--color-secondary)]" />
                <h2 className="text-lg font-semibold">Preferencias personales</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Tema</label>
                  <select
                    value={userSettings.theme}
                    onChange={(e) => setUserSettings((prev) => ({ ...prev, theme: e.target.value }))}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-focus-ring)]"
                  >
                    <option value="dark">Oscuro</option>
                    <option value="light">Claro</option>
                    <option value="auto">Automático</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Idioma</label>
                  <select
                    value={userSettings.language}
                    onChange={(e) => setUserSettings((prev) => ({ ...prev, language: e.target.value }))}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-focus-ring)]"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="pt">Português</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Zona horaria</label>
                  <select
                    value={userSettings.timezone}
                    onChange={(e) => setUserSettings((prev) => ({ ...prev, timezone: e.target.value }))}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-focus-ring)]"
                  >
                    <option value="America/Montevideo">America/Montevideo (UYT)</option>
                    <option value="America/Argentina/Buenos_Aires">America/Argentina/Buenos Aires (ART)</option>
                    <option value="America/Sao_Paulo">America/Sao Paulo (BRT)</option>
                    <option value="Europe/Madrid">Europe/Madrid (CET)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <div className="border-t border-[var(--color-border)] pt-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={userSettings.email_notifications}
                      onChange={(e) => setUserSettings((prev) => ({ ...prev, email_notifications: e.target.checked }))}
                      className="h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
                    />
                    <span className="text-sm">Recibir notificaciones por email</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={userSettings.show_in_profile}
                      onChange={(e) => setUserSettings((prev) => ({ ...prev, show_in_profile: e.target.checked }))}
                      className="h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
                    />
                    <span className="text-sm">Mostrar perfil en directorio</span>
                  </label>
                </div>

                {message && (
                  <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)]">
                    {message}
                  </div>
                )}

                <button
                  onClick={handleSaveUserSettings}
                  disabled={saving}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={16} />
                  {saving ? 'Guardando…' : 'Guardar preferencias'}
                </button>
              </div>
            </div>

            {/* Security */}
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-6">
              <div className="mb-6 flex items-center gap-2">
                <Lock size={20} className="text-[var(--color-secondary)]" />
                <h2 className="text-lg font-semibold">Seguridad y sesión</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium">Email actual</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">{profile?.email}</p>
                </div>

                <div className="border-t border-[var(--color-border)] pt-4">
                  <p className="mb-3 text-sm font-medium">Sesión activa</p>
                  <p className="mb-3 text-xs text-[var(--color-text-secondary)]">
                    Para cambiar tu contraseña o email, accede a tu cuenta desde Supabase.
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[rgba(239,68,68,0.06)] px-4 py-2.5 text-sm font-semibold text-[var(--color-error)] hover:bg-[rgba(239,68,68,0.12)]"
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
