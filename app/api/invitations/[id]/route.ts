import { createClient } from '../../../lib/supabase/server'
import { fetchCurrentProfile } from '../../../lib/profile'
import { NextResponse } from 'next/server'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabase
      .from('organization_invitations')
      .update({ status: 'revoked' })
      .eq('id', id)
      .eq('organization_id', profile.organization_id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to revoke invitation' },
      { status: 500 }
    )
  }
}
