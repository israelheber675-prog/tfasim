'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/offline/db'

interface DuplicateResult {
  found: boolean
  callId?: string
  patientName?: string
  updatedAt?: number
}

export function useDuplicateCheck(patientId: string | undefined, currentCallId: string | null): DuplicateResult {
  const [result, setResult] = useState<DuplicateResult>({ found: false })

  useEffect(() => {
    if (!patientId || patientId.length < 5) { setResult({ found: false }); return }

    const WINDOW_MS = 12 * 60 * 60 * 1000 // 12 שעות
    const since = Date.now() - WINDOW_MS

    db.calls
      .where('updatedAt').above(since)
      .toArray()
      .then(calls => {
        const match = calls.find(c => {
          if (c.id === currentCallId) return false
          const id = (c.data as Record<string, unknown>).patientId as string | undefined
          return id === patientId
        })
        if (match) {
          const d = match.data as Record<string, unknown>
          const name = [d.patientFirstName, d.patientLastName].filter(Boolean).join(' ') || 'לא ידוע'
          setResult({ found: true, callId: match.id, patientName: name, updatedAt: match.updatedAt })
        } else {
          setResult({ found: false })
        }
      })
  }, [patientId, currentCallId])

  return result
}
