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

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)

    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Allow updating specific fields only
    const allowedFields = [
      'full_name',
      'username',
      'avatar_url',
      'cover_url',
      'city',
      'company',
      'birth_date',
      'bio',
      'website',
      'linkedin',
      'twitter',
      'instagram',
    ]

    const updates = Object.fromEntries(Object.entries(body).filter(([key]) => allowedFields.includes(key)))

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id)
      .select(
        'id, full_name, email, initials, organization_id, username, avatar_url, cover_url, city, company, birth_date, bio, role, status, website, linkedin, twitter, instagram'
      )
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update profile' },
      { status: 500 }
    )
  }
}
