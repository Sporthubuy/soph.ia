'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  User, Globe, Bell, Shield, Save, LogOut, Loader2,
} from 'lucide-react'
import { AppHeader } from '../components/shell/AppHeader'
import { AppSidebar } from '../components/shell/AppSidebar'
import { createClient } from '../lib/supabase/client'
import { fetchCurrentProfile, type Profile } from '../lib/profile'
import { applyTheme, type Theme } from '../lib/useTheme'

const TABS = [
  { key: 'profile', label: 'Perfil', icon: User },
  { key: 'preferences', label: 'Preferencias', icon: Globe },
  { key: 'notifications', label: 'Notificaciones', icon: Bell },
  { key: 'security', label: 'Seguridad', icon: Shield },
] as const

type Tab = (typeof TABS)[number]['key']

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-6">
      {children}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">{children}</label>
}

function InputField({
  value, onChange, placeholder, type = 'text',
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-focus-ring)]"
    />
  )
}

function SelectField({
  value, onChange, options,
}: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-focus-ring)]"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

function Toggle({
  checked, onChange, label, description,
}: {
  checked: boolean; onChange: (v: boolean) => void; label: string; description?: string
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 py-1">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`mt-0.5 h-5 w-9 flex-none rounded-full transition-colors ${checked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`}
      >
        <span className={`block h-4 w-4 translate-x-0.5 rounded-full bg-white transition-transform ${checked ? 'translate-x-[18px]' : ''}`} />
      </button>
      <div>
        <div className="text-sm font-medium text-[var(--color-text-primary)]">{label}</div>
        {description && <div className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">{description}</div>}
      </div>
    </label>
  )
}

function SaveButton({
  onClick, saving, label = 'Guardar cambios',
}: {
  onClick: () => void; saving: boolean; label?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
    >
      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
      {saving ? 'Guardando…' : label}
    </button>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('profile')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null)

  const [profileForm, setProfileForm] = useState({
    full_name: '',
    bio: '',
    company: '',
    city: '',
    website: '',
    linkedin: '',
    twitter: '',
  })

  const [userSettings, setUserSettings] = useState({
    theme: 'dark',
    language: 'es',
    timezone: 'America/Montevideo',
  })

  const [notifications, setNotifications] = useState({
    email_notifications: true,
    email_digest: 'weekly',
    email_on_share: true,
    email_on_mention: true,
    email_on_approval: true,
    email_on_publish: false,
  })

  function showToast(message: string, tone: 'success' | 'error' = 'success') {
    setToast({ message, tone })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }

      try {
        const p = await fetchCurrentProfile(supabase)
        if (!p) throw new Error('No profile')
        setProfile(p)
        setProfileForm({
          full_name: p.full_name ?? '',
          bio: p.bio ?? '',
          company: p.company ?? '',
          city: p.city ?? '',
          website: p.website ?? '',
          linkedin: p.linkedin ?? '',
          twitter: p.twitter ?? '',
        })

        const settingsRes = await fetch('/api/settings')
        if (settingsRes.ok) {
          const data = await settingsRes.json()
          if (data.user) {
            setUserSettings((prev) => ({
              ...prev,
              theme: data.user.theme ?? prev.theme,
              language: data.user.language ?? prev.language,
              timezone: data.user.timezone ?? prev.timezone,
            }))
            setNotifications((prev) => ({
              ...prev,
              email_notifications: data.user.email_notifications ?? prev.email_notifications,
              email_digest: data.user.email_digest ?? prev.email_digest,
            }))
          }
        }

        const { data: notifPrefs } = await supabase
          .from('notification_preferences')
          .select('email_on_share, email_on_mention, email_on_approval, email_on_publish')
          .eq('profile_id', user.id)
          .maybeSingle()

        if (notifPrefs) {
          setNotifications((prev) => ({ ...prev, ...notifPrefs }))
        }
      } catch {
        showToast('Error al cargar configuración', 'error')
      }
      setLoading(false)
    }
    load()
  }, [router])

  async function saveProfile() {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setProfile((prev) => prev ? { ...prev, ...updated } : prev)
      showToast('Perfil actualizado')
    } catch {
      showToast('Error al guardar perfil', 'error')
    } finally { setSaving(false) }
  }

  async function savePreferences() {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'user', ...userSettings }),
      })
      if (!res.ok) throw new Error()
      applyTheme(userSettings.theme as Theme)
      showToast('Preferencias guardadas')
    } catch {
      showToast('Error al guardar preferencias', 'error')
    } finally { setSaving(false) }
  }

  async function saveNotifications() {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error()

      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'user',
          email_notifications: notifications.email_notifications,
          email_digest: notifications.email_digest,
        }),
      })

      await supabase
        .from('notification_preferences')
        .upsert({
          profile_id: user.id,
          organization_id: profile?.organization_id,
          email_on_share: notifications.email_on_share,
          email_on_mention: notifications.email_on_mention,
          email_on_approval: notifications.email_on_approval,
          email_on_publish: notifications.email_on_publish,
        }, { onConflict: 'profile_id,organization_id' })

      showToast('Notificaciones actualizadas')
    } catch {
      showToast('Error al guardar notificaciones', 'error')
    } finally { setSaving(false) }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
        <AppHeader userName="" userEmail="" initials="" />
        <div className="flex">
          <AppSidebar active="settings" />
          <div className="flex flex-1 items-center justify-center py-32">
            <Loader2 size={24} className="animate-spin text-[var(--color-text-tertiary)]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
      <AppHeader
        userName={profile?.full_name ?? ''}
        userEmail={profile?.email ?? ''}
        initials={profile?.initials ?? ''}
      />

      <div className="flex items-start">
        <AppSidebar active="settings" />

        <div className="min-w-0 flex-1 px-8 pb-14 pt-8" style={{ maxWidth: 1200 }}>
          <div className="mb-6">
            <h1 className="m-0 mb-1.5 text-[28px] font-bold">Configuración</h1>
            <p className="m-0 text-sm text-[var(--color-text-secondary)]">Administrá tu cuenta y preferencias</p>
          </div>

          {/* Tab nav */}
          <div className="mb-6 flex gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-1">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors ${
                  tab === key
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Toast */}
          {toast && (
            <div
              className={`mb-4 rounded-[var(--radius-md)] border px-4 py-3 text-sm ${
                toast.tone === 'success'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border-[var(--color-error)]/30 bg-[rgba(239,68,68,0.06)] text-[var(--color-error)]'
              }`}
            >
              {toast.message}
            </div>
          )}

          {/* Profile tab */}
          {tab === 'profile' && (
            <div className="space-y-6">
              <SectionCard>
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)] text-xl font-bold text-white">
                    {profile?.initials ?? '??'}
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{profile?.full_name}</div>
                    <div className="text-sm text-[var(--color-text-secondary)]">{profile?.email}</div>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Nombre completo</FieldLabel>
                    <InputField
                      value={profileForm.full_name}
                      onChange={(v) => setProfileForm((p) => ({ ...p, full_name: v }))}
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <FieldLabel>Empresa</FieldLabel>
                    <InputField
                      value={profileForm.company}
                      onChange={(v) => setProfileForm((p) => ({ ...p, company: v }))}
                      placeholder="Tu empresa u organización"
                    />
                  </div>
                  <div>
                    <FieldLabel>Ciudad</FieldLabel>
                    <InputField
                      value={profileForm.city}
                      onChange={(v) => setProfileForm((p) => ({ ...p, city: v }))}
                      placeholder="Tu ciudad"
                    />
                  </div>
                  <div>
                    <FieldLabel>Sitio web</FieldLabel>
                    <InputField
                      value={profileForm.website}
                      onChange={(v) => setProfileForm((p) => ({ ...p, website: v }))}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel>Bio</FieldLabel>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                      placeholder="Contá brevemente sobre vos..."
                      rows={3}
                      className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-focus-ring)]"
                    />
                  </div>
                </div>

                <div className="mt-4 border-t border-[var(--color-border-light)] pt-4">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
                    Redes sociales
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <FieldLabel>LinkedIn</FieldLabel>
                      <InputField
                        value={profileForm.linkedin}
                        onChange={(v) => setProfileForm((p) => ({ ...p, linkedin: v }))}
                        placeholder="linkedin.com/in/..."
                      />
                    </div>
                    <div>
                      <FieldLabel>Twitter / X</FieldLabel>
                      <InputField
                        value={profileForm.twitter}
                        onChange={(v) => setProfileForm((p) => ({ ...p, twitter: v }))}
                        placeholder="@usuario"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <SaveButton onClick={saveProfile} saving={saving} label="Guardar perfil" />
                </div>
              </SectionCard>
            </div>
          )}

          {/* Preferences tab */}
          {tab === 'preferences' && (
            <div className="space-y-6">
              <SectionCard>
                <h2 className="mb-5 text-lg font-semibold">Apariencia e idioma</h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Tema</FieldLabel>
                    <SelectField
                      value={userSettings.theme}
                      onChange={(v) => setUserSettings((p) => ({ ...p, theme: v }))}
                      options={[
                        { value: 'dark', label: 'Oscuro' },
                        { value: 'light', label: 'Claro' },
                        { value: 'auto', label: 'Automático (sistema)' },
                      ]}
                    />
                  </div>
                  <div>
                    <FieldLabel>Idioma</FieldLabel>
                    <SelectField
                      value={userSettings.language}
                      onChange={(v) => setUserSettings((p) => ({ ...p, language: v }))}
                      options={[
                        { value: 'es', label: 'Español' },
                        { value: 'en', label: 'English' },
                        { value: 'pt', label: 'Portugues' },
                      ]}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel>Zona horaria</FieldLabel>
                    <SelectField
                      value={userSettings.timezone}
                      onChange={(v) => setUserSettings((p) => ({ ...p, timezone: v }))}
                      options={[
                        { value: 'America/Montevideo', label: 'America/Montevideo (UYT)' },
                        { value: 'America/Argentina/Buenos_Aires', label: 'America/Buenos Aires (ART)' },
                        { value: 'America/Sao_Paulo', label: 'America/Sao Paulo (BRT)' },
                        { value: 'America/New_York', label: 'America/New York (EST)' },
                        { value: 'Europe/Madrid', label: 'Europe/Madrid (CET)' },
                        { value: 'UTC', label: 'UTC' },
                      ]}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <SaveButton onClick={savePreferences} saving={saving} label="Guardar preferencias" />
                </div>
              </SectionCard>
            </div>
          )}

          {/* Notifications tab */}
          {tab === 'notifications' && (
            <div className="space-y-6">
              <SectionCard>
                <h2 className="mb-5 text-lg font-semibold">Email</h2>
                <div className="space-y-4">
                  <Toggle
                    checked={notifications.email_notifications}
                    onChange={(v) => setNotifications((p) => ({ ...p, email_notifications: v }))}
                    label="Recibir notificaciones por email"
                    description="Recibí un resumen de la actividad de tu equipo"
                  />

                  {notifications.email_notifications && (
                    <div className="ml-12">
                      <FieldLabel>Frecuencia del resumen</FieldLabel>
                      <SelectField
                        value={notifications.email_digest}
                        onChange={(v) => setNotifications((p) => ({ ...p, email_digest: v }))}
                        options={[
                          { value: 'never', label: 'Nunca' },
                          { value: 'daily', label: 'Diario' },
                          { value: 'weekly', label: 'Semanal' },
                          { value: 'monthly', label: 'Mensual' },
                        ]}
                      />
                    </div>
                  )}
                </div>
              </SectionCard>

              <SectionCard>
                <h2 className="mb-5 text-lg font-semibold">Tipos de notificación</h2>
                <div className="space-y-3">
                  <Toggle
                    checked={notifications.email_on_share}
                    onChange={(v) => setNotifications((p) => ({ ...p, email_on_share: v }))}
                    label="Cuando comparten algo conmigo"
                    description="Knowledge units o agentes compartidos con vos"
                  />
                  <Toggle
                    checked={notifications.email_on_mention}
                    onChange={(v) => setNotifications((p) => ({ ...p, email_on_mention: v }))}
                    label="Cuando me mencionan"
                    description="Te mencionaron en un comentario o revisión"
                  />
                  <Toggle
                    checked={notifications.email_on_approval}
                    onChange={(v) => setNotifications((p) => ({ ...p, email_on_approval: v }))}
                    label="Aprobaciones pendientes"
                    description="Contenido que necesita tu revisión"
                  />
                  <Toggle
                    checked={notifications.email_on_publish}
                    onChange={(v) => setNotifications((p) => ({ ...p, email_on_publish: v }))}
                    label="Publicaciones del equipo"
                    description="Cuando se publica una knowledge unit o agente"
                  />
                </div>

                <div className="mt-6 flex justify-end">
                  <SaveButton onClick={saveNotifications} saving={saving} label="Guardar notificaciones" />
                </div>
              </SectionCard>
            </div>
          )}

          {/* Security tab */}
          {tab === 'security' && (
            <div className="space-y-6">
              <SectionCard>
                <h2 className="mb-5 text-lg font-semibold">Cuenta</h2>
                <div className="space-y-4">
                  <div>
                    <FieldLabel>Email</FieldLabel>
                    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-2.5 text-sm text-[var(--color-text-secondary)]">
                      {profile?.email}
                    </div>
                    <p className="mt-1.5 text-xs text-[var(--color-text-tertiary)]">
                      El email no se puede cambiar desde acá. Contactá al administrador.
                    </p>
                  </div>
                  <div>
                    <FieldLabel>Organización</FieldLabel>
                    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-2.5 text-sm text-[var(--color-text-secondary)]">
                      {profile?.organization_id?.slice(0, 8)}…
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard>
                <h2 className="mb-3 text-lg font-semibold">Sesión</h2>
                <p className="mb-5 text-sm text-[var(--color-text-secondary)]">
                  Cerrá tu sesión en este dispositivo. Vas a necesitar volver a iniciar sesión.
                </p>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[rgba(239,68,68,0.06)] px-5 py-2.5 text-sm font-semibold text-[var(--color-error)] transition-colors hover:bg-[rgba(239,68,68,0.12)]"
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
              </SectionCard>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
