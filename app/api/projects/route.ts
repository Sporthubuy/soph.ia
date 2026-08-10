import { createClient } from '../../lib/supabase/server'
import { fetchCurrentProfile } from '../../lib/profile'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('projects')
      .select(`
        id, name, description, status, owner_id, created_at, updated_at,
        owner:profiles!projects_owner_id_fkey(id, full_name, initials),
        project_members(id, user_id, role, profile:profiles(id, full_name, initials))
      `)
      .eq('organization_id', profile.organization_id)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, description } = await request.json() as { name: string; description?: string }
    if (!name?.trim()) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        organization_id: profile.organization_id,
        owner_id: profile.id,
      })
      .select('id, name, description, status, owner_id, created_at')
      .single()

    if (error) throw error

    await supabase.from('project_members').insert({
      project_id: project.id,
      user_id: profile.id,
      role: 'owner',
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create project' },
      { status: 500 }
    )
  }
}
