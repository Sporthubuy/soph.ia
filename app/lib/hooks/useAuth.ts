'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '../supabase/client'

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function getUser() {
      try {
        const supabase = createClient()
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          throw userError
        }

        setUser(user)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  async function logout() {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      setUser(null)
      router.push('/login')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Logout failed'))
    }
  }

  return { user, loading, error, logout }
}
