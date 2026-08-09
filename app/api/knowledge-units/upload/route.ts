import { createClient } from '../../../lib/supabase/server'
import { fetchCurrentProfile } from '../../../lib/profile'
import { extractFromFile } from '../../../lib/file-extract'
import { NextResponse } from 'next/server'

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB
const ACCEPT_EXTENSIONS = ['.md', '.markdown', '.txt', '.docx', '.pdf']

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const files = formData.getAll('files').filter((f): f is File => f instanceof File)

    if (files.length === 0) {
      return NextResponse.json({ error: 'No se enviaron archivos' }, { status: 400 })
    }

    const results: Array<{ id?: string; name: string; error?: string }> = []

    for (const file of files) {
      try {
        if (file.size > MAX_FILE_SIZE) {
          results.push({ name: file.name, error: `Archivo demasiado grande (max 25MB)` })
          continue
        }
        const lower = file.name.toLowerCase()
        if (!ACCEPT_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
          results.push({ name: file.name, error: 'Formato no soportado' })
          continue
        }

        const extracted = await extractFromFile(file)

        const { data: ku, error } = await supabase
          .from('knowledge_units')
          .insert({
            name: extracted.name,
            type: 'Documento',
            area: 'General',
            format: extracted.format,
            source: 'Upload',
            content: extracted.content,
            organization_id: profile.organization_id,
            author_id: profile.id,
          })
          .select('id, name')
          .single()

        if (error) throw error

        results.push({ id: ku.id, name: ku.name })

        // Best-effort reindex in the background (fire and forget)
        const proto = request.headers.get('x-forwarded-proto') ?? 'http'
        const host = request.headers.get('host') ?? 'localhost:3000'
        fetch(`${proto}://${host}/api/knowledge-units/${ku.id}/reindex`, {
          method: 'POST',
          headers: { cookie: request.headers.get('cookie') ?? '' },
        }).catch(() => {})
      } catch (err) {
        results.push({
          name: file.name,
          error: err instanceof Error ? err.message : 'Error desconocido',
        })
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload' },
      { status: 500 }
    )
  }
}
