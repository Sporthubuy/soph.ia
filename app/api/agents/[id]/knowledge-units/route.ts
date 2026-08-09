import { createClient } from '../../../../lib/supabase/server'
import { fetchCurrentProfile } from '../../../../lib/profile'
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
      .from('agents_knowledge_units')
      .select('knowledge_unit_id')
      .eq('agent_id', id)

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching agent KUs:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch agent KUs' },
      { status: 500 }
    )
  }
}
