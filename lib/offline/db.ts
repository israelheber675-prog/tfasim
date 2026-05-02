import Dexie, { type EntityTable } from 'dexie'

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

class AmbulanceDB extends Dexie {
  calls!: EntityTable<DraftCall, 'id'>
  syncQueue!: EntityTable<SyncQueueItem, 'id'>
  cachedData!: EntityTable<CachedData, 'key'>

  constructor() {
    super('ambulance-pcr')
    this.version(1).stores({
      calls: 'id, updatedAt, synced',
      syncQueue: '++id, callId, createdAt',
      cachedData: 'key, cachedAt',
    })
  }
}

export const db = new AmbulanceDB()
