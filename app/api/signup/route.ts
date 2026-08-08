import { createClient as createClientBrowser } from '../../lib/supabase/client'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, fullName, organizationName } = body

    if (!email || !password || !fullName || !organizationName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create admin client with service role key
    const adminClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return []
          },
          setAll() {},
        },
      }
    )

    // Sign up the user
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true, // Auto-confirm in development
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Create organization
    const { data: orgData, error: orgError } = await adminClient
      .from('organizations')
      .insert({
        name: organizationName.trim(),
        slug: organizationName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-'),
      })
      .select('id')
      .single()

    if (orgError) {
      console.error('Error creating organization:', orgError)
      return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
    }

    // Create profile
    const initials = fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    const { error: profileError } = await adminClient.from('profiles').insert({
      id: authData.user.id,
      email: authData.user.email!,
      full_name: fullName.trim(),
      initials,
      organization_id: orgData.id,
    })

    if (profileError) {
      console.error('Error creating profile:', profileError)
    }

    // Link user to organization
    const { error: linkError } = await adminClient.from('profiles_organizations').insert({
      profile_id: authData.user.id,
      organization_id: orgData.id,
      role: 'admin',
    })

    if (linkError) {
      console.error('Error linking user to organization:', linkError)
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Signup failed' },
      { status: 500 }
    )
  }
}
