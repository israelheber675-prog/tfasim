'use client'

import { useEffect, useState, useMemo } from 'react'
import { db, type DraftCall } from '@/lib/offline/db'
import { BarChart2, Phone, CloudOff, Cloud, AlertCircle, Users, Clock, TrendingUp, Car, Baby } from 'lucide-react'

type CallField = Record<string, unknown>

function getField(call: DraftCall, key: string): string {
  return ((call.data as CallField)[key] ?? '') as string
}

function StatCard({ label, value, sub, icon: Icon, color = 'blue' }: {
  label: string
  value: number | string
  sub?: string
  icon: React.ElementType
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple'
}) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600 border-blue-100',
    green:  'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber:  'bg-amber-50 text-amber-600 border-amber-100',
    red:    'bg-red-50 text-red-600 border-red-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
      <div className={`p-3 rounded-lg border ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function BarRow({ label, count, max, color = '#1F4E78' }: { label: string; count: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-28 shrink-0 text-right text-gray-600 truncate">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="w-7 text-left text-gray-500 font-medium shrink-0">{count}</span>
    </div>
  )
}

function last7days() {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

export default function DashboardPage() {
  const [calls, setCalls] = useState<DraftCall[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    db.calls.toArray().then(rows => { setCalls(rows); setLoading(false) })
  }, [])

  const stats = useMemo(() => {
    const total = calls.length
    const synced = calls.filter(c => c.synced).length
    const pending = calls.filter(c => !c.synced && !c.syncError).length
    const errors = calls.filter(c => !!c.syncError).length

    const byType: Record<string, number> = {}
    calls.forEach(c => {
      const t = getField(c, 'callType') || 'לא מוגדר'
      byType[t] = (byType[t] || 0) + 1
    })

    const byPriority: Record<string, number> = {}
    calls.forEach(c => {
      const p = getField(c, 'callPriority') || 'לא מוגדר'
      byPriority[p] = (byPriority[p] || 0) + 1
    })

    const mvcCount = calls.filter(c => getField(c, 'isMVC') === 'כן').length
    const birthCount = calls.filter(c => {
      const data = c.data as CallField
      return data.deliveryTime || data.motherStatus
    }).length

    const perDay: Record<string, number> = {}
    last7days().forEach(d => { perDay[d] = 0 })
    calls.forEach(c => {
      const d = getField(c, 'callDate')
      if (d && d in perDay) perDay[d]++
    })

    const dayValues = Object.values(perDay)
    const avgPerDay = dayValues.length > 0
      ? (dayValues.reduce((a, b) => a + b, 0) / dayValues.length).toFixed(1)
      : '0'

    const crewSet = new Set<string>()
    calls.forEach(c => {
      const data = c.data as CallField
      ;['driver', 'paramedic', 'emt1', 'emt2', 'volunteer1', 'volunteer2', 'doctor'].forEach(k => {
        const v = data[k] as string | undefined
        if (v?.trim()) crewSet.add(v.trim())
      })
    })

    return { total, synced, pending, errors, byType, byPriority, mvcCount, birthCount, perDay, avgPerDay, crewCount: crewSet.size }
  }, [calls])

  const maxType = Math.max(...Object.values(stats.byType), 1)
  const maxPriority = Math.max(...Object.values(stats.byPriority), 1)
  const maxDay = Math.max(...Object.values(stats.perDay), 1)

  const priorityColors: Record<string, string> = {
    'P1 — דחוף ביותר': '#ef4444',
    'P2 — דחוף': '#f97316',
    'P3 — שגרתי': '#22c55e',
    'P4 — ירוק': '#84cc16',
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">טוען...</div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8" dir="rtl">

      <div className="flex items-center gap-3">
        <BarChart2 size={24} className="text-[#1F4E78]" />
        <h1 className="text-2xl font-bold text-[#1F4E78]">דשבורד מנהל</h1>
      </div>

      {/* KPI row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="סה״כ קריאות" value={stats.total} icon={Phone} color="blue" />
        <StatCard label="מסונכרן" value={stats.synced}
          sub={`${stats.total > 0 ? Math.round(stats.synced / stats.total * 100) : 0}%`}
          icon={Cloud} color="green" />
        <StatCard label="ממתין לסנכרון" value={stats.pending} icon={CloudOff} color="amber" />
        <StatCard label="שגיאות סנכרון" value={stats.errors} icon={AlertCircle} color="red" />
      </div>

      {/* KPI row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="ממוצע ליום (7 ימים)" value={stats.avgPerDay} icon={TrendingUp} color="purple" />
        <StatCard label="תאונות דרכים" value={stats.mvcCount} icon={Car} color="amber" />
        <StatCard label="לידות בשטח" value={stats.birthCount} icon={Baby} color="green" />
        <StatCard label="אנשי צוות" value={stats.crewCount} icon={Users} color="blue" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* קריאות לפי יום */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-[#1F4E78]" />
            <h2 className="font-semibold text-gray-700">קריאות — 7 ימים אחרונים</h2>
          </div>
          <div className="space-y-2">
            {Object.entries(stats.perDay).map(([date, count]) => {
              const d = new Date(date)
              const label = d.toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'numeric' })
              return <BarRow key={date} label={label} count={count} max={maxDay} />
            })}
          </div>
        </div>

        {/* סוגי קריאות */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-700">סוגי קריאות</h2>
          {Object.keys(stats.byType).length === 0
            ? <p className="text-sm text-gray-400">אין נתונים</p>
            : (
              <div className="space-y-2">
                {Object.entries(stats.byType)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 8)
                  .map(([type, count]) => (
                    <BarRow key={type} label={type} count={count} max={maxType} />
                  ))}
              </div>
            )
          }
        </div>

        {/* דחיפות */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-700">דחיפות</h2>
          {Object.keys(stats.byPriority).length === 0
            ? <p className="text-sm text-gray-400">אין נתונים</p>
            : (
              <div className="space-y-2">
                {Object.entries(stats.byPriority)
                  .sort(([, a], [, b]) => b - a)
                  .map(([p, count]) => (
                    <BarRow key={p} label={p} count={count} max={maxPriority}
                      color={priorityColors[p] ?? '#1F4E78'} />
                  ))}
              </div>
            )
          }
        </div>

        {/* סנכרון breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-700">סטטוס סנכרון</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-emerald-600"><Cloud size={14}/> מסונכרן</span>
              <span className="font-bold text-emerald-600">{stats.synced}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-amber-600"><CloudOff size={14}/> ממתין</span>
              <span className="font-bold text-amber-600">{stats.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-red-600"><AlertCircle size={14}/> שגיאה</span>
              <span className="font-bold text-red-600">{stats.errors}</span>
            </div>
            {stats.total > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full" style={{ width: `${stats.synced / stats.total * 100}%` }} />
                  <div className="bg-amber-400 h-full" style={{ width: `${stats.pending / stats.total * 100}%` }} />
                  <div className="bg-red-500 h-full" style={{ width: `${stats.errors / stats.total * 100}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
