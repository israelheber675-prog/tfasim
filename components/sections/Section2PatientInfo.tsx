'use client'

import { useFormContext } from 'react-hook-form'
import { FormField } from '@/components/form/FormField'
import { NumberStepper } from '@/components/form/NumberStepper'
import { HEALTH_FUNDS, ID_TYPES, PATIENT_SEX, CONTACT_RELATIONS, PREFERRED_LANGUAGES } from '@/lib/constants/lists'
import { useDuplicateCheck } from '@/hooks/useDuplicateCheck'
import { useCallStore } from '@/stores/callStore'
import { StickerOCR } from '@/components/form/StickerOCR'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import type { CallData } from '@/types/call'

const INSURANCE_TYPES = ['חברת ביטוח פרטית', 'ביטוח חו"ל']
const s = 'flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E78]'

export function Section2PatientInfo() {
  const { register, setValue, watch } = useFormContext<CallData>()
  const { callId } = useCallStore()
  const healthFund = watch('healthFund')
  const patientAge = watch('patientAge')
  const idType = watch('patientIdType')
  const patientId = watch('patientId')
  const duplicate = useDuplicateCheck(patientId, callId)

  function handleDobChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setValue('patientDob', val, { shouldDirty: true })
    if (val) {
      const ms = Date.now() - new Date(val).getTime()
      const age = Math.floor(ms / (365.25 * 24 * 3600 * 1000))
      setValue('patientAge', age, { shouldDirty: true })
    }
  }

  const showInsuranceExtra = INSURANCE_TYPES.some(t => healthFund?.includes(t))

  return (
    <section aria-labelledby="s2" className="space-y-6">
      <h2 id="s2" className="text-lg font-semibold text-[#1F4E78] border-b border-[#2E75B6]/30 pb-2">
        פרטי המטופל
      </h2>

      {/* אזהרת כפילות */}
      {duplicate.found && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-800">אזהרת כפילות!</p>
            <p className="text-amber-700">
              מטופל עם ת.ז. זו נמצא בקריאה אחרת מה-12 שעות האחרונות:{' '}
              <span className="font-medium">{duplicate.patientName}</span>
              {' — '}
              <Link href={`/calls/${duplicate.callId}`} className="underline hover:text-amber-900" target="_blank">
                פתח קריאה
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* 2a — זיהוי */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-500">זיהוי</h3>
          <StickerOCR onExtracted={data => {
            if (data.patientId) setValue('patientId', data.patientId, { shouldDirty: true })
            if (data.patientFirstName) setValue('patientFirstName', data.patientFirstName, { shouldDirty: true })
            if (data.patientLastName) setValue('patientLastName', data.patientLastName, { shouldDirty: true })
            if (data.patientDob) {
              setValue('patientDob', data.patientDob, { shouldDirty: true })
              const ms = Date.now() - new Date(data.patientDob).getTime()
              setValue('patientAge', Math.floor(ms / (365.25 * 24 * 3600 * 1000)), { shouldDirty: true })
            }
          }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">

          <FormField label="שם פרטי" htmlFor="patientFirstName">
            <input id="patientFirstName" type="text" placeholder="שם פרטי"
              {...register('patientFirstName')} className={s} />
          </FormField>

          <FormField label="שם משפחה" htmlFor="patientLastName">
            <input id="patientLastName" type="text" placeholder="שם משפחה"
              {...register('patientLastName')} className={s} />
          </FormField>

          <FormField label="שם האב" htmlFor="patientFatherName">
            <input id="patientFatherName" type="text"
              {...register('patientFatherName')} className={s} />
          </FormField>

          <FormField label="מין" htmlFor="patientSex">
            <select id="patientSex" {...register('patientSex')} className={s}>
              <option value="">בחר</option>
              {PATIENT_SEX.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
            </select>
          </FormField>

          <FormField label="סוג תעודה" htmlFor="patientIdType">
            <select id="patientIdType" {...register('patientIdType')} className={s}>
              <option value="">בחר</option>
              {ID_TYPES.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
            </select>
          </FormField>

          {idType === 'דרכון' ? (
            <FormField label="מספר דרכון" htmlFor="patientId" helper="2 אותיות + עד 9 ספרות">
              <input id="patientId" type="text" placeholder="AB123456789"
                maxLength={11}
                {...register('patientId', {
                  pattern: { value: /^[A-Za-z]{2}\d{1,9}$/, message: '2 אותיות ואחריהן עד 9 ספרות' },
                })}
                className={s} />
            </FormField>
          ) : (
            <FormField label="מספר תעודה" htmlFor="patientId" helper="עד 9 ספרות">
              <input id="patientId" type="text" inputMode="numeric" placeholder="000000000"
                maxLength={9}
                {...register('patientId', {
                  pattern: { value: /^\d*$/, message: 'ספרות בלבד' },
                  maxLength: { value: 9, message: 'מקסימום 9 ספרות' },
                })}
                className={s} />
            </FormField>
          )}

          <FormField label="תאריך לידה" htmlFor="patientDob">
            <input id="patientDob" type="date"
              {...register('patientDob')} onChange={handleDobChange} className={s} />
          </FormField>

          <FormField label="גיל" htmlFor="patientAge">
            <input id="patientAge" type="number" inputMode="numeric" min={0} max={130}
              {...register('patientAge', { valueAsNumber: true })} className={s + ' text-center'} />
          </FormField>

          {patientAge === 0 && (
            <FormField label="גיל בחודשים" htmlFor="patientAgeMonths">
              <input id="patientAgeMonths" type="number" inputMode="numeric" min={0} max={11}
                {...register('patientAgeMonths', { valueAsNumber: true })} className={s + ' text-center'} />
            </FormField>
          )}

          <FormField label="משקל משוערם (ק״ג)" htmlFor="patientWeight">
            <input id="patientWeight" type="number" inputMode="numeric" min={0} max={300}
              {...register('patientWeight', { valueAsNumber: true })} className={s + ' text-center'} />
          </FormField>

        </div>
      </div>

      {/* 2b — כתובת מגורים */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3">כתובת מגורים</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-5">

          <FormField label="עיר מגורים" htmlFor="patientCity" className="sm:col-span-2">
            <input id="patientCity" type="text" {...register('patientCity')} className={s} />
          </FormField>

          <FormField label="רחוב" htmlFor="patientStreet" className="sm:col-span-2">
            <input id="patientStreet" type="text" {...register('patientStreet')} className={s} />
          </FormField>

          <FormField label="מס׳ בית" htmlFor="patientHouseNumber">
            <input id="patientHouseNumber" type="text" {...register('patientHouseNumber')} className={s} />
          </FormField>

          <FormField label="דירה / כניסה / קומה" htmlFor="patientApartment">
            <input id="patientApartment" type="text" {...register('patientApartment')} className={s} />
          </FormField>

          <FormField label="ת.ד." htmlFor="patientPoBox">
            <input id="patientPoBox" type="text" maxLength={10} {...register('patientPoBox')} className={s} />
          </FormField>

          <FormField label="מיקוד" htmlFor="patientPostalCode">
            <input id="patientPostalCode" type="text" inputMode="numeric" maxLength={7}
              {...register('patientPostalCode')} className={s} />
          </FormField>

        </div>
      </div>

      {/* 2c — קשר */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3">פרטי קשר ואיש קשר לחירום</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">

          <FormField label="טלפון נייד" htmlFor="patientPhone" helper="עד 10 ספרות">
            <input id="patientPhone" type="tel" inputMode="tel" placeholder="050-0000000"
              maxLength={10} {...register('patientPhone')} className={s} />
          </FormField>

          <FormField label="טלפון נוסף / בית" htmlFor="patientPhone2">
            <input id="patientPhone2" type="tel" inputMode="tel" maxLength={10}
              {...register('patientPhone2')} className={s} />
          </FormField>

          <FormField label="דוא״ל" htmlFor="patientEmail">
            <input id="patientEmail" type="email" placeholder="user@example.com"
              {...register('patientEmail')} className={s} />
          </FormField>


        </div>
      </div>

      {/* 2d — ביטוח */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3">פרטי ביטוח</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">

          <FormField label="קופת חולים / ביטוח" htmlFor="healthFund">
            <select id="healthFund" {...register('healthFund')} className={s}>
              <option value="">בחר</option>
              {HEALTH_FUNDS.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </FormField>

          {showInsuranceExtra && (
            <>
              <FormField label="שם חברת ביטוח" htmlFor="insuranceCompany">
                <input id="insuranceCompany" type="text" {...register('insuranceCompany')} className={s} />
              </FormField>

              <FormField label="מספר פוליסה" htmlFor="policyNumber">
                <input id="policyNumber" type="text" {...register('policyNumber')} className={s} />
              </FormField>
            </>
          )}


        </div>
      </div>

    </section>
  )
}
