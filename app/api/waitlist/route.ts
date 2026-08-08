import { createHash } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '../../lib/supabase/admin'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SOURCES = new Set(['hero', 'final-cta'])

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const source = typeof body.source === 'string' && SOURCES.has(body.source) ? body.source : 'hero'

    if (!name || name.length > 100 || !EMAIL_PATTERN.test(email) || email.length > 320) {
      return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })
    }

    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
    const ipHash = createHash('sha256').update(ip).digest('hex')
    const admin = createAdminClient()
    const { error } = await admin.rpc('submit_waitlist_signup', {
      p_name: name,
      p_email: email,
      p_source: source,
      p_ip_hash: ipHash,
    })

    if (error?.code === 'PGRST202') {
      // Allows the application release to precede the migration without
      // interrupting signups. The direct browser grant is revoked by that
      // migration; this server-side fallback is only used before then.
      const { error: insertError } = await admin.from('waitlist_signups').insert({ name, email, source })
      if (insertError) throw insertError
    } else if (error) {
      if (error.code === 'P0001') {
        return NextResponse.json({ error: 'Esperá unos minutos antes de volver a intentarlo.' }, { status: 429 })
      }
      throw error
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('waitlist signup failed', error)
    return NextResponse.json({ error: 'No pudimos registrar tu solicitud.' }, { status: 500 })
  }
}
