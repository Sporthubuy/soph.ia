import Link from 'next/link'
import { Logo } from './Logo'

export function Header() {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-[var(--color-bg-primary)]/88 backdrop-blur-[10px] border-b border-[var(--color-border)]">
      <Logo size={32} />
      <div className="hidden md:flex gap-8">
        <a href="#como-funciona" className="no-underline text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
          Cómo funciona
        </a>
        <a href="#caracteristicas" className="no-underline text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
          Características
        </a>
        <a href="#faq" className="no-underline text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
          FAQ
        </a>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/auth/login"
          className="hidden sm:inline-flex items-center px-4 py-[10px] text-sm font-semibold text-[var(--color-text-secondary)] no-underline hover:text-[var(--color-primary)] transition-colors"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/auth/signup"
          className="inline-flex items-center px-[18px] py-[10px] bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] text-sm font-semibold no-underline hover:brightness-110 transition-all"
        >
          Crear cuenta
        </Link>
      </div>
    </div>
  )
}
