'use client'

import { useEffect, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { ChevronRight, ChevronLeft, CheckCircle2, Save } from 'lucide-react'
import { useCallStore } from '@/stores/callStore'
import { useAutosave } from '@/hooks/useAutosave'
import { useOffline } from '@/hooks/useOffline'
import { db } from '@/lib/offline/db'
import { enqueueUpsert, syncAll } from '@/lib/offline/sync'
import type { CallData } from '@/types/call'

import { Section1EventDetails } from '@/components/sections/Section1EventDetails'
import { Section2PatientInfo } from '@/components/sections/Section2PatientInfo'
import { Section3ChiefComplaint } from '@/components/sections/Section3ChiefComplaint'
import { Section4MedicalHistory } from '@/components/sections/Section4MedicalHistory'
import { Section5PhysicalExam } from '@/components/sections/Section5PhysicalExam'
import { Section5Vitals } from '@/components/sections/Section5Vitals'
import { Section6Treatment } from '@/components/sections/Section6Treatment'
import { Section9MVC } from '@/components/sections/Section9MVC'
import { Section10Childbirth } from '@/components/sections/Section10Childbirth'
import { Section11Disposition } from '@/components/sections/Section11Disposition'
import { Section12Signatures } from '@/components/sections/Section12Signatures'

function nowTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const STEPS = [
  { id: 1, label: 'פרטי האירוע',    shortLabel: 'אירוע' },
  { id: 2, label: 'פרטי מטופל',     shortLabel: 'מטופל' },
  { id: 3, label: 'תלונה עיקרית',   shortLabel: 'תלונה' },
  { id: 4, label: 'רקע רפואי',      shortLabel: 'רפואי' },
  { id: 5, label: 'בדיקה וסימנים',  shortLabel: 'בדיקה' },
  { id: 6, label: 'טיפול',          shortLabel: 'טיפול' },
  { id: 7, label: 'תאונה / לידה',   shortLabel: 'מיוחד' },
  { id: 8, label: 'פינוי',          shortLabel: 'פינוי' },
  { id: 9, label: 'חתימות',         shortLabel: 'חתימות' },
]

export default function NewCallPage() {
  const { callId, data, initNewCall, setFields } = useCallStore()
  const { isOnline } = useOffline()
  const [step, setStep] = useState(1)
  const [saved, setSaved] = useState(false)
  useAutosave()

  const methods = useForm<CallData>({ defaultValues: data, mode: 'onBlur' })
  const { handleSubmit, watch, reset, setValue, formState: { isSubmitting } } = methods

  useEffect(() => { initNewCall() }, [initNewCall])

  useEffect(() => {
    const sub = watch((values) => setFields(values as Partial<CallData>))
    return () => sub.unsubscribe()
  }, [watch, setFields])

  useEffect(() => { reset(data) }, [callId]) // eslint-disable-line

  async function saveDraft() {
    if (!callId) return
    await db.calls.put({
      id: callId,
      data: methods.getValues() as Record<string, unknown>,
      updatedAt: Date.now(),
      synced: false,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function onSubmit(values: CallData) {
    if (!callId) return

    // Auto-set form close time
    const closeTime = nowTime()
    values.formClosedTime = values.formClosedTime || closeTime
    setValue('formClosedTime', values.formClosedTime)

    await db.calls.put({
      id: callId,
      data: values as Record<string, unknown>,
      updatedAt: Date.now(),
      synced: false,
    })
    await enqueueUpsert(callId, values as Record<string, unknown>)

    // סנכרון מיידי אם מחובר
    if (isOnline) {
      try {
        await syncAll()
      } catch {
        // נסנכרן ברקע
      }
    }

    alert(
      isOnline
        ? '✅ הקריאה נשמרה וסונכרנה בהצלחה!'
        : '💾 הקריאה נשמרה מקומית — תסונכרן אוטומטית כשיחזור חיבור לאינטרנט.'
    )
  }

  function goNext() { setStep(s => Math.min(s + 1, STEPS.length)) }
  function goPrev() { setStep(s => Math.max(s - 1, 1)) }

  const isLastStep = step === STEPS.length

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">

      {/* כותרת + אינדיקטורים */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-[#1F4E78]">קריאה חדשה</h1>
          {callId && <p className="text-xs text-gray-400 mt-0.5 font-mono">{callId.slice(0, 8)}…</p>}
        </div>
        <div className="flex items-center gap-2">
          {!isOnline && (
            <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
              לא מקוון
            </span>
          )}
          <button type="button" onClick={saveDraft}
            className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-[#2E75B6] text-[#1F4E78] text-sm hover:bg-[#DDEBF7] transition-colors">
            {saved ? <CheckCircle2 size={15} className="text-emerald-600" /> : <Save size={15} />}
            {saved ? 'נשמר!' : 'שמור טיוטה'}
          </button>
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-6">
        {/* Progress bar */}
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-[#1F4E78] rounded-full transition-all duration-300"
            style={{ width: `${(step / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Step pills — scrollable on mobile */}
        <div className="overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {STEPS.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  s.id === step
                    ? 'bg-[#1F4E78] text-white'
                    : s.id < step
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {s.id < step ? '✓ ' : ''}{s.shortLabel}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          שלב {step} מתוך {STEPS.length} — <span className="font-medium text-[#1F4E78]">{STEPS[step - 1].label}</span>
        </p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* תוכן השלב */}
          <div className="min-h-[400px]">
            {step === 1 && <Section1EventDetails />}
            {step === 2 && <Section2PatientInfo />}
            {step === 3 && <Section3ChiefComplaint />}
            {step === 4 && <Section4MedicalHistory />}
            {step === 5 && (
              <div className="space-y-12">
                <Section5PhysicalExam />
                <Section5Vitals />
              </div>
            )}
            {step === 6 && <Section6Treatment />}
            {step === 7 && (
              <div className="space-y-12">
                <Section9MVC />
                <Section10Childbirth />
              </div>
            )}
            {step === 8 && <Section11Disposition />}
            {step === 9 && <Section12Signatures />}
          </div>

          {/* ניווט */}
          <div className="flex justify-between items-center border-t border-gray-200 mt-8 pt-5 pb-8">
            <button
              type="button"
              onClick={goPrev}
              disabled={step === 1}
              className="flex items-center gap-2 h-11 px-5 rounded-md border border-input bg-background text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-40">
              <ChevronRight size={18} />
              שלב קודם
            </button>

            <span className="text-xs text-gray-400 hidden sm:block">
              {step} / {STEPS.length}
            </span>

            {isLastStep ? (
              <button type="submit" disabled={isSubmitting}
                className="flex items-center gap-2 h-11 px-8 rounded-md bg-[#1F4E78] text-white text-sm font-bold hover:bg-[#2E75B6] transition-colors disabled:opacity-60">
                <CheckCircle2 size={18} />
                {isSubmitting ? 'שומר...' : 'סיים וסנכרן'}
              </button>
            ) : (
              <button type="button" onClick={goNext}
                className="flex items-center gap-2 h-11 px-5 rounded-md bg-[#1F4E78] text-white text-sm font-medium hover:bg-[#2E75B6] transition-colors">
                שלב הבא
                <ChevronLeft size={18} />
              </button>
            )}
          </div>

        </form>
      </FormProvider>
    </div>
  )
}
