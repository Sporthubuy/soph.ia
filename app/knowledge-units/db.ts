import type { SupabaseClient } from '@supabase/supabase-js'
import { formatDate, formatRelativeTime } from '../lib/format'
import type { KnowledgeUnit, KUStatus } from './data'

type ProfileRef = { id: string; full_name: string; initials: string } | null

type ShareRow = { id: string; scope: string; role: string; profile: ProfileRef }
type HistoryRow = { id: string; action: string; created_at: string; actor: ProfileRef }

type KURow = {
  id: string
  name: string
  type: string
  area: string
  status: KUStatus
  format: string
  language: string
  version: number
  quality: number
  usage_count: number
  tags: string[]
  expires_at: string | null
  source: string
  created_at: string
  updated_at: string
  author: ProfileRef
  knowledge_unit_shares: ShareRow[]
  knowledge_unit_history: HistoryRow[]
}

const SELECT = `
  id, name, type, area, status, format, language, version, quality, usage_count, tags, expires_at, source, created_at, updated_at,
  author:profiles!knowledge_units_author_id_fkey(id, full_name, initials),
  knowledge_unit_shares(id, scope, role, profile:profiles(id, full_name, initials)),
  knowledge_unit_history(id, action, created_at, actor:profiles(id, full_name, initials))
`

const COMBINING_DIACRITICS = /[̀-ͯ]/g

function typeShort(type: string) {
  return type
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS, '')
    .slice(0, 3)
    .toUpperCase()
}

function toViewModel(row: KURow): KnowledgeUnit {
  const history = [...row.knowledge_unit_history].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return {
    id: row.id,
    name: row.name,
    type: row.type,
    typeShort: typeShort(row.type),
    area: row.area,
    status: row.status,
    sub: `v${row.version} · ${row.format}`,
    edited: formatRelativeTime(row.updated_at),
    version: row.version,
    author: row.author?.full_name ?? 'Sin autor',
    language: row.language,
    format: row.format,
    created: formatDate(row.created_at),
    expires: row.expires_at ? formatDate(row.expires_at) : null,
    source: row.source,
    quality: row.quality,
    usage: row.usage_count,
    usageNote:
      row.usage_count === 0 ? 'Sin uso todavía' : `Usada en ${row.usage_count} agente${row.usage_count === 1 ? '' : 's'}`,
    tags: row.tags,
    shares: row.knowledge_unit_shares
      .filter((s): s is ShareRow & { profile: NonNullable<ProfileRef> } => s.profile !== null)
      .map((s) => ({ i: s.profile.initials, name: s.profile.full_name, scope: s.scope, role: s.role })),
    history: history.map((h) => ({
      who: h.actor?.full_name ?? 'Alguien',
      what: h.action,
      when: formatRelativeTime(h.created_at),
    })),
  }
}

export async function fetchKnowledgeUnits(supabase: SupabaseClient, limit?: number): Promise<KnowledgeUnit[]> {
  let query = supabase.from('knowledge_units').select(SELECT).order('updated_at', { ascending: false })
  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) throw error
  return (data as unknown as KURow[]).map(toViewModel)
}

export async function fetchKnowledgeUnitById(supabase: SupabaseClient, id: string): Promise<KnowledgeUnit | null> {
  const { data, error } = await supabase.from('knowledge_units').select(SELECT).eq('id', id).maybeSingle()
  if (error) throw error
  if (!data) return null
  return toViewModel(data as unknown as KURow)
}

export async function fetchKnowledgeUnitRaw(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('knowledge_units')
    .select('id, name, type, area, status, format, language, version, quality, tags, content, expires_at, source, created_at, updated_at')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createKnowledgeUnit(
  supabase: SupabaseClient,
  input: { name: string; type: string; area: string; visibility?: string; status?: string; content?: string; organizationId: string; authorId: string }
): Promise<KnowledgeUnit> {
  const { data: created, error } = await supabase
    .from('knowledge_units')
    .insert({
      name: input.name,
      type: input.type,
      area: input.area,
      visibility: input.visibility || 'team',
      status: input.status || 'Borrador',
      content: input.content || null,
      organization_id: input.organizationId,
      author_id: input.authorId,
    })
    .select('id')
    .single()
  if (error) throw error

  const { data, error: fetchError } = await supabase.from('knowledge_units').select(SELECT).eq('id', created.id).single()
  if (fetchError) throw fetchError
  return toViewModel(data as unknown as KURow)
}

export async function updateKnowledgeUnit(
  supabase: SupabaseClient,
  id: string,
  fields: Partial<{
    name: string
    content: string
    type: string
    area: string
    status: string
    tags: string[]
    format: string
    language: string
  }>
) {
  const { data, error } = await supabase
    .from('knowledge_units')
    .update(fields)
    .eq('id', id)
    .select('id, name, content, type, area, status, format, language, version, quality, tags, expires_at, source, updated_at')
    .single()
  if (error) throw error
  return data
}

export async function deleteKnowledgeUnit(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from('knowledge_units').delete().eq('id', id)
  if (error) throw error
}
