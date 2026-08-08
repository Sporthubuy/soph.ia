import type { KUStatus } from './data'

const TYPE_VISUALS: Record<string, { bg: string; color: string }> = {
  Política: { bg: 'rgba(139,92,246,0.12)', color: '#7C3AED' },
  Guía: { bg: 'rgba(59,130,246,0.12)', color: '#1D4FD7' },
  FAQ: { bg: 'rgba(6,182,212,0.12)', color: '#0891B2' },
  Documento: { bg: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' },
  Proceso: { bg: 'rgba(16,185,129,0.12)', color: '#059669' },
  Dataset: { bg: 'rgba(99,102,241,0.12)', color: '#4F46E5' },
}

export function typeVisual(type: string) {
  return TYPE_VISUALS[type] ?? TYPE_VISUALS.Documento
}

export function qualityColor(score: number) {
  if (score >= 80) return 'var(--color-success)'
  if (score >= 50) return 'var(--color-warning)'
  return 'var(--color-error)'
}

export type ApprovalStep = {
  title: string
  meta: string
  state: 'done' | 'current' | 'pending'
}

export function approvalSteps(status: KUStatus, meta: { author: string; edited: string }): ApprovalStep[] {
  const created: ApprovalStep = { title: 'Creada', meta: `por ${meta.author}`, state: 'done' }
  const review: ApprovalStep = { title: 'En revisión', meta: 'pendiente', state: 'pending' }
  const approved: ApprovalStep = { title: 'Aprobada', meta: 'pendiente', state: 'pending' }
  const published: ApprovalStep = { title: 'Publicada', meta: 'pendiente', state: 'pending' }

  if (status === 'Borrador') {
    review.state = 'current'
    return [created, review, approved, published]
  }

  if (status === 'En revisión') {
    review.state = 'done'
    review.meta = meta.edited
    approved.state = 'current'
    return [created, review, approved, published]
  }

  if (status === 'Aprobada') {
    review.state = 'done'
    review.meta = meta.edited
    approved.state = 'done'
    approved.meta = meta.edited
    published.state = 'current'
    return [created, review, approved, published]
  }

  review.state = 'done'
  review.meta = meta.edited
  approved.state = 'done'
  approved.meta = meta.edited
  published.state = 'done'
  published.meta = meta.edited
  return [created, review, approved, published]
}

export function stepDotColor(state: ApprovalStep['state']) {
  if (state === 'done') return { dot: 'var(--color-success)', ring: 'rgba(16,185,129,0.16)', titleColor: 'var(--color-text-primary)' }
  if (state === 'current') return { dot: 'var(--color-secondary)', ring: 'rgba(59,130,246,0.16)', titleColor: 'var(--color-text-primary)' }
  return { dot: 'var(--color-border)', ring: 'transparent', titleColor: 'var(--color-text-tertiary)' }
}
