'use client'

import { useState, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { FormField } from '@/components/form/FormField'
import { NumberStepper } from '@/components/form/NumberStepper'
import { AVPU, GCS_EYE, GCS_VERBAL, GCS_MOTOR } from '@/lib/constants/lists'
import { useCallStore } from '@/stores/callStore'
import type { CallData, VitalSet } from '@/types/call'

function nowTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function Section5Vitals() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<CallData>()
  const { addVitalSet, removeVitalSet } = useCallStore()
  const vitals = watch('vitals') ?? []

  const [draft, setDraft] = useState<VitalSet>({ time: '' })

  // Set initial time only on client to avoid hydration mismatch
  useEffect(() => {
    setDraft({ time: nowTime() })
  }, [])

  function addRow() {
    const rowToAdd = { ...draft, time: draft.time || nowTime() }
    const updated = [...vitals, rowToAdd]
    setValue('vitals', updated, { shouldDirty: true })
    addVitalSet(rowToAdd)
    setDraft({ time: nowTime() })
  }

  function removeRow(i: number) {
    const updated = vitals.filter((_, idx) => idx !== i)
    setValue('vitals', updated, { shouldDirty: true })
    removeVitalSet(i)
  }

  return (
    <section aria-labelledby="section5-heading" className="space-y-5">
      <h2 id="section5-heading" className="text-lg font-semibold text-[#1F4E78] border-b border-[#2E75B6]/30 pb-2">
        סימנים חיוניים
      </h2>

      {/* Vitals table */}
      {vitals.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-2 text-right font-medium">שעה</th>
                <th className="px-3 py-2 text-right font-medium">דופק</th>
                <th className="px-3 py-2 text-right font-medium">ל"ד</th>
                <th className="px-3 py-2 text-right font-medium">נשימה</th>
                <th className="px-3 py-2 text-right font-medium">SpO₂</th>
                <th className="px-3 py-2 text-right font-medium">גלוקוז</th>
                <th className="px-3 py-2 text-right font-medium">כאב</th>
                <th className="px-3 py-2 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {vitals.map((v, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="px-3 py-2">{v.time}</td>
                  <td className="px-3 py-2">{v.pulseRate ?? '—'}</td>
                  <td className="px-3 py-2">{v.bpSystolic && v.bpDiastolic ? `${v.bpSystolic}/${v.bpDiastolic}` : '—'}</td>
                  <td className="px-3 py-2">{v.respiratoryRate ?? '—'}</td>
                  <td className="px-3 py-2">{v.spo2 != null ? `${v.spo2}%` : '—'}</td>
                  <td className="px-3 py-2">{v.bloodGlucose ?? '—'}</td>
                  <td className="px-3 py-2">{v.painScore != null ? `${v.painScore}/10` : '—'}</td>
                  <td className="px-3 py-2">
                    <button type="button" onClick={() => removeRow(i)} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New vital row */}
      <div className="bg-[#DDEBF7]/40 rounded-md border border-[#2E75B6]/20 p-4 space-y-4">
        <p className="text-sm font-medium text-[#1F4E78]">הוסף מדידה</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <FormField label="שעה" htmlFor="v-time">
            <input
              id="v-time"
              type="time"
              value={draft.time}
              onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </FormField>

          <FormField label="דופק (bpm)">
            <NumberStepper
              value={draft.pulseRate}
              onChange={(v) => setDraft((d) => ({ ...d, pulseRate: v }))}
              min={0} max={250} step={1}
              vitalKey="pulseRate"
            />
          </FormField>

          <FormField label="ל״ד סיסטולי">
            <NumberStepper
              value={draft.bpSystolic}
              onChange={(v) => setDraft((d) => ({ ...d, bpSystolic: v }))}
              min={0} max={1000} step={2}
              defaultValue={120}
              vitalKey="bpSystolic"
            />
          </FormField>

          <FormField label="ל״ד דיאסטולי">
            <NumberStepper
              value={draft.bpDiastolic}
              onChange={(v) => setDraft((d) => ({ ...d, bpDiastolic: v }))}
              min={0} max={1000} step={2}
              defaultValue={80}
              vitalKey="bpDiastolic"
            />
          </FormField>

          <FormField label="נשימה (rpm)">
            <NumberStepper
              value={draft.respiratoryRate}
              onChange={(v) => setDraft((d) => ({ ...d, respiratoryRate: v }))}
              min={0} max={60} step={1}
              vitalKey="respRate"
            />
          </FormField>

          <FormField label="SpO₂ (%)">
            <NumberStepper
              value={draft.spo2}
              onChange={(v) => setDraft((d) => ({ ...d, spo2: v }))}
              min={0} max={100} step={1}
              vitalKey="spo2"
            />
          </FormField>

          <FormField label="גלוקוז (mg/dL)">
            <NumberStepper
              value={draft.bloodGlucose}
              onChange={(v) => setDraft((d) => ({ ...d, bloodGlucose: v }))}
              min={0} max={600} step={5}
              vitalKey="bloodGlucose"
            />
          </FormField>

          <FormField label="כאב (0–10)">
            <NumberStepper
              value={draft.painScore}
              onChange={(v) => setDraft((d) => ({ ...d, painScore: v }))}
              min={0} max={10} step={1}
              vitalKey="painScale"
            />
          </FormField>
        </div>

        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-2 h-11 px-5 rounded-md bg-[#1F4E78] text-white text-sm font-medium hover:bg-[#2E75B6] transition-colors"
        >
          <Plus size={16} />
          הוסף מדידה
        </button>
      </div>

      {/* Consciousness */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="AVPU" htmlFor="avpu">
          <select
            id="avpu"
            {...register('avpu')}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">בחר</option>
            {AVPU.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </FormField>

        <FormField label="אישונים" htmlFor="pupils">
          <select
            id="pupils"
            {...register('pupils')}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">בחר</option>
            {['שווים ומגיבים', 'שווים לא מגיבים', 'לא שווים', 'מיוזיס', 'מידריאזיס'].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </FormField>
      </div>

      {/* GCS */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Glasgow Coma Scale (GCS)</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="עיניים (E)" htmlFor="gcsEye">
            <select id="gcsEye" {...register('gcsEye', { valueAsNumber: true })}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">בחר</option>
              {GCS_EYE.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </FormField>

          <FormField label="דיבור (V)" htmlFor="gcsVerbal">
            <select id="gcsVerbal" {...register('gcsVerbal', { valueAsNumber: true })}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">בחר</option>
              {GCS_VERBAL.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </FormField>

          <FormField label="תנועה (M)" htmlFor="gcsMotor">
            <select id="gcsMotor" {...register('gcsMotor', { valueAsNumber: true })}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">בחר</option>
              {GCS_MOTOR.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </FormField>
        </div>
      </div>
    </section>
  )
}
