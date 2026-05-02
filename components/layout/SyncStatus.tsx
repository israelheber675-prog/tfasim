'use client'

import { Cloud, CloudOff, RefreshCw, AlertCircle } from 'lucide-react'
import { useSyncStore } from '@/stores/syncStore'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  synced: { icon: Cloud, label: 'מסונכרן', className: 'text-emerald-600' },
  syncing: { icon: RefreshCw, label: 'מסנכרן...', className: 'text-blue-600 animate-spin' },
  offline: { icon: CloudOff, label: 'אופליין', className: 'text-gray-500' },
  error: { icon: AlertCircle, label: 'שגיאת סנכרון', className: 'text-red-600' },
}

export function SyncStatus() {
  const { status, pendingCount, errorMessage } = useSyncStore()
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <div
      className="flex items-center gap-1.5 text-sm cursor-default"
      title={errorMessage ?? config.label}
      aria-label={`סטטוס סנכרון: ${config.label}${pendingCount > 0 ? `, ${pendingCount} ממתינים` : ''}`}
    >
      <Icon size={16} className={config.className} />
      <span className="hidden sm:inline text-gray-600">{config.label}</span>
      {pendingCount > 0 && (
        <span className="bg-amber-100 text-amber-800 text-xs px-1.5 py-0.5 rounded-full">
          {pendingCount}
        </span>
      )}
    </div>
  )
}
