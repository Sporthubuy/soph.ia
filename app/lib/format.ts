export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diffMs / 60_000)

  if (minutes < 1) return 'recién'
  if (minutes < 60) return `hace ${minutes} min`

  const hours = Math.round(minutes / 60)
  if (hours < 24) return `hace ${hours} hora${hours === 1 ? '' : 's'}`

  const days = Math.round(hours / 24)
  if (days === 1) return 'ayer'
  if (days < 7) return `hace ${days} días`

  const weeks = Math.round(days / 7)
  if (weeks < 5) return `hace ${weeks} semana${weeks === 1 ? '' : 's'}`

  const months = Math.round(days / 30)
  if (months < 12) return `hace ${months} mes${months === 1 ? '' : 'es'}`

  const years = Math.round(days / 365)
  return `hace ${years} año${years === 1 ? '' : 's'}`
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}
