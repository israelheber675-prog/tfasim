import { db } from './db'
import { useSyncStore } from '@/stores/syncStore'

const MAX_RETRIES = 5
const RETRY_BASE_MS = 1000

async function syncItem(id: number) {
  const item = await db.syncQueue.get(id)
  if (!item) return

  const res = await fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callId: item.callId,
      operation: item.operation,
      payload: item.payload,
    }),
  })

  if (!res.ok) throw new Error(`Sync failed: ${res.status}`)

  await db.syncQueue.delete(id)

  if (item.operation === 'upsert') {
    await db.calls.update(item.callId, { synced: true, syncError: undefined })
  }
}

export async function syncAll() {
  const { setStatus, setPendingCount, setError, markSynced } = useSyncStore.getState()

  const pending = await db.syncQueue.orderBy('createdAt').toArray()
  if (pending.length === 0) {
    markSynced()
    return
  }

  setStatus('syncing')
  setPendingCount(pending.length)

  let errors = 0

  for (const item of pending) {
    if (item.id == null) continue
    try {
      await syncItem(item.id)
      setPendingCount((await db.syncQueue.count()))
    } catch (err) {
      errors++
      const retries = item.retries + 1
      const errMsg = err instanceof Error ? err.message : 'Unknown error'
      await db.syncQueue.update(item.id, { retries })
      await db.calls.update(item.callId, { syncError: errMsg })
    }
  }

  if (errors === 0) {
    markSynced()
  } else {
    setError(`${errors} פריטים לא סונכרנו`)
  }
}

/**
 * אפס את מונה הניסיונות לכל הפריטים שנכשלו וסנכרן מחדש.
 * שימושי כשהחיבור לשרת חזר אחרי תקופה של כשלונות.
 */
export async function forceRetryAll() {
  // אפס retries לכל הפריטים שנתקעו
  const all = await db.syncQueue.toArray()
  await Promise.all(
    all
      .filter(item => item.retries > 0)
      .map(item => db.syncQueue.update(item.id!, { retries: 0 }))
  )
  // נקה שגיאות מהקריאות
  const callIds = [...new Set(all.map(i => i.callId))]
  await Promise.all(
    callIds.map(id => db.calls.update(id, { syncError: undefined }))
  )
  // סנכרן
  await syncAll()
}

// שדות שנשמרים מקומית בלבד ולא נשלחים לשרת / לבית החולים
const LOCAL_ONLY_FIELDS = [
  'hospitalStickerPhotos',  // מדבקת ח"ב — לשימוש מקומי בלבד
  'babyStickerPhotos',      // מדבקת תינוק
  'scenePhotos',            // תמונות זירה
  'consentSignature',       // חתימות — נשמרות מקומית, לא משודרות
  'refusalTreatmentSignature',
  'refusalEvacuationSignature',
  'witnessSignature',
  'guardianSignature',
  'crewLeaderSignature',
] as const

function stripLocalOnlyFields(payload: Record<string, unknown>): Record<string, unknown> {
  const clean = { ...payload }
  for (const field of LOCAL_ONLY_FIELDS) {
    delete clean[field]
  }
  return clean
}

export async function enqueueUpsert(callId: string, payload: Record<string, unknown>) {
  await db.syncQueue.add({
    callId,
    operation: 'upsert',
    payload: stripLocalOnlyFields(payload),  // ← ללא תמונות ומדבקות
    createdAt: Date.now(),
    retries: 0,
  })
  useSyncStore.getState().setPendingCount(await db.syncQueue.count())
}

export async function enqueueDelete(callId: string) {
  await db.syncQueue.add({
    callId,
    operation: 'delete',
    payload: {},
    createdAt: Date.now(),
    retries: 0,
  })
  useSyncStore.getState().setPendingCount(await db.syncQueue.count())
}

export function listenForOnline() {
  const handler = () => {
    if (navigator.onLine) syncAll()
  }
  window.addEventListener('online', handler)
  return () => window.removeEventListener('online', handler)
}
