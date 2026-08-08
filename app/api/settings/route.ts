import { createClient } from '@/app/lib/supabase/server'
import { fetchCurrentProfile } from '@/app/lib/profile'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)

    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userSettings, error: userError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('profile_id', profile.id)
      .single()

    if (userError && userError.code !== 'PGRST116') {
      throw userError
    }

    const { data: orgSettings, error: orgError } = await supabase
      .from('org_settings')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .single()

    if (orgError && orgError.code !== 'PGRST116') {
      throw orgError
    }

    return NextResponse.json({
      user: userSettings || {},
      org: orgSettings || {},
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch settings' },
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
    const { type, ...updates } = body

    let result

    if (type === 'user') {
      const { data, error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('profile_id', profile.id)
        .select('*')
        .single()

      if (error) throw error
      result = { user: data }
    } else if (type === 'org') {
      const { data, error } = await supabase
        .from('org_settings')
        .update(updates)
        .eq('organization_id', profile.organization_id)
        .select('*')
        .single()

      if (error) throw error
      result = { org: data }
    } else {
      return NextResponse.json({ error: 'Invalid settings type' }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update settings' },
      { status: 500 }
    )
  }
}
