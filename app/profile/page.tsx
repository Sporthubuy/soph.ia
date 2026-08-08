'use client'
/* eslint-disable @next/next/no-img-element -- previews include user-selected blob URLs and arbitrary profile URLs. */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Mail, MapPin, Briefcase, CalendarDays, AtSign, Sparkles, Globe, Link, BadgeCheck, MessageCircleMore, UserRoundCheck } from 'lucide-react'
import { createClient } from '../lib/supabase/client'
import { fetchCurrentProfile, type Profile } from '../lib/profile'

const emptyProfile = {
  id: '',
  full_name: '',
  email: '',
  initials: '',
  organization_id: '',
  username: '',
  avatar_url: '',
  cover_url: '',
  city: '',
  company: '',
  birth_date: '',
  bio: '',
  role: '',
  status: '',
  website: '',
  linkedin: '',
  twitter: '',
  instagram: '',
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [coverUrl, setCoverUrl] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [website, setWebsite] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [twitter, setTwitter] = useState('')
  const [instagram, setInstagram] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [coverPreview, setCoverPreview] = useState('')

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
        const data = await fetchCurrentProfile(supabase)
        if (!data) throw new Error('No pudimos cargar tu perfil.')
        const normalized = {
          ...emptyProfile,
          ...data,
        } as Profile
        setProfile(normalized)
        setForm(normalized)
        setCoverUrl(normalized.cover_url ?? '')
        setRole(normalized.role ?? '')
        setStatus(normalized.status ?? '')
        setWebsite(normalized.website ?? '')
        setLinkedin(normalized.linkedin ?? '')
        setTwitter(normalized.twitter ?? '')
        setInstagram(normalized.instagram ?? '')
        setAvatarPreview(normalized.avatar_url ?? '')
        setCoverPreview(normalized.cover_url ?? '')
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'No pudimos cargar tu perfil.')
      }

      setLoading(false)
    }

    load()
  }, [router])

  async function handleFileUpload(
    supabase: ReturnType<typeof createClient>,
    userId: string,
    file: File,
    folder: 'avatars' | 'covers'
  ) {
    const bucketName = 'profile-media'
    const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
    const extension = extensions[file.type]

    if (!extension) throw new Error('Usá una imagen JPG, PNG o WebP.')
    if (file.size > 5 * 1024 * 1024) throw new Error('La imagen no puede superar 5 MB.')

    const filePath = `${userId}/${folder}/${crypto.randomUUID()}.${extension}`
    const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

    if (error) throw error

    const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(data.path)
    return publicData.publicUrl
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form) return

    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('No hay sesión activa')

      const trimmedName = form.full_name?.trim() ?? ''
      const nextInitials = (form.initials || trimmedName).trim().slice(0, 2).toUpperCase()

      let avatarUrl = form.avatar_url?.trim() ?? null
      let coverUrlValue = coverUrl.trim() || null

      if (avatarFile) {
        avatarUrl = await handleFileUpload(supabase, user.id, avatarFile, 'avatars')
      }

      if (coverFile) {
        coverUrlValue = await handleFileUpload(supabase, user.id, coverFile, 'covers')
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: trimmedName,
          initials: nextInitials,
          username: form.username?.trim() ?? null,
          avatar_url: avatarUrl,
          cover_url: coverUrlValue,
          city: form.city?.trim() ?? null,
          company: form.company?.trim() ?? null,
          birth_date: form.birth_date?.trim() ?? null,
          bio: form.bio?.trim() ?? null,
          role: role.trim() || null,
          status: status.trim() || null,
          website: website.trim() || null,
          linkedin: linkedin.trim() || null,
          twitter: twitter.trim() || null,
          instagram: instagram.trim() || null,
        })
        .eq('id', user.id)

      if (error) throw error

      const updatedProfile = {
        ...form,
        avatar_url: avatarUrl,
        cover_url: coverUrlValue,
        role: role.trim() || null,
        status: status.trim() || null,
        website: website.trim() || null,
        linkedin: linkedin.trim() || null,
        twitter: twitter.trim() || null,
        instagram: instagram.trim() || null,
      }

      setProfile(updatedProfile)
      setForm(updatedProfile)
      setAvatarPreview(avatarUrl ?? '')
      setCoverPreview(coverUrlValue ?? '')
      setMessage('Perfil actualizado correctamente')
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar el perfil')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-secondary)] p-8 text-[var(--color-text-primary)]">
        <div className="mx-auto max-w-5xl rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-8">
          Cargando perfil…
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-secondary)] p-8 text-[var(--color-text-primary)]">
        <div className="mx-auto max-w-5xl rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-8">
          No pudimos cargar tu perfil.
        </div>
      </div>
    )
  }

  function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>, kind: 'avatar' | 'cover') {
    const file = event.target.files?.[0]
    if (!file) return

    if (kind === 'avatar') {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    } else {
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] px-4 py-8 text-[var(--color-text-primary)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] shadow-sm">
          <div className="h-36 bg-[linear-gradient(135deg,var(--color-primary),var(--color-secondary))]">
            {coverPreview ? <img src={coverPreview} alt="Portada" className="h-full w-full object-cover" /> : null}
          </div>
          <div className="px-6 pb-6 pt-0">
            <div className="-mt-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-[var(--color-bg-primary)] bg-[var(--color-bg-secondary)] text-2xl font-semibold text-[var(--color-text-primary)] shadow-lg">
                  {avatarPreview || form.avatar_url ? (
                    <img src={avatarPreview || (form.avatar_url ?? '')} alt={form.full_name ?? 'Avatar'} className="h-full w-full object-cover" />
                  ) : (
                    (form.initials || form.full_name?.slice(0, 2) || 'U').toUpperCase()
                  )}
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">Perfil social</p>
                    <BadgeCheck size={16} className="text-[var(--color-secondary)]" />
                  </div>
                  <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">{form.full_name || 'Tu nombre'}</h1>
                  <p className="text-sm text-[var(--color-text-secondary)]">{form.username ? `@${form.username}` : 'Agregá tu usuario'}</p>
                  {role ? <p className="mt-2 text-sm font-medium text-[var(--color-text-primary)]">{role}</p> : null}
                  {status ? <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{status}</p> : null}
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-text-secondary)]"
              >
                Volver al dashboard
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <Sparkles size={18} className="text-[var(--color-secondary)]" />
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Información pública</h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
                <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">Portada</label>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-focus-ring)]"
                  />
                  <input type="file" accept="image/*" onChange={(event) => handleImageSelect(event, 'cover')} className="w-full text-sm text-[var(--color-text-secondary)]" />
                </div>
              </div>

              <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
                <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">Avatar</label>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-sm font-semibold text-[var(--color-text-primary)]">
                    {avatarPreview || form.avatar_url ? (
                      <img src={avatarPreview || (form.avatar_url ?? '')} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      (form.initials || form.full_name?.slice(0, 2) || 'U').toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="url"
                      value={form.avatar_url ?? ''}
                      onChange={(e) => setForm((prev) => prev ? { ...prev, avatar_url: e.target.value } : prev)}
                      placeholder="https://..."
                      className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-focus-ring)]"
                    />
                    <input type="file" accept="image/*" onChange={(event) => handleImageSelect(event, 'avatar')} className="w-full text-sm text-[var(--color-text-secondary)]" />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">Nombre completo</label>
                  <input
                    type="text"
                    value={form.full_name ?? ''}
                    onChange={(e) => setForm((prev) => prev ? { ...prev, full_name: e.target.value } : prev)}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-focus-ring)]"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">Usuario</label>
                  <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5">
                    <AtSign size={16} className="text-[var(--color-text-tertiary)]" />
                    <input
                      type="text"
                      value={form.username ?? ''}
                      onChange={(e) => setForm((prev) => prev ? { ...prev, username: e.target.value } : prev)}
                      className="w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none"
                      placeholder="tuusuario"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">Rol / cargo</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-focus-ring)]"
                    placeholder="Product Designer"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">Estado</label>
                  <input
                    type="text"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-focus-ring)]"
                    placeholder="Trabajando en nuevas automaciones"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">Biografía</label>
                <textarea
                  value={form.bio ?? ''}
                  onChange={(e) => setForm((prev) => prev ? { ...prev, bio: e.target.value } : prev)}
                  rows={4}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-focus-ring)]"
                  placeholder="Contá un poco sobre tu rol, tus intereses o tu equipo."
                />
              </div>
            </div>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <Camera size={18} className="text-[var(--color-secondary)]" />
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Detalles personales</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">Email</label>
                <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5">
                  <Mail size={16} className="text-[var(--color-text-tertiary)]" />
                  <input
                    type="email"
                    value={form.email ?? ''}
                    readOnly
                    aria-describedby="email-help"
                    className="w-full cursor-not-allowed bg-transparent text-sm text-[var(--color-text-secondary)] outline-none"
                  />
                </div>
                <p id="email-help" className="mt-1.5 text-xs text-[var(--color-text-tertiary)]">El email se administra desde tu cuenta de acceso.</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">Ciudad</label>
                <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5">
                  <MapPin size={16} className="text-[var(--color-text-tertiary)]" />
                  <input
                    type="text"
                    value={form.city ?? ''}
                    onChange={(e) => setForm((prev) => prev ? { ...prev, city: e.target.value } : prev)}
                    className="w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none"
                    placeholder="Buenos Aires"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">Empresa</label>
                <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5">
                  <Briefcase size={16} className="text-[var(--color-text-tertiary)]" />
                  <input
                    type="text"
                    value={form.company ?? ''}
                    onChange={(e) => setForm((prev) => prev ? { ...prev, company: e.target.value } : prev)}
                    className="w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none"
                    placeholder="Soph.ia"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">Fecha de nacimiento</label>
                <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5">
                  <CalendarDays size={16} className="text-[var(--color-text-tertiary)]" />
                  <input
                    type="date"
                    value={form.birth_date ?? ''}
                    onChange={(e) => setForm((prev) => prev ? { ...prev, birth_date: e.target.value } : prev)}
                    className="w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none"
                  />
                </div>
              </div>

              <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
                <label className="mb-3 block text-sm font-medium text-[var(--color-text-primary)]">Links sociales</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2.5">
                    <Globe size={16} className="text-[var(--color-text-tertiary)]" />
                    <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none" placeholder="https://tuweb.com" />
                  </div>
                  <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2.5">
                    <Link size={16} className="text-[var(--color-text-tertiary)]" />
                    <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none" placeholder="https://linkedin.com/in/tuusuario" />
                  </div>
                  <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2.5">
                    <MessageCircleMore size={16} className="text-[var(--color-text-tertiary)]" />
                    <input type="url" value={twitter} onChange={(e) => setTwitter(e.target.value)} className="w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none" placeholder="https://x.com/tuusuario" />
                  </div>
                  <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2.5">
                    <UserRoundCheck size={16} className="text-[var(--color-text-tertiary)]" />
                    <input type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none" placeholder="https://instagram.com/tuusuario" />
                  </div>
                </div>
              </div>
            </div>

            {message && (
              <div className="mt-5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)]">
                {message}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button type="submit" disabled={saving} className="rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
