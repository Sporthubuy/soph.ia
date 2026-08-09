import { createClient } from '../../lib/supabase/server'
import { fetchCurrentProfile } from '../../lib/profile'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('organization_invitations')
      .select('id, email, token, status, created_at, expires_at, accepted_at, invited_by')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch invitations' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { email } = await request.json() as { email: string }
    if (!email?.trim()) return NextResponse.json({ error: 'El email es obligatorio' }, { status: 400 })

    const normalizedEmail = email.trim().toLowerCase()
    if (normalizedEmail === profile.email.toLowerCase()) {
      return NextResponse.json({ error: 'No podés invitarte a vos mismo' }, { status: 400 })
    }

    const { data: existingMember } = await supabase
      .from('profiles')
      .select('id')
      .eq('organization_id', profile.organization_id)
      .ilike('email', normalizedEmail)
      .maybeSingle()

    if (existingMember) {
      return NextResponse.json({ error: 'Ese email ya pertenece a un miembro del equipo' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('organization_invitations')
      .insert({
        organization_id: profile.organization_id,
        email: normalizedEmail,
        invited_by: profile.id,
      })
      .select('id, email, token, status, created_at, expires_at')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Ya existe una invitación pendiente para ese email' }, { status: 400 })
      }
      throw error
    }

    // Send email best-effort (don't fail the request if email fails)
    try {
      const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', profile.organization_id)
        .single()

      const proto = request.headers.get('x-forwarded-proto') ?? 'http'
      const host = request.headers.get('host') ?? 'localhost:3000'
      const inviteUrl = `${proto}://${host}/invite/${data.token}`

      await fetch(`${proto}://${host}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: normalizedEmail,
          subject: `${profile.full_name} te invitó a ${org?.name ?? 'un equipo'} en Soph.ia`,
          html: `
            <h2>Te invitaron a Soph.ia</h2>
            <p><strong>${profile.full_name}</strong> te invitó a unirte al equipo <strong>${org?.name ?? ''}</strong> en Soph.ia.</p>
            <p><a href="${inviteUrl}" style="display:inline-block;background:#5B9BFF;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">Aceptar invitación</a></p>
            <p style="color:#666;font-size:12px">Si el botón no funciona, copiá este link: ${inviteUrl}</p>
            <p style="color:#666;font-size:12px">La invitación expira en 7 días.</p>
          `,
        }),
      })
    } catch (e) {
      console.error('Failed to send invitation email:', e)
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create invitation' },
      { status: 500 }
    )
  }
}
