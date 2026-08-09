import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { fetchCurrentProfile } from '../../../lib/profile'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: org } = await supabase
      .from('organizations')
      .select('owner_id')
      .eq('id', profile.organization_id)
      .single()

    if (profile.id !== org?.owner_id) {
      return NextResponse.json({ error: 'Solo el dueño puede cambiar roles' }, { status: 403 })
    }

    if (id === org.owner_id) {
      return NextResponse.json({ error: 'No podés cambiar tu propio rol de owner' }, { status: 400 })
    }

    const { role } = await request.json() as { role: string }
    const validRoles = ['admin', 'member', 'viewer']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: `Rol inválido. Opciones: ${validRoles.join(', ')}` }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error } = await admin
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .eq('organization_id', profile.organization_id)

    if (error) throw error
    return NextResponse.json({ success: true, role })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update role' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: org } = await supabase
      .from('organizations')
      .select('owner_id')
      .eq('id', profile.organization_id)
      .single()

    if (profile.id !== org?.owner_id) {
      return NextResponse.json({ error: 'Solo el dueño puede remover miembros' }, { status: 403 })
    }

    if (id === org.owner_id) {
      return NextResponse.json({ error: 'No podés removerte a vos mismo como owner' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error } = await admin
      .from('profiles')
      .update({ organization_id: null })
      .eq('id', id)
      .eq('organization_id', profile.organization_id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove member' },
      { status: 500 }
    )
  }
}
