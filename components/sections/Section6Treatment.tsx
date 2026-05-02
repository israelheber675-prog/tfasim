'use client'

import { useState, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { FormField } from '@/components/form/FormField'
import { COMMON_MEDICATIONS, MED_ROUTES, OXYGEN_DELIVERY } from '@/lib/constants/lists'
import { useCallStore } from '@/stores/callStore'
import type { CallData, MedicationGiven, Treatment } from '@/types/call'

function nowTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function Section6Treatment() {
  const { register, watch, setValue } = useFormContext<CallData>()
  const { addMedication, removeMedication, addTreatment, removeTreatment } = useCallStore()

  const medications = watch('medications_given') ?? []
  const treatments = watch('treatments') ?? []

  const [medDraft, setMedDraft] = useState<MedicationGiven>({ time: '', name: '' })
  const [txDraft, setTxDraft] = useState<Treatment>({ time: '', procedure: '' })

  useEffect(() => {
    setMedDraft(d => ({ ...d, time: nowTime() }))
    setTxDraft(d => ({ ...d, time: nowTime() }))
  }, [])

  function addMed() {
    if (!medDraft.name) return
    const updated = [...medications, medDraft]
    setValue('medications_given', updated, { shouldDirty: true })
    addMedication(medDraft)
    setMedDraft({ time: nowTime(), name: '' })
  }

  function removeMed(i: number) {
    const updated = medications.filter((_, idx) => idx !== i)
    setValue('medications_given', updated, { shouldDirty: true })
    removeMedication(i)
  }

  function addTx() {
    if (!txDraft.procedure) return
    const updated = [...treatments, txDraft]
    setValue('treatments', updated, { shouldDirty: true })
    addTreatment(txDraft)
    setTxDraft({ time: nowTime(), procedure: '' })
  }

  function removeTx(i: number) {
    const updated = treatments.filter((_, idx) => idx !== i)
    setValue('treatments', updated, { shouldDirty: true })
    removeTreatment(i)
  }

  return (
    <section aria-labelledby="section6-heading" className="space-y-6">
      <h2 id="section6-heading" className="text-lg font-semibold text-[#1F4E78] border-b border-[#2E75B6]/30 pb-2">
        טיפול
      </h2>

      {/* Oxygen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="מתן חמצן" htmlFor="o2Delivery">
          <select
            id="o2Delivery"
            {...register('o2Delivery')}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">בחר</option>
            {OXYGEN_DELIVERY.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </FormField>
      </div>

      {/* Medications */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">תרופות שניתנו</p>

        {medications.length > 0 && (
          <div className="overflow-x-auto rounded-md border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-right font-medium">שעה</th>
                  <th className="px-3 py-2 text-right font-medium">תרופה</th>
                  <th className="px-3 py-2 text-right font-medium">מינון</th>
                  <th className="px-3 py-2 text-right font-medium">מסלול</th>
                  <th className="px-3 py-2 text-right font-medium">תגובה</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {medications.map((m, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-3 py-2">{m.time}</td>
                    <td className="px-3 py-2">{m.name}</td>
                    <td className="px-3 py-2">{m.dose ?? '—'}</td>
                    <td className="px-3 py-2">{m.route ?? '—'}</td>
                    <td className="px-3 py-2">{m.response ?? '—'}</td>
                    <td className="px-3 py-2">
                      <button type="button" onClick={() => removeMed(i)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="bg-[#DDEBF7]/40 rounded-md border border-[#2E75B6]/20 p-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <FormField label="שעה">
              <input type="time" value={medDraft.time}
                onChange={(e) => setMedDraft((d) => ({ ...d, time: e.target.value }))}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </FormField>

            <FormField label="תרופה">
              <select value={medDraft.name}
                onChange={(e) => setMedDraft((d) => ({ ...d, name: e.target.value }))}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">בחר</option>
                {COMMON_MEDICATIONS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </FormField>

            <FormField label="מינון">
              <input type="text" placeholder="למשל: 0.5mg"
                value={medDraft.dose ?? ''}
                onChange={(e) => setMedDraft((d) => ({ ...d, dose: e.target.value }))}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </FormField>

            <FormField label="מסלול">
              <select value={medDraft.route ?? ''}
                onChange={(e) => setMedDraft((d) => ({ ...d, route: e.target.value }))}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">בחר</option>
                {MED_ROUTES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </FormField>
          </div>

          <FormField label="תגובה לטיפול">
            <input type="text" placeholder="שיפור / ללא שינוי / הידרדרות..."
              value={medDraft.response ?? ''}
              onChange={(e) => setMedDraft((d) => ({ ...d, response: e.target.value }))}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </FormField>

          <button type="button" onClick={addMed}
            className="flex items-center gap-2 h-11 px-5 rounded-md bg-[#1F4E78] text-white text-sm font-medium hover:bg-[#2E75B6] transition-colors">
            <Plus size={16} /> הוסף תרופה
          </button>
        </div>
      </div>

      {/* Procedures */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">פרוצדורות</p>

        {treatments.length > 0 && (
          <ul className="space-y-1">
            {treatments.map((t, i) => (
              <li key={i} className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2 text-sm">
                <span className="text-gray-500 ml-3">{t.time}</span>
                <span className="flex-1">{t.procedure}</span>
                {t.response && <span className="text-gray-400 mx-2">| {t.response}</span>}
                <button type="button" onClick={() => removeTx(i)} className="text-red-500 hover:text-red-700 p-1">
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="bg-[#DDEBF7]/40 rounded-md border border-[#2E75B6]/20 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="שעה">
              <input type="time" value={txDraft.time}
                onChange={(e) => setTxDraft((d) => ({ ...d, time: e.target.value }))}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </FormField>

            <FormField label="פרוצדורה" className="sm:col-span-2">
              <input type="text" placeholder="למשל: הנשמה ידנית, עצירת דימום, אינטובציה..."
                value={txDraft.procedure}
                onChange={(e) => setTxDraft((d) => ({ ...d, procedure: e.target.value }))}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </FormField>
          </div>

          <button type="button" onClick={addTx}
            className="flex items-center gap-2 h-11 px-5 rounded-md bg-[#1F4E78] text-white text-sm font-medium hover:bg-[#2E75B6] transition-colors">
            <Plus size={16} /> הוסף פרוצדורה
          </button>
        </div>
      </div>
    </section>
  )
}
