import { createClient } from '../../../../lib/supabase/server'
import { fetchCurrentProfile } from '../../../../lib/profile'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: agentId } = await params
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('conversations')
      .select('id, title, created_at, updated_at')
      .eq('agent_id', agentId)
      .eq('profile_id', profile.id)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: agentId } = await params
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => ({}))

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        agent_id: agentId,
        profile_id: profile.id,
        organization_id: profile.organization_id,
        title: body.title || null,
      })
      .select('id, title, created_at, updated_at')
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create conversation' },
      { status: 500 }
    )
  }
}
