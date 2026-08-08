import type { BadgeTone } from '../components/dashboard/Badge'

export const currentUser = {
  userName: 'Martín Rivas',
  userEmail: 'martin@sporthub.com.uy',
  initials: 'MR',
}

export type KUStatus = 'Publicado' | 'En revisión' | 'Borrador' | 'Archivado'

export const statusTone: Record<KUStatus, BadgeTone> = {
  Publicado: 'success',
  'En revisión': 'warning',
  Borrador: 'neutral',
  Archivado: 'neutral',
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
  quality: number
  usage: number
  usageNote: string
  tags: string[]
  shares: Person[]
  history: HistoryItem[]
}

export const areas = ['Todas las áreas', 'Soporte', 'Ventas', 'Producto', 'Operaciones']

export const units: KnowledgeUnit[] = [
  {
    id: 'ku-1',
    name: 'Política de reembolsos',
    type: 'Política',
    typeShort: 'POL',
    area: 'Soporte',
    status: 'Publicado',
    sub: 'v3 · PDF',
    edited: 'hace 12 min',
    version: 3,
    author: 'Lucía Fernández',
    language: 'Español',
    format: 'PDF',
    created: '3 mar 2026',
    quality: 92,
    usage: 4,
    usageNote: 'Soporte N1, Onboarding Coach + 2 más',
    tags: ['reembolsos', 'políticas', 'soporte'],
    shares: [
      { i: 'LF', name: 'Lucía Fernández', scope: 'Autora', role: 'Puede editar' },
      { i: 'JP', name: 'Juan Pérez', scope: 'Equipo Soporte', role: 'Puede ver' },
      { i: 'MR', name: 'Martín Rivas', scope: 'Organización', role: 'Puede aprobar' },
    ],
    history: [
      { who: 'Lucía Fernández', what: 'publicó la versión 3', when: 'hace 12 min' },
      { who: 'Martín Rivas', what: 'aprobó los cambios', when: 'hace 40 min' },
      { who: 'Lucía Fernández', what: 'envió a revisión', when: 'hace 2 horas' },
    ],
  },
  {
    id: 'ku-2',
    name: 'Onboarding de nuevos clientes',
    type: 'Guía',
    typeShort: 'GUI',
    area: 'Soporte',
    status: 'En revisión',
    sub: 'v2 · Google Doc',
    edited: 'hace 2 horas',
    version: 2,
    author: 'Carla Acosta',
    language: 'Español',
    format: 'Google Doc',
    created: '18 feb 2026',
    quality: 74,
    usage: 2,
    usageNote: 'Onboarding Coach + 1 más',
    tags: ['onboarding', 'clientes'],
    shares: [
      { i: 'CA', name: 'Carla Acosta', scope: 'Autora', role: 'Puede editar' },
      { i: 'MR', name: 'Martín Rivas', scope: 'Organización', role: 'Puede aprobar' },
    ],
    history: [
      { who: 'Carla Acosta', what: 'comentó en la sección 2', when: 'hace 2 horas' },
      { who: 'Carla Acosta', what: 'envió a revisión', when: 'ayer' },
    ],
  },
  {
    id: 'ku-3',
    name: 'Guía de instalación v2',
    type: 'Guía',
    typeShort: 'GUI',
    area: 'Producto',
    status: 'Borrador',
    sub: 'v2 · Markdown',
    edited: 'ayer',
    version: 2,
    author: 'Martín Rivas',
    language: 'Español',
    format: 'Markdown',
    created: '30 ene 2026',
    quality: 41,
    usage: 0,
    usageNote: 'Sin uso todavía',
    tags: ['instalación', 'producto'],
    shares: [{ i: 'MR', name: 'Martín Rivas', scope: 'Autor', role: 'Puede editar' }],
    history: [{ who: 'Martín Rivas', what: 'creó el borrador', when: 'ayer' }],
  },
  {
    id: 'ku-4',
    name: 'FAQ Facturación',
    type: 'FAQ',
    typeShort: 'FAQ',
    area: 'Ventas',
    status: 'Publicado',
    sub: 'v5 · Notion',
    edited: 'hace 3 días',
    version: 5,
    author: 'Juan Pérez',
    language: 'Español',
    format: 'Notion',
    created: '12 nov 2025',
    quality: 88,
    usage: 6,
    usageNote: 'Ventas Técnicas, Soporte N1 + 4 más',
    tags: ['facturación', 'ventas', 'faq'],
    shares: [
      { i: 'JP', name: 'Juan Pérez', scope: 'Autor', role: 'Puede editar' },
      { i: 'CA', name: 'Carla Acosta', scope: 'Equipo Ventas', role: 'Puede ver' },
      { i: 'MR', name: 'Martín Rivas', scope: 'Organización', role: 'Puede aprobar' },
    ],
    history: [
      { who: 'Juan Pérez', what: 'publicó la versión 5', when: 'hace 3 días' },
      { who: 'Martín Rivas', what: 'aprobó los cambios', when: 'hace 3 días' },
    ],
  },
  {
    id: 'ku-5',
    name: 'Proceso de escalamiento N2',
    type: 'Proceso',
    typeShort: 'PRO',
    area: 'Soporte',
    status: 'Publicado',
    sub: 'v4 · PDF',
    edited: 'hace 1 semana',
    version: 4,
    author: 'Lucía Fernández',
    language: 'Español',
    format: 'PDF',
    created: '2 sep 2025',
    quality: 95,
    usage: 5,
    usageNote: 'Soporte N1 + 4 más',
    tags: ['escalamiento', 'soporte', 'proceso'],
    shares: [
      { i: 'LF', name: 'Lucía Fernández', scope: 'Autora', role: 'Puede editar' },
      { i: 'JP', name: 'Juan Pérez', scope: 'Equipo Soporte', role: 'Puede ver' },
    ],
    history: [{ who: 'Lucía Fernández', what: 'publicó la versión 4', when: 'hace 1 semana' }],
  },
  {
    id: 'ku-6',
    name: 'Manual de API pública',
    type: 'Documento',
    typeShort: 'DOC',
    area: 'Producto',
    status: 'En revisión',
    sub: 'v1 · Markdown',
    edited: 'hace 4 horas',
    version: 1,
    author: 'Martín Rivas',
    language: 'Inglés',
    format: 'Markdown',
    created: '5 ago 2026',
    quality: 58,
    usage: 1,
    usageNote: 'Ventas Técnicas',
    tags: ['api', 'desarrolladores', 'producto'],
    shares: [
      { i: 'MR', name: 'Martín Rivas', scope: 'Autor', role: 'Puede editar' },
      { i: 'CA', name: 'Carla Acosta', scope: 'Equipo Producto', role: 'Puede ver' },
    ],
    history: [{ who: 'Martín Rivas', what: 'envió a revisión', when: 'hace 4 horas' }],
  },
  {
    id: 'ku-7',
    name: 'Política de vacaciones',
    type: 'Política',
    typeShort: 'POL',
    area: 'Operaciones',
    status: 'Publicado',
    sub: 'v2 · PDF',
    edited: 'hace 2 semanas',
    version: 2,
    author: 'Carla Acosta',
    language: 'Español',
    format: 'PDF',
    created: '10 ene 2026',
    quality: 90,
    usage: 3,
    usageNote: 'Onboarding Coach + 2 más',
    tags: ['rrhh', 'operaciones'],
    shares: [
      { i: 'CA', name: 'Carla Acosta', scope: 'Autora', role: 'Puede editar' },
      { i: 'MR', name: 'Martín Rivas', scope: 'Organización', role: 'Puede aprobar' },
    ],
    history: [{ who: 'Carla Acosta', what: 'publicó la versión 2', when: 'hace 2 semanas' }],
  },
  {
    id: 'ku-8',
    name: 'Checklist de alta de cliente',
    type: 'Proceso',
    typeShort: 'PRO',
    area: 'Ventas',
    status: 'Archivado',
    sub: 'v1 · Google Doc',
    edited: 'hace 1 mes',
    version: 1,
    author: 'Juan Pérez',
    language: 'Español',
    format: 'Google Doc',
    created: '15 jun 2025',
    quality: 63,
    usage: 0,
    usageNote: 'Sin uso todavía',
    tags: ['ventas', 'onboarding'],
    shares: [{ i: 'JP', name: 'Juan Pérez', scope: 'Autor', role: 'Puede editar' }],
    history: [{ who: 'Juan Pérez', what: 'archivó la unidad', when: 'hace 1 mes' }],
  },
]

export const typeChoices = [
  { value: 'Documento', label: 'Documento', hint: 'PDF, Word, texto' },
  { value: 'Proceso', label: 'Proceso', hint: 'Paso a paso' },
  { value: 'FAQ', label: 'FAQ', hint: 'Preguntas frecuentes' },
  { value: 'Guía', label: 'Guía', hint: 'Tutorial o manual' },
]

export const notifications = [
  { text: 'Lucía Fernández publicó una nueva versión de "Política de reembolsos"', when: 'hace 12 min' },
  { text: 'Tu agente "Soporte N1" alcanzó 300 consultas este mes', when: 'hace 2 horas' },
  { text: '3 knowledge units necesitan revisión antes del viernes', when: 'ayer' },
]
