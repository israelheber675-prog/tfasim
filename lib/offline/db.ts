import Dexie, { type EntityTable } from 'dexie'
import type { MCIIncident } from '@/types/call'

export interface DraftCall {
  id: string
  data: Record<string, unknown>
  updatedAt: number
  synced: boolean
  syncError?: string
}

export interface SyncQueueItem {
  id?: number
  callId: string
  operation: 'upsert' | 'delete'
  payload: Record<string, unknown>
  createdAt: number
  retries: number
}

export interface CachedData {
  key: string
  value: unknown
  cachedAt: number
  ttlMs: number
}

export type AuditAction =
  | 'call_created'
  | 'call_updated'
  | 'call_draft_saved'
  | 'call_submitted'
  | 'call_synced'
  | 'call_sync_failed'
  | 'call_viewed'
  | 'pdf_downloaded'
  | 'email_sent'
  | 'mci_created'
  | 'mci_updated'

export interface AuditEntry {
  id?: number
  ts: number           // timestamp ms
  action: AuditAction
  callId?: string
  detail?: string      // free text details
  user?: string        // if auth is added later
}

class AmbulanceDB extends Dexie {
  calls!: EntityTable<DraftCall, 'id'>
  syncQueue!: EntityTable<SyncQueueItem, 'id'>
  cachedData!: EntityTable<CachedData, 'key'>
  mciIncidents!: EntityTable<MCIIncident, 'id'>
  auditLog!: EntityTable<AuditEntry, 'id'>

  constructor() {
    super('ambulance-pcr')
    this.version(1).stores({
      calls: 'id, updatedAt, synced',
      syncQueue: '++id, callId, createdAt',
      cachedData: 'key, cachedAt',
    })
    this.version(2).stores({
      calls: 'id, updatedAt, synced',
      syncQueue: '++id, callId, createdAt',
      cachedData: 'key, cachedAt',
      mciIncidents: 'id, updatedAt, synced',
    })
    this.version(3).stores({
      calls: 'id, updatedAt, synced',
      syncQueue: '++id, callId, createdAt',
      cachedData: 'key, cachedAt',
      mciIncidents: 'id, updatedAt, synced',
      auditLog: '++id, ts, action, callId',
    })
  }
}

export const db = new AmbulanceDB()

// Helper — fire and forget
export function auditLog(action: AuditAction, callId?: string, detail?: string) {
  db.auditLog.add({ ts: Date.now(), action, callId, detail }).catch(() => {/* silent */})
}
