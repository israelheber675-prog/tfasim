'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { FormField } from '@/components/form/FormField'
import { NumberStepper } from '@/components/form/NumberStepper'
import { CHIEF_COMPLAINTS, ASSOCIATED_SYMPTOMS, PAIN_QUALITY, INJURY_MECHANISMS } from '@/lib/constants/lists'
import type { CallData } from '@/types/call'

const ONSET_OPTIONS = ['פתאומי', 'הדרגתי', 'לאחר מאמץ', 'בשינה', 'לא ידוע']
const LAST_KNOWN_WELL = ['ידוע', 'זמן ראשון שנראה בריא', 'לא ידוע']
const s = 'flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E78]'
const ta = 'flex w-full rounded-md border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E78] resize-none'

function ChipMulti({ options, value, onChange, color = 'blue' }: {
  options: readonly string[]
  value: string[]
  onChange: (v: string[]) => void
  color?: 'blue'
}) {
  const toggle = (item: string) =>
    onChange(value.includes(item) ? value.filter(x => x !== item) : [...value, item])
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button key={o} type="button" onClick={() => toggle(o)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            value.includes(o)
              ? 'bg-[#1F4E78] text-white border-[#1F4E78]'
              : 'bg-white text-gray-700 border-gray-300 hover:border-[#2E75B6]'
          }`}>{o}</button>
      ))}
    </div>
  )
}

export function Section3ChiefComplaint() {
  const { register, control, watch } = useFormContext<CallData>()
  const chiefComplaints = watch('chiefComplaint') ?? []
  const traumaMechanism = watch('traumaMechanism') ?? []

  return (
    <section aria-labelledby="s3" className="space-y-6">
      <h2 id="s3" className="text-lg font-semibold text-[#1F4E78] border-b border-[#2E75B6]/30 pb-2">
        תלונה עיקרית ותיאור האירוע
      </h2>

      {/* 4a — תלונה */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3">תלונה עיקרית</h3>
        <div className="space-y-5">

          <FormField label="תלונה עיקרית (ניתן לבחור מספר)">
            <Controller name="chiefComplaint" control={control} defaultValue={[]}
              render={({ field }) => (
                <ChipMulti options={CHIEF_COMPLAINTS}
                  value={(field.value as string[]) ?? []} onChange={field.onChange} />
              )} />
            {chiefComplaints.length > 0 && (
              <p className="text-xs text-[#1F4E78] mt-2">נבחרו: {chiefComplaints.join(' ، ')}</p>
            )}
          </FormField>

          <FormField label="תיאור הרקמה (נרטיב מקרה)" htmlFor="caseNarrative">
            <textarea id="caseNarrative" rows={4}
              placeholder="תאר את האירוע, הסיפור הרפואי, התפתחות הסימפטומים..."
              {...register('caseNarrative')} className={ta} />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="שעת הופעת הסימפטומים" htmlFor="symptomOnsetTime">
              <input id="symptomOnsetTime" type="time" {...register('symptomOnsetTime')} className={s} />
            </FormField>

            <FormField label="תאריך הופעה (אם לא היום)" htmlFor="symptomOnsetDate">
              <input id="symptomOnsetDate" type="date" {...register('symptomOnsetDate')} className={s} />
            </FormField>

            <FormField label="Last Known Well" htmlFor="lastKnownWell">
              <select id="lastKnownWell" {...register('lastKnownWell')} className={s}>
                <option value="">בחר</option>
                {LAST_KNOWN_WELL.map(x => <option key={x} value={x}>{x}</option>)}
              </select>
            </FormField>
          </div>
        </div>
      </div>

      {/* 4b — OPQRST */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3">OPQRST — הערכת כאב</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <FormField label="O — Onset: מתי ואיך התחיל?" htmlFor="opqrst_O">
            <input id="opqrst_O" type="text" placeholder="מתי / מה גרם לכאב..."
              {...register('opqrst_O')} className={s} />
          </FormField>

          <FormField label="P — Provokes: מה מחמיר / מקל?" htmlFor="opqrst_P">
            <input id="opqrst_P" type="text" placeholder="מאמץ / מנוחה / לחץ..."
              {...register('opqrst_P')} className={s} />
          </FormField>

          <FormField label="Q — Quality: אופי הכאב">
            <Controller name="opqrst_Q" control={control} defaultValue={[]}
              render={({ field }) => (
                <ChipMulti options={PAIN_QUALITY}
                  value={(field.value as string[]) ?? []} onChange={field.onChange} />
              )} />
          </FormField>

          <FormField label="R — Radiation: מקרין ל..." htmlFor="opqrst_R">
            <input id="opqrst_R" type="text" placeholder="זרוע שמאל, גב, צוואר..."
              {...register('opqrst_R')} className={s} />
          </FormField>

          <FormField label="S — Severity: עצמת כאב (0–10)">
            <Controller name="painScore" control={control}
              render={({ field }) => (
                <NumberStepper value={field.value} onChange={field.onChange}
                  min={0} max={10} step={1} vitalKey="painScale" />
              )} />
          </FormField>

          <FormField label="T — Time: כמה זמן נמשך?" htmlFor="opqrst_T">
            <input id="opqrst_T" type="text" placeholder="דקות / שעות / ימים..."
              {...register('opqrst_T')} className={s} />
          </FormField>
        </div>
      </div>

      {/* 4c — SAMPLE */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3">SAMPLE — תסמינים נלווים</h3>
        <div className="space-y-4">

          <FormField label="S — Symptoms: תסמינים נלווים">
            <Controller name="associatedSymptoms" control={control} defaultValue={[]}
              render={({ field }) => (
                <ChipMulti options={ASSOCIATED_SYMPTOMS}
                  value={(field.value as string[]) ?? []} onChange={field.onChange} />
              )} />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="L — Last meal: מתי אכל/שתה?" htmlFor="lastMealTime">
              <input id="lastMealTime" type="text" placeholder="לפני X שעות, מה..."
                {...register('lastMealTime')} className={s} />
            </FormField>

            <FormField label="E — Events: מה קרה לפני?" htmlFor="eventsLeadingUp">
              <input id="eventsLeadingUp" type="text" placeholder="מה קרה לפני הסימפטומים..."
                {...register('eventsLeadingUp')} className={s} />
            </FormField>
          </div>
        </div>
      </div>

      {/* 4d — מנגנון פציעה */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3">מנגנון פציעה (בטראומה)</h3>
        <div className="space-y-4">
          <FormField label="מנגנון פציעה (ניתן לבחור מספר)">
            <Controller name="traumaMechanism" control={control} defaultValue={[]}
              render={({ field }) => (
                <ChipMulti options={INJURY_MECHANISMS}
                  value={(field.value as string[]) ?? []} onChange={field.onChange} />
              )} />
          </FormField>

          {traumaMechanism.includes('נפילה מגובה') && (
            <FormField label="גובה נפילה משוערת (מטרים)" htmlFor="fallHeight">
              <input id="fallHeight" type="number" min={0} max={100}
                {...register('fallHeight', { valueAsNumber: true })} className={s + ' w-32'} />
            </FormField>
          )}
        </div>
      </div>

    </section>
  )
}
