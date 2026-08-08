'use client'

import { useState } from 'react'
import { Info, X } from 'lucide-react'
import { areas, typeChoices } from '../data'

export function CreateModal({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (draft: { name: string; type: string; area: string }) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState(typeChoices[0].value)
  const [area, setArea] = useState(areas[1])
  const [visibility, setVisibility] = useState('team')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!name.trim() || saving) return
    setSaving(true)
    setError(null)
    try {
      await onSave({ name: name.trim(), type, area })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No pudimos crear la knowledge unit.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(15,23,42,0.42)] p-8">
      <div className="max-h-[88vh] w-full max-w-[620px] overflow-y-auto rounded-[var(--radius-lg)] bg-[var(--color-bg-primary)] shadow-[var(--shadow-xl)]">
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-6 py-5">
          <div className="flex-1">
            <div className="text-[17px] font-bold text-[var(--color-text-primary)]">Crear knowledge unit</div>
            <div className="text-[12.5px] text-[var(--color-text-secondary)]">Definí el contenido y quién puede usarlo.</div>
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
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full cursor-pointer rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 font-[family-name:var(--font-sans)] text-[13px] text-[var(--color-text-primary)] outline-none"
              >
                {areas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[12.5px] font-semibold text-[var(--color-text-primary)]">Visibilidad</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full cursor-pointer rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 font-[family-name:var(--font-sans)] text-[13px] text-[var(--color-text-primary)] outline-none"
              >
                <option value="private">Solo yo</option>
                <option value="team">Mi equipo</option>
                <option value="org">Toda la organización</option>
              </select>
            </div>
          </div>

          <div className="rounded-[var(--radius-md)] border-[1.5px] border-dashed border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5.5 text-center">
            <div className="mb-1 text-[13px] font-semibold text-[var(--color-text-primary)]">Arrastrá un archivo o pegá el contenido</div>
            <div className="text-xs text-[var(--color-text-tertiary)]">PDF, DOCX, Markdown, enlace a Drive o Notion · hasta 25 MB</div>
          </div>

          {error && <p className="m-0 text-sm text-[var(--color-error)]">{error}</p>}

          <div className="flex items-start gap-2.5 rounded-[var(--radius-md)] bg-[rgba(59,130,246,0.07)] p-3.5">
            <Info size={17} className="mt-0.5 flex-none text-[#1D4FD7]" />
            <div className="text-[12.5px] leading-relaxed text-[#1D4FD7]">
              Al guardar, la unidad queda en <strong className="font-bold">borrador</strong>. Enviala a aprobación cuando esté lista para que otros
              agentes la usen.
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
      </div>
    </div>
  )
}
