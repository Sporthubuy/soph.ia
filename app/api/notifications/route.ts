import { createClient } from '../../lib/supabase/server'
import { fetchCurrentProfile } from '../../lib/profile'
import { NextResponse } from 'next/server'

type Notification = {
  id: string
  type: 'ku_status' | 'invitation_accepted' | 'invitation_sent' | 'conversation' | 'agent_created'
  text: string
  when: string
  href?: string
}

export async function GET() {
  try {
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Recent activity from multiple tables, merged and sorted by recency
    const [historyRes, invAcceptedRes, invSentRes, convsRes, agentsRes] = await Promise.all([
      supabase
        .from('knowledge_unit_history')
        .select('id, action, created_at, actor:profiles(full_name), knowledge_unit:knowledge_units(id, name, organization_id)')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('organization_invitations')
        .select('id, email, accepted_at, accepted_by:profiles!organization_invitations_accepted_by_fkey(full_name)')
        .eq('organization_id', profile.organization_id)
        .eq('status', 'accepted')
        .order('accepted_at', { ascending: false })
        .limit(5),
      supabase
        .from('organization_invitations')
        .select('id, email, created_at, invited_by:profiles!organization_invitations_invited_by_fkey(full_name)')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('conversations')
        .select('id, title, created_at, agent:agents(id, name)')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('agents')
        .select('id, name, created_at, author:profiles!agents_author_id_fkey(full_name)')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    const notifications: Notification[] = []

    for (const h of historyRes.data ?? []) {
      const ku = h.knowledge_unit as { id: string; name: string; organization_id: string } | null
      if (!ku || ku.organization_id !== profile.organization_id) continue
      const actor = (h.actor as { full_name: string } | null)?.full_name ?? 'Alguien'
      notifications.push({
        id: `h-${h.id}`,
        type: 'ku_status',
        text: `${actor} ${h.action} en "${ku.name}"`,
        when: h.created_at,
        href: `/knowledge-units/${ku.id}/edit`,
      })
    }

    for (const inv of invAcceptedRes.data ?? []) {
      const name = (inv.accepted_by as { full_name: string } | null)?.full_name ?? inv.email
      notifications.push({
        id: `ia-${inv.id}`,
        type: 'invitation_accepted',
        text: `${name} se sumó al equipo`,
        when: inv.accepted_at ?? new Date().toISOString(),
        href: '/settings/team',
      })
    }

    for (const inv of invSentRes.data ?? []) {
      const invitedBy = (inv.invited_by as { full_name: string } | null)?.full_name ?? 'Alguien'
      notifications.push({
        id: `is-${inv.id}`,
        type: 'invitation_sent',
        text: `${invitedBy} invitó a ${inv.email}`,
        when: inv.created_at,
        href: '/settings/team',
      })
    }

    for (const c of convsRes.data ?? []) {
      const agent = c.agent as { id: string; name: string } | null
      if (!agent) continue
      notifications.push({
        id: `c-${c.id}`,
        type: 'conversation',
        text: `Nueva conversación con "${agent.name}"${c.title ? `: ${c.title}` : ''}`,
        when: c.created_at,
        href: `/agents/${agent.id}/chat?c=${c.id}`,
      })
    }

    for (const a of agentsRes.data ?? []) {
      const author = (a.author as { full_name: string } | null)?.full_name ?? 'Alguien'
      notifications.push({
        id: `a-${a.id}`,
        type: 'agent_created',
        text: `${author} creó el agente "${a.name}"`,
        when: a.created_at,
        href: `/agents/${a.id}/edit`,
      })
    }

    notifications.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())

    return NextResponse.json(notifications.slice(0, 15))
  } catch (error) {
    console.error('Notifications error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}
