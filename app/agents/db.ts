import type { SupabaseClient } from '@supabase/supabase-js'
import { formatDate, formatRelativeTime } from '../lib/format'
import type { Agent, AgentStatus } from './data'

type ProfileRef = { id: string; full_name: string } | null

type AgentRow = {
  id: string
  name: string
  description: string | null
  type: string
  status: AgentStatus
  model: string
  version: number
  usage_count: number
  tags: string[]
  created_at: string
  updated_at: string
  author: ProfileRef
}

const SELECT = `
  id, name, description, type, status, model, version, usage_count, tags, created_at, updated_at,
  author:profiles!agents_author_id_fkey(id, full_name)
`

function toViewModel(row: AgentRow): Agent {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    type: row.type,
    status: row.status,
    model: row.model,
    version: row.version,
    usage: row.usage_count,
    usageNote: row.usage_count === 0 ? 'Sin uso todavía' : `Usada ${row.usage_count} vez${row.usage_count === 1 ? '' : 'es'}`,
    author: row.author?.full_name ?? 'Sin autor',
    tags: row.tags,
    created: formatDate(row.created_at),
    edited: formatRelativeTime(row.updated_at),
  }
}

export async function fetchAgents(supabase: SupabaseClient, limit?: number): Promise<Agent[]> {
  let query = supabase.from('agents').select(SELECT).order('updated_at', { ascending: false })
  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) throw error
  return (data as unknown as AgentRow[]).map(toViewModel)
}

export async function fetchAgentById(supabase: SupabaseClient, id: string): Promise<Agent | null> {
  const { data, error } = await supabase.from('agents').select(SELECT).eq('id', id).single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return toViewModel(data as unknown as AgentRow)
}

export async function createAgent(
  supabase: SupabaseClient,
  input: { name: string; description?: string; type: string; model: string; organizationId: string; authorId: string }
): Promise<Agent> {
  const { data: created, error } = await supabase
    .from('agents')
    .insert({
      name: input.name,
      description: input.description || null,
      type: input.type,
      model: input.model,
      organization_id: input.organizationId,
      author_id: input.authorId,
    })
    .select('id')
    .single()

  if (error) throw error

  const { data, error: fetchError } = await supabase.from('agents').select(SELECT).eq('id', created.id).single()
  if (fetchError) throw fetchError
  return toViewModel(data as unknown as AgentRow)
}

export async function updateAgent(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<{ name: string; description: string; status: AgentStatus; model: string }>
): Promise<Agent> {
  const { data, error } = await supabase
    .from('agents')
    .update(updates)
    .eq('id', id)
    .select(SELECT)
    .single()

  if (error) throw error
  return toViewModel(data as unknown as AgentRow)
}

export async function deleteAgent(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from('agents').delete().eq('id', id)
  if (error) throw error
}
