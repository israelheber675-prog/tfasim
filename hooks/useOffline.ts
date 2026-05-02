'use client'

import { useEffect, useState } from 'react'
import { useSyncStore } from '@/stores/syncStore'
import { listenForOnline, syncAll } from '@/lib/offline/sync'

export function useOffline() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const setStatus = useSyncStore((s) => s.setStatus)

  useEffect(() => {
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
