'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, X, FileText, Cloud, CloudOff, AlertCircle, Download, ClipboardList } from 'lucide-react'
import { db, type DraftCall, type AuditEntry } from '@/lib/offline/db'

type CallField = Record<string, string | undefined>

function get(call: DraftCall, key: string): string {
  return ((call.data as CallField)[key] ?? '') as string
}

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

const ACTION_LABELS: Record<string, string> = {
  call_created:     '✏️ קריאה נוצרה',
  call_updated:     '📝 קריאה עודכנה',
  call_draft_saved: '💾 טיוטה נשמרה',
  call_submitted:   '✅ קריאה הוגשה',
  call_synced:      '☁️ קריאה סונכרנה',
  call_sync_failed: '❌ סנכרון נכשל',
  call_viewed:      '👁 קריאה נצפתה',
  pdf_downloaded:   '📄 PDF הורד',
  email_sent:       '📧 מייל נשלח',
  mci_created:      '🚨 אמ"כ נוצר',
  mci_updated:      '🚨 אמ"כ עודכן',
}

export default function ReportsPage() {
  const [tab, setTab] = useState<'calls' | 'audit'>('calls')
  const [calls, setCalls] = useState<DraftCall[]>([])
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    Promise.all([
      db.calls.orderBy('updatedAt').reverse().toArray(),
      db.auditLog.orderBy('ts').reverse().limit(500).toArray(),
    ]).then(([rows, audit]) => {
      setCalls(rows)
      setAuditEntries(audit)
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return calls
    return calls.filter(call => {
      const first = get(call, 'patientFirstName').toLowerCase()
      const last = get(call, 'patientLastName').toLowerCase()
      const id = get(call, 'patientId').toLowerCase()
      const phone = get(call, 'patientPhone').toLowerCase()
      const form = get(call, 'formNumber').toLowerCase()
      const incident = get(call, 'incidentNumber').toLowerCase()
      return first.includes(q) || last.includes(q) || id.includes(q) ||
             phone.includes(q) || form.includes(q) || incident.includes(q)
    })
  }, [calls, query])

  const filteredAudit = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return auditEntries
    return auditEntries.filter(e =>
      (e.action.includes(q)) ||
      (e.callId?.toLowerCase().includes(q)) ||
      (e.detail?.toLowerCase().includes(q)) ||
      (ACTION_LABELS[e.action]?.includes(q))
    )
  }, [auditEntries, query])

  function formatDate(ts: number) {
    return new Date(ts).toLocaleString('he-IL', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  }

  function exportCSV() {
    const rows = [
      ['מס׳ טופס', 'שם פרטי', 'שם משפחה', 'ת.ז.', 'טלפון', 'סוג קריאה', 'תאריך', 'סנכרון'],
      ...filtered.map(c => [
        get(c, 'formNumber') || c.id.slice(0, 8),
        get(c, 'patientFirstName'),
        get(c, 'patientLastName'),
        get(c, 'patientId'),
        get(c, 'patientPhone'),
        get(c, 'callType'),
        formatDate(c.updatedAt),
        c.synced ? 'מסונכרן' : 'ממתין',
      ])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pcr-reports-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function exportExcel() {
    const XLSX = await import('xlsx')
    const data = filtered.map(c => ({
      'מס׳ טופס': get(c, 'formNumber') || c.id.slice(0, 8),
      'תאריך': get(c, 'callDate'),
      'שם פרטי': get(c, 'patientFirstName'),
      'שם משפחה': get(c, 'patientLastName'),
      'ת.ז.': get(c, 'patientId'),
      'תאריך לידה': get(c, 'patientDob'),
      'גיל': get(c, 'patientAge'),
      'מין': get(c, 'patientSex'),
      'טלפון': get(c, 'patientPhone'),
      'עיר מגורים': get(c, 'patientCity'),
      'קופת חולים': get(c, 'healthFund'),
      'סוג קריאה': get(c, 'callType'),
      'דחיפות': get(c, 'callPriority'),
      'עיר אירוע': get(c, 'eventCity'),
      'אמבולנס': get(c, 'ambulanceNumber'),
      'נהג': get(c, 'driver'),
      'חובש': get(c, 'paramedic'),
      'בית חולים': get(c, 'destinationHospital'),
      'סנכרון': c.synced ? 'מסונכרן' : 'ממתין',
      'עדכון אחרון': formatDate(c.updatedAt),
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    ws['!dir'] = 'rtl'
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'קריאות')
    XLSX.writeFile(wb, `pcr-reports-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  function exportAuditCSV() {
    const rows = [
      ['זמן', 'פעולה', 'מזהה קריאה', 'פרטים'],
      ...filteredAudit.map(e => [
        formatDate(e.ts),
        ACTION_LABELS[e.action] ?? e.action,
        e.callId?.slice(0, 8) ?? '',
        e.detail ?? '',
      ])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1F4E78]">דוחות</h1>
        <div className="flex items-center gap-2">
          {tab === 'calls' && (
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 h-11 px-4 rounded-md border border-emerald-500 text-emerald-700 text-sm font-medium hover:bg-emerald-50 transition-colors">
              <Download size={16} />
              Excel
            </button>
          )}
          <button
            onClick={tab === 'calls' ? exportCSV : exportAuditCSV}
            className="flex items-center gap-2 h-11 px-4 rounded-md border border-[#2E75B6] text-[#1F4E78] text-sm font-medium hover:bg-[#DDEBF7] transition-colors">
            <Download size={16} />
            CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setTab('calls')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'calls'
              ? 'border-[#1F4E78] text-[#1F4E78]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText size={16} />
          קריאות
        </button>
        <button
          onClick={() => setTab('audit')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'audit'
              ? 'border-[#1F4E78] text-[#1F4E78]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <ClipboardList size={16} />
          יומן פעולות
          {auditEntries.length > 0 && (
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{auditEntries.length}</span>
          )}
        </button>
      </div>

      {/* חיפוש */}
      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="search" value={query} onChange={e => setQuery(e.target.value)}
          placeholder={tab === 'calls' ? 'חפש לפי שם, ת״ז, טלפון, מס׳ טופס...' : 'חפש בפעולות...'}
          className="flex h-11 w-full rounded-md border border-input bg-background pr-9 pl-9 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E78]" />
        {query && (
          <button onClick={() => setQuery('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      {loading && <p className="text-center text-gray-400 py-16">טוען...</p>}

      {/* ── TAB: קריאות ── */}
      {!loading && tab === 'calls' && (
        <>
          {filtered.length === 0 && (
            <div className="text-center py-20 space-y-3">
              <FileText size={48} className="mx-auto text-gray-300" />
              <p className="text-gray-500 font-medium">{query ? 'לא נמצאו תוצאות' : 'אין קריאות שמורות'}</p>
            </div>
          )}
          {filtered.length > 0 && (
            <>
              <p className="text-xs text-gray-400">{filtered.length} קריאות נמצאו</p>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-right font-medium">מס׳ טופס</th>
                      <th className="px-4 py-3 text-right font-medium">שם מטופל</th>
                      <th className="px-4 py-3 text-right font-medium">ת.ז.</th>
                      <th className="px-4 py-3 text-right font-medium">סוג קריאה</th>
                      <th className="px-4 py-3 text-right font-medium">תאריך</th>
                      <th className="px-4 py-3 text-right font-medium">סנכרון</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((call, i) => (
                      <tr key={call.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          {get(call, 'formNumber') || call.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {[get(call, 'patientFirstName'), get(call, 'patientLastName')].filter(Boolean).join(' ') || 'לא ידוע'}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{get(call, 'patientId') || '—'}</td>
                        <td className="px-4 py-3 text-gray-500">{get(call, 'callType') || '—'}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(call.updatedAt)}</td>
                        <td className="px-4 py-3"><SyncBadge call={call} /></td>
                        <td className="px-4 py-3">
                          <Link href={`/calls/${call.id}`} className="text-[#2E75B6] hover:underline text-xs">פתח</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* ── TAB: יומן פעולות ── */}
      {!loading && tab === 'audit' && (
        <>
          {filteredAudit.length === 0 && (
            <div className="text-center py-20 space-y-3">
              <ClipboardList size={48} className="mx-auto text-gray-300" />
              <p className="text-gray-500 font-medium">{query ? 'לא נמצאו תוצאות' : 'יומן הפעולות ריק'}</p>
              <p className="text-xs text-gray-400">פעולות כמו שמירת טיוטה, הגשת קריאה והורדת PDF יופיעו כאן</p>
            </div>
          )}
          {filteredAudit.length > 0 && (
            <>
              <p className="text-xs text-gray-400">{filteredAudit.length} רשומות</p>
              <div className="space-y-1">
                {filteredAudit.map(entry => (
                  <div key={entry.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-4 py-2.5 text-sm">
                    <span className="text-xs text-gray-400 font-mono shrink-0 w-32">{formatDate(entry.ts)}</span>
                    <span className="flex-1 text-gray-700">{ACTION_LABELS[entry.action] ?? entry.action}</span>
                    {entry.callId && (
                      <Link href={`/calls/${entry.callId}`}
                        className="font-mono text-xs text-[#2E75B6] hover:underline shrink-0">
                        #{entry.callId.slice(0, 8)}
                      </Link>
                    )}
                    {entry.detail && (
                      <span className="text-xs text-gray-400 truncate max-w-[200px]">{entry.detail}</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
