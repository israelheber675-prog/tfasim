'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, AlertTriangle, Users, ChevronLeft } from 'lucide-react'
import { db } from '@/lib/offline/db'
import type { MCIIncident, TriageColor } from '@/types/call'

const TRIAGE_LABELS: Record<TriageColor, string> = {
  red: 'אדום – מיידי',
  yellow: 'צהוב – דחוי',
  green: 'ירוק – קל',
  black: 'שחור – נפטר',
}
const TRIAGE_BG: Record<TriageColor, string> = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-400',
  green: 'bg-green-500',
  black: 'bg-gray-800',
}

function countByColor(patients: MCIIncident['patients']) {
  const c = { red: 0, yellow: 0, green: 0, black: 0 }
  patients.forEach((p) => { c[p.triageColor]++ })
  return c
}

export default function MCIListPage() {
  const [incidents, setIncidents] = useState<MCIIncident[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    db.mciIncidents.orderBy('updatedAt').reverse().toArray().then((list) => {
      setIncidents(list)
      setLoading(false)
    })
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1F4E78]">אירועי אמ"כ</h1>
            <p className="text-xs text-gray-400">Mass Casualty Incidents</p>
          </div>
        </div>
        <Link
          href="/mci/new"
          className="flex items-center gap-2 h-10 px-4 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
        >
          <Plus size={16} />
          אירוע חדש
        </Link>
      </div>

      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex items-start gap-2">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        <span>מצב אמ"כ מאפשר ניהול מספר נפגעים בו-זמנית עם פרוטוקול ט"ל START.</span>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">טוען...</div>
      ) : incidents.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Users size={40} className="mx-auto text-gray-300" />
          <p className="text-gray-400">אין אירועי אמ"כ</p>
          <Link href="/mci/new" className="inline-block text-sm text-[#2E75B6] underline">
            פתח אירוע חדש
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map((inc) => {
            const counts = countByColor(inc.patients)
            return (
              <Link
                key={inc.id}
                href={`/mci/${inc.id}`}
                className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:border-[#2E75B6]/50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800 text-sm truncate">
                      {inc.incidentNumber ? `#${inc.incidentNumber}` : 'ללא מספר'}
                    </span>
                    <span className="text-xs text-gray-400">{inc.date} {inc.time}</span>
                  </div>
                  {inc.location && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{inc.location}</p>
                  )}
                  {/* Triage color dots */}
                  <div className="flex items-center gap-2 mt-2">
                    {(Object.keys(counts) as TriageColor[]).map((color) =>
                      counts[color] > 0 ? (
                        <span
                          key={color}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white ${TRIAGE_BG[color]}`}
                        >
                          {counts[color]}
                        </span>
                      ) : null
                    )}
                    <span className="text-xs text-gray-400">
                      סה"כ {inc.patients.length} נפגעים
                    </span>
                  </div>
                </div>
                <ChevronLeft size={16} className="text-gray-400 group-hover:text-[#2E75B6] transition-colors shrink-0" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
