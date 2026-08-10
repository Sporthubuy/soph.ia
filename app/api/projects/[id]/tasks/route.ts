import { createClient } from '../../../../lib/supabase/server'
import { fetchCurrentProfile } from '../../../../lib/profile'
import { NextResponse } from 'next/server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json() as {
      title: string
      description?: string
      type?: string
      assigned_to?: string
    }

    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('project_tasks')
      .insert({
        project_id: id,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        type: body.type || 'general',
        assigned_to: body.assigned_to || null,
        created_by: profile.id,
      })
      .select('id, title, description, type, status, assigned_to, created_by, created_at')
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
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create task' },
      { status: 500 }
    )
  }
}
