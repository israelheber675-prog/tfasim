'use client'

import { useEffect, useState } from 'react'

export function useDarkMode() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('pcr-dark-mode')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const enabled = saved !== null ? saved === 'true' : prefersDark
    setDark(enabled)
    document.documentElement.classList.toggle('dark', enabled)
  }, [])

  function toggle() {
    setDark(d => {
      const next = !d
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('pcr-dark-mode', String(next))
      return next
    })
  }

  return { dark, toggle }
}
