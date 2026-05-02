'use client'

import { useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import { Camera, X } from 'lucide-react'
import { FormField } from '@/components/form/FormField'
import type { CallData } from '@/types/call'

const IMPACT_DIRECTIONS = ['חזיתי', 'אחורי', 'צידי ימין', 'צידי שמאל', 'התהפכות', 'דריסה']
const SEATBELT = ['חגור', 'ללא חגורה', 'לא ידוע', 'מושב בטיחות']
const AIRBAG = ['נפרס', 'לא נפרס', 'לא רלוונטי']
const EXTRICATION = ['כן', 'לא', 'יצא לבד']

const s = 'flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E78]'

export function Section9MVC() {
  const { register, watch, setValue } = useFormContext<CallData>()
  const isMVC = watch('isMVC')
  const extrication = watch('extrication')
  const scenePhotos: string[] = (watch('scenePhotos') as string[] | undefined) ?? []
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handlePhotoCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        const b64 = reader.result as string
        setValue('scenePhotos', [...(watch('scenePhotos') as string[] ?? []), b64], { shouldDirty: true })
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  function removePhoto(i: number) {
    const updated = scenePhotos.filter((_, idx) => idx !== i)
    setValue('scenePhotos', updated, { shouldDirty: true })
  }

  return (
    <section aria-labelledby="s9mvc" className="space-y-5">
      <h2 id="s9mvc" className="text-lg font-semibold text-[#1F4E78] border-b border-[#2E75B6]/30 pb-2">
        תאונת דרכים (MVC)
      </h2>

      <FormField label="האם מדובר בתאונת דרכים?" htmlFor="isMVC">
        <div className="flex gap-4 mt-1">
          {['כן', 'לא', 'חשד'].map(v => (
            <label key={v} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" {...register('isMVC')} value={v} className="w-4 h-4 accent-[#1F4E78]" />
              <span className="text-sm">{v}</span>
            </label>
          ))}
        </div>
      </FormField>

      {/* תמונות מהזירה — תמיד זמין */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">תמונות מהזירה</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={handlePhotoCapture}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 h-11 px-4 rounded-md border-2 border-dashed border-[#2E75B6]/40 text-sm text-[#1F4E78] hover:bg-[#DDEBF7]/40 transition-colors"
        >
          <Camera size={18} />
          צלם / בחר תמונה
        </button>
        {scenePhotos.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {scenePhotos.map((src, i) => (
              <div key={i} className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`תמונה ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-0.5 left-0.5 bg-black/60 rounded-full p-0.5 text-white hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {isMVC === 'כן' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">

          <FormField label="מס׳ אירוע משטרתי" htmlFor="policeIncidentNumber">
            <input id="policeIncidentNumber" type="text" maxLength={15}
              {...register('policeIncidentNumber')} className={s} />
          </FormField>

          <FormField label="חגורת בטיחות" htmlFor="seatbelt">
            <select id="seatbelt" {...register('seatbelt')} className={s}>
              <option value="">בחר</option>
              {SEATBELT.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </FormField>

          <FormField label="כריות אוויר" htmlFor="airbagDeployed">
            <select id="airbagDeployed" {...register('airbagDeployed')} className={s}>
              <option value="">בחר</option>
              {AIRBAG.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </FormField>

          <FormField label="נדרש חילוץ?" htmlFor="extrication">
            <div className="flex gap-4 mt-1">
              {EXTRICATION.map(v => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" {...register('extrication')} value={v} className="w-4 h-4 accent-[#1F4E78]" />
                  <span className="text-sm">{v}</span>
                </label>
              ))}
            </div>
          </FormField>

          {extrication === 'כן' && (
            <FormField label="משך חילוץ (דקות)" htmlFor="extractionTime">
              <input id="extractionTime" type="number" min={0} max={180}
                {...register('extractionTime', { valueAsNumber: true })} className={s} />
            </FormField>
          )}

          <FormField label="נזרק מהרכב?" htmlFor="ejectedFromVehicle">
            <div className="flex gap-4 mt-1">
              {['כן', 'לא'].map(v => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" {...register('ejectedFromVehicle')} value={v} className="w-4 h-4 accent-[#1F4E78]" />
                  <span className="text-sm">{v}</span>
                </label>
              ))}
            </div>
          </FormField>

          <FormField label="הרוג בזירה?" htmlFor="fatalityAtScene">
            <div className="flex gap-4 mt-1">
              {['כן', 'לא'].map(v => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" {...register('fatalityAtScene')} value={v} className="w-4 h-4 accent-[#1F4E78]" />
                  <span className="text-sm">{v}</span>
                </label>
              ))}
            </div>
          </FormField>

          <FormField label="מהירות משוערת (קמ״ש)" htmlFor="estimatedSpeed">
            <input id="estimatedSpeed" type="number" min={0} max={250}
              {...register('estimatedSpeed', { valueAsNumber: true })} className={s} />
          </FormField>

          <FormField label="כיוון הפגיעה" htmlFor="impactDirection">
            <select id="impactDirection" {...register('impactDirection')} className={s}>
              <option value="">בחר</option>
              {IMPACT_DIRECTIONS.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </FormField>

        </div>
      )}
    </section>
  )
}
