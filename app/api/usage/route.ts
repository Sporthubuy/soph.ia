import { createClient } from '../../lib/supabase/server'
import { fetchCurrentProfile } from '../../lib/profile'
import { DAILY_CHAT_LIMIT, since24h } from '../../lib/usage'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [convsRes, kusRes, agentsRes] = await Promise.all([
      supabase
        .from('conversations')
        .select('id', { count: 'exact', head: true })
        .eq('profile_id', profile.id),
      supabase
        .from('knowledge_units')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', profile.id),
      supabase
        .from('agents')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', profile.id),
    ])

    const { data: convIds } = await supabase
      .from('conversations')
      .select('id')
      .eq('profile_id', profile.id)

    let messagesToday = 0
    if (convIds && convIds.length > 0) {
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .in('conversation_id', convIds.map((c) => c.id))
        .eq('role', 'user')
        .gte('created_at', since24h())
      messagesToday = count ?? 0
    }

    return NextResponse.json({
      messages_today: messagesToday,
      daily_limit: DAILY_CHAT_LIMIT,
      remaining: Math.max(0, DAILY_CHAT_LIMIT - messagesToday),
      totals: {
        conversations: convsRes.count ?? 0,
        knowledge_units: kusRes.count ?? 0,
        agents: agentsRes.count ?? 0,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch usage' },
      { status: 500 }
    )
  }
}
