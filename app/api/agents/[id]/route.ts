import { createClient } from '../../../lib/supabase/server'
import { fetchCurrentProfile } from '../../../lib/profile'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)

    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('agents')
      .select('id, name, description, type, status, visibility, model, prompt, temperature, max_tokens, restrict_to_kus, web_search, version, usage_count, tags, created_at, updated_at')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching agent:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch agent' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)

    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const allowed = ['name', 'description', 'type', 'status', 'model', 'prompt', 'temperature', 'max_tokens', 'restrict_to_kus', 'web_search', 'visibility'] as const
    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    let updated = null
    if (Object.keys(updates).length > 0) {
      const { data, error } = await supabase
        .from('agents')
        .update(updates)
        .eq('id', id)
        .select('id, name, description, type, status, model, prompt, temperature, max_tokens, restrict_to_kus, web_search, updated_at')
        .single()
      if (error) throw error
      updated = data
    }

    if (Array.isArray(body.knowledge_unit_ids)) {
      const { error: delErr } = await supabase
        .from('agents_knowledge_units')
        .delete()
        .eq('agent_id', id)
      if (delErr) throw delErr

      if (body.knowledge_unit_ids.length > 0) {
        const rows = body.knowledge_unit_ids.map((kuId: string) => ({
          agent_id: id,
          knowledge_unit_id: kuId,
        }))
        const { error: insErr } = await supabase.from('agents_knowledge_units').insert(rows)
        if (insErr) throw insErr
      }
    }

    if (!updated) {
      const { data } = await supabase
        .from('agents')
        .select('id, name, description, type, status, model, prompt, temperature, max_tokens, restrict_to_kus, web_search, updated_at')
        .eq('id', id)
        .single()
      updated = data
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating agent:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update agent' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)

    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase.from('agents').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting agent:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete agent' },
      { status: 500 }
    )
  }
}
