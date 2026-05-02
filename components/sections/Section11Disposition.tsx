'use client'

import { useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import { Camera, X } from 'lucide-react'
import { FormField } from '@/components/form/FormField'
import { EVACUATION_STATUS, HOSPITALS, HOSPITAL_DEPARTMENTS, TRIAGE_COLORS, HEALTH_FUNDS } from '@/lib/constants/lists'
import type { CallData } from '@/types/call'

const EVACUATION_DESTINATIONS = ['בית חולים', 'טרם', 'מוסד רפואי', 'קופת חולים', 'הבית', 'אחר']
const HANDOFF_ROLES = ['רופא', 'אחות', 'סגן אחות', 'רופא מיון', 'אחר']

const s = 'flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E78]'
const ta = 'flex w-full rounded-md border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E78] resize-none'

export function Section11Disposition() {
  const { register, watch, setValue } = useFormContext<CallData>()
  const evacuationStatus = watch('evacuationStatus')
  const evacuationDestination = watch('evacuationDestination')
  const triageColor = watch('triageColor')
  const hospitalPhotos: string[] = (watch('hospitalStickerPhotos') as string[] | undefined) ?? []
  const hospitalPhotoRef = useRef<HTMLInputElement>(null)

  function handleHospitalPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        const b64 = reader.result as string
        setValue('hospitalStickerPhotos', [...(watch('hospitalStickerPhotos') as string[] ?? []), b64], { shouldDirty: true })
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  function removeHospitalPhoto(i: number) {
    setValue('hospitalStickerPhotos', hospitalPhotos.filter((_, idx) => idx !== i), { shouldDirty: true })
  }

  const isTransported = evacuationStatus?.startsWith('transported')
  const isHospital = evacuationDestination === 'בית חולים'
  const isHMO = evacuationDestination === 'קופת חולים'
  const isInstitution = evacuationDestination === 'מוסד רפואי'
  const isOther = evacuationDestination === 'אחר'
  const isRefusal = evacuationStatus === 'refused_transport' || evacuationStatus === 'refused_treatment'

  return (
    <section aria-labelledby="s11disp" className="space-y-6">
      <h2 id="s11disp" className="text-lg font-semibold text-[#1F4E78] border-b border-[#2E75B6]/30 pb-2">
        פינוי וסיום קריאה
      </h2>

      {/* סטטוס פינוי */}
      <FormField label="סטטוס פינוי" htmlFor="evacuationStatus">
        <select id="evacuationStatus" {...register('evacuationStatus')} className={s}>
          <option value="">בחר סטטוס</option>
          {EVACUATION_STATUS.map(e => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
      </FormField>

      {/* יעד */}
      {isTransported && (
        <div className="space-y-4">
          <FormField label="יעד הפינוי" htmlFor="evacuationDestination">
            <div className="flex flex-wrap gap-3">
              {EVACUATION_DESTINATIONS.map(v => (
                <label key={v} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" {...register('evacuationDestination')} value={v}
                    className="w-4 h-4 accent-[#1F4E78]" />
                  {v}
                </label>
              ))}
            </div>
          </FormField>

          {isHospital && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="בית חולים" htmlFor="hospital">
                <input id="hospital" type="text" list="hospital-list"
                  placeholder="הקלד לחיפוש..."
                  {...register('hospital')} className={s} />
                <datalist id="hospital-list">
                  {HOSPITALS.map(h => <option key={h} value={h} />)}
                </datalist>
              </FormField>
              <FormField label="מחלקה" htmlFor="hospitalDepartment">
                <select id="hospitalDepartment" {...register('hospitalDepartment')} className={s}>
                  <option value="">בחר</option>
                  {HOSPITAL_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </FormField>
            </div>
          )}

          {isHMO && (
            <FormField label="איזה קופת חולים?" htmlFor="hmoDestination">
              <select id="hmoDestination" {...register('hmoDestination')} className={s}>
                <option value="">בחר</option>
                {['כללית', 'מכבי', 'מאוחדת', 'לאומית'].map(x => (
                  <option key={x} value={x}>{x}</option>
                ))}
              </select>
            </FormField>
          )}

          {isInstitution && (
            <FormField label="שם המוסד הרפואי" htmlFor="institutionName">
              <input id="institutionName" type="text" {...register('institutionName')} className={s} />
            </FormField>
          )}

          {isOther && (
            <FormField label="פירוט יעד" htmlFor="otherDestinationDetail">
              <input id="otherDestinationDetail" type="text" {...register('otherDestinationDetail')} className={s} />
            </FormField>
          )}

          {/* מסירה */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="שם מקבל המטופל" htmlFor="handoffPersonName">
              <input id="handoffPersonName" type="text" {...register('handoffPersonName')} className={s} />
            </FormField>
            <FormField label="תפקיד מקבל" htmlFor="handoffPersonRole">
              <select id="handoffPersonRole" {...register('handoffPersonRole')} className={s}>
                <option value="">בחר</option>
                {HANDOFF_ROLES.map(x => <option key={x} value={x}>{x}</option>)}
              </select>
            </FormField>
            <FormField label="שעת מסירה" htmlFor="handoffTime">
              <input id="handoffTime" type="time" {...register('handoffTime')} className={s} />
            </FormField>
          </div>
        </div>
      )}

      {/* טריאז' */}
      <FormField label="טריאז׳">
        <div className="flex flex-wrap gap-3">
          {TRIAGE_COLORS.map(t => (
            <button key={t.value} type="button"
              onClick={() => setValue('triageColor', t.value, { shouldDirty: true })}
              style={{
                borderColor: t.color,
                backgroundColor: triageColor === t.value ? t.color : 'transparent',
                color: triageColor === t.value ? '#fff' : t.color,
              }}
              className="px-4 py-2 rounded-md border-2 text-sm font-bold transition-colors">
              {t.label}
            </button>
          ))}
        </div>
        <input type="hidden" {...register('triageColor')} />
      </FormField>

      {/* סירוב */}
      {isRefusal && (
        <FormField label="סיבת הסירוב" htmlFor="refusalReason">
          <textarea id="refusalReason" rows={3} {...register('refusalReason')} className={ta} />
        </FormField>
      )}

      {/* דיווח מסירה */}
      <FormField label="דיווח מסירה (SBAR)" htmlFor="handoffNote">
        <textarea id="handoffNote" rows={4}
          placeholder="Situation / Background / Assessment / Recommendation..."
          {...register('handoffNote')} className={ta} />
      </FormField>

      <FormField label="הערות נוספות" htmlFor="notes">
        <textarea id="notes" rows={3} {...register('notes')} className={ta} />
      </FormField>

      {/* תמונת מדבקת ח"ב */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">תמונת מדבקת בית חולים / צמיד</p>
        <input ref={hospitalPhotoRef} type="file" accept="image/*" capture="environment" multiple
          className="hidden" onChange={handleHospitalPhoto} />
        <button type="button" onClick={() => hospitalPhotoRef.current?.click()}
          className="flex items-center gap-2 h-11 px-4 rounded-md border-2 border-dashed border-[#2E75B6]/40 text-sm text-[#1F4E78] hover:bg-[#DDEBF7]/40 transition-colors">
          <Camera size={18} /> צלם מדבקת ח"ב
        </button>
        {hospitalPhotos.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {hospitalPhotos.map((src, i) => (
              <div key={i} className="relative w-28 h-20 rounded-md overflow-hidden border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`מדבקה ${i + 1}`} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeHospitalPhoto(i)}
                  className="absolute top-0.5 left-0.5 bg-black/60 rounded-full p-0.5 text-white hover:bg-red-600">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
