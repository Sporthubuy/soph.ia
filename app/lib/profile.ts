import type { SupabaseClient } from '@supabase/supabase-js'

export type Profile = {
  id: string
  full_name: string | null
  email: string
  initials: string
  organization_id: string
  username: string | null
  avatar_url: string | null
  cover_url: string | null
  city: string | null
  company: string | null
  birth_date: string | null
  bio: string | null
  role: string | null
  status: string | null
  website: string | null
  linkedin: string | null
  twitter: string | null
  instagram: string | null
}

export function getFirstName(fullName: string | null | undefined): string {
  if (!fullName) return ''

  const trimmedName = fullName.trim()
  if (!trimmedName) return ''

  return trimmedName.split(/\s+/)[0]
}

export async function fetchCurrentProfile(supabase: SupabaseClient): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, initials, organization_id, username, avatar_url, cover_url, city, company, birth_date, bio, role, status, website, linkedin, twitter, instagram')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return data
}
