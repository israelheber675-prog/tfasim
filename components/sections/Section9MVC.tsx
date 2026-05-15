'use client'

import { useRef } from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { Camera, X, Plus, Trash2, Car, ChevronDown, ChevronUp } from 'lucide-react'
import { FormField } from '@/components/form/FormField'
import type { CallData } from '@/types/call'
import { useState } from 'react'

const VEHICLE_TYPES = ['רכב פרטי', 'משאית', 'אוטובוס', 'אופנוע', 'אופניים / קורקינט', 'רכב כבד', 'רכב חירום', 'הולך רגל', 'אחר']
const IMPACT_DIRECTIONS = ['חזיתי', 'אחורי', 'צידי ימין', 'צידי שמאל', 'התהפכות', 'דריסה', 'צד-צד']
const SEATBELT = ['חגור', 'ללא חגורה', 'לא ידוע', 'מושב בטיחות']
const AIRBAG = ['נפרס', 'לא נפרס', 'לא רלוונטי']
const EXTRICATION = ['כן', 'לא', 'יצא לבד']

const s = 'flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E78]'
const ta = 'flex w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E78] resize-none'

function newVehicle(): NonNullable<CallData['vehicles']>[0] {
  return { id: crypto.randomUUID() }
}

function VehicleCard({ index, remove }: { index: number; remove: () => void }) {
  const { register, watch } = useFormContext<CallData>()
  const [open, setOpen] = useState(true)
  const extrication = watch(`vehicles.${index}.extrication` as const)
  const plate = watch(`vehicles.${index}.licensePlate` as const)
  const vtype = watch(`vehicles.${index}.vehicleType` as const)

  const title = [vtype, plate].filter(Boolean).join(' — ') || `רכב ${index + 1}`

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between bg-gray-50 px-4 py-3">
        <button type="button" onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 flex-1 text-right">
          <Car size={16} className="text-[#1F4E78]" />
          {title}
          {open ? <ChevronUp size={15} className="mr-auto" /> : <ChevronDown size={15} className="mr-auto" />}
        </button>
        <button type="button" onClick={remove}
          className="mr-2 p-1.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
          <Trash2 size={15} />
        </button>
      </div>

      {open && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4">

          <FormField label="סוג רכב" htmlFor={`v${index}_type`}>
            <select id={`v${index}_type`} {...register(`vehicles.${index}.vehicleType`)} className={s}>
              <option value="">בחר</option>
              {VEHICLE_TYPES.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </FormField>

          <FormField label="לוחית רישוי" htmlFor={`v${index}_plate`}>
            <input id={`v${index}_plate`} type="text" maxLength={10}
              {...register(`vehicles.${index}.licensePlate`)} className={s} />
          </FormField>

          <FormField label="צבע הרכב" htmlFor={`v${index}_color`}>
            <input id={`v${index}_color`} type="text"
              {...register(`vehicles.${index}.color`)} className={s} />
          </FormField>

          <FormField label="כיוון הפגיעה" htmlFor={`v${index}_impact`}>
            <select id={`v${index}_impact`} {...register(`vehicles.${index}.impactDirection`)} className={s}>
              <option value="">בחר</option>
              {IMPACT_DIRECTIONS.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </FormField>

          <FormField label="מהירות משוערת (קמ״ש)" htmlFor={`v${index}_speed`}>
            <input id={`v${index}_speed`} type="number" min={0} max={250}
              {...register(`vehicles.${index}.estimatedSpeed`, { valueAsNumber: true })} className={s} />
          </FormField>

          <FormField label="מספר נוסעים" htmlFor={`v${index}_pax`}>
            <input id={`v${index}_pax`} type="number" min={0} max={60}
              {...register(`vehicles.${index}.passengerCount`, { valueAsNumber: true })} className={s} />
          </FormField>

          <FormField label="חגורת בטיחות" htmlFor={`v${index}_belt`}>
            <select id={`v${index}_belt`} {...register(`vehicles.${index}.seatbelt`)} className={s}>
              <option value="">בחר</option>
              {SEATBELT.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </FormField>

          <FormField label="כריות אוויר" htmlFor={`v${index}_airbag`}>
            <select id={`v${index}_airbag`} {...register(`vehicles.${index}.airbagDeployed`)} className={s}>
              <option value="">בחר</option>
              {AIRBAG.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </FormField>

          <FormField label="נדרש חילוץ?" htmlFor={`v${index}_extr`}>
            <div className="flex gap-4 mt-1 flex-wrap">
              {EXTRICATION.map(v => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" {...register(`vehicles.${index}.extrication`)} value={v}
                    className="w-4 h-4 accent-[#1F4E78]" />
                  <span className="text-sm">{v}</span>
                </label>
              ))}
            </div>
          </FormField>

          {extrication === 'כן' && (
            <FormField label="משך חילוץ (דקות)" htmlFor={`v${index}_extrtime`}>
              <input id={`v${index}_extrtime`} type="number" min={0} max={180}
                {...register(`vehicles.${index}.extractionTime`, { valueAsNumber: true })} className={s} />
            </FormField>
          )}

          <FormField label="נזרק מהרכב?" htmlFor={`v${index}_ejected`}>
            <div className="flex gap-4 mt-1">
              {['כן', 'לא'].map(v => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" {...register(`vehicles.${index}.ejectedFromVehicle`)} value={v}
                    className="w-4 h-4 accent-[#1F4E78]" />
                  <span className="text-sm">{v}</span>
                </label>
              ))}
            </div>
          </FormField>

          <FormField label="הערות על הרכב" htmlFor={`v${index}_notes`} className="sm:col-span-2 lg:col-span-3">
            <textarea id={`v${index}_notes`} rows={2}
              {...register(`vehicles.${index}.notes`)} className={ta} />
          </FormField>

        </div>
      )}
    </div>
  )
}

export function Section9MVC() {
  const { register, watch, setValue } = useFormContext<CallData>()
  const { fields, append, remove } = useFieldArray<CallData>({ name: 'vehicles' })
  const isMVC = watch('isMVC')
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

      {/* תמונות מהזירה */}
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
        <div className="space-y-4">
          {/* שדות כלליים לאירוע */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
            <FormField label="מס׳ אירוע משטרתי" htmlFor="policeIncidentNumber">
              <input id="policeIncidentNumber" type="text" maxLength={15}
                {...register('policeIncidentNumber')} className={s} />
            </FormField>

            <FormField label="הרוג בזירה?" htmlFor="fatalityAtScene">
              <div className="flex gap-4 mt-1">
                {['כן', 'לא'].map(v => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" {...register('fatalityAtScene')} value={v}
                      className="w-4 h-4 accent-[#1F4E78]" />
                    <span className="text-sm">{v}</span>
                  </label>
                ))}
              </div>
            </FormField>
          </div>

          {/* רשימת רכבים */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">
                רכבים מעורבים
                {fields.length > 0 && (
                  <span className="mr-2 text-xs text-gray-400 font-normal">({fields.length})</span>
                )}
              </p>
              <button
                type="button"
                onClick={() => append(newVehicle())}
                className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-[#2E75B6] text-[#1F4E78] text-sm hover:bg-[#DDEBF7] transition-colors"
              >
                <Plus size={15} />
                הוסף רכב
              </button>
            </div>

            {fields.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                <Car size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">לחץ &quot;הוסף רכב&quot; להוספת פרטי הרכבים המעורבים</p>
              </div>
            )}

            {fields.map((field, index) => (
              <VehicleCard
                key={field.id}
                index={index}
                remove={() => remove(index)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
