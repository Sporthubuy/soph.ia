'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Search, Settings, ChevronDown, Bot, FileText, User, Loader2 } from 'lucide-react'
import { Logo } from '../Logo'
import { Card } from '../dashboard/Card'
import { createClient } from '../../lib/supabase/client'

type SearchResults = {
  agents: { id: string; name: string; description: string | null; type: string; status: string }[]
  kus: { id: string; name: string; type: string; area: string; status: string }[]
  members: { id: string; full_name: string; email: string; initials: string }[]
}

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
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [notifsOpen, setNotifsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<SearchResults>({ agents: [], kus: [], members: [] })
  const searchAbort = useRef<AbortController | null>(null)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ agents: [], kus: [], members: [] })
      setSearching(false)
      return
    }
    setSearching(true)
    searchAbort.current?.abort()
    const controller = new AbortController()
    searchAbort.current = controller
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal })
        .then((r) => r.json())
        .then((data) => {
          if (!controller.signal.aborted) setResults(data)
        })
        .catch(() => {})
        .finally(() => {
          if (!controller.signal.aborted) setSearching(false)
        })
    }, 220)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  function goto(path: string) {
    setSearchOpen(false)
    setQuery('')
    router.push(path)
  }

  const totalResults = results.agents.length + results.kus.length + results.members.length

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

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
          onFocus={() => setSearchOpen(true)}
          onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
          placeholder="Buscar agentes, knowledge units o personas"
          aria-label="Buscar en la plataforma"
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] py-[9px] pl-9 pr-3 font-[family-name:var(--font-sans)] text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-focus-ring)]"
        />
        {searching && (
          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--color-text-tertiary)]" />
        )}

        {searchOpen && query.trim().length >= 2 && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] max-h-[420px] overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] shadow-[var(--shadow-lg)]">
            {totalResults === 0 && !searching ? (
              <div className="px-4 py-6 text-center text-sm text-[var(--color-text-tertiary)]">
                Sin resultados para "{query}"
              </div>
            ) : (
              <>
                {results.agents.length > 0 && (
                  <div>
                    <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-tertiary)]">
                      Agentes
                    </div>
                    {results.agents.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => goto(`/agents/${a.id}/chat`)}
                        className="flex w-full items-center gap-3 border-b border-[var(--color-border)] px-4 py-2.5 text-left last:border-b-0 hover:bg-[var(--color-bg-secondary)]"
                      >
                        <div className="flex h-7 w-7 flex-none items-center justify-center rounded-[6px] bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                          <Bot size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{a.name}</div>
                          {a.description && (
                            <div className="truncate text-xs text-[var(--color-text-tertiary)]">{a.description}</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {results.kus.length > 0 && (
                  <div>
                    <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-tertiary)]">
                      Knowledge Units
                    </div>
                    {results.kus.map((k) => (
                      <button
                        key={k.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => goto(`/knowledge-units/${k.id}/edit`)}
                        className="flex w-full items-center gap-3 border-b border-[var(--color-border)] px-4 py-2.5 text-left last:border-b-0 hover:bg-[var(--color-bg-secondary)]"
                      >
                        <div className="flex h-7 w-7 flex-none items-center justify-center rounded-[6px] bg-emerald-500/10 text-emerald-500">
                          <FileText size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{k.name}</div>
                          <div className="truncate text-xs text-[var(--color-text-tertiary)]">
                            {k.type} · {k.area} · {k.status}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {results.members.length > 0 && (
                  <div>
                    <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-tertiary)]">
                      Personas
                    </div>
                    {results.members.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => goto('/settings/team')}
                        className="flex w-full items-center gap-3 border-b border-[var(--color-border)] px-4 py-2.5 text-left last:border-b-0 hover:bg-[var(--color-bg-secondary)]"
                      >
                        <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[var(--color-bg-tertiary)] text-[10px] font-bold text-[var(--color-text-secondary)]">
                          {m.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{m.full_name}</div>
                          <div className="truncate text-xs text-[var(--color-text-tertiary)]">{m.email}</div>
                        </div>
                        <User size={12} className="flex-none text-[var(--color-text-tertiary)]" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
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
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false)
                    router.push('/profile')
                  }}
                  className="w-full cursor-pointer rounded-[var(--radius-md)] px-3 py-2.5 text-left text-[13px] text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]"
                >
                  Mi perfil
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false)
                    router.push('/settings')
                  }}
                  className="w-full cursor-pointer rounded-[var(--radius-md)] px-3 py-2.5 text-left text-[13px] text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]"
                >
                  Preferencias
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="w-full cursor-pointer rounded-[var(--radius-md)] bg-transparent px-3 py-2.5 text-left font-[family-name:var(--font-sans)] text-[13px] text-[var(--color-error)] hover:bg-[var(--color-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {signingOut ? 'Saliendo…' : 'Cerrar sesión'}
                </button>
              </Card>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
