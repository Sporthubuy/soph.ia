import { createClient } from '../../../lib/supabase/server'
import { fetchCurrentProfile } from '../../../lib/profile'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { token } = await request.json()
    if (!token) return NextResponse.json({ error: 'Token requerido' }, { status: 400 })

    const { data, error } = await supabase.rpc('accept_invitation', { invitation_token: token })

    if (error) {
      const msg = error.message.includes('does not match')
        ? 'La invitación es para otro email. Iniciá sesión con la cuenta correcta.'
        : error.message.includes('not found or expired')
        ? 'La invitación es inválida o expiró.'
        : error.message
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to accept invitation' },
      { status: 500 }
    )
  }
}
