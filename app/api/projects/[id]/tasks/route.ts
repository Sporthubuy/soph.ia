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
      .select(`
        id, title, description, type, status, created_at,
        assigned:profiles!project_tasks_assigned_to_fkey(id, full_name, initials),
        creator:profiles!project_tasks_created_by_fkey(id, full_name, initials)
      `)
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create task' },
      { status: 500 }
    )
  }
}
