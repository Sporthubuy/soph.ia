import { createClient } from '../../lib/supabase/server'
import { fetchCurrentProfile } from '../../lib/profile'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: org } = await supabase
      .from('organizations')
      .select('owner_id')
      .eq('id', profile.organization_id)
      .single()

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, initials, role, created_at')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: true })

    if (error) throw error

    const members = (data ?? []).map((m) => ({
      ...m,
      is_owner: m.id === org?.owner_id,
      role: m.id === org?.owner_id ? 'owner' : m.role || 'member',
    }))

    return NextResponse.json(members)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch team' },
      { status: 500 }
    )
  }
}
