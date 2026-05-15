'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm, FormProvider } from 'react-hook-form'
import { ChevronRight, ChevronLeft, CheckCircle2, Save, ArrowRight, Lock } from 'lucide-react'
import { useCallStore } from '@/stores/callStore'
import { useAutosave } from '@/hooks/useAutosave'
import { useOffline } from '@/hooks/useOffline'
import { db, auditLog } from '@/lib/offline/db'
import { enqueueUpsert, syncAll } from '@/lib/offline/sync'
import type { CallData } from '@/types/call'
import { toast } from '@/lib/toast'

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

function nowTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function EditCallPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data, loadCall, setFields } = useCallStore()
  const { isOnline } = useOffline()
  const [step, setStep] = useState(1)
  const [visited, setVisited] = useState<Set<number>>(new Set([1]))
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isLocked, setIsLocked] = useState(false)
  useAutosave()

  const methods = useForm<CallData>({ defaultValues: data, mode: 'onBlur' })
  const { handleSubmit, watch, reset, setValue, formState: { isSubmitting } } = methods

  // Load existing call data
  useEffect(() => {
    db.calls.get(id).then(call => {
      if (!call) { router.push(`/calls/${id}`); return }
      // Check if locked (submitted + synced)
      if ((call.data as Record<string, unknown>).formLocked) {
        setIsLocked(true)
      }
      loadCall(id, call.data as CallData)
      reset(call.data as CallData)
      setLoading(false)
    })
  }, [id]) // eslint-disable-line

  useEffect(() => {
    const sub = watch((values) => setFields(values as Partial<CallData>))
    return () => sub.unsubscribe()
  }, [watch, setFields])

  async function saveDraft() {
    await db.calls.put({
      id,
      data: methods.getValues() as Record<string, unknown>,
      updatedAt: Date.now(),
      synced: false,
    })
    auditLog('call_draft_saved', id)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    toast.success('טיוטה נשמרה')
  }

  async function onSubmit(values: CallData) {
    values.formClosedTime = values.formClosedTime || nowTime()
    setValue('formClosedTime', values.formClosedTime)

    await db.calls.put({
      id,
      data: values as Record<string, unknown>,
      updatedAt: Date.now(),
      synced: false,
    })
    await enqueueUpsert(id, values as Record<string, unknown>)
    auditLog('call_updated', id)

    if (isOnline) {
      try { await syncAll() } catch { /* ברקע */ }
    }

    toast.success(isOnline ? 'הקריאה עודכנה וסונכרנה!' : 'הקריאה עודכנה — תסונכרן כשיחזור חיבור')
    router.push(`/calls/${id}`)
  }

  function goTo(n: number) {
    setStep(n)
    setVisited(prev => new Set([...prev, n]))
  }
  function goNext() { goTo(Math.min(step + 1, STEPS.length)) }
  function goPrev() { goTo(Math.max(step - 1, 1)) }
  const isLastStep = step === STEPS.length

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">טוען...</div>
  )

  if (isLocked) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
        <Lock size={28} className="text-amber-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-800">הקריאה נעולה</h2>
      <p className="text-sm text-gray-500">קריאה זו הוגשה ונעולה לעריכה. פנה למפקח לביטול נעילה.</p>
      <button onClick={() => router.push(`/calls/${id}`)}
        className="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-[#1F4E78] text-white text-sm hover:bg-[#2E75B6] transition-colors">
        <ArrowRight size={16} /> חזור לצפייה
      </button>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">

      {/* כותרת */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/calls/${id}`)}
            className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-gray-100">
            <ArrowRight size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#1F4E78]">עריכת קריאה</h1>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">{id.slice(0, 8)}…</p>
          </div>
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
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-[#1F4E78] rounded-full transition-all duration-300"
            style={{ width: `${(step / STEPS.length) * 100}%` }} />
        </div>
        <div className="overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {STEPS.map(s => {
              const isCurrent = s.id === step
              const wasVisited = visited.has(s.id) && !isCurrent
              return (
                <button key={s.id} type="button" onClick={() => goTo(s.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                    isCurrent ? 'bg-[#1F4E78] text-white'
                    : wasVisited ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}>
                  {wasVisited ? '✓ ' : ''}{s.shortLabel}
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
          <div className="min-h-[400px]">
            {step === 1 && <Section1EventDetails />}
            {step === 2 && <Section2PatientInfo />}
            {step === 3 && <Section3ChiefComplaint />}
            {step === 4 && <Section4MedicalHistory />}
            {step === 5 && <div className="space-y-12"><Section5PhysicalExam /><Section5Vitals /></div>}
            {step === 6 && <Section6Treatment />}
            {step === 7 && <div className="space-y-12"><Section9MVC /><Section10Childbirth /></div>}
            {step === 8 && <Section11Disposition />}
            {step === 9 && <Section12Signatures />}
          </div>

          <div className="flex justify-between items-center border-t border-gray-200 mt-8 pt-5 pb-8">
            <button type="button" onClick={goPrev} disabled={step === 1}
              className="flex items-center gap-2 h-11 px-5 rounded-md border border-input bg-background text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-40">
              <ChevronRight size={18} /> שלב קודם
            </button>
            <span className="text-xs text-gray-400 hidden sm:block">{step} / {STEPS.length}</span>
            {isLastStep ? (
              <button type="submit" disabled={isSubmitting}
                className="flex items-center gap-2 h-11 px-8 rounded-md bg-[#1F4E78] text-white text-sm font-bold hover:bg-[#2E75B6] transition-colors disabled:opacity-60">
                <CheckCircle2 size={18} />
                {isSubmitting ? 'שומר...' : 'שמור שינויים'}
              </button>
            ) : (
              <button type="button" onClick={goNext}
                className="flex items-center gap-2 h-11 px-5 rounded-md bg-[#1F4E78] text-white text-sm font-medium hover:bg-[#2E75B6] transition-colors">
                שלב הבא <ChevronLeft size={18} />
              </button>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
