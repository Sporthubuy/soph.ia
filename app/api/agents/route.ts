import { createClient } from '../../lib/supabase/server'
import { fetchCurrentProfile } from '../../lib/profile'
import { fetchAgents } from '../../agents/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)

    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const agents = await fetchAgents(supabase)
    return NextResponse.json(agents)
  } catch (error) {
    console.error('Error fetching agents:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch agents' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)

    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      type,
      model,
      prompt,
      temperature,
      max_tokens,
      restrict_to_kus,
      web_search,
      knowledge_unit_ids,
      status,
    } = body

    if (!name || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const insertPayload: Record<string, unknown> = {
      name,
      description: description ?? null,
      type,
      model: model || 'claude-sonnet-4-20250514',
      organization_id: profile.organization_id,
      author_id: profile.id,
      status: status || 'draft',
    }
    if (prompt !== undefined) insertPayload.prompt = prompt
    if (typeof temperature === 'number') insertPayload.temperature = temperature
    if (typeof max_tokens === 'number') insertPayload.max_tokens = max_tokens
    if (typeof restrict_to_kus === 'boolean') insertPayload.restrict_to_kus = restrict_to_kus
    if (typeof web_search === 'boolean') insertPayload.web_search = web_search

    const { data: created, error } = await supabase
      .from('agents')
      .insert(insertPayload)
      .select('id, name, description, type, status, model')
      .single()

    if (error) throw error

    if (Array.isArray(knowledge_unit_ids) && knowledge_unit_ids.length > 0) {
      const rows = knowledge_unit_ids.map((kuId: string) => ({
        agent_id: created.id,
        knowledge_unit_id: kuId,
      }))
      const { error: linkErr } = await supabase.from('agents_knowledge_units').insert(rows)
      if (linkErr) console.error('Failed to link KUs:', linkErr)
    }

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Error creating agent:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create agent' },
      { status: 500 }
    )
  }
}
