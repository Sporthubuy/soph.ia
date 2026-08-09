'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Loader2, Bot, User, AlertCircle } from 'lucide-react'
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

export default function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [agent, setAgent] = useState<AgentInfo | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetch(`/api/agents/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((data) => setAgent(data))
      .catch(() => setError('No se pudo cargar el agente'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!streaming) inputRef.current?.focus()
  }, [streaming])

  async function sendMessage() {
    const text = input.trim()
    if (!text || streaming) return

    setInput('')
    setError(null)

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text }
    const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: '' }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setStreaming(true)

    try {
      const allMessages = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }))

      const res = await fetch(`/api/agents/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `Error ${res.status}`)
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
    <div className="flex h-screen flex-col bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-3">
        <button
          onClick={() => router.push('/agents')}
          className="rounded-[var(--radius-md)] p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white">
          <Bot size={18} />
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
          {messages.length === 0 && (
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
          )}

          {messages.map((msg) => (
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
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
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
          ))}

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
  )
}
