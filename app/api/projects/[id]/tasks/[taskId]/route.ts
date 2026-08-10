import { createClient } from '../../../../../lib/supabase/server'
import { fetchCurrentProfile } from '../../../../../lib/profile'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { taskId } = await params
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const allowed = ['title', 'description', 'type', 'status', 'assigned_to'] as const
    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('project_tasks')
      .update(updates)
      .eq('id', taskId)
      .select('id, title, description, type, status, assigned_to, created_by, updated_at')
      .single()

    if (error) throw error

    const userIds = [data.created_by, data.assigned_to].filter(Boolean) as string[]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, initials')
      .in('id', userIds)
    const pMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

    return NextResponse.json({
      ...data,
      assigned: data.assigned_to ? pMap[data.assigned_to] ?? null : null,
      creator: pMap[data.created_by] ?? null,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update task' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { taskId } = await params
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabase
      .from('project_tasks')
      .delete()
      .eq('id', taskId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete task' },
      { status: 500 }
    )
  }
}
