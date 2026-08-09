import mammoth from 'mammoth'

export type ExtractResult = {
  name: string
  content: string
  format: 'Markdown' | 'PDF' | 'DOCX' | 'Texto'
}

export async function extractFromFile(file: File): Promise<ExtractResult> {
  const name = file.name.replace(/\.[^/.]+$/, '')
  const lower = file.name.toLowerCase()
  const buffer = Buffer.from(await file.arrayBuffer())

  if (lower.endsWith('.md') || lower.endsWith('.markdown')) {
    return { name, content: buffer.toString('utf8'), format: 'Markdown' }
  }

  if (lower.endsWith('.txt')) {
    return { name, content: buffer.toString('utf8'), format: 'Texto' }
  }

  if (lower.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer })
    return { name, content: result.value.trim(), format: 'DOCX' }
  }

  if (lower.endsWith('.pdf')) {
    // Lazy-load pdf-parse to avoid its module-level side effects at boot.
    const pdfParse = (await import('pdf-parse')).default
    const parsed = await pdfParse(buffer)
    return { name, content: parsed.text.trim(), format: 'PDF' }
  }

  throw new Error(`Formato no soportado: ${file.name}. Aceptamos MD, TXT, DOCX, PDF.`)
}
