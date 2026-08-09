import { createClient } from '../../../lib/supabase/server'
import { fetchCurrentProfile } from '../../../lib/profile'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('knowledge_units')
      .select('id, name, type, area, status, format, language, version, quality, usage_count, tags, content, expires_at, source, created_at, updated_at')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    if (!data) {
      return NextResponse.json({ error: 'Knowledge unit no encontrada' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching knowledge unit:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch knowledge unit' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const allowed = ['name', 'content', 'type', 'area', 'status', 'tags', 'format', 'language'] as const
    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    let previousStatus: string | null = null
    if ('status' in updates) {
      const { data: current } = await supabase
        .from('knowledge_units')
        .select('status')
        .eq('id', id)
        .maybeSingle()
      previousStatus = current?.status ?? null
    }

    const { data, error } = await supabase
      .from('knowledge_units')
      .update(updates)
      .eq('id', id)
      .select('id, name, content, type, area, status, format, language, version, quality, tags, updated_at')
      .single()

    if (error) throw error

    if (previousStatus && previousStatus !== data.status) {
      await supabase.from('knowledge_unit_history').insert({
        knowledge_unit_id: id,
        actor_id: profile.id,
        action: `cambió el estado de "${previousStatus}" a "${data.status}"`,
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating knowledge unit:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update knowledge unit' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('knowledge_units')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting knowledge unit:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete knowledge unit' },
      { status: 500 }
    )
  }
}
