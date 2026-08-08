'use client'

import { useEffect, useState } from 'react'
import { createClient } from './supabase/client'

export type Theme = 'light' | 'dark' | 'auto'

interface ThemeSettings {
  theme: Theme
  loading: boolean
}

export function useTheme(): ThemeSettings {
  const [theme, setTheme] = useState<Theme>('auto')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTheme() {
      try {
        const supabase = createClient()

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          applyTheme('auto')
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('user_settings')
          .select('theme')
          .eq('id', user.id)
          .maybeSingle()

        const userTheme = (data?.theme as Theme) || 'auto'
        setTheme(userTheme)
        applyTheme(userTheme)
      } catch {
        applyTheme('auto')
      } finally {
        setLoading(false)
      }
    }

    loadTheme()
  }, [])

  return { theme, loading }
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement

  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
  } else {
    root.setAttribute('data-theme', theme)
  }
}
