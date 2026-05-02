'use client'

import { create } from 'zustand'

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error'

interface SyncState {
  status: SyncStatus
  lastSyncedAt: Date | null
  pendingCount: number
  errorMessage: string | null
  setStatus: (status: SyncStatus) => void
  setPendingCount: (count: number) => void
  setError: (message: string | null) => void
  markSynced: () => void
}

export const useSyncStore = create<SyncState>((set) => ({
  status: 'synced',
  lastSyncedAt: null,
  pendingCount: 0,
  errorMessage: null,
  setStatus: (status) => set({ status }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
  setError: (errorMessage) => set({ errorMessage, status: errorMessage ? 'error' : 'synced' }),
  markSynced: () => set({ status: 'synced', lastSyncedAt: new Date(), errorMessage: null }),
}))
