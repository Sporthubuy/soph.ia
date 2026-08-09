import { createClient } from '../../lib/supabase/server'
import { fetchCurrentProfile } from '../../lib/profile'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('knowledge_units')
      .select('id, name, type, area, status, format, language, version, quality, usage_count, tags, content, expires_at, source, created_at, updated_at')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching knowledge units:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch knowledge units' },
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
    const { name, type, area } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('knowledge_units')
      .insert({
        name: name.trim(),
        type: type || 'Documento',
        area: area || 'General',
        organization_id: profile.organization_id,
        author_id: profile.id,
      })
      .select('id, name, type, area, status, created_at')
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating knowledge unit:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create knowledge unit' },
      { status: 500 }
    )
  }
}
