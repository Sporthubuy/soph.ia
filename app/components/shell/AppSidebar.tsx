import Link from 'next/link'
import { Bot, Globe, LayoutGrid, Network, Plus, Settings, Users } from 'lucide-react'

const MODULES = [
  { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
  { key: 'agents', label: 'Agentes', href: '/agents', icon: Bot },
  { key: 'knowledge-units', label: 'Knowledge units', href: '/knowledge-units', icon: Network },
  { key: 'community', label: 'Comunidad', href: '/community', icon: Globe },
  { key: 'team', label: 'Equipo', href: '/team', icon: Users },
] as const

type SidebarKey = (typeof MODULES)[number]['key'] | 'settings' | 'profile'

export function AppSidebar({ active }: { active: SidebarKey }) {
  return (
    <div className="sticky top-16 hidden h-[calc(100vh-64px)] w-60 flex-none flex-col gap-1.5 overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-5 md:flex">
      <div className="px-2 pb-2.5 text-[11px] font-bold tracking-[.06em] text-[var(--color-text-tertiary)]">
        MÓDULOS
      </div>
      {MODULES.map(({ key, label, href, icon: Icon }) =>
        key === active ? (
          <div
            key={key}
            className="flex items-center gap-2.5 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3 py-2.5 text-sm font-semibold text-white"
          >
            <Icon size={18} />
            {label}
          </div>
        ) : (
          <Link
            key={key}
            href={href}
            className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] no-underline hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]"
          >
            <Icon size={18} />
            {label}
          </Link>
        )
      )}
      <div className="mt-auto flex flex-col gap-2 border-t border-[var(--color-border-light)] pt-4">
        {active === 'settings' ? (
          <div className="flex items-center gap-2.5 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3 py-2.5 text-sm font-semibold text-white">
            <Settings size={18} />
            Configuración
          </div>
        ) : (
          <Link
            href="/settings"
            className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] no-underline hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]"
          >
            <Settings size={18} />
            Configuración
          </Link>
        )}
        <button
          type="button"
          disabled
          title="Los módulos personalizados estarán disponibles próximamente."
          className="flex w-full items-center gap-2.5 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] px-3 py-2.5 text-[13px] font-medium text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)]"
        >
          <Plus size={16} />
          Agregar módulo (próximamente)
        </button>
      </div>
    </div>
  )
}
