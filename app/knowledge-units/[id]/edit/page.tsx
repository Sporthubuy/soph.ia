'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Bold,
  CheckCircle2,
  ChevronDown,
  Clock,
  Code,
  Eye,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Pencil,
  Quote,
  Save,
  Tag,
  X,
} from 'lucide-react'

type KUData = {
  id: string
  name: string
  content: string
  type: string
  area: string
  status: string
  format: string
  language: string
  visibility: string
  version: number
  quality: number
  tags: string[]
  updated_at: string
}

const STATUS_OPTIONS = ['Borrador', 'En revisión', 'Aprobada', 'Publicada']
const STATUS_COLORS: Record<string, string> = {
  Borrador: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]',
  'En revisión': 'bg-amber-500/10 text-amber-600',
  Aprobada: 'bg-blue-500/10 text-blue-600',
  Publicada: 'bg-emerald-500/10 text-emerald-600',
}

export default function KUEditorPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [ku, setKu] = useState<KUData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState('')
  const [area, setArea] = useState('')
  const [status, setStatus] = useState('')
  const [visibility, setVisibility] = useState('team')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [dirty, setDirty] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    fetch(`/api/knowledge-units/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((data: KUData) => {
        setKu(data)
        setName(data.name)
        setContent(data.content || '')
        setType(data.type)
        setArea(data.area)
        setStatus(data.status)
        setVisibility(data.visibility || 'team')
        setTags(data.tags || [])
      })
      .catch(() => setError('No se pudo cargar la knowledge unit'))
      .finally(() => setLoading(false))
  }, [id])

  const save = useCallback(async (fields?: Partial<{ name: string; content: string; type: string; area: string; status: string; tags: string[]; visibility: string }>) => {
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      const body = fields ?? { name, content, type, area, status, tags, visibility }
      const contentChanged = !fields || 'content' in body
      const res = await fetch(`/api/knowledge-units/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al guardar')
      }
      const updated = await res.json()
      setKu((prev) => prev ? { ...prev, ...updated } : prev)
      setDirty(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)

      // Best-effort reindex when content changed. Silent if OpenAI key missing.
      if (contentChanged) {
        fetch(`/api/knowledge-units/${id}/reindex`, { method: 'POST' }).catch(() => {})
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }, [id, name, content, type, area, status, tags, visibility])

  function scheduleAutosave() {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => save(), 3000)
  }

  function handleContentChange(value: string) {
    setContent(value)
    setDirty(true)
    scheduleAutosave()
  }

  function handleNameChange(value: string) {
    setName(value)
    setDirty(true)
  }

  function addTag() {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) {
      const next = [...tags, t]
      setTags(next)
      setTagInput('')
      setDirty(true)
    }
  }

  function removeTag(tag: string) {
    const next = tags.filter((t) => t !== tag)
    setTags(next)
    setDirty(true)
  }

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        save()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [save])

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-secondary)]">
        <Loader2 size={24} className="animate-spin text-[var(--color-text-tertiary)]" />
      </div>
    )
  }

  if (!ku) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
        <p>{error || 'Knowledge unit no encontrada'}</p>
        <button
          onClick={() => router.push('/knowledge-units')}
          className="text-sm text-[var(--color-primary)] underline"
        >
          Volver a Knowledge Units
        </button>
      </div>
    )
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const charCount = content.length

  return (
    <div className="flex h-screen flex-col bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-2.5">
        <button
          onClick={() => router.push('/knowledge-units')}
          className="rounded-[var(--radius-md)] p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          <FileText size={16} />
        </div>

        <input
          type="text"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="min-w-0 flex-1 border-none bg-transparent text-sm font-semibold text-[var(--color-text-primary)] outline-none"
        />

        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-emerald-500">
              <CheckCircle2 size={14} />
              Guardado
            </span>
          )}
          {dirty && !saving && !saved && (
            <span className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
              <Clock size={14} />
              Sin guardar
            </span>
          )}

          <div className="flex gap-0.5 rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] p-0.5">
            <button
              onClick={() => setMode('edit')}
              className={`flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-xs font-medium ${
                mode === 'edit' ? 'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]'
              }`}
            >
              <Pencil size={13} />
              Editar
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-xs font-medium ${
                mode === 'preview' ? 'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]'
              }`}
            >
              <Eye size={13} />
              Vista previa
            </button>
          </div>

          <button
            onClick={() => {
              if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
              save()
            }}
            disabled={saving || !dirty}
            className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>

      {error && (
        <div className="border-b border-[var(--color-error)]/30 bg-[rgba(239,68,68,0.06)] px-4 py-2 text-sm text-[var(--color-error)]">
          {error}
        </div>
      )}

      {/* Main */}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Editor area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {mode === 'edit' ? (
            <>
              <MarkdownToolbar textareaRef={textareaRef} onInsert={(val) => { handleContentChange(val) }} content={content} />
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Escribí el contenido de tu knowledge unit en Markdown...

# Título

Tu conocimiento va acá. Podés usar:

- **Negrita** y *cursiva*
- Listas numeradas y con viñetas
- `código inline` y bloques de código
- [enlaces](https://ejemplo.com)
- Tablas, citas, y más"
                className="flex-1 resize-none bg-[var(--color-bg-secondary)] p-6 font-mono text-sm leading-relaxed text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)]"
                spellCheck
              />
            </>
          ) : (
            <div className="flex-1 overflow-y-auto bg-[var(--color-bg-secondary)] p-6">
              <div className="prose-custom mx-auto max-w-3xl">
                {content ? (
                  <MarkdownPreview content={content} />
                ) : (
                  <p className="text-sm italic text-[var(--color-text-tertiary)]">
                    Sin contenido todavía. Cambiá a modo edición para empezar a escribir.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Footer stats */}
          <div className="flex items-center gap-4 border-t border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-2 text-xs text-[var(--color-text-tertiary)]">
            <span>{wordCount} palabras</span>
            <span>{charCount} caracteres</span>
            <span>v{ku.version}</span>
            <span className="ml-auto">Markdown</span>
          </div>
        </div>

        {/* Right sidebar - metadata */}
        <div className="max-h-64 flex-none overflow-y-auto border-t border-[var(--color-border)] bg-[var(--color-bg-primary)] md:max-h-none md:w-[280px] md:border-l md:border-t-0">
          <div className="flex flex-col gap-5 p-4">
            {/* Status */}
            <div>
              <label className="mb-1.5 block text-[11px] font-bold tracking-[.05em] text-[var(--color-text-tertiary)]">ESTADO</label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value)
                    setDirty(true)
                  }}
                  className="w-full cursor-pointer appearance-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 pr-8 text-xs font-medium text-[var(--color-text-primary)] outline-none"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
              </div>
              <div className="mt-2">
                <span className={`inline-block rounded-[var(--radius-full)] px-2.5 py-1 text-[11px] font-semibold ${STATUS_COLORS[status] || STATUS_COLORS.Borrador}`}>
                  {status}
                </span>
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="mb-1.5 block text-[11px] font-bold tracking-[.05em] text-[var(--color-text-tertiary)]">TIPO</label>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value)
                  setDirty(true)
                }}
                className="w-full cursor-pointer rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-xs text-[var(--color-text-primary)] outline-none"
              >
                <option value="Documento">Documento</option>
                <option value="Proceso">Proceso</option>
                <option value="FAQ">FAQ</option>
                <option value="Política">Política</option>
                <option value="Guía">Guía</option>
                <option value="Dataset">Dataset</option>
              </select>
            </div>

            {/* Area */}
            <div>
              <label className="mb-1.5 block text-[11px] font-bold tracking-[.05em] text-[var(--color-text-tertiary)]">AREA</label>
              <select
                value={area}
                onChange={(e) => {
                  setArea(e.target.value)
                  setDirty(true)
                }}
                className="w-full cursor-pointer rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-xs text-[var(--color-text-primary)] outline-none"
              >
                <option value="Soporte">Soporte</option>
                <option value="Ventas">Ventas</option>
                <option value="Producto">Producto</option>
                <option value="Operaciones">Operaciones</option>
                <option value="General">General</option>
              </select>
            </div>

            {/* Visibility */}
            <div>
              <label className="mb-1.5 block text-[11px] font-bold tracking-[.05em] text-[var(--color-text-tertiary)]">VISIBILIDAD</label>
              <select
                value={visibility}
                onChange={(e) => {
                  setVisibility(e.target.value)
                  setDirty(true)
                }}
                className="w-full cursor-pointer rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-xs text-[var(--color-text-primary)] outline-none"
              >
                <option value="private">Solo yo</option>
                <option value="team">Mi equipo</option>
                <option value="org">Toda la organización</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="mb-1.5 block text-[11px] font-bold tracking-[.05em] text-[var(--color-text-tertiary)]">ETIQUETAS</label>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-[var(--radius-full)] bg-[var(--color-bg-tertiary)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-secondary)]"
                  >
                    <Tag size={10} />
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-0.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-error)]"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Nueva etiqueta…"
                  className="min-w-0 flex-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2.5 py-1.5 text-[11px] text-[var(--color-text-primary)] outline-none"
                />
                <button
                  onClick={addTag}
                  disabled={!tagInput.trim()}
                  className="rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--color-text-secondary)] disabled:opacity-40"
                >
                  Agregar
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="border-t border-[var(--color-border)] pt-4">
              <div className="flex flex-col gap-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-tertiary)]">Calidad</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">{ku.quality}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-tertiary)]">Formato</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">Markdown</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-tertiary)]">Versión</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">v{ku.version}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MarkdownToolbar({
  textareaRef,
  onInsert,
  content,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  onInsert: (value: string) => void
  content: string
}) {
  function wrap(before: string, after: string) {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = content.slice(start, end)
    const replacement = selected ? `${before}${selected}${after}` : `${before}texto${after}`
    const next = content.slice(0, start) + replacement + content.slice(end)
    onInsert(next)
    requestAnimationFrame(() => {
      ta.focus()
      const cursorPos = selected ? start + replacement.length : start + before.length
      const cursorEnd = selected ? cursorPos : cursorPos + 5
      ta.setSelectionRange(cursorPos, cursorEnd)
    })
  }

  function prefix(pfx: string) {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const lineStart = content.lastIndexOf('\n', start - 1) + 1
    const next = content.slice(0, lineStart) + pfx + content.slice(lineStart)
    onInsert(next)
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(start + pfx.length, start + pfx.length)
    })
  }

  function insertBlock(block: string) {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const before = start > 0 && content[start - 1] !== '\n' ? '\n' : ''
    const next = content.slice(0, start) + before + block + content.slice(start)
    onInsert(next)
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(start + before.length + block.length, start + before.length + block.length)
    })
  }

  const buttons = [
    { icon: Bold, title: 'Negrita (⌘B)', action: () => wrap('**', '**') },
    { icon: Italic, title: 'Cursiva (⌘I)', action: () => wrap('*', '*') },
    { icon: Code, title: 'Código inline', action: () => wrap('`', '`') },
    null,
    { icon: Heading1, title: 'Título H1', action: () => prefix('# ') },
    { icon: Heading2, title: 'Título H2', action: () => prefix('## ') },
    { icon: Heading3, title: 'Título H3', action: () => prefix('### ') },
    null,
    { icon: List, title: 'Lista', action: () => prefix('- ') },
    { icon: ListOrdered, title: 'Lista numerada', action: () => prefix('1. ') },
    { icon: Quote, title: 'Cita', action: () => prefix('> ') },
    { icon: Minus, title: 'Separador', action: () => insertBlock('\n---\n') },
    null,
    { icon: Link2, title: 'Enlace', action: () => wrap('[', '](url)') },
  ]

  return (
    <div className="flex items-center gap-0.5 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-1.5">
      {buttons.map((btn, i) =>
        btn === null ? (
          <div key={i} className="mx-1 h-5 w-px bg-[var(--color-border)]" />
        ) : (
          <button
            key={btn.title}
            type="button"
            title={btn.title}
            onClick={btn.action}
            className="rounded p-1.5 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <btn.icon size={15} />
          </button>
        )
      )}
    </div>
  )
}

function MarkdownPreview({ content }: { content: string }) {
  const html = simpleMarkdown(content)
  return (
    <div
      className="prose-sm max-w-none text-[var(--color-text-primary)] [&_a]:text-[var(--color-primary)] [&_blockquote]:border-l-[var(--color-border)] [&_blockquote]:text-[var(--color-text-secondary)] [&_code]:rounded [&_code]:bg-[var(--color-bg-tertiary)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_h3]:text-sm [&_h3]:font-bold [&_hr]:border-[var(--color-border)] [&_li]:text-sm [&_p]:text-sm [&_p]:leading-relaxed [&_pre]:rounded-[var(--radius-md)] [&_pre]:bg-[var(--color-bg-tertiary)] [&_pre]:p-4 [&_strong]:font-bold [&_table]:w-full [&_td]:border [&_td]:border-[var(--color-border)] [&_td]:px-3 [&_td]:py-2 [&_td]:text-xs [&_th]:border [&_th]:border-[var(--color-border)] [&_th]:bg-[var(--color-bg-tertiary)] [&_th]:px-3 [&_th]:py-2 [&_th]:text-xs [&_th]:font-semibold"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function simpleMarkdown(md: string): string {
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  html = html.replace(/^---$/gm, '<hr />')
  html = html.replace(/^\&gt; (.+)$/gm, '<blockquote><p>$1</p></blockquote>')

  const lines = html.split('\n')
  const result: string[] = []
  let inList = false

  for (const line of lines) {
    if (/^- (.+)$/.test(line)) {
      if (!inList) { result.push('<ul>'); inList = true }
      result.push(`<li>${line.slice(2)}</li>`)
    } else {
      if (inList) { result.push('</ul>'); inList = false }
      if (line.trim() === '') {
        result.push('')
      } else if (!line.startsWith('<h') && !line.startsWith('<hr') && !line.startsWith('<blockquote')) {
        result.push(`<p>${line}</p>`)
      } else {
        result.push(line)
      }
    }
  }
  if (inList) result.push('</ul>')

  return result.join('\n')
}
