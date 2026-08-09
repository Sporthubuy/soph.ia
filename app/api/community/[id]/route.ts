import { createClient } from '../../../lib/supabase/server'
import { fetchCurrentProfile } from '../../../lib/profile'
import { NextResponse } from 'next/server'

export async function GET(
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

    const url = new URL(request.url)
    const type = url.searchParams.get('type') as 'agent' | 'ku' | null

    if (type === 'agent') {
      const { data, error } = await supabase
        .from('agents')
        .select(`
          id, name, description, type, model, status, visibility,
          usage_count, clone_count, tags, created_at, updated_at,
          author:profiles!agents_author_id_fkey(id, full_name, initials),
          organization:organizations!agents_organization_id_fkey(name)
        `)
        .eq('id', id)
        .eq('visibility', 'public')
        .eq('status', 'published')
        .maybeSingle()

      if (error) throw error
      if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

      return NextResponse.json({ item: data, type: 'agent' })
    }

    if (type === 'ku') {
      const { data, error } = await supabase
        .from('knowledge_units')
        .select(`
          id, name, type, area, format, status, visibility,
          usage_count, clone_count, tags, language, created_at, updated_at,
          author:profiles!knowledge_units_author_id_fkey(id, full_name, initials),
          organization:organizations!knowledge_units_organization_id_fkey(name)
        `)
        .eq('id', id)
        .eq('visibility', 'public')
        .eq('status', 'Publicada')
        .maybeSingle()

      if (error) throw error
      if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

      return NextResponse.json({ item: data, type: 'ku' })
    }

    return NextResponse.json({ error: 'type query param required (agent or ku)' }, { status: 400 })
  } catch (error) {
    console.error('Community detail error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch item' },
      { status: 500 }
    )
  }
}
