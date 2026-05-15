'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Cloud, CloudOff, AlertCircle, FileText, Search, X, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react'
import { db, type DraftCall } from '@/lib/offline/db'
import { PDFButton } from '@/components/pdf/PDFButton'
import { forceRetryAll } from '@/lib/offline/sync'

function SyncBadge({ call }: { call: DraftCall }) {
  if (call.syncError) return (
    <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
      <AlertCircle size={10} /> שגיאה
    </span>
  )
  if (call.synced) return (
    <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
      <Cloud size={10} /> מסונכרן
    </span>
  )
  return (
    <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
      <CloudOff size={10} /> ממתין
    </span>
  )
}

type CallField = Record<string, string | undefined>

function getField(call: DraftCall, key: string): string {
  return ((call.data as CallField)[key] ?? '') as string
}

export default function CallsPage() {
  const [calls, setCalls] = useState<DraftCall[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [syncing, setSyncing] = useState(false)

  function loadCalls() {
    db.calls.orderBy('updatedAt').reverse().toArray().then((rows) => {
      setCalls(rows)
      setLoading(false)
    })
  }

  useEffect(() => { loadCalls() }, [])

  const pendingCount = useMemo(() => calls.filter(c => !c.synced).length, [calls])

  async function handleSyncAll() {
    setSyncing(true)
    await forceRetryAll()
    loadCalls()
    setSyncing(false)
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return calls
    return calls.filter((call) => {
      const first = getField(call, 'patientFirstName').toLowerCase()
      const last = getField(call, 'patientLastName').toLowerCase()
      const id = getField(call, 'patientId').toLowerCase()
      const phone = getField(call, 'patientPhone').toLowerCase()
      const form = getField(call, 'formNumber').toLowerCase()
      return (
        first.includes(q) ||
        last.includes(q) ||
        id.includes(q) ||
        phone.includes(q) ||
        form.includes(q)
      )
    })
  }, [calls, query])

  function formatDate(ts: number) {
    return new Date(ts).toLocaleString('he-IL', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  }

  function getPatientName(call: DraftCall) {
    const first = getField(call, 'patientFirstName')
    const last = getField(call, 'patientLastName')
    return [first, last].filter(Boolean).join(' ') || 'לא ידוע'
  }

  function getCallType(call: DraftCall) {
    return getField(call, 'callType') || getField(call, 'chiefComplaintFreeText') || '—'
  }

  function getFormNumber(call: DraftCall) {
    return getField(call, 'formNumber') || call.id.slice(0, 8).toUpperCase()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1F4E78]">קריאות</h1>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <button
              onClick={handleSyncAll}
              disabled={syncing}
              className="flex items-center gap-2 h-11 px-4 rounded-md bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-60"
            >
              {syncing
                ? <Loader2 size={15} className="animate-spin" />
                : <RefreshCw size={15} />}
              {syncing ? 'מסנכרן...' : `סנכרן הכל (${pendingCount})`}
            </button>
          )}
          <Link href="/mci"
            className="flex items-center gap-2 h-11 px-4 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">
            אמ"כ
          </Link>
          <Link href="/new-call"
            className="flex items-center gap-2 h-11 px-5 rounded-md bg-[#1F4E78] text-white text-sm font-medium hover:bg-[#2E75B6] transition-colors">
            <Plus size={16} />
            קריאה חדשה
          </Link>
        </div>
      </div>

      {/* חיפוש */}
      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חפש לפי שם, ת״ז, טלפון או מספר טופס..."
          className="flex h-11 w-full rounded-md border border-input bg-background pr-9 pl-4 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E78]"
        />
        {query && (
          <button onClick={() => setQuery('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      {loading && <p className="text-center text-gray-400 py-16">טוען...</p>}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 space-y-3">
          <FileText size={48} className="mx-auto text-gray-300" />
          <p className="text-gray-500 font-medium">
            {query ? 'לא נמצאו תוצאות לחיפוש' : 'אין קריאות שמורות'}
          </p>
          {!query && <p className="text-sm text-gray-400">קריאות שתמלא יישמרו כאן</p>}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400">{filtered.length} קריאות</p>
          <ul className="space-y-3">
            {filtered.map((call) => (
              <li key={call.id}>
                <Link href={`/calls/${call.id}`}
                  className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-5 py-4 hover:border-[#2E75B6] hover:shadow-sm transition-all">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-gray-800 truncate">{getPatientName(call)}</p>
                      <span className="text-xs text-gray-400 font-mono shrink-0">#{getFormNumber(call)}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{getCallType(call)}</p>
                    {getField(call, 'patientId') && (
                      <p className="text-xs text-gray-400">ת״ז: {getField(call, 'patientId')}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0 mr-4">
                    <span className="text-xs text-gray-400">{formatDate(call.updatedAt)}</span>
                    <SyncBadge call={call} />
                    <PDFButton callId={call.id} variant="icon" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
