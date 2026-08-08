import { createClient } from '@/app/lib/supabase/server'
import { fetchCurrentProfile } from '@/app/lib/profile'
import { fetchAgents, createAgent } from '@/app/agents/db'
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
    const { name, description, type, model } = body

    if (!name || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const agent = await createAgent(supabase, {
      name,
      description,
      type,
      model: model || 'claude-sonnet-4-20250514',
      organizationId: profile.organization_id,
      authorId: profile.id,
    })

    return NextResponse.json(agent, { status: 201 })
  } catch (error) {
    console.error('Error creating agent:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create agent' },
      { status: 500 }
    )
  }
}
