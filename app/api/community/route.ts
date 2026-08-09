import { createClient } from '../../lib/supabase/server'
import { fetchCurrentProfile } from '../../lib/profile'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const type = url.searchParams.get('type') || 'all'

    const result: { agents: unknown[]; knowledgeUnits: unknown[] } = { agents: [], knowledgeUnits: [] }

    if (type === 'all' || type === 'agents') {
      const { data: agents, error: agentsErr } = await supabase
        .from('agents')
        .select(`
          id, name, description, type, model, usage_count, clone_count, tags, created_at,
          author:profiles!agents_author_id_fkey(id, full_name, initials),
          organization:organizations!agents_organization_id_fkey(name)
        `)
        .eq('visibility', 'public')
        .eq('status', 'published')
        .order('clone_count', { ascending: false })

      if (agentsErr) throw agentsErr
      result.agents = agents ?? []
    }

    if (type === 'all' || type === 'kus') {
      const { data: kus, error: kusErr } = await supabase
        .from('knowledge_units')
        .select(`
          id, name, type, area, format, tags, usage_count, clone_count, created_at,
          author:profiles!knowledge_units_author_id_fkey(id, full_name, initials),
          organization:organizations!knowledge_units_organization_id_fkey(name)
        `)
        .eq('visibility', 'public')
        .eq('status', 'Publicada')
        .order('clone_count', { ascending: false })

      if (kusErr) throw kusErr
      result.knowledgeUnits = kus ?? []
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Community fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch community items' },
      { status: 500 }
    )
  }
}
