import { createClient } from '../../lib/supabase/server'
import { fetchCurrentProfile } from '../../lib/profile'
import { encrypt, keyHint } from '../../lib/crypto'
import { NextResponse } from 'next/server'

const VALID_PROVIDERS = ['anthropic', 'openai', 'google']

export async function GET() {
  try {
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('api_keys')
      .select('id, provider, key_hint, is_valid, created_at, updated_at')
      .eq('profile_id', profile.id)
      .order('provider')

    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch keys' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { provider, api_key } = await request.json()

    if (!VALID_PROVIDERS.includes(provider)) {
      return NextResponse.json({ error: 'Proveedor no válido' }, { status: 400 })
    }
    if (!api_key || typeof api_key !== 'string' || api_key.trim().length < 10) {
      return NextResponse.json({ error: 'API key inválida' }, { status: 400 })
    }

    const trimmed = api_key.trim()
    const encrypted = encrypt(trimmed)
    const hint = keyHint(trimmed)

    const { data, error } = await supabase
      .from('api_keys')
      .upsert(
        {
          profile_id: profile.id,
          organization_id: profile.organization_id,
          provider,
          encrypted_key: encrypted,
          key_hint: hint,
          is_valid: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'profile_id,provider' }
      )
      .select('id, provider, key_hint, is_valid, created_at, updated_at')
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save key' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { provider } = await request.json()

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('profile_id', profile.id)
      .eq('provider', provider)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete key' },
      { status: 500 }
    )
  }
}
