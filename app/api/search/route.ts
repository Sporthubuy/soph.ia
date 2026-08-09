import { createClient } from '../../lib/supabase/server'
import { fetchCurrentProfile } from '../../lib/profile'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const q = (url.searchParams.get('q') ?? '').trim()
    if (q.length < 2) {
      return NextResponse.json({ agents: [], kus: [], members: [] })
    }

    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const pattern = `%${q}%`

    const [agentsRes, kusRes, membersRes] = await Promise.all([
      supabase
        .from('agents')
        .select('id, name, description, type, status')
        .or(`name.ilike.${pattern},description.ilike.${pattern}`)
        .limit(5),
      supabase
        .from('knowledge_units')
        .select('id, name, type, area, status')
        .or(`name.ilike.${pattern},content.ilike.${pattern}`)
        .limit(5),
      supabase
        .from('profiles')
        .select('id, full_name, email, initials')
        .eq('organization_id', profile.organization_id)
        .or(`full_name.ilike.${pattern},email.ilike.${pattern}`)
        .limit(5),
    ])

    return NextResponse.json({
      agents: agentsRes.data ?? [],
      kus: kusRes.data ?? [],
      members: membersRes.data ?? [],
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    )
  }
}
