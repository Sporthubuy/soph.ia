'use client'

import { useMemo, useState } from 'react'
import {
  ArrowRight, Bot, BookOpen, Check, ChevronDown, CircleHelp,
  Plus, Sparkles, Trash2, Workflow, X,
} from 'lucide-react'
import { AppHeader } from '../components/shell/AppHeader'
import { AppSidebar } from '../components/shell/AppSidebar'

type BlockType = 'instructions' | 'knowledge' | 'workflow' | 'review'
type Block = { id: number; type: BlockType }

const blockCopy: Record<BlockType, { label: string; hint: string; icon: typeof Bot }> = {
  instructions: { label: 'Instrucciones', hint: 'Cómo piensa, habla y decide el agente.', icon: Bot },
  knowledge: { label: 'Knowledge units', hint: 'Contexto aprobado que el agente puede consultar.', icon: BookOpen },
  workflow: { label: 'Workflow', hint: 'Pasos y condiciones para resolver cada tarea.', icon: Workflow },
  review: { label: 'Criterio de revisión', hint: 'Cómo verifica calidad antes de responder.', icon: Check },
}

const initialBlocks: Block[] = [
  { id: 1, type: 'instructions' },
  { id: 2, type: 'knowledge' },
  { id: 3, type: 'workflow' },
]

export default function AgentsPage() {
  const [name, setName] = useState('Asistente de Operaciones')
  const [blocks, setBlocks] = useState(initialBlocks)
  const [showPicker, setShowPicker] = useState(false)
  const [selectedKus, setSelectedKus] = useState(['Guía de atención al cliente', 'Políticas de devoluciones'])
  const [saved, setSaved] = useState(false)

  const completion = useMemo(() => Math.min(100, 20 + blocks.length * 20 + (selectedKus.length ? 10 : 0)), [blocks.length, selectedKus.length])

  function addBlock(type: BlockType) {
    setBlocks((current) => [...current, { id: Date.now(), type }])
    setShowPicker(false)
  }

  function removeBlock(id: number) {
    setBlocks((current) => current.filter((block) => block.id !== id))
  }

  function toggleKu(ku: string) {
    setSelectedKus((current) => current.includes(ku) ? current.filter((item) => item !== ku) : [...current, ku])
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
      <AppHeader userName="" userEmail="" initials="" />
      <div className="flex items-start">
        <AppSidebar active="agents" />
        <main className="min-w-0 flex-1 px-6 py-7 lg:px-8">
          <div className="mx-auto max-w-[1260px]">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <span>Agentes</span><ChevronDown size={14} /><span className="text-[var(--color-text-tertiary)]">Nuevo agente</span>
                </div>
                <h1 className="m-0 text-[28px] font-bold tracking-[-.025em]">Diseñá un agente que trabaje como tu equipo</h1>
                <p className="mt-2 mb-0 text-sm text-[var(--color-text-secondary)]">Componé sus instrucciones, conocimiento y forma de trabajar en bloques editables.</p>
              </div>
              <div className="flex items-center gap-2.5">
                <button className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold hover:bg-[var(--color-bg-secondary)]">Vista previa</button>
                <button onClick={() => setSaved(true)} className="rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#001a2f]">{saved ? 'Guardado' : 'Guardar agente'}</button>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_295px]">
              <section className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]">
                <div className="border-b border-[var(--color-border-light)] px-5 py-5 sm:px-7">
                  <label htmlFor="agent-name" className="block text-xs font-bold tracking-[.06em] text-[var(--color-text-tertiary)]">NOMBRE DEL AGENTE</label>
                  <input id="agent-name" value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full border-0 bg-transparent p-0 text-[22px] font-semibold tracking-[-.02em] outline-none placeholder:text-[var(--color-text-disabled)]" />
                </div>
                <div className="space-y-4 px-5 py-6 sm:px-7">
                  {blocks.map((block, index) => {
                    const detail = blockCopy[block.type]
                    const Icon = detail.icon
                    return (
                      <div key={block.id} className="group rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white transition-shadow hover:shadow-[var(--shadow-sm)]">
                        <div className="flex items-center gap-3 border-b border-[var(--color-border-light)] px-4 py-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] text-[var(--color-primary)]"><Icon size={16} /></span>
                          <div className="min-w-0 flex-1"><h2 className="m-0 text-sm font-semibold">{detail.label}</h2><p className="m-0 truncate text-xs text-[var(--color-text-tertiary)]">{detail.hint}</p></div>
                          <button onClick={() => removeBlock(block.id)} aria-label={`Eliminar ${detail.label}`} className="rounded p-1 text-[var(--color-text-tertiary)] opacity-0 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"><Trash2 size={16} /></button>
                        </div>
                        <div className="p-4">
                          {block.type === 'instructions' && <textarea defaultValue={'Rol: resolvés consultas operativas con precisión y cercanía.\n\nAntes de responder, entendé el objetivo y el contexto. Si falta información, hacé una sola pregunta clara. Priorizá pasos accionables y citá la fuente cuando uses conocimiento interno.'} className="min-h-[150px] w-full resize-y rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-3 text-sm leading-6 outline-none focus:border-[var(--color-focus-ring)]" />}
                          {block.type === 'knowledge' && <div><div className="flex flex-wrap gap-2">{['Guía de atención al cliente', 'Políticas de devoluciones', 'Catálogo de servicios'].map((ku) => <button key={ku} onClick={() => toggleKu(ku)} className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${selectedKus.includes(ku) ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}>{selectedKus.includes(ku) && <Check size={13} />}{ku}</button>)}</div><p className="mb-0 mt-3 text-xs text-[var(--color-text-tertiary)]">Solo se usarán knowledge units aprobadas. Podés cambiar esta selección después.</p></div>}
                          {block.type === 'workflow' && <ol className="m-0 space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]"><li>Interpretar intención, urgencia y datos disponibles.</li><li>Consultar las knowledge units relacionadas.</li><li>Responder con una recomendación y el siguiente paso.</li><li>Escalar a una persona si hay riesgo, excepción o falta de certeza.</li></ol>}
                          {block.type === 'review' && <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-secondary)] px-3 py-3 text-sm leading-6 text-[var(--color-text-secondary)]">Verificá que la respuesta sea fiel a las fuentes, concreta y segura antes de enviarla.</div>}
                        </div>
                        {index < blocks.length - 1 && <div className="mx-auto -mb-7 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-text-tertiary)]"><ArrowRight size={13} className="rotate-90" /></div>}
                      </div>
                    )
                  })}
                  <div className="relative pt-1">
                    <button onClick={() => setShowPicker(!showPicker)} className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] py-3 text-sm font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]"><Plus size={17} />Agregar bloque</button>
                    {showPicker && <div className="absolute left-0 right-0 z-10 mt-2 grid gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-2 shadow-[var(--shadow-lg)] sm:grid-cols-2">{(Object.keys(blockCopy) as BlockType[]).map((type) => { const item = blockCopy[type]; const Icon = item.icon; return <button key={type} onClick={() => addBlock(type)} className="flex items-start gap-3 rounded-[var(--radius-md)] p-3 text-left hover:bg-[var(--color-bg-secondary)]"><Icon size={17} className="mt-0.5 text-[var(--color-text-secondary)]" /><span><span className="block text-sm font-semibold">{item.label}</span><span className="block text-xs leading-5 text-[var(--color-text-tertiary)]">{item.hint}</span></span></button> })}</div>}
                  </div>
                </div>
              </section>

              <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
                <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)]">
                  <div className="flex items-center justify-between"><span className="text-sm font-semibold">Listo para publicar</span><span className="text-sm font-bold">{completion}%</span></div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-bg-tertiary)]"><div className="h-full rounded-full bg-[var(--color-secondary)] transition-all" style={{ width: `${completion}%` }} /></div>
                  <p className="mb-0 mt-3 text-xs leading-5 text-[var(--color-text-secondary)]">Sumá un criterio de revisión para completar la configuración recomendada.</p>
                </div>
                <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)]">
                  <div className="flex items-center gap-2"><Sparkles size={17} className="text-[var(--color-secondary)]" /><h2 className="m-0 text-sm font-semibold">Un prompt que funciona</h2></div>
                  <ul className="mb-0 mt-4 space-y-3 p-0 text-xs leading-5 text-[var(--color-text-secondary)]"><li className="flex gap-2"><Check size={15} className="mt-0.5 flex-none text-emerald-500" />Definí el resultado y para quién trabaja.</li><li className="flex gap-2"><Check size={15} className="mt-0.5 flex-none text-emerald-500" />Marcá límites: qué no debe asumir ni hacer.</li><li className="flex gap-2"><Check size={15} className="mt-0.5 flex-none text-emerald-500" />Indicá cómo debe actuar ante información incompleta.</li></ul>
                  <button className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[var(--color-secondary)] hover:underline"><CircleHelp size={14} />Ver guía de prompting</button>
                </div>
                <div className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] p-5 text-white shadow-[var(--shadow-md)]"><div className="flex items-center gap-2"><Bot size={18} /><h2 className="m-0 text-sm font-semibold">Probalo en contexto</h2></div><p className="mb-4 mt-2 text-xs leading-5 text-slate-300">Simulá una conversación y revisá el comportamiento antes de publicarlo.</p><button className="w-full rounded-[var(--radius-md)] bg-white px-3 py-2.5 text-sm font-semibold text-[var(--color-primary)] hover:bg-slate-100">Abrir playground</button></div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
