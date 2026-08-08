import type { BadgeTone } from '../components/dashboard/Badge'

export const currentUser = {
  firstName: 'Martín',
  userName: 'Martín Rivas',
  userEmail: 'martin@sporthub.com.uy',
  initials: 'MR',
}

export const pending: {
  title: string
  meta: string
  kind: string
  tone: BadgeTone
  dot: string
}[] = [
  {
    title: 'Revisar KU: Onboarding de nuevos clientes',
    meta: 'Knowledge unit · vence hoy',
    kind: 'Revisión',
    tone: 'warning',
    dot: 'var(--color-warning)',
  },
  {
    title: 'Aprobar acceso de Lucía Fernández al agente Soporte N1',
    meta: 'Agente · Soporte N1',
    kind: 'Aprobación',
    tone: 'info',
    dot: 'var(--color-secondary)',
  },
  {
    title: 'Responder comentario en KU: Política de reembolsos',
    meta: 'Knowledge unit · hace 2 horas',
    kind: 'Comentario',
    tone: 'submitted',
    dot: 'var(--color-submitted)',
  },
  {
    title: 'Versionar KU: Guía de instalación v2',
    meta: 'Knowledge unit · borrador',
    kind: 'Versión',
    tone: 'neutral',
    dot: 'var(--color-text-tertiary)',
  },
]

export const changes: { initials: string; who: string; what: string; when: string }[] = [
  { initials: 'LF', who: 'Lucía Fernández', what: 'publicó una nueva versión de "Política de reembolsos"', when: 'hace 12 min' },
  { initials: 'JP', who: 'Juan Pérez', what: 'creó el agente "Soporte N1"', when: 'hace 1 hora' },
  { initials: 'MR', who: 'Martín Rivas', what: 'aprobó 2 knowledge units', when: 'hace 3 horas' },
  { initials: 'CA', who: 'Carla Acosta', what: 'comentó en "Onboarding de nuevos clientes"', when: 'ayer' },
  { initials: 'SB', who: 'Sistema', what: 'sincronizó 14 documentos desde Google Drive', when: 'ayer' },
]

export const agents: { tag: string; name: string; meta: string; status: string; tone: BadgeTone }[] = [
  { tag: 'S1', name: 'Soporte N1', meta: '12 knowledge units · 340 consultas', status: 'Activo', tone: 'success' },
  { tag: 'OB', name: 'Onboarding Coach', meta: '8 knowledge units · 96 consultas', status: 'En pausa', tone: 'warning' },
  { tag: 'VT', name: 'Ventas Técnicas', meta: '5 knowledge units · borrador', status: 'Borrador', tone: 'neutral' },
]

export const units: { name: string; meta: string; status: string; tone: BadgeTone }[] = [
  { name: 'Política de reembolsos', meta: 'Actualizado hace 12 min · v3', status: 'Publicado', tone: 'success' },
  { name: 'Onboarding de nuevos clientes', meta: 'En revisión · 2 comentarios', status: 'En revisión', tone: 'warning' },
  { name: 'Guía de instalación v2', meta: 'Editado por vos · borrador', status: 'Borrador', tone: 'neutral' },
]

export const invites: { initials: string; who: string; what: string; when: string }[] = [
  { initials: 'JP', who: 'Juan Pérez', what: 'te invitó a colaborar en el agente Soporte N1', when: 'hace 1 hora' },
  { initials: 'CA', who: 'Carla Acosta', what: 'te invitó a revisar Onboarding de nuevos clientes', when: 'hace 3 horas' },
]
