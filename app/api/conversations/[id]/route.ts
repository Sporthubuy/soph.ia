import { createClient } from '../../../lib/supabase/server'
import { fetchCurrentProfile } from '../../../lib/profile'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [convRes, msgsRes] = await Promise.all([
      supabase
        .from('conversations')
        .select('id, agent_id, title, created_at, updated_at')
        .eq('id', id)
        .maybeSingle(),
      supabase
        .from('messages')
        .select('id, role, content, created_at')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true }),
    ])

    if (convRes.error) throw convRes.error
    if (msgsRes.error) throw msgsRes.error
    if (!convRes.data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ conversation: convRes.data, messages: msgsRes.data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch conversation' },
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
    const updates: Record<string, unknown> = {}
    if ('title' in body) updates.title = body.title

    const { data, error } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', id)
      .select('id, title, updated_at')
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update conversation' },
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

    const { error } = await supabase.from('conversations').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete conversation' },
      { status: 500 }
    )
  }
}
