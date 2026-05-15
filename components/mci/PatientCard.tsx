'use client'

import { Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useMCIStore } from '@/stores/mciStore'
import type { MCIPatient, TriageColor } from '@/types/call'

const TRIAGE_STYLE: Record<TriageColor, { border: string; header: string; label: string }> = {
  red:    { border: 'border-red-400',    header: 'bg-red-500 text-white',       label: 'אדום – מיידי' },
  yellow: { border: 'border-yellow-400', header: 'bg-yellow-400 text-gray-900', label: 'צהוב – דחוי' },
  green:  { border: 'border-green-400',  header: 'bg-green-500 text-white',     label: 'ירוק – קל' },
  black:  { border: 'border-gray-700',   header: 'bg-gray-800 text-white',      label: 'שחור – נפטר' },
}

interface Props {
  patient: MCIPatient
  expanded: boolean
  onToggle: () => void
}

export function PatientCard({ patient, expanded, onToggle }: Props) {
  const { updatePatient, removePatient } = useMCIStore()
  const style = TRIAGE_STYLE[patient.triageColor]

  function field(key: keyof MCIPatient, value: string | number) {
    updatePatient(patient.id, { [key]: value || undefined } as Partial<MCIPatient>)
  }

  const patientLabel = patient.tagNumber || `#${patient.id.slice(0, 4).toUpperCase()}`

  return (
    <div className={`rounded-xl border-2 ${style.border} overflow-hidden bg-white`}>
      {/* Card header */}
      <div
        className={`flex items-center justify-between px-4 py-2 cursor-pointer ${style.header}`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm">{patientLabel}</span>
          {patient.name && <span className="text-sm opacity-90">{patient.name}</span>}
          <span className="text-xs opacity-75">{style.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removePatient(patient.id) }}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-black/20 transition-colors"
            title="הסר נפגע"
          >
            <Trash2 size={14} />
          </button>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Collapsed summary */}
      {!expanded && (
        <div className="px-4 py-2 text-xs text-gray-500 flex flex-wrap gap-3">
          {patient.chiefComplaint && <span>תלונה: {patient.chiefComplaint}</span>}
          {patient.pulseRate && <span>דופק: {patient.pulseRate}</span>}
          {patient.respiratoryRate && <span>נשימה: {patient.respiratoryRate}/ד׳</span>}
          {patient.spo2 && <span>SpO₂: {patient.spo2}%</span>}
          {!patient.chiefComplaint && !patient.pulseRate && (
            <span className="italic">לחץ לפרטים</span>
          )}
        </div>
      )}

      {/* Expanded form */}
      {expanded && (
        <div className="p-4 space-y-4">
          {/* Basic info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">מס׳ תג</label>
              <input
                type="text"
                defaultValue={patient.tagNumber ?? ''}
                onBlur={(e) => field('tagNumber', e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="T-001"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">שם (אם ידוע)</label>
              <input
                type="text"
                defaultValue={patient.name ?? ''}
                onBlur={(e) => field('name', e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">גיל משוער</label>
              <input
                type="number"
                defaultValue={patient.age ?? ''}
                onBlur={(e) => field('age', parseInt(e.target.value) || 0)}
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                min={0} max={120}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">מין</label>
              <select
                defaultValue={patient.sex ?? ''}
                onBlur={(e) => field('sex', e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">—</option>
                <option value="זכר">זכר</option>
                <option value="נקבה">נקבה</option>
                <option value="לא ידוע">לא ידוע</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">AVPU</label>
              <select
                defaultValue={patient.avpu ?? ''}
                onBlur={(e) => field('avpu', e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">—</option>
                <option value="A">A – ער</option>
                <option value="V">V – מגיב לקול</option>
                <option value="P">P – מגיב לכאב</option>
                <option value="U">U – חסר הכרה</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">יעד פינוי</label>
              <input
                type="text"
                defaultValue={patient.destination ?? ''}
                onBlur={(e) => field('destination', e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder='שם ח"ב'
              />
            </div>
          </div>

          {/* Vitals */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">סימנים חיוניים</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: 'pulseRate' as const,       label: 'דופק',      placeholder: 'bpm',  max: 250 },
                { key: 'respiratoryRate' as const,  label: 'נשימה',     placeholder: '/דקה', max: 60  },
                { key: 'spo2' as const,             label: 'SpO₂ (%)',  placeholder: '%',    max: 100 },
                { key: 'bpSystolic' as const,       label: 'ל"ד סיסטולי', placeholder: 'mmHg', max: 300 },
              ].map(({ key, label, placeholder, max }) => (
                <div key={key}>
                  <label className="block text-xs text-gray-500 mb-1">{label}</label>
                  <input
                    type="number"
                    defaultValue={(patient[key] as number | undefined) ?? ''}
                    onBlur={(e) => field(key, parseInt(e.target.value) || 0)}
                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    min={0} max={max} placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Injury + Treatment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">תלונה / פציעה</label>
              <textarea
                defaultValue={patient.chiefComplaint ?? ''}
                onBlur={(e) => field('chiefComplaint', e.target.value)}
                rows={2}
                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                placeholder="תיאור התלונה / הפציעה"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">טיפול שניתן</label>
              <textarea
                defaultValue={patient.treatments ?? ''}
                onBlur={(e) => field('treatments', e.target.value)}
                rows={2}
                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                placeholder="תורניקט, חבישה, חמצן..."
              />
            </div>
          </div>

          {/* Triage color change */}
          <div>
            <p className="text-xs text-gray-500 mb-2">שינוי צבע ט"ל</p>
            <div className="flex gap-2 flex-wrap">
              {(['red', 'yellow', 'green', 'black'] as TriageColor[]).map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updatePatient(patient.id, { triageColor: color })}
                  className={`h-8 px-3 rounded-full text-xs font-medium border-2 transition-all ${
                    patient.triageColor === color
                      ? `${TRIAGE_STYLE[color].header} border-transparent`
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  {TRIAGE_STYLE[color].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
