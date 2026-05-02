'use client'

import { useEffect, useRef } from 'react'
import { useCallStore } from '@/stores/callStore'
import { db } from '@/lib/offline/db'

const AUTOSAVE_DELAY_MS = 15_000

export function useAutosave() {
  const callId = useCallStore((s) => s.callId)
  const data = useCallStore((s) => s.data)
  const isDirty = useCallStore((s) => s.isDirty)
  const markSaved = useCallStore((s) => s.markSaved)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!callId || !isDirty) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      try {
        await db.calls.put({
          id: callId,
          data: data as Record<string, unknown>,
          updatedAt: Date.now(),
          synced: false,
        })
        markSaved()
      } catch (err) {
        console.error('Autosave failed:', err)
      }
    }, AUTOSAVE_DELAY_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [callId, data, isDirty, markSaved])
}
