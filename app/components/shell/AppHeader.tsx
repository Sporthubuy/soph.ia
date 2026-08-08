'use client'

import { useState } from 'react'
import { Bell, Search, Settings, ChevronDown } from 'lucide-react'
import { Logo } from '../Logo'
import { Card } from '../dashboard/Card'

const NOTIFICATIONS = [
  { text: 'Lucía Fernández publicó una nueva versión de "Política de reembolsos"', when: 'hace 12 min' },
  { text: 'Tu agente "Soporte N1" alcanzó 300 consultas este mes', when: 'hace 2 horas' },
  { text: '3 knowledge units necesitan revisión antes del viernes', when: 'ayer' },
]

export function AppHeader({
  userName,
  userEmail,
  initials,
}: {
  userName: string
  userEmail: string
  initials: string
}) {
  const [query, setQuery] = useState('')
  const [notifsOpen, setNotifsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <div className="sticky top-0 z-40 flex h-16 items-center gap-6 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)] px-6">
      <div className="flex w-[216px] items-center">
        <Logo size={28} />
      </div>

      <div className="relative max-w-[480px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" size={16} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar agentes, knowledge units o personas"
          aria-label="Buscar en la plataforma"
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] py-[9px] pl-9 pr-3 font-[family-name:var(--font-sans)] text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-focus-ring)]"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotifsOpen((v) => !v)
              setProfileOpen(false)
            }}
            aria-label="Notificaciones"
            className="relative flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)]"
          >
            <Bell size={20} />
            <span className="absolute right-[9px] top-[9px] flex h-4 min-w-4 items-center justify-center rounded-[var(--radius-full)] border-2 border-[var(--color-bg-primary)] bg-[var(--color-error)] px-1 text-[10px] font-bold text-white">
              {NOTIFICATIONS.length}
            </span>
          </button>

          {notifsOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-[340px]">
              <Card variant="elevated">
                <div className="mb-3.5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">Notificaciones</span>
                  <button type="button" className="text-xs font-semibold text-[var(--color-secondary)]">
                    Marcar como leídas
                  </button>
                </div>
                <div className="flex flex-col gap-3.5">
                  {NOTIFICATIONS.map((n, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-[7px] w-[7px] flex-none rounded-full bg-[var(--color-secondary)]" />
                      <div>
                        <div className="text-[13px] leading-relaxed text-[var(--color-text-primary)]">{n.text}</div>
                        <div className="text-xs text-[var(--color-text-tertiary)]">{n.when}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>

        <button
          type="button"
          aria-label="Configuración"
          className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)]"
        >
          <Settings size={20} />
        </button>

        <div className="mx-1 h-6 w-px bg-[var(--color-border)]" />

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen((v) => !v)
              setNotifsOpen(false)
            }}
            aria-label="Perfil"
            className="flex items-center gap-2.5 rounded-[var(--radius-full)] py-1 pl-1 pr-2 hover:bg-[var(--color-hover)]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-primary)] text-xs font-semibold text-white">
              {initials}
            </span>
            <span className="text-[13px] font-medium text-[var(--color-text-primary)]">{userName}</span>
            <ChevronDown size={14} className="text-[var(--color-text-tertiary)]" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-[220px]">
              <Card variant="elevated">
                <div className="mb-1.5 border-b border-[var(--color-border-light)] px-3 pb-2.5 pt-2.5 -mx-4 -mt-4">
                  <div className="px-1 text-[13px] font-semibold text-[var(--color-text-primary)]">{userName}</div>
                  <div className="px-1 text-xs text-[var(--color-text-tertiary)]">{userEmail}</div>
                </div>
                <div className="cursor-pointer rounded-[var(--radius-md)] px-3 py-2.5 text-[13px] text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]">
                  Mi perfil
                </div>
                <div className="cursor-pointer rounded-[var(--radius-md)] px-3 py-2.5 text-[13px] text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]">
                  Preferencias
                </div>
                <div className="cursor-pointer rounded-[var(--radius-md)] px-3 py-2.5 text-[13px] text-[var(--color-error)] hover:bg-[var(--color-hover)]">
                  Cerrar sesión
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
