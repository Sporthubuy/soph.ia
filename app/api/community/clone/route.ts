import { createClient } from '../../../lib/supabase/server'
import { fetchCurrentProfile } from '../../../lib/profile'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, type } = (await request.json()) as { id: string; type: 'agent' | 'ku' }

    if (!id || !type) {
      return NextResponse.json({ error: 'Se requiere id y type' }, { status: 400 })
    }

    if (type === 'agent') {
      const { data: source, error: fetchErr } = await supabase
        .from('agents')
        .select('name, description, type, prompt, model, temperature, max_tokens, tags, restrict_to_kus')
        .eq('id', id)
        .eq('visibility', 'public')
        .eq('status', 'published')
        .single()

      if (fetchErr || !source) {
        return NextResponse.json({ error: 'Agente no encontrado o no es público' }, { status: 404 })
      }

      const { data: clone, error: insertErr } = await supabase
        .from('agents')
        .insert({
          name: source.name,
          description: source.description,
          type: source.type,
          prompt: source.prompt,
          model: source.model,
          temperature: source.temperature,
          max_tokens: source.max_tokens,
          tags: source.tags,
          restrict_to_kus: source.restrict_to_kus,
          status: 'draft',
          visibility: 'private',
          forked_from: id,
          organization_id: profile.organization_id,
          author_id: profile.id,
        })
        .select('id, name')
        .single()

      if (insertErr) throw insertErr

      // Increment clone count on the original (best-effort)
      const { data: original } = await supabase
        .from('agents')
        .select('clone_count')
        .eq('id', id)
        .single()
      if (original) {
        await supabase
          .from('agents')
          .update({ clone_count: (original.clone_count ?? 0) + 1 })
          .eq('id', id)
      }

      return NextResponse.json({ cloned: clone, type: 'agent' }, { status: 201 })
    }

    if (type === 'ku') {
      const { data: source, error: fetchErr } = await supabase
        .from('knowledge_units')
        .select('name, type, area, format, content, tags, language')
        .eq('id', id)
        .eq('visibility', 'public')
        .eq('status', 'Publicada')
        .single()

      if (fetchErr || !source) {
        return NextResponse.json({ error: 'Knowledge Unit no encontrada o no es pública' }, { status: 404 })
      }

      const { data: clone, error: insertErr } = await supabase
        .from('knowledge_units')
        .insert({
          name: source.name,
          type: source.type,
          area: source.area,
          format: source.format,
          content: source.content,
          tags: source.tags,
          language: source.language,
          status: 'Borrador',
          visibility: 'private',
          forked_from: id,
          organization_id: profile.organization_id,
          author_id: profile.id,
        })
        .select('id, name')
        .single()

      if (insertErr) throw insertErr

      const { data: originalKU } = await supabase
        .from('knowledge_units')
        .select('clone_count')
        .eq('id', id)
        .single()
      if (originalKU) {
        await supabase
          .from('knowledge_units')
          .update({ clone_count: (originalKU.clone_count ?? 0) + 1 })
          .eq('id', id)
      }

      return NextResponse.json({ cloned: clone, type: 'ku' }, { status: 201 })
    }

    return NextResponse.json({ error: 'type debe ser "agent" o "ku"' }, { status: 400 })
  } catch (error) {
    console.error('Clone error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al clonar' },
      { status: 500 }
    )
  }
}
