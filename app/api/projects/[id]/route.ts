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
        owner:profiles!projects_owner_id_fkey(id, full_name, initials),
        project_members(id, user_id, role, profile:profiles(id, full_name, initials))
      `)
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .maybeSingle()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

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
      .select(`
        id, title, description, type, status, created_at, updated_at,
        assigned:profiles!project_tasks_assigned_to_fkey(id, full_name, initials),
        creator:profiles!project_tasks_created_by_fkey(id, full_name, initials)
      `)
      .eq('project_id', id)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      ...data,
      agents: agents ?? [],
      knowledge_units: kus ?? [],
      tasks: tasks ?? [],
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
