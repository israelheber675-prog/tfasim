'use client'

import { useEffect, useState } from 'react'
import { useSyncStore } from '@/stores/syncStore'
import { listenForOnline, syncAll } from '@/lib/offline/sync'

export function useOffline() {
  // מתחילים תמיד עם true (זהה לשרת) ומעדכנים ב-useEffect אחרי mount
  const [isOnline, setIsOnline] = useState(true)
  const setStatus = useSyncStore((s) => s.setStatus)

  useEffect(() => {
    // עדכן מיד לפי המצב האמיתי
    setIsOnline(navigator.onLine)
    if (!navigator.onLine) setStatus('offline')

    const onOnline = () => {
      setIsOnline(true)
      setStatus('syncing')
      syncAll()
    }
    const onOffline = () => {
      setIsOnline(false)
      setStatus('offline')
    }

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    const cleanup = listenForOnline()

    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      cleanup()
    }
  }, [setStatus])

  return { isOnline }
}
