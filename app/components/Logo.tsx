export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <svg viewBox="0 0 200 200" width={size} height={size} xmlns="http://www.w3.org/2000/svg" className="text-[var(--color-primary)]">
        <polygon points="100,20 140,50 100,80 60,50" fill="currentColor" />
        <polygon points="80,80 120,110 80,140 40,110" fill="currentColor" />
        <polygon points="100,140 140,170 100,200 60,170" fill="currentColor" />
      </svg>
      <span className="font-bold text-[var(--color-primary)]">soph.ia</span>
    </div>
  )
}
