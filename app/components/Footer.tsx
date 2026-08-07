import { Logo } from './Logo'

export function Footer() {
  return (
    <div className="px-6 md:px-12 py-8 border-t border-[var(--color-border)] flex items-center justify-between">
      <Logo size={24} />
      <p className="text-[13px] text-[var(--color-text-tertiary)]">
        © 2026 Soph.ia. Todos los derechos reservados.
      </p>
    </div>
  )
}
