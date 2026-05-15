'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Save, ArrowRight, Loader2, AlertTriangle, Users } from 'lucide-react'
import { useMCIStore } from '@/stores/mciStore'
import { PatientCard } from './PatientCard'
import { StartGuide } from './StartGuide'
import type { TriageColor } from '@/types/call'

interface Props {
  onSaved: (id: string) => void
}

const TRIAGE_BUTTONS: { color: TriageColor; label: string; bg: string; border: string; text: string }[] = [
  { color: 'red',    label: 'אדום – מיידי',  bg: 'bg-red-600',    border: 'border-red-600',    text: 'text-white' },
  { color: 'yellow', label: 'צהוב – דחוי',   bg: 'bg-yellow-400', border: 'border-yellow-400', text: 'text-gray-900' },
  { color: 'green',  label: 'ירוק – קל',     bg: 'bg-green-500',  border: 'border-green-500',  text: 'text-white' },
  { color: 'black',  label: 'שחור – נפטר',   bg: 'bg-gray-800',   border: 'border-gray-800',   text: 'text-white' },
]

const TRIAGE_COUNT_STYLE: Record<TriageColor, string> = {
  red:    'bg-red-100 text-red-700 border-red-200',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  green:  'bg-green-100 text-green-700 border-green-200',
  black:  'bg-gray-100 text-gray-700 border-gray-200',
}

export function MCIEditor({ onSaved }: Props) {
  const router = useRouter()
  const { incident, setIncidentField, addPatient, save, saving } = useMCIStore()
  const [showStart, setShowStart] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (!incident) return null

  const patients = incident.patients
  const counts: Record<TriageColor, number> = { red: 0, yellow: 0, green: 0, black: 0 }
  patients.forEach((p) => counts[p.triageColor]++)

  async function handleSave() {
    const id = await save()
    onSaved(id)
  }

  function handleAddPatient(color: TriageColor) {
    const patient = addPatient(color)
    setExpandedId(patient.id)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-gray-100"
          >
            <ArrowRight size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1F4E78]">אירוע אמ"כ</h1>
              <p className="text-xs text-gray-400">{patients.length} נפגעים רשומים</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStart(true)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-[#2E75B6] text-[#1F4E78] text-xs font-medium hover:bg-[#DDEBF7] transition-colors"
          >
            פרוטוקול START
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 h-9 px-4 rounded-md bg-[#1F4E78] text-white text-sm font-medium hover:bg-[#2E75B6] transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            שמור
          </button>
        </div>
      </div>

      {/* Incident details */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">פרטי האירוע</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">מספר אירוע</label>
            <input
              type="text"
              value={incident.incidentNumber ?? ''}
              onChange={(e) => setIncidentField('incidentNumber', e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="למשל: 2025-001"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">תאריך</label>
            <input
              type="date"
              value={incident.date}
              onChange={(e) => setIncidentField('date', e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">שעה</label>
            <input
              type="time"
              value={incident.time}
              onChange={(e) => setIncidentField('time', e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1">מיקום</label>
            <input
              type="text"
              value={incident.location ?? ''}
              onChange={(e) => setIncidentField('location', e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="כתובת / תיאור מיקום"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">מפקד זירה</label>
            <input
              type="text"
              value={incident.commanderName ?? ''}
              onChange={(e) => setIncidentField('commanderName', e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="שם המפקד"
            />
          </div>
          <div className="col-span-full">
            <label className="block text-xs text-gray-500 mb-1">סוג אירוע</label>
            <select
              value={incident.incidentType ?? ''}
              onChange={(e) => setIncidentField('incidentType', e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">בחר סוג</option>
              {['תאונת דרכים רב-נפגעים', 'פיגוע', 'אסון טבע', 'שריפה', 'התמוטטות מבנה', 'הרעלה המונית', 'אחר'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Triage summary */}
      <div className="grid grid-cols-4 gap-2">
        {TRIAGE_BUTTONS.map(({ color, label }) => (
          <div
            key={color}
            className={`rounded-lg border p-3 text-center ${TRIAGE_COUNT_STYLE[color]}`}
          >
            <div className="text-2xl font-bold">{counts[color]}</div>
            <div className="text-xs mt-0.5 leading-tight">{label}</div>
          </div>
        ))}
      </div>

      {/* Add patient buttons */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Users size={16} />
          הוספת נפגע לפי צבע ט"ל
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TRIAGE_BUTTONS.map(({ color, label, bg, text }) => (
            <button
              key={color}
              onClick={() => handleAddPatient(color)}
              className={`flex items-center justify-center gap-2 h-12 rounded-lg font-medium text-sm ${bg} ${text} hover:opacity-90 transition-opacity`}
            >
              <Plus size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Patient cards */}
      {patients.length === 0 ? (
        <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
          <Users size={36} className="mx-auto mb-2 text-gray-300" />
          <p>לא נרשמו נפגעים עדיין</p>
          <p className="text-xs mt-1">לחץ על אחד מכפתורי הצבע למעלה כדי להוסיף נפגע</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Sort: red → yellow → green → black */}
          {['red', 'yellow', 'green', 'black'].flatMap((color) =>
            patients
              .filter((p) => p.triageColor === color)
              .map((p) => (
                <PatientCard
                  key={p.id}
                  patient={p}
                  expanded={expandedId === p.id}
                  onToggle={() => setExpandedId(expandedId === p.id ? null : p.id)}
                />
              ))
          )}
        </div>
      )}

      {/* Notes */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
        <label className="text-sm font-semibold text-gray-700">הערות כלליות לאירוע</label>
        <textarea
          value={incident.notes ?? ''}
          onChange={(e) => setIncidentField('notes', e.target.value)}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          placeholder="הערות, הוראות, תיאום עם גורמים נוספים..."
        />
      </div>

      {/* START guide modal */}
      {showStart && <StartGuide onClose={() => setShowStart(false)} />}
    </div>
  )
}
