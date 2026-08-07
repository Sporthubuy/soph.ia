export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <svg viewBox="0 0 200 200" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        <polygon points="100,20 140,50 100,80 60,50" fill="#001F3F" />
        <polygon points="80,80 120,110 80,140 40,110" fill="#001F3F" />
        <polygon points="100,140 140,170 100,200 60,170" fill="#001F3F" />
      </svg>
      <span className="font-bold text-[#0F172A]">soph.ia</span>
    </div>
  )
}
