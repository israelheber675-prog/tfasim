'use client'

import { useState } from 'react'
import { Calculator, X, ChevronDown, ChevronUp } from 'lucide-react'

interface Drug {
  name: string
  dosePerKg: number     // mg/kg
  maxDose: number       // mg
  concentration: number // mg/ml
  route: string
  notes?: string
}

const PEDS_DRUGS: Drug[] = [
  { name: 'אדרנלין (אנפילקסיס)', dosePerKg: 0.01, maxDose: 0.5, concentration: 1, route: 'IM', notes: '1:1000' },
  { name: 'אדרנלין (קרדיאק)', dosePerKg: 0.01, maxDose: 1, concentration: 0.1, route: 'IV/IO', notes: '1:10000' },
  { name: 'דקסמתזון', dosePerKg: 0.6, maxDose: 10, concentration: 4, route: 'IV/IM' },
  { name: 'דיפנהידרמין', dosePerKg: 1, maxDose: 50, concentration: 50, route: 'IV/IM' },
  { name: 'מידאזולם (נאזלי)', dosePerKg: 0.2, maxDose: 10, concentration: 5, route: 'Intranasal' },
  { name: 'מידאזולם IV', dosePerKg: 0.1, maxDose: 5, concentration: 1, route: 'IV' },
  { name: 'מורפין', dosePerKg: 0.1, maxDose: 5, concentration: 1, route: 'IV/IM' },
  { name: 'פנטניל', dosePerKg: 0.001, maxDose: 0.05, concentration: 0.05, route: 'IV/IN', notes: 'mg/kg (1 mcg/kg)' },
  { name: 'אמיודרון', dosePerKg: 5, maxDose: 300, concentration: 50, route: 'IV/IO' },
  { name: 'אטרופין', dosePerKg: 0.02, maxDose: 1, concentration: 0.5, route: 'IV/IO', notes: 'מינ׳ 0.1 מ"ג' },
  { name: 'גלוקוז 10%', dosePerKg: 2, maxDose: 25000, concentration: 100, route: 'IV/IO', notes: '2 ml/kg' },
  { name: 'נלוקסון', dosePerKg: 0.01, maxDose: 0.4, concentration: 0.4, route: 'IV/IM/IN' },
]

export function PedsDrugCalc() {
  const [open, setOpen] = useState(false)
  const [weight, setWeight] = useState('')

  const kg = parseFloat(weight)
  const valid = !isNaN(kg) && kg > 0 && kg <= 120

  const s = 'flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E78]'

  return (
    <div className="border border-[#2E75B6]/30 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 text-sm font-medium text-[#1F4E78] hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Calculator size={16} />
          מחשבון תרופות ילדים (לפי משקל)
        </div>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div className="p-4 space-y-4 bg-white">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 shrink-0">משקל (ק&quot;ג):</label>
            <input
              type="number"
              min={1}
              max={120}
              step={0.5}
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="למשל: 18"
              className={s + ' w-28'}
            />
            {valid && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {kg} ק&quot;ג
              </span>
            )}
          </div>

          {valid && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-3 py-2 text-right font-medium">תרופה</th>
                    <th className="px-3 py-2 text-right font-medium">מינון</th>
                    <th className="px-3 py-2 text-right font-medium">נפח</th>
                    <th className="px-3 py-2 text-right font-medium">דרך</th>
                  </tr>
                </thead>
                <tbody>
                  {PEDS_DRUGS.map((drug, i) => {
                    const dose = Math.min(drug.dosePerKg * kg, drug.maxDose)
                    const vol = dose / drug.concentration
                    const isCapped = drug.dosePerKg * kg > drug.maxDose
                    return (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-2 font-medium text-gray-800">
                          {drug.name}
                          {drug.notes && <span className="text-gray-400 font-normal ml-1">({drug.notes})</span>}
                        </td>
                        <td className={`px-3 py-2 font-mono ${isCapped ? 'text-amber-700 font-semibold' : 'text-gray-700'}`}>
                          {dose.toFixed(dose < 1 ? 3 : 1)} מ&quot;ג
                          {isCapped && <span className="text-amber-600 text-[10px] mr-1">MAX</span>}
                        </td>
                        <td className="px-3 py-2 font-mono text-[#1F4E78] font-semibold">
                          {vol.toFixed(vol < 1 ? 2 : 1)} מ&quot;ל
                        </td>
                        <td className="px-3 py-2 text-gray-500">{drug.route}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <p className="text-[10px] text-gray-400 mt-2 px-1">
                ⚠️ לפי פרוטוקול בלבד — אמת מול ספר התרופות
              </p>
            </div>
          )}

          {!valid && weight && (
            <p className="text-xs text-red-500">הזן משקל תקין (1–120 ק&quot;ג)</p>
          )}
        </div>
      )}
    </div>
  )
}
