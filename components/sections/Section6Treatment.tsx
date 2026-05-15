'use client'

import { useState, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { Plus, Trash2, ChevronDown, ChevronUp, CheckSquare } from 'lucide-react'
import { FormField } from '@/components/form/FormField'
import { COMMON_MEDICATIONS, MED_ROUTES, OXYGEN_DELIVERY, PROCEDURES_BY_CATEGORY } from '@/lib/constants/lists'
import { useCallStore } from '@/stores/callStore'
import { PedsDrugCalc } from '@/components/form/PedsDrugCalc'
import type { CallData, MedicationGiven, Treatment } from '@/types/call'

function nowTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function Section6Treatment() {
  const { register, watch, setValue } = useFormContext<CallData>()
  const { addMedication, removeMedication, addTreatment, removeTreatment } = useCallStore()

  const medications = watch('medications_given') ?? []
  const treatments  = watch('treatments') ?? []

  const [medDraft, setMedDraft] = useState<MedicationGiven>({ time: '', name: '' })
  const [txTime, setTxTime]     = useState('')
  const [txResponse, setTxResponse] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [openCats, setOpenCats] = useState<Set<string>>(new Set())

  useEffect(() => {
    setMedDraft(d => ({ ...d, time: nowTime() }))
    setTxTime(nowTime())
  }, [])

  // ── Medications ──────────────────────────────────────────────────────────────
  function addMed() {
    if (!medDraft.name) return
    const updated = [...medications, medDraft]
    setValue('medications_given', updated, { shouldDirty: true })
    addMedication(medDraft)
    setMedDraft({ time: nowTime(), name: '' })
  }
  function removeMed(i: number) {
    setValue('medications_given', medications.filter((_, idx) => idx !== i), { shouldDirty: true })
    removeMedication(i)
  }

  // ── Procedures multi-select ──────────────────────────────────────────────────
  function toggleItem(item: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(item)) next.delete(item)
      else next.add(item)
      return next
    })
  }
  function toggleCat(cat: string) {
    setOpenCats(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }
  function selectAllInCat(cat: string) {
    const catItems = PROCEDURES_BY_CATEGORY.find(c => c.category === cat)?.items ?? []
    const allSelected = catItems.every(i => selected.has(i))
    setSelected(prev => {
      const next = new Set(prev)
      catItems.forEach(i => allSelected ? next.delete(i) : next.add(i))
      return next
    })
  }

  function addSelectedProcedures() {
    if (selected.size === 0) return
    const time = txTime || nowTime()
    const newRows: Treatment[] = Array.from(selected).map(procedure => ({
      time,
      procedure,
      response: txResponse || undefined,
    }))
    const updated = [...treatments, ...newRows]
    setValue('treatments', updated, { shouldDirty: true })
    newRows.forEach(t => addTreatment(t))
    setSelected(new Set())
    setTxResponse('')
    setTxTime(nowTime())
  }

  function removeTx(i: number) {
    setValue('treatments', treatments.filter((_, idx) => idx !== i), { shouldDirty: true })
    removeTreatment(i)
  }

  return (
    <section aria-labelledby="section6-heading" className="space-y-6">
      <h2 id="section6-heading" className="text-lg font-semibold text-[#1F4E78] border-b border-[#2E75B6]/30 pb-2">
        טיפול
      </h2>

      {/* ── חמצן ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="מתן חמצן" htmlFor="o2Delivery">
          <select id="o2Delivery" {...register('o2Delivery')}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="">לא ניתן חמצן</option>
            {OXYGEN_DELIVERY.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </FormField>
      </div>

      {/* ── תרופות ───────────────────────────────────────────── */}
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
                    <td className="px-3 py-2 font-medium">{m.name}</td>
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
                onChange={e => setMedDraft(d => ({ ...d, time: e.target.value }))}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </FormField>
            <FormField label="תרופה">
              <select value={medDraft.name}
                onChange={e => setMedDraft(d => ({ ...d, name: e.target.value }))}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">בחר</option>
                {COMMON_MEDICATIONS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </FormField>
            <FormField label="מינון">
              <input type="text" placeholder="0.5mg" value={medDraft.dose ?? ''}
                onChange={e => setMedDraft(d => ({ ...d, dose: e.target.value }))}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </FormField>
            <FormField label="מסלול">
              <select value={medDraft.route ?? ''}
                onChange={e => setMedDraft(d => ({ ...d, route: e.target.value }))}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">בחר</option>
                {MED_ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="תגובה לטיפול">
            <input type="text" placeholder="שיפור / ללא שינוי / הידרדרות..."
              value={medDraft.response ?? ''}
              onChange={e => setMedDraft(d => ({ ...d, response: e.target.value }))}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </FormField>
          <button type="button" onClick={addMed}
            className="flex items-center gap-2 h-11 px-5 rounded-md bg-[#1F4E78] text-white text-sm font-medium hover:bg-[#2E75B6] transition-colors">
            <Plus size={16} /> הוסף תרופה
          </button>
        </div>
      </div>

      {/* ── פרוצדורות — בחירה מרובה ──────────────────────────── */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">פרוצדורות שבוצעו</p>

        {/* Procedures already added */}
        {treatments.length > 0 && (
          <div className="overflow-x-auto rounded-md border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-right font-medium">שעה</th>
                  <th className="px-3 py-2 text-right font-medium">פרוצדורה</th>
                  <th className="px-3 py-2 text-right font-medium">הערה</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {treatments.map((t, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-3 py-2 font-mono text-xs">{t.time}</td>
                    <td className="px-3 py-2">{t.procedure}</td>
                    <td className="px-3 py-2 text-gray-500">{t.response ?? '—'}</td>
                    <td className="px-3 py-2">
                      <button type="button" onClick={() => removeTx(i)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Multi-select panel */}
        <div className="bg-[#DDEBF7]/40 rounded-md border border-[#2E75B6]/20 p-4 space-y-4">

          {/* Selected chips */}
          {selected.size > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-white rounded-md border border-[#2E75B6]/30">
              <span className="text-xs text-gray-500 ml-1 self-center">נבחרו:</span>
              {Array.from(selected).map(item => (
                <span key={item}
                  className="inline-flex items-center gap-1 bg-[#1F4E78] text-white text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-red-600 transition-colors"
                  onClick={() => toggleItem(item)}
                  title="לחץ להסרה"
                >
                  {item} ✕
                </span>
              ))}
            </div>
          )}

          {/* Category accordion */}
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {PROCEDURES_BY_CATEGORY.map(cat => {
              const isOpen = openCats.has(cat.category)
              const catSelectedCount = cat.items.filter(i => selected.has(i)).length
              return (
                <div key={cat.category} className="rounded-md border border-gray-200 bg-white overflow-hidden">
                  {/* Category header */}
                  <button
                    type="button"
                    onClick={() => toggleCat(cat.category)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      <span>{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {catSelectedCount > 0 && (
                        <span className="bg-[#1F4E78] text-white text-xs px-1.5 py-0.5 rounded-full">
                          {catSelectedCount}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); selectAllInCat(cat.category) }}
                        className="text-xs text-[#2E75B6] hover:text-[#1F4E78] transition-colors"
                      >
                        {cat.items.every(i => selected.has(i)) ? 'בטל הכל' : 'בחר הכל'}
                      </button>
                    </div>
                  </button>

                  {/* Items */}
                  {isOpen && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5 px-3 pb-3 pt-1">
                      {cat.items.map(item => {
                        const checked = selected.has(item)
                        return (
                          <label key={item}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors ${
                              checked
                                ? 'bg-[#1F4E78]/10 text-[#1F4E78] font-medium'
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleItem(item)}
                              className="h-4 w-4 rounded accent-[#1F4E78] shrink-0"
                            />
                            {item}
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Time + response + add button */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#2E75B6]/20">
            <FormField label="שעת ביצוע">
              <input type="time" value={txTime}
                onChange={e => setTxTime(e.target.value)}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </FormField>
            <FormField label="תגובה / הערה" className="sm:col-span-2">
              <input type="text" placeholder="שיפור / ללא שינוי / פירוט..."
                value={txResponse}
                onChange={e => setTxResponse(e.target.value)}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </FormField>
          </div>

          <button
            type="button"
            onClick={addSelectedProcedures}
            disabled={selected.size === 0}
            className="flex items-center gap-2 h-11 px-5 rounded-md bg-[#1F4E78] text-white text-sm font-medium hover:bg-[#2E75B6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckSquare size={16} />
            הוסף {selected.size > 0 ? `${selected.size} פרוצדורות` : 'פרוצדורות'}
          </button>
        </div>
      </div>

      <PedsDrugCalc />
    </section>
  )
}
