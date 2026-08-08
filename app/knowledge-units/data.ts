import type { BadgeTone } from '../components/dashboard/Badge'

export type KUStatus = 'Publicada' | 'En revisión' | 'Borrador' | 'Aprobada' | 'Por vencer'

export const statusTone: Record<KUStatus, BadgeTone> = {
  Publicada: 'success',
  'En revisión': 'warning',
  Borrador: 'neutral',
  Aprobada: 'info',
  'Por vencer': 'expired',
}

export type Person = { i: string; name: string; scope: string; role: string }
export type HistoryItem = { who: string; what: string; when: string }

export type KnowledgeUnit = {
  id: string
  name: string
  type: string
  typeShort: string
  area: string
  status: KUStatus
  sub: string
  edited: string
  version: number
  author: string
  language: string
  format: string
  created: string
  expires: string | null
  source: string
  quality: number
  usage: number
  usageNote: string
  tags: string[]
  shares: Person[]
  history: HistoryItem[]
}

export const areas = ['Todas las áreas', 'Soporte', 'Ventas', 'Producto', 'Operaciones']

export const typeChoices = [
  { value: 'Documento', label: 'Documento', hint: 'PDF, Word, texto' },
  { value: 'Proceso', label: 'Proceso', hint: 'Paso a paso' },
  { value: 'FAQ', label: 'FAQ', hint: 'Preguntas frecuentes' },
  { value: 'Dataset', label: 'Dataset', hint: 'Datos estructurados' },
]
