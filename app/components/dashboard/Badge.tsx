const TONES = {
  success: { bg: 'rgba(16,185,129,0.14)', color: '#059669' },
  warning: { bg: 'rgba(245,158,11,0.16)', color: '#B45309' },
  info: { bg: 'rgba(59,130,246,0.14)', color: '#1D4FD7' },
  submitted: { bg: 'rgba(139,92,246,0.14)', color: '#6D28D9' },
  neutral: { bg: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' },
  expired: { bg: 'rgba(107,114,128,0.14)', color: '#4B5563' },
} as const

export type BadgeTone = keyof typeof TONES

export function Badge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  const { bg, color } = TONES[tone]
  return (
    <span
      className="flex-none rounded-[var(--radius-full)] px-[9px] py-[3px] text-[11px] font-semibold"
      style={{ background: bg, color }}
    >
      {children}
    </span>
  )
}
