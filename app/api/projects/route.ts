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
        project_members(id, user_id, role)
      `)
      .eq('organization_id', profile.organization_id)
      .order('updated_at', { ascending: false })

    if (error) throw error

    const allUserIds = new Set<string>()
    for (const p of data ?? []) {
      for (const m of p.project_members) allUserIds.add(m.user_id)
    }

    let profilesMap: Record<string, { id: string; full_name: string; initials: string }> = {}
    if (allUserIds.size > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, initials')
        .in('id', [...allUserIds])
      for (const p of profiles ?? []) profilesMap[p.id] = p
    }

    const enriched = (data ?? []).map((p) => {
      const members = p.project_members.map((m) => ({
        ...m,
        profile: profilesMap[m.user_id] ?? null,
      }))
      const ownerMember = members.find((m) => m.role === 'owner')
      return { ...p, project_members: members, owner: ownerMember?.profile ?? null }
    })

    return NextResponse.json(enriched)
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
