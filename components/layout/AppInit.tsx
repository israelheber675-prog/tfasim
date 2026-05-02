'use client'

import { useEffect } from 'react'
import { syncAll } from '@/lib/offline/sync'
import { useSyncStore } from '@/stores/syncStore'
import { db } from '@/lib/offline/db'

// מופעל פעם אחת בטעינת האפליקציה
export function AppInit() {
  const setPendingCount = useSyncStore(s => s.setPendingCount)
  const setStatus = useSyncStore(s => s.setStatus)

  useEffect(() => {
    async function init() {
      // עדכן ספירת ממתינים מה-IndexedDB
      const pending = await db.syncQueue.count()
      setPendingCount(pending)

      // נסה לסנכרן אם מחובר לאינטרנט
      if (navigator.onLine) {
        if (pending > 0) {
          setStatus('syncing')
          await syncAll()
        } else {
          setStatus('synced')
        }
      } else {
        setStatus('offline')
      }
    }

    init()

    // סנכרן גם כשחוזר חיבור
    const onOnline = () => {
      setStatus('syncing')
      syncAll()
    }
    const onOffline = () => setStatus('offline')

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    // סנכרון רקע כל 5 דקות
    const interval = setInterval(() => {
      if (navigator.onLine) syncAll()
    }, 5 * 60 * 1000)

    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      clearInterval(interval)
    }
  }, [setPendingCount, setStatus])

  return null
}
