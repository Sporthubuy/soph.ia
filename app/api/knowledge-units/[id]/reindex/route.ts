import { createClient } from '../../../../lib/supabase/server'
import { fetchCurrentProfile } from '../../../../lib/profile'
import { decrypt } from '../../../../lib/crypto'
import { chunkContent, embedTexts } from '../../../../lib/embeddings'
import { NextResponse } from 'next/server'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: ku, error: kuErr } = await supabase
      .from('knowledge_units')
      .select('id, content, organization_id')
      .eq('id', id)
      .maybeSingle()

    if (kuErr) throw kuErr
    if (!ku) return NextResponse.json({ error: 'Knowledge unit no encontrada' }, { status: 404 })

    const { data: keyRow, error: keyErr } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('profile_id', profile.id)
      .eq('provider', 'openai')
      .maybeSingle()

    if (keyErr) throw keyErr
    if (!keyRow) {
      return NextResponse.json(
        { error: 'Necesitás una API key de OpenAI configurada para generar embeddings.' },
        { status: 400 }
      )
    }

    const openaiKey = decrypt(keyRow.encrypted_key)
    const chunks = chunkContent(ku.content || '')

    // Clear existing chunks first
    await supabase.from('knowledge_unit_chunks').delete().eq('knowledge_unit_id', id)

    if (chunks.length === 0) {
      return NextResponse.json({ chunks: 0, note: 'KU sin contenido, no se generaron embeddings.' })
    }

    const embeddings = await embedTexts(openaiKey, chunks)

    const rows = chunks.map((content, i) => ({
      knowledge_unit_id: id,
      organization_id: ku.organization_id,
      chunk_index: i,
      content,
      embedding: embeddings[i] as unknown as string,
      tokens: Math.ceil(content.length / 4),
    }))

    const { error: insErr } = await supabase.from('knowledge_unit_chunks').insert(rows)
    if (insErr) throw insErr

    return NextResponse.json({ chunks: chunks.length })
  } catch (error) {
    console.error('Reindex error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reindex' },
      { status: 500 }
    )
  }
}
