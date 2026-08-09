import { Logo } from './Logo'

export function Header() {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-[var(--color-bg-primary)]/88 backdrop-blur-[10px] border-b border-[var(--color-border)]">
      <Logo size={32} />
      <div className="hidden md:flex gap-8">
        <a href="#como-funciona" className="no-underline text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
          Cómo funciona
        </a>
        <a href="#comunidad" className="no-underline text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
          Beneficios
        </a>
        <a href="#faq" className="no-underline text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
          Preguntas frecuentes
        </a>
      </div>
      <a
        href="#registro"
        className="inline-flex items-center px-[18px] py-[10px] bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] text-sm font-semibold no-underline"
      >
        Unirme a la lista
      </a>
    </div>
  )
}
