import type { SupabaseClient } from '@supabase/supabase-js'
import { formatRelativeTime } from '../lib/format'
import type { BadgeTone } from '../components/dashboard/Badge'

export type DashboardStats = {
  agentCount: number
  kuCount: number
  pendingCount: number
}

export type DashboardAgent = {
  id: string
  tag: string
  name: string
  meta: string
  status: string
  tone: BadgeTone
}

export type DashboardActivity = {
  initials: string
  who: string
  what: string
  when: string
}

export type DashboardPending = {
  title: string
  meta: string
  kind: string
  tone: BadgeTone
  dot: string
}

export async function fetchDashboardStats(supabase: SupabaseClient): Promise<DashboardStats> {
  const [agentsRes, kusRes, pendingRes] = await Promise.all([
    supabase.from('agents').select('id', { count: 'exact', head: true }),
    supabase.from('knowledge_units').select('id', { count: 'exact', head: true }),
    supabase.from('knowledge_units').select('id', { count: 'exact', head: true }).in('status', ['Borrador', 'En revisión']),
  ])

  return {
    agentCount: agentsRes.count ?? 0,
    kuCount: kusRes.count ?? 0,
    pendingCount: pendingRes.count ?? 0,
  }
}

export async function fetchDashboardAgents(supabase: SupabaseClient): Promise<DashboardAgent[]> {
  const { data, error } = await supabase
    .from('agents')
    .select('id, name, status, usage_count, model')
    .order('updated_at', { ascending: false })
    .limit(3)

  if (error) throw error
  if (!data) return []

  return data.map((a) => {
    const statusMap: Record<string, { label: string; tone: BadgeTone }> = {
      published: { label: 'Activo', tone: 'success' },
      draft: { label: 'Borrador', tone: 'neutral' },
      archived: { label: 'Archivado', tone: 'warning' },
    }
    const s = statusMap[a.status] ?? { label: a.status, tone: 'neutral' as BadgeTone }

    return {
      id: a.id,
      tag: a.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
      name: a.name,
      meta: `${a.usage_count} consultas · ${a.model}`,
      status: s.label,
      tone: s.tone,
    }
  })
}

export async function fetchDashboardActivity(supabase: SupabaseClient): Promise<DashboardActivity[]> {
  const { data, error } = await supabase
    .from('knowledge_unit_history')
    .select(`
      id, action, created_at,
      actor:profiles(full_name, initials),
      knowledge_unit:knowledge_units(name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) return []
  if (!data || data.length === 0) return []

  return data.map((h: any) => ({
    initials: h.actor?.initials ?? '??',
    who: h.actor?.full_name ?? 'Alguien',
    what: `${h.action}${h.knowledge_unit?.name ? ` "${h.knowledge_unit.name}"` : ''}`,
    when: formatRelativeTime(h.created_at),
  }))
}

export async function fetchDashboardPending(supabase: SupabaseClient): Promise<DashboardPending[]> {
  const items: DashboardPending[] = []

  const { data: kus } = await supabase
    .from('knowledge_units')
    .select('name, status, area, updated_at')
    .in('status', ['Borrador', 'En revisión'])
    .order('updated_at', { ascending: false })
    .limit(4)

  if (kus) {
    for (const ku of kus) {
      const kindMap: Record<string, { kind: string; tone: BadgeTone; dot: string }> = {
        'En revisión': { kind: 'Revisión', tone: 'warning', dot: 'var(--color-warning)' },
        'Borrador': { kind: 'Borrador', tone: 'neutral', dot: 'var(--color-text-tertiary)' },
      }
      const info = kindMap[ku.status] ?? { kind: ku.status, tone: 'neutral' as BadgeTone, dot: 'var(--color-text-tertiary)' }

      items.push({
        title: ku.name,
        meta: `Knowledge unit · ${ku.area} · ${formatRelativeTime(ku.updated_at)}`,
        kind: info.kind,
        tone: info.tone,
        dot: info.dot,
      })
    }
  }

  const { data: draftAgents } = await supabase
    .from('agents')
    .select('name, updated_at')
    .eq('status', 'draft')
    .order('updated_at', { ascending: false })
    .limit(2)

  if (draftAgents) {
    for (const agent of draftAgents) {
      items.push({
        title: `Completar agente: ${agent.name}`,
        meta: `Agente · borrador · ${formatRelativeTime(agent.updated_at)}`,
        kind: 'Borrador',
        tone: 'info',
        dot: 'var(--color-secondary)',
      })
    }
  }

  return items.slice(0, 5)
}
