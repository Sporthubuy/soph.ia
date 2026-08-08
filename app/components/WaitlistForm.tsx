'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

type Status = 'idle' | 'loading' | 'success' | 'duplicate' | 'error'

export function WaitlistForm({ formId, source }: { formId: string; source: string }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return

    setStatus('loading')

    const { error } = await supabase
      .from('waitlist_signups')
      .insert({ name: name.trim(), email: email.trim().toLowerCase(), source })

    if (!error) {
      setStatus('success')
      setName('')
      setEmail('')
      return
    }

    if (error.code === '23505') {
      setStatus('duplicate')
    } else {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <p className="text-[15px] font-semibold text-[var(--color-secondary)]">
        ¡Listo! Te avisamos apenas Soph.ia esté disponible.
      </p>
    )
  }

  return (
    <div>
      <form id={formId} onSubmit={handleSubmit} className="flex gap-3 justify-center flex-wrap mb-3.5">
        <input
          type="text"
          name="name"
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-[200px] px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-[var(--radius-md)] bg-white text-[var(--color-text-primary)] outline-none focus:border-[var(--color-secondary)] transition-colors"
        />
        <input
          type="email"
          name="email"
          placeholder="tu@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-[240px] px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-[var(--radius-md)] bg-white text-[var(--color-text-primary)] outline-none focus:border-[var(--color-secondary)] transition-colors"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--radius-md)] cursor-pointer transition-colors px-5 py-3 text-base bg-[var(--color-primary)] text-white hover:bg-[#1e293b] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Enviando…' : 'Quiero acceso anticipado'}
        </button>
      </form>

      {status === 'duplicate' && (
        <p className="text-[13px] text-[var(--color-secondary)]">Ese email ya está en la lista de espera.</p>
      )}
      {status === 'error' && (
        <p className="text-[13px] text-red-500">Algo salió mal. Probá de nuevo en un momento.</p>
      )}
    </div>
  )
}
