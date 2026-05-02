'use client'

import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { FormField } from '@/components/form/FormField'
import { TimeField } from '@/components/form/TimeField'
import { SHIFTS, CALL_LOCATIONS, CALL_TYPES, CALL_PRIORITIES } from '@/lib/constants/lists'
import type { CallData } from '@/types/call'

const PAYMENT_TYPES = ['מזומן', 'אשראי', 'קופ"ח', 'חברת ביטוח', 'משרד', 'לצ"ל', 'ביטוח לאומי', 'חיוב מאוחר', 'אחר']

const s = 'flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E78]'
const ta = 'flex w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E78] resize-none'

export function Section1EventDetails() {
  const { register, setValue } = useFormContext<CallData>()

  useEffect(() => {
    setValue('callDate', new Date().toISOString().split('T')[0])
  }, [setValue])

  function now() {
    const d = new Date()
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  }

  return (
    <section aria-labelledby="s1" className="space-y-6">
      <h2 id="s1" className="text-lg font-semibold text-[#1F4E78] border-b border-[#2E75B6]/30 pb-2">
        פרטי האירוע והקריאה
      </h2>

      {/* 1a — זמן ומיקום */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3">חותמות זמן</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">

          <FormField label="תאריך האירוע" htmlFor="callDate">
            <input id="callDate" type="date" {...register('callDate')} className={s} />
          </FormField>

          <FormField label="משמרת" htmlFor="shift">
            <select id="shift" {...register('shift')} className={s}>
              <option value="">בחר משמרת</option>
              {SHIFTS.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </FormField>

          <FormField label="סוג האירוע" htmlFor="callType">
            <select id="callType" {...register('callType')} className={s}>
              <option value="">בחר</option>
              {CALL_TYPES.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </FormField>

          <FormField label="דחיפות" htmlFor="callPriority">
            <select id="callPriority" {...register('callPriority')} className={s}>
              <option value="">בחר</option>
              {CALL_PRIORITIES.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
            </select>
          </FormField>

          <FormField label="מס׳ אירוע / קריאה" htmlFor="incidentNumber">
            <input id="incidentNumber" type="text" maxLength={15}
              {...register('incidentNumber')} className={s} />
          </FormField>

          <FormField label="מיקום האירוע" htmlFor="callLocation">
            <select id="callLocation" {...register('callLocation')} className={s}>
              <option value="">בחר</option>
              {CALL_LOCATIONS.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </FormField>

          <FormField label="שעת קבלת האירוע" htmlFor="callReceivedTime">
            <TimeField id="callReceivedTime" {...register('callReceivedTime')}
              onNow={() => setValue('callReceivedTime', now(), { shouldDirty: true })} />
          </FormField>

          <FormField label="שעת יציאה מהתחנה" htmlFor="departureTime">
            <TimeField id="departureTime" {...register('departureTime')}
              onNow={() => setValue('departureTime', now(), { shouldDirty: true })} />
          </FormField>

          <FormField label="שעת הגעה לזירה" htmlFor="arrivalTime">
            <TimeField id="arrivalTime" {...register('arrivalTime')}
              onNow={() => setValue('arrivalTime', now(), { shouldDirty: true })} />
          </FormField>

          <FormField label="שעת הגעה למטופל" htmlFor="patientContactTime">
            <TimeField id="patientContactTime" {...register('patientContactTime')}
              onNow={() => setValue('patientContactTime', now(), { shouldDirty: true })} />
          </FormField>

          <FormField label="שעת תחילת פינוי" htmlFor="sceneTime">
            <TimeField id="sceneTime" {...register('sceneTime')}
              onNow={() => setValue('sceneTime', now(), { shouldDirty: true })} />
          </FormField>

          <FormField label="שעת הגעה לח״ב / יעד" htmlFor="hospitalArrivalTime">
            <TimeField id="hospitalArrivalTime" {...register('hospitalArrivalTime')}
              onNow={() => setValue('hospitalArrivalTime', now(), { shouldDirty: true })} />
          </FormField>

          <FormField label="שעת סיום האירוע" htmlFor="callEndTime">
            <TimeField id="callEndTime" {...register('callEndTime')}
              onNow={() => setValue('callEndTime', now(), { shouldDirty: true })} />
          </FormField>

        </div>
      </div>

      {/* 1b — כתובת מלאה */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3">כתובת האירוע</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-5">

          <FormField label="עיר / יישוב" htmlFor="eventCity" className="sm:col-span-2">
            <input id="eventCity" type="text" placeholder="עיר" {...register('eventCity')} className={s} />
          </FormField>

          <FormField label="רחוב" htmlFor="eventStreet" className="sm:col-span-2">
            <input id="eventStreet" type="text" placeholder="רחוב" {...register('eventStreet')} className={s} />
          </FormField>

          <FormField label="מס׳ בית" htmlFor="eventHouseNumber">
            <input id="eventHouseNumber" type="text" {...register('eventHouseNumber')} className={s} />
          </FormField>

          <FormField label="כניסה / דירה / קומה" htmlFor="eventApartment" className="sm:col-span-2">
            <input id="eventApartment" type="text" {...register('eventApartment')} className={s} />
          </FormField>

          <FormField label="הערות ניווט" htmlFor="navigationNotes" className="lg:col-span-4">
            <textarea id="navigationNotes" rows={2} placeholder="כיצד להגיע / ציוני דרך..."
              {...register('navigationNotes')} className={ta} />
          </FormField>

        </div>
      </div>

      {/* 1c — צוות מטפל */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3">צוות מטפל</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">

          <FormField label="מס׳ אמבולנס" htmlFor="ambulanceNumber">
            <input id="ambulanceNumber" type="text" {...register('ambulanceNumber')} className={s} />
          </FormField>

          <FormField label="נהג אמבולנס" htmlFor="driver">
            <input id="driver" type="text" {...register('driver')} className={s} />
          </FormField>

          <FormField label="פרמדיק" htmlFor="paramedic">
            <input id="paramedic" type="text" {...register('paramedic')} className={s} />
          </FormField>

          <FormField label="חובש 1" htmlFor="emt1">
            <input id="emt1" type="text" {...register('emt1')} className={s} />
          </FormField>

          <FormField label="חובש 2" htmlFor="emt2">
            <input id="emt2" type="text" {...register('emt2')} className={s} />
          </FormField>

          <FormField label="מע״ר 1" htmlFor="volunteer1">
            <input id="volunteer1" type="text" {...register('volunteer1')} className={s} />
          </FormField>

          <FormField label="מע״ר 2" htmlFor="volunteer2">
            <input id="volunteer2" type="text" {...register('volunteer2')} className={s} />
          </FormField>

          <FormField label="רופא" htmlFor="doctor">
            <input id="doctor" type="text" {...register('doctor')} className={s} />
          </FormField>

          <FormField label="מס׳ רישיון רופא" htmlFor="doctorLicenseNumber">
            <input id="doctorLicenseNumber" type="text" {...register('doctorLicenseNumber')} className={s} />
          </FormField>

        </div>
      </div>

      {/* 1d — חיוב ותשלום */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3">פרטי חיוב</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">

          <FormField label="סוג תשלום" htmlFor="paymentType">
            <select id="paymentType" {...register('paymentType')} className={s}>
              <option value="">בחר</option>
              {PAYMENT_TYPES.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </FormField>

          <FormField label="מס׳ חשבונית" htmlFor="invoiceNumber">
            <input id="invoiceNumber" type="text" maxLength={10} {...register('invoiceNumber')} className={s} />
          </FormField>

          <FormField label="מס׳ קבלה" htmlFor="receiptNumber">
            <input id="receiptNumber" type="text" maxLength={10} {...register('receiptNumber')} className={s} />
          </FormField>

          <FormField label="מס׳ התחייבות" htmlFor="commitmentNumber">
            <input id="commitmentNumber" type="text" maxLength={15} {...register('commitmentNumber')} className={s} />
          </FormField>

          <FormField label="מס׳ התחייבות דואר" htmlFor="postalCommitmentNumber">
            <input id="postalCommitmentNumber" type="text" maxLength={15} {...register('postalCommitmentNumber')} className={s} />
          </FormField>

        </div>
      </div>

    </section>
  )
}
