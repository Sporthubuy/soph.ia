import { createClient } from '../../../lib/supabase/server'
import { fetchCurrentProfile } from '../../../lib/profile'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('projects')
      .select(`
        id, name, description, status, owner_id, created_at, updated_at,
        project_members(id, user_id, role)
      `)
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .maybeSingle()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    const memberUserIds = (data.project_members ?? []).map((m: { user_id: string }) => m.user_id)
    let profilesMap: Record<string, { id: string; full_name: string; initials: string }> = {}
    if (memberUserIds.length > 0) {
      const { data: memberProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, initials')
        .in('id', memberUserIds)
      for (const p of memberProfiles ?? []) profilesMap[p.id] = p
    }

    const membersWithProfiles = (data.project_members ?? []).map((m: { user_id: string; role: string; id: string }) => ({
      ...m,
      profile: profilesMap[m.user_id] ?? null,
    }))
    data.project_members = membersWithProfiles

    const ownerMember = membersWithProfiles.find((m: { role: string }) => m.role === 'owner')

    const { data: agents } = await supabase
      .from('agents')
      .select('id, name, description, type, model, status')
      .eq('project_id', id)
      .order('created_at', { ascending: false })

    const { data: kus } = await supabase
      .from('knowledge_units')
      .select('id, name, type, area, status, format')
      .eq('project_id', id)
      .order('created_at', { ascending: false })

    const { data: tasks } = await supabase
      .from('project_tasks')
      .select('id, title, description, type, status, assigned_to, created_by, created_at, updated_at')
      .eq('project_id', id)
      .order('created_at', { ascending: false })

    const taskUserIds = new Set<string>()
    for (const t of tasks ?? []) {
      if (t.assigned_to) taskUserIds.add(t.assigned_to)
      if (t.created_by) taskUserIds.add(t.created_by)
    }
    const knownIds = new Set(memberUserIds)
    const extraIds = [...taskUserIds].filter((uid) => !knownIds.has(uid))

    const taskProfilesMap: Record<string, { id: string; full_name: string; initials: string }> = { ...profilesMap }
    if (extraIds.length > 0) {
      const { data: extraProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, initials')
        .in('id', extraIds)
      for (const p of extraProfiles ?? []) {
        taskProfilesMap[p.id] = p
      }
    }

    const enrichedTasks = (tasks ?? []).map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      type: t.type,
      status: t.status,
      created_at: t.created_at,
      updated_at: t.updated_at,
      assigned: t.assigned_to ? taskProfilesMap[t.assigned_to] ?? null : null,
      creator: t.created_by ? taskProfilesMap[t.created_by] ?? null : null,
    }))

    return NextResponse.json({
      ...data,
      owner: ownerMember?.profile ?? null,
      agents: agents ?? [],
      knowledge_units: kus ?? [],
      tasks: enrichedTasks,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const allowed = ['name', 'description', 'status'] as const
    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .select('id, name, description, status, updated_at')
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update project' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('owner_id', profile.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete project' },
      { status: 500 }
    )
  }
}
