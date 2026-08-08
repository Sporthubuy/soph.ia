'use client'

import { useEffect } from 'react'
import { useTheme } from '../lib/useTheme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { loading } = useTheme()

  // Prevent flashing by keeping content hidden during theme load
  if (loading) {
    return <div>{children}</div>
  }

  return <div>{children}</div>
}
