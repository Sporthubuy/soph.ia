'use client'

import { useEffect } from 'react'

export function ForceLightMode() {
  useEffect(() => {
    const root = document.documentElement
    const previous = root.getAttribute('data-theme')

    function lock() {
      if (root.getAttribute('data-theme') !== 'light') {
        root.setAttribute('data-theme', 'light')
      }
    }

    lock()

    const observer = new MutationObserver(lock)
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })

    return () => {
      observer.disconnect()
      if (previous) root.setAttribute('data-theme', previous)
      else root.removeAttribute('data-theme')
    }
  }, [])

  return null
}
