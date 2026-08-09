'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Info, X, Upload, FileText, Loader2, CheckCircle2, AlertCircle, Plus } from 'lucide-react'
import { areas as defaultAreas, typeChoices } from '../data'

type UploadResult = { id?: string; name: string; error?: string }

const VISIBILITY_OPTIONS = [
  { value: 'private', label: 'Solo yo',          hint: 'Solo vos podés verla' },
  { value: 'team',    label: 'Mi equipo',         hint: 'Los miembros del equipo' },
  { value: 'org',     label: 'Mi organización',   hint: 'Toda la organización' },
  { value: 'public',  label: 'Toda la comunidad', hint: 'Cualquier usuario de Soph.ia' },
]

function fileNameToKUName(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, '')        // quita extensión
    .replace(/[-_]+/g, ' ')         // guiones/underscores → espacio
    .replace(/\b\w/g, (c) => c.toUpperCase()) // Title Case
    .trim()
}

export function CreateModal({
  onClose,
  onSave,
  onUploaded,
}: {
  onClose: () => void
  onSave: (draft: { name: string; type: string; area: string; visibility: string }) => Promise<void>
  onUploaded?: () => void
}) {
  const router = useRouter()
  const [tab, setTab] = useState<'blank' | 'upload'>('blank')

  const [name, setName] = useState('')
  const [type, setType] = useState(typeChoices[0].value)
  const [customAreas, setCustomAreas] = useState<string[]>([])
  const [area, setArea] = useState(defaultAreas[1])
  const [newArea, setNewArea] = useState('')
  const [showNewArea, setShowNewArea] = useState(false)
  const [visibility, setVisibility] = useState('team')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const allAreas = [...defaultAreas.filter((a) => a !== 'Todas las áreas'), ...customAreas]

  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadResults, setUploadResults] = useState<UploadResult[] | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function addCustomArea() {
    const trimmed = newArea.trim()
    if (!trimmed || allAreas.includes(trimmed)) return
    setCustomAreas((prev) => [...prev, trimmed])
    setArea(trimmed)
    setNewArea('')
    setShowNewArea(false)
  }

  async function handleSave() {
    if (!name.trim() || saving) return
    setSaving(true)
    setError(null)
    try {
      await onSave({ name: name.trim(), type, area, visibility })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos crear la knowledge unit.')
    } finally {
      setSaving(false)
    }
  }

  function addFiles(files: File[]) {
    if (files.length === 0) return
    setSelectedFiles((prev) => [...prev, ...files])
    // auto-fill name from first file if blank tab hasn't been touched
    if (!name && files.length === 1) setName(fileNameToKUName(files[0].name))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragActive(false)
    addFiles(Array.from(e.dataTransfer.files))
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(e.target.files ?? []))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleUpload() {
    if (selectedFiles.length === 0 || uploading) return
    setUploading(true)
    setError(null)
    setUploadResults(null)
    try {
      const fd = new FormData()
      for (const f of selectedFiles) fd.append('files', f)
      const res = await fetch('/api/knowledge-units/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al subir')
      setUploadResults(data.results as UploadResult[])
      const successCount = (data.results as UploadResult[]).filter((r) => r.id).length
      if (successCount > 0) {
        onUploaded?.()
        if (successCount === 1) {
          const created = (data.results as UploadResult[]).find((r) => r.id)
          if (created?.id) {
            router.push(`/knowledge-units/${created.id}/edit`)
            return
          }
        }
        setSelectedFiles([])
        setTimeout(() => onClose(), 1500)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(15,23,42,0.42)] p-8">
      <div className="max-h-[88vh] w-full max-w-[620px] overflow-y-auto rounded-[var(--radius-lg)] bg-[var(--color-bg-primary)] shadow-[var(--shadow-xl)]">
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-6 py-5">
          <div className="flex-1">
            <div className="text-[17px] font-bold text-[var(--color-text-primary)]">Crear knowledge unit</div>
            <div className="text-[12.5px] text-[var(--color-text-secondary)]">Empezá desde cero o subí un archivo.</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-[30px] w-[30px] items-center justify-center rounded-[6px] text-[var(--color-text-tertiary)] hover:bg-[var(--color-hover)]"
          >
            <X size={17} />
          </button>
        </div>

        <div className="flex border-b border-[var(--color-border)] px-6">
          <button
            type="button"
            onClick={() => setTab('blank')}
            className={`border-b-2 px-3 py-3 text-sm font-semibold transition-colors ${
              tab === 'blank'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            En blanco
          </button>
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`border-b-2 px-3 py-3 text-sm font-semibold transition-colors ${
              tab === 'upload'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            Subir archivo
          </button>
        </div>

        {tab === 'blank' ? (
          <>
            <div className="flex flex-col gap-5 px-6 py-5.5">
              <div>
                <label className="mb-1.5 block text-[12.5px] font-semibold text-[var(--color-text-primary)]">Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Política de devoluciones 2026"
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 font-[family-name:var(--font-sans)] text-[13.5px] text-[var(--color-text-primary)] outline-none"
                />
              </div>

              <div>
                <div className="mb-2 text-[12.5px] font-semibold text-[var(--color-text-primary)]">Tipo de contenido</div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2">
                  {typeChoices.map((tc) => {
                    const active = tc.value === type
                    return (
                      <button
                        key={tc.value}
                        type="button"
                        onClick={() => setType(tc.value)}
                        className="rounded-[var(--radius-md)] p-3 text-left"
                        style={{
                          background: active ? 'rgba(59,130,246,0.08)' : 'var(--color-bg-primary)',
                          border: `1.5px solid ${active ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                        }}
                      >
                        <div className="text-[12.5px] font-semibold" style={{ color: active ? 'var(--color-secondary)' : 'var(--color-text-primary)' }}>
                          {tc.label}
                        </div>
                        <div className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">{tc.hint}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-semibold text-[var(--color-text-primary)]">Área</label>
                  {showNewArea ? (
                    <div className="flex gap-1.5">
                      <input
                        autoFocus
                        type="text"
                        value={newArea}
                        onChange={(e) => setNewArea(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') addCustomArea(); if (e.key === 'Escape') setShowNewArea(false) }}
                        placeholder="Nueva área…"
                        className="min-w-0 flex-1 rounded-[var(--radius-md)] border border-[var(--color-primary)] px-3 py-2.5 text-[13px] text-[var(--color-text-primary)] outline-none"
                      />
                      <button type="button" onClick={addCustomArea} className="rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3 text-white text-xs font-semibold">OK</button>
                    </div>
                  ) : (
                    <div className="flex gap-1.5">
                      <select
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="min-w-0 flex-1 cursor-pointer rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 text-[13px] text-[var(--color-text-primary)] outline-none"
                      >
                        {allAreas.map((a) => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowNewArea(true)}
                        title="Crear área"
                        className="flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] px-2.5 text-[var(--color-text-tertiary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-semibold text-[var(--color-text-primary)]">Visibilidad</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-full cursor-pointer rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 font-[family-name:var(--font-sans)] text-[13px] text-[var(--color-text-primary)] outline-none"
                  >
                    {VISIBILITY_OPTIONS.map((v) => (
                      <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">
                    {VISIBILITY_OPTIONS.find((v) => v.value === visibility)?.hint}
                  </p>
                </div>
              </div>

              {error && <p className="m-0 text-sm text-[var(--color-error)]">{error}</p>}

              <div className="flex items-start gap-2.5 rounded-[var(--radius-md)] bg-[rgba(59,130,246,0.07)] p-3.5">
                <Info size={17} className="mt-0.5 flex-none text-[#1D4FD7]" />
                <div className="text-[12.5px] leading-relaxed text-[#1D4FD7]">
                  Al guardar, la unidad queda en <strong className="font-bold">borrador</strong>. Enviala a aprobación cuando esté lista.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-6 py-4">
              <span className="flex-1 text-xs text-[var(--color-text-tertiary)]">Podés seguir editándola después de guardar.</span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-[var(--radius-md)] border border-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-hover)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!name.trim() || saving}
                onClick={handleSave}
                className="rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Guardando…' : 'Guardar borrador'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-4 px-6 py-5.5">
              <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragActive(true)
                }}
                onDragLeave={() => setDragActive(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-[var(--radius-md)] border-[1.5px] border-dashed p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                    : 'border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-primary)]/50'
                }`}
              >
                <Upload size={28} className="text-[var(--color-text-tertiary)]" />
                <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Arrastrá archivos acá o hacé click
                </div>
                <div className="text-xs text-[var(--color-text-tertiary)]">
                  PDF, DOCX, Markdown, TXT · hasta 25MB por archivo
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.md,.markdown,.txt"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>

              {selectedFiles.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-tertiary)]">
                    Seleccionados ({selectedFiles.length})
                  </div>
                  {selectedFiles.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2"
                    >
                      <FileText size={14} className="flex-none text-[var(--color-text-tertiary)]" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm text-[var(--color-text-primary)]">{file.name}</div>
                        <div className="text-[11px] text-[var(--color-text-tertiary)]">{(file.size / 1024).toFixed(1)} KB</div>
                      </div>
                      {!uploading && (
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="rounded p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-error)]"
                          aria-label="Quitar"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {uploadResults && (
                <div className="flex flex-col gap-1.5">
                  {uploadResults.map((r, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-xs ${
                        r.id
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-[rgba(239,68,68,0.06)] text-[var(--color-error)]'
                      }`}
                    >
                      {r.id ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                      <span className="truncate">
                        <strong>{r.name}</strong>
                        {r.error && ` — ${r.error}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {error && <p className="m-0 text-sm text-[var(--color-error)]">{error}</p>}
            </div>

            <div className="flex items-center gap-2.5 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-6 py-4">
              <span className="flex-1 text-xs text-[var(--color-text-tertiary)]">
                Cada archivo se convierte en una KU editable.
              </span>
              <button
                type="button"
                onClick={onClose}
                disabled={uploading}
                className="rounded-[var(--radius-md)] border border-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-hover)] disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={selectedFiles.length === 0 || uploading}
                onClick={handleUpload}
                className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading && <Loader2 size={14} className="animate-spin" />}
                {uploading ? 'Subiendo…' : `Subir ${selectedFiles.length || ''}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
