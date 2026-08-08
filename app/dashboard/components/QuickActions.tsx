import Link from 'next/link'
import { Bot, ChevronRight, Network } from 'lucide-react'
import { Card } from '../../components/dashboard/Card'

const ACTIONS = [
  {
    icon: Bot,
    iconBg: 'var(--color-primary)',
    title: 'Crear agente',
    description: 'Armá un agente sobre el conocimiento de tu equipo.',
    href: '/agents',
  },
  {
    icon: Network,
    iconBg: 'var(--color-secondary)',
    title: 'Crear knowledge unit',
    description: 'Sumá un documento, proceso o aprendizaje.',
    href: '/knowledge-units',
  },
]

export function QuickActions() {
  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {ACTIONS.map(({ icon: Icon, iconBg, title, description, href }) => (
        <Link key={title} href={href} className="no-underline">
          <Card className="cursor-pointer">
            <div className="flex items-center gap-4">
              <span
                className="flex h-11 w-11 flex-none items-center justify-center rounded-[var(--radius-md)] text-white"
                style={{ background: iconBg }}
              >
                <Icon size={22} />
              </span>
              <div className="flex-1">
                <div className="text-[15px] font-semibold text-[var(--color-text-primary)]">{title}</div>
                <div className="text-[13px] text-[var(--color-text-secondary)]">{description}</div>
              </div>
              <ChevronRight size={18} className="text-[var(--color-text-tertiary)]" />
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
