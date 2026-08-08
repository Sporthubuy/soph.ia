import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

interface SendEmailRequest {
  to: string
  subject: string
  html: string
  text?: string
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as SendEmailRequest
    const { to, subject, html, text } = body

    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create admin client with service role key
    const supabase = createServerClient(
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

    // Use Supabase's built-in email functionality
    const { error } = await supabase.auth.admin.sendRawUserEmail({
      email: to,
      subject,
      html,
      plain_text: text || html.replace(/<[^>]*>/g, ''),
    })

    if (error) {
      console.error('Email send error:', error)
      return NextResponse.json(
        { error: 'Failed to send email', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Send email endpoint error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    )
  }
}
