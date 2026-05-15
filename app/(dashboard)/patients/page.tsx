'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, X, User, Clock, ChevronLeft } from 'lucide-react'
import { db, type DraftCall } from '@/lib/offline/db'

type CallField = Record<string, string | number | undefined>

function get(call: DraftCall, key: string): string {
  return ((call.data as CallField)[key] ?? '') as string
}

interface PatientRecord {
  patientId: string
  firstName: string
  lastName: string
  dob: string
  age: number | string
  phone: string
  healthFund: string
  calls: Array<{ id: string; date: string; callType: string; updatedAt: number }>
}

export default function PatientsPage() {
  const [calls, setCalls] = useState<DraftCall[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    db.calls.orderBy('updatedAt').reverse().toArray().then(rows => {
      setCalls(rows)
      setLoading(false)
    })
  }, [])

  // Group calls by patient ID, building a patient registry
  const patients = useMemo<PatientRecord[]>(() => {
    const map = new Map<string, PatientRecord>()

    for (const call of calls) {
      const pid = get(call, 'patientId')
      if (!pid) continue

      const callEntry = {
        id: call.id,
        date: get(call, 'callDate'),
        callType: get(call, 'callType'),
        updatedAt: call.updatedAt,
      }

      if (map.has(pid)) {
        map.get(pid)!.calls.push(callEntry)
      } else {
        map.set(pid, {
          patientId: pid,
          firstName: get(call, 'patientFirstName'),
          lastName: get(call, 'patientLastName'),
          dob: get(call, 'patientDob'),
          age: get(call, 'patientAge'),
          phone: get(call, 'patientPhone'),
          healthFund: get(call, 'healthFund'),
          calls: [callEntry],
        })
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      const latestA = Math.max(...a.calls.map(c => c.updatedAt))
      const latestB = Math.max(...b.calls.map(c => c.updatedAt))
      return latestB - latestA
    })
  }, [calls])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return patients
    return patients.filter(p =>
      p.patientId.includes(q) ||
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.phone.includes(q)
    )
  }, [patients, query])

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1F4E78]">היסטוריית מטופלים</h1>
        <span className="text-sm text-gray-400">{patients.length} מטופלים</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="חפש לפי ת.ז., שם, טלפון..."
          className="flex h-11 w-full rounded-md border border-input bg-background pr-9 pl-9 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E78]"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        )}
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-400">טוען...</div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 space-y-2">
          <User size={40} className="mx-auto text-gray-300" />
          <p className="text-gray-400">{query ? 'לא נמצאו מטופלים' : 'אין מטופלים בהיסטוריה'}</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(patient => {
          const latest = patient.calls.reduce((a, b) => a.updatedAt > b.updatedAt ? a : b)
          return (
            <div key={patient.patientId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Patient header */}
              <div className="px-5 py-4 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#DDEBF7] flex items-center justify-center shrink-0">
                    <User size={18} className="text-[#1F4E78]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {[patient.firstName, patient.lastName].filter(Boolean).join(' ') || 'ללא שם'}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                      {patient.patientId && (
                        <span className="text-xs text-gray-500 font-mono">ת.ז. {patient.patientId}</span>
                      )}
                      {patient.dob && (
                        <span className="text-xs text-gray-500">נולד: {patient.dob}</span>
                      )}
                      {patient.age && (
                        <span className="text-xs text-gray-500">גיל {patient.age}</span>
                      )}
                      {patient.phone && (
                        <span className="text-xs text-gray-500">📞 {patient.phone}</span>
                      )}
                      {patient.healthFund && (
                        <span className="text-xs text-gray-500">🏥 {patient.healthFund}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#DDEBF7] text-[#1F4E78] text-xs font-medium px-2 py-1 rounded-full">
                    {patient.calls.length} קריאות
                  </span>
                </div>
              </div>

              {/* Calls list */}
              <div className="border-t border-gray-100 divide-y divide-gray-50">
                {patient.calls.slice(0, 5).map(call => (
                  <Link
                    key={call.id}
                    href={`/calls/${call.id}`}
                    className="flex items-center justify-between px-5 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Clock size={13} className="text-gray-400 shrink-0" />
                      <span className="text-sm text-gray-600">{call.date || formatDate(call.updatedAt)}</span>
                      {call.callType && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{call.callType}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[#2E75B6]">
                      <span className="text-xs font-mono">{call.id.slice(0, 8).toUpperCase()}</span>
                      <ChevronLeft size={14} />
                    </div>
                  </Link>
                ))}
                {patient.calls.length > 5 && (
                  <div className="px-5 py-2 text-xs text-gray-400 text-center">
                    + {patient.calls.length - 5} קריאות נוספות
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
