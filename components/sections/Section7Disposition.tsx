'use client'

import { useFormContext } from 'react-hook-form'
import { FormField } from '@/components/form/FormField'
import { EVACUATION_STATUS, HOSPITALS, HOSPITAL_DEPARTMENTS, TRIAGE_COLORS } from '@/lib/constants/lists'
import type { CallData } from '@/types/call'

export function Section7Disposition() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<CallData>()
  const evacuationStatus = watch('evacuationStatus')
  const triageColor = watch('triageColor')

  const isTransported = evacuationStatus?.startsWith('transported')

  return (
    <section aria-labelledby="section7-heading" className="space-y-5">
      <h2 id="section7-heading" className="text-lg font-semibold text-[#1F4E78] border-b border-[#2E75B6]/30 pb-2">
        פינוי וסיום קריאה
      </h2>

      {/* Evacuation status */}
      <FormField label="סטטוס פינוי" required htmlFor="evacuationStatus" error={errors.evacuationStatus?.message}>
        <select
          id="evacuationStatus"
          {...register('evacuationStatus', { required: 'שדה חובה' })}
          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">בחר סטטוס</option>
          {EVACUATION_STATUS.map((e) => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
      </FormField>

      {/* Hospital fields — only if transported */}
      {isTransported && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="בית חולים" htmlFor="hospital">
            <select
              id="hospital"
              {...register('hospital')}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">בחר בית חולים</option>
              {HOSPITALS.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </FormField>

          <FormField label="מחלקה" htmlFor="hospitalDepartment">
            <select
              id="hospitalDepartment"
              {...register('hospitalDepartment')}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">בחר מחלקה</option>
              {HOSPITAL_DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </FormField>
        </div>
      )}

      {/* Triage */}
      <FormField label="טריאז׳">
        <div className="flex flex-wrap gap-3">
          {TRIAGE_COLORS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setValue('triageColor', t.value, { shouldDirty: true })}
              style={{
                borderColor: t.color,
                backgroundColor: triageColor === t.value ? t.color : 'transparent',
                color: triageColor === t.value ? '#fff' : t.color,
              }}
              className="px-4 py-2 rounded-md border-2 text-sm font-semibold transition-colors"
            >
              {t.label}
            </button>
          ))}
        </div>
        <input type="hidden" {...register('triageColor')} />
      </FormField>

      {/* Handoff note */}
      <FormField label="דיווח מסירה (SBAR)" htmlFor="handoffNote">
        <textarea
          id="handoffNote"
          rows={4}
          placeholder="מצב, רקע, הערכה, המלצה..."
          {...register('handoffNote')}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
        />
      </FormField>

      {/* General notes */}
      <FormField label="הערות נוספות" htmlFor="notes">
        <textarea
          id="notes"
          rows={3}
          {...register('notes')}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
        />
      </FormField>
    </section>
  )
}
