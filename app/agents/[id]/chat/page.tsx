'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Send,
  Loader2,
  Bot,
  User,
  AlertCircle,
  Plus,
  MessageSquare,
  Trash2,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { getProviderName, getProviderForModel } from '../../../lib/providers'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type AgentInfo = {
  id: string
  name: string
  description: string | null
  model: string
  type: string
}

type ConversationSummary = {
  id: string
  title: string | null
  created_at: string
  updated_at: string
}

export default function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialConvId = searchParams.get('c')

  const [agent, setAgent] = useState<AgentInfo | null>(null)
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [currentConvId, setCurrentConvId] = useState<string | null>(initialConvId)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.innerWidth >= 768
  })
  const [loadingMessages, setLoadingMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/agents/${id}`).then((r) => r.ok ? r.json() : Promise.reject()),
      fetch(`/api/agents/${id}/conversations`).then((r) => r.ok ? r.json() : []),
    ])
      .then(([agentData, convs]) => {
        setAgent(agentData)
        setConversations(convs)
      })
      .catch(() => setError('No se pudo cargar el agente'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!currentConvId) {
      setMessages([])
      return
    }
    setLoadingMessages(true)
    fetch(`/api/conversations/${currentConvId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.messages)) {
          setMessages(
            data.messages.map((m: { id: string; role: 'user' | 'assistant'; content: string }) => ({
              id: m.id,
              role: m.role,
              content: m.content,
            }))
          )
        }
      })
      .catch(() => setError('No se pudo cargar la conversación'))
      .finally(() => setLoadingMessages(false))
  }, [currentConvId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!streaming) inputRef.current?.focus()
  }, [streaming])

  function newConversation() {
    setCurrentConvId(null)
    setMessages([])
    setError(null)
    const url = new URL(window.location.href)
    url.searchParams.delete('c')
    window.history.replaceState({}, '', url.toString())
    inputRef.current?.focus()
  }

  function selectConversation(convId: string) {
    setCurrentConvId(convId)
    setError(null)
    const url = new URL(window.location.href)
    url.searchParams.set('c', convId)
    window.history.replaceState({}, '', url.toString())
  }

  async function deleteConversation(convId: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('¿Eliminar esta conversación?')) return
    try {
      await fetch(`/api/conversations/${convId}`, { method: 'DELETE' })
      setConversations((prev) => prev.filter((c) => c.id !== convId))
      if (currentConvId === convId) newConversation()
    } catch {
      setError('No se pudo eliminar')
    }
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || streaming) return

    setInput('')
    setError(null)

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text }
    const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: '' }
    const wasFirstMessage = messages.length === 0

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setStreaming(true)

    try {
      const allMessages = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }))

      const res = await fetch(`/api/agents/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages, conversation_id: currentConvId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `Error ${res.status}`)
      }

      const newConvId = res.headers.get('x-conversation-id')
      if (newConvId && newConvId !== currentConvId) {
        setCurrentConvId(newConvId)
        const url = new URL(window.location.href)
        url.searchParams.set('c', newConvId)
        window.history.replaceState({}, '', url.toString())
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No stream')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') break

          try {
            const json = JSON.parse(payload)
            if (json.error) throw new Error(json.error)
            if (json.text) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsg.id ? { ...m, content: m.content + json.text } : m
                )
              )
            }
          } catch (e) {
            if (e instanceof Error && e.message !== payload) throw e
          }
        }
      }

      if (wasFirstMessage) {
        fetch(`/api/agents/${id}/conversations`)
          .then((r) => r.json())
          .then((convs) => setConversations(convs))
          .catch(() => {})
      } else {
        setConversations((prev) => {
          const now = new Date().toISOString()
          return prev.map((c) => (c.id === currentConvId ? { ...c, updated_at: now } : c))
        })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al conectar con la IA'
      setError(msg)
      setMessages((prev) => prev.filter((m) => m.id !== assistantMsg.id || m.content))
    } finally {
      setStreaming(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-secondary)]">
        <Loader2 size={24} className="animate-spin text-[var(--color-text-tertiary)]" />
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
        <p>Agente no encontrado</p>
        <Link href="/agents" className="text-sm text-[var(--color-primary)] underline">
          Volver a agentes
        </Link>
      </div>
    )
  }

  const provider = getProviderForModel(agent.model)

  return (
    <div className="flex h-screen bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="fixed left-0 top-0 z-40 flex h-full w-72 max-w-[85vw] flex-none flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-primary)] md:static md:z-auto md:h-auto md:w-64 md:max-w-none">
          <div className="border-b border-[var(--color-border)] p-3">
            <button
              onClick={newConversation}
              className="flex w-full items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]"
            >
              <Plus size={14} />
              Nueva conversación
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {conversations.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-[var(--color-text-tertiary)]">
                Sin conversaciones todavía
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {conversations.map((c) => {
                  const active = c.id === currentConvId
                  return (
                    <div
                      key={c.id}
                      onClick={() => selectConversation(c.id)}
                      className={`group flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 ${
                        active
                          ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
                      }`}
                    >
                      <MessageSquare size={13} className="flex-none" />
                      <span className="min-w-0 flex-1 truncate text-xs">
                        {c.title || 'Sin título'}
                      </span>
                      <button
                        onClick={(e) => deleteConversation(c.id, e)}
                        className="flex-none rounded p-1 text-[var(--color-text-tertiary)] opacity-0 hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-error)] group-hover:opacity-100"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="border-t border-[var(--color-border)] p-2">
            <button
              onClick={() => router.push(`/agents/${id}/edit`)}
              className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
            >
              <Settings size={13} />
              Configurar agente
            </button>
          </div>
        </aside>
      )}

      {/* Chat area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2.5">
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            className="rounded-[var(--radius-md)] p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
            aria-label={sidebarOpen ? 'Ocultar barra' : 'Mostrar barra'}
          >
            {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>
          <button
            onClick={() => router.push('/agents')}
            className="rounded-[var(--radius-md)] p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white">
            <Bot size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{agent.name}</div>
            <div className="truncate text-xs text-[var(--color-text-tertiary)]">
              {agent.model} · {provider ? getProviderName(provider) : ''}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-6">
            {loadingMessages ? (
              <div className="flex justify-center py-16">
                <Loader2 size={20} className="animate-spin text-[var(--color-text-tertiary)]" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <Bot size={32} />
                </div>
                <h2 className="mb-2 text-lg font-semibold">{agent.name}</h2>
                {agent.description && (
                  <p className="mb-4 max-w-md text-sm text-[var(--color-text-secondary)]">{agent.description}</p>
                )}
                <p className="text-xs text-[var(--color-text-tertiary)]">Escribí un mensaje para empezar la conversación</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-4 flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="mt-1 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
                      <Bot size={14} />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)]'
                    }`}
                  >
                    {msg.content || (
                      <span className="inline-flex items-center gap-1.5 text-[var(--color-text-tertiary)]">
                        <Loader2 size={14} className="animate-spin" />
                        Pensando…
                      </span>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="mt-1 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]">
                      <User size={14} />
                    </div>
                  )}
                </div>
              ))
            )}

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-error)]/30 bg-[rgba(239,68,68,0.06)] px-4 py-3 text-sm text-[var(--color-error)]">
                <AlertCircle size={16} className="mt-0.5 flex-none" />
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4">
          <div className="mx-auto flex max-w-3xl gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribí tu mensaje..."
              rows={1}
              disabled={streaming}
              className="flex-1 resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-focus-ring)] disabled:opacity-60"
              style={{ maxHeight: 120 }}
              onInput={(e) => {
                const el = e.currentTarget
                el.style.height = 'auto'
                el.style.height = Math.min(el.scrollHeight, 120) + 'px'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={streaming || !input.trim()}
              className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-[var(--color-primary)] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              {streaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
