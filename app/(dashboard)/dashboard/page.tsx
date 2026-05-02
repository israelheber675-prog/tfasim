'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Ambulance, FileText, CloudOff, CheckCircle2 } from 'lucide-react'
import { db } from '@/lib/offline/db'

interface Stats {
  total: number
  synced: number
  pending: number
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
}) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ total: 0, synced: 0, pending: 0 })

  useEffect(() => {
    async function load() {
      const total = await db.calls.count()
      const synced = await db.calls.where('synced').equals(1).count()
      setStats({ total, synced, pending: total - synced })
    }
    load()
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">

      <div>
        <h1 className="text-2xl font-bold text-[#1F4E78]">לוח בקרה</h1>
        <p className="text-sm text-gray-500 mt-1">ברוך הבא — הנה סיכום הפעילות</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<FileText size={22} className="text-[#1F4E78]" />}
          label="סה״כ קריאות"
          value={stats.total}
          color="bg-[#DDEBF7]"
        />
        <StatCard
          icon={<CheckCircle2 size={22} className="text-emerald-600" />}
          label="מסונכרנות"
          value={stats.synced}
          color="bg-emerald-50"
        />
        <StatCard
          icon={<CloudOff size={22} className="text-amber-600" />}
          label="ממתינות לסנכרון"
          value={stats.pending}
          color="bg-amber-50"
        />
      </div>

      {/* Quick actions */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-gray-700">פעולות מהירות</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/new-call"
            className="flex items-center gap-4 bg-[#1F4E78] text-white rounded-xl p-5 hover:bg-[#2E75B6] transition-colors"
          >
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Ambulance size={24} />
            </div>
            <div>
              <p className="font-semibold">קריאה חדשה</p>
              <p className="text-sm text-white/70">פתח טופס PCR חדש</p>
            </div>
          </Link>

          <Link
            href="/calls"
            className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-5 hover:border-[#2E75B6] hover:shadow-sm transition-all"
          >
            <div className="w-12 h-12 bg-[#DDEBF7] rounded-full flex items-center justify-center">
              <FileText size={24} className="text-[#1F4E78]" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">כל הקריאות</p>
              <p className="text-sm text-gray-500">צפה בקריאות שמורות</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
