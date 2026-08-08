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

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          setTheme('auto')
          setLoading(false)
          return
        }

        // Get user settings
        const { data, error } = await supabase
          .from('user_settings')
          .select('theme')
          .eq('id', user.id)
          .single()

        if (error) {
          setTheme('auto')
          setLoading(false)
          return
        }

        const userTheme = (data?.theme as Theme) || 'auto'
        setTheme(userTheme)

        // Apply theme to DOM
        applyTheme(userTheme)
      } catch (error) {
        console.error('Error loading theme:', error)
        setTheme('auto')
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
    // Use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
  } else {
    root.setAttribute('data-theme', theme)
  }
}
