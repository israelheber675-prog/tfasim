'use client'

import { useEffect, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { ChevronRight, ChevronLeft, CheckCircle2, Save } from 'lucide-react'
import { useCallStore } from '@/stores/callStore'
import { useAutosave } from '@/hooks/useAutosave'
import { useOffline } from '@/hooks/useOffline'
import { useFormProgress } from '@/hooks/useFormProgress'
import { db, auditLog } from '@/lib/offline/db'
import { enqueueUpsert, syncAll } from '@/lib/offline/sync'
import { toast } from '@/lib/toast'
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
  const { stepResults, overall } = useFormProgress(data)
  const [step, setStep] = useState(1)
  const [visited, setVisited] = useState<Set<number>>(new Set([1]))
  const [saved, setSaved] = useState(false)
  useAutosave()

  const methods = useForm<CallData>({ defaultValues: data, mode: 'onBlur' })
  const { handleSubmit, watch, reset, setValue, formState: { isSubmitting } } = methods

  useEffect(() => {
    initNewCall()
  }, [initNewCall])

  useEffect(() => {
    if (callId) auditLog('call_created', callId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callId])

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
    auditLog('call_draft_saved', callId)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function onSubmit(values: CallData) {
    if (!callId) return

    // Auto-set form close time
    values.formClosedTime = values.formClosedTime || nowTime()
    setValue('formClosedTime', values.formClosedTime)

    await db.calls.put({
      id: callId,
      data: values as Record<string, unknown>,
      updatedAt: Date.now(),
      synced: false,
    })
    await enqueueUpsert(callId, values as Record<string, unknown>)
    auditLog('call_submitted', callId)

    // סנכרון מיידי אם מחובר
    if (isOnline) {
      try { await syncAll() } catch { /* ברקע */ }
    }

    // שליחת מייל למטופל אם הוזנה כתובת
    const email = values.patientEmail
    if (email && isOnline) {
      try {
        const patientName = [values.patientFirstName, values.patientLastName].filter(Boolean).join(' ')
        const res = await fetch('/api/email/send-pcr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callId,
            data: values,
            recipientEmail: email,
            patientName,
          }),
        })
        const result = await res.json() as { success?: boolean; message?: string; error?: string }
        if (result.success) {
          toast.success(isOnline ? `הקריאה נשמרה! PDF נשלח ל-${email}` : `נשמר מקומית. PDF נשלח ל-${email}`)
          return
        }
      } catch {
        // אם המייל נכשל — לא עוצרים
      }
    }

    toast.success(isOnline ? 'הקריאה נשמרה וסונכרנה!' : 'הקריאה נשמרה — תסונכרן כשיחזור חיבור')
  }

  function goTo(n: number) {
    setStep(n)
    setVisited(prev => new Set([...prev, n]))
  }
  function goNext() { goTo(Math.min(step + 1, STEPS.length)) }
  function goPrev() { goTo(Math.max(step - 1, 1)) }

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
        {/* Overall progress bar */}
        <div className="flex items-center gap-2 mb-1">
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${overall}%`,
                background: overall >= 80 ? '#22c55e' : overall >= 40 ? '#1F4E78' : '#94a3b8'
              }}
            />
          </div>
          <span className="text-xs text-gray-400 shrink-0 w-8 text-left">{overall}%</span>
        </div>

        {/* Step pills — scrollable on mobile */}
        <div className="overflow-x-auto">
          <div className="flex gap-1 min-w-max mt-2">
            {STEPS.map(s => {
              const isCurrent = s.id === step
              const wasVisited = visited.has(s.id) && !isCurrent
              const stepPct = stepResults.find(r => r.step === s.id)?.pct ?? 0
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goTo(s.id)}
                  title={`${s.label} — ${stepPct}%`}
                  className={`relative px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                    isCurrent
                      ? 'bg-[#1F4E78] text-white'
                      : wasVisited && stepPct === 100
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : wasVisited
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {wasVisited && stepPct === 100 ? '✓ ' : ''}{s.shortLabel}
                </button>
              )
            })}
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
