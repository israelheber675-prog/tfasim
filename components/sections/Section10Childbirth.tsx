'use client'

import { useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import { Camera, X } from 'lucide-react'
import { FormField } from '@/components/form/FormField'
import { NumberStepper } from '@/components/form/NumberStepper'
import type { CallData } from '@/types/call'

const MOTHER_STATUS = ['לא רלוונטי', 'לידה פעילה', 'הפלה', 'דימום', 'כיווצים', 'פוסט-פרטום']
const AMNIOTIC_COLOR = ['צלולים', 'מקוניים (ירוק)', 'דמיים', 'מעורפלים']
const CONTRACTION_INTENSITY = ['חלשים', 'בינוניים', 'חזקים']
const VAGINAL_BLEEDING = ['ללא', 'מועט', 'בינוני', 'מסיבי']
const DELIVERY_TYPE = ['לידה רגילה', 'עכוז', 'ואקום/מלקחיים', 'לאחר ניתוח קיסרי', 'אחר']
const NEWBORN_BREATHING = ['תקינה', 'לא תקינה', 'אפניאה']
const NEWBORN_TONE = ['תקין', 'ירוד', 'ללא טונוס']
const NEWBORN_COLOR = ['ורוד', 'ציאנוזיס היקפי', 'חיוור', 'ציאנוזיס מרכזי']
const NEWBORN_CRIED = ['כן', 'לא', 'בכי חלש']
const NEWBORN_ACTIONS = ['ייבוש וחימום', 'חמצן', 'BVM', 'CPR', 'אינטובציה', 'עטיפת רדיד', 'ויטמין K', 'אחר']
const PLACENTA = ['ירדה', 'לא ירדה', 'חלקית']
const POSTPARTUM_BLEEDING = ['תקין', 'מוגבר', 'פוסט-פרטום מסיבי']
const WATERS_BROKE = ['כן', 'לא', 'לא ידוע']

const s = 'flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E78]'
const ta = 'flex w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E78] resize-none'

function Radio({ name, options, reg }: { name: string; options: string[]; reg: ReturnType<typeof useFormContext>['register'] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map(v => (
        <label key={v} className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="radio" {...reg(name)} value={v} className="w-4 h-4 accent-[#1F4E78]" />
          {v}
        </label>
      ))}
    </div>
  )
}

const APGAR_OPTIONS: Record<string, [string, string, string]> = {
  color:       ['0 — כחלחל/חיוור', '1 — גוף ורוד, גפיים כחולות', '2 — ורוד לחלוטין'],
  pulse:       ['0 — ללא', '1 — מתחת ל-100', '2 — מעל 100'],
  reflex:      ['0 — ללא תגובה', '1 — עוויה', '2 — בכי / שיעול'],
  tone:        ['0 — רפוי', '1 — כיפוף חלקי', '2 — תנועה פעילה'],
  respiration: ['0 — ללא', '1 — חלשה / לא סדירה', '2 — תקינה / בכי'],
}

function ApgarField({ label, fieldName, criteriaKey, reg }: { label: string; fieldName: string; criteriaKey: string; reg: ReturnType<typeof useFormContext>['register'] }) {
  const opts = APGAR_OPTIONS[criteriaKey] ?? ['0', '1', '2']
  return (
    <div className="flex flex-col gap-1 min-w-[160px]">
      <span className="text-xs font-medium text-gray-600">{label}</span>
      <select {...reg(fieldName, { valueAsNumber: true })}
        className="h-11 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E78]">
        <option value="">—</option>
        {opts.map((o, i) => <option key={i} value={i}>{o}</option>)}
      </select>
    </div>
  )
}

function ApgarBlock({ minute, suffix, watch: w }: { minute: string; suffix: string; watch: ReturnType<typeof useFormContext>['watch'] }) {
  const { register } = useFormContext<CallData>()
  const total = [
    w(`apgarColor${suffix}` as keyof CallData) ?? 0,
    w(`apgarPulse${suffix}` as keyof CallData) ?? 0,
    w(`apgarReflex${suffix}` as keyof CallData) ?? 0,
    w(`apgarTone${suffix}` as keyof CallData) ?? 0,
    w(`apgarRespiration${suffix}` as keyof CallData) ?? 0,
  ].reduce((a: number, b: unknown) => a + (Number(b) || 0), 0)

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 mb-3">APGAR — דקה {minute}</h3>
      <div className="flex flex-wrap gap-3 items-end">
        <ApgarField label="צבע"    fieldName={`apgarColor${suffix}`}       criteriaKey="color"       reg={register} />
        <ApgarField label="דופק"   fieldName={`apgarPulse${suffix}`}       criteriaKey="pulse"       reg={register} />
        <ApgarField label="תגובה"  fieldName={`apgarReflex${suffix}`}      criteriaKey="reflex"      reg={register} />
        <ApgarField label="טונוס"  fieldName={`apgarTone${suffix}`}        criteriaKey="tone"        reg={register} />
        <ApgarField label="נשימה"  fieldName={`apgarRespiration${suffix}`} criteriaKey="respiration" reg={register} />
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-600">סיכום</span>
          <div className={`h-11 w-16 flex items-center justify-center rounded-md border-2 text-xl font-bold ${
            total >= 7 ? 'border-emerald-400 text-emerald-700 bg-emerald-50'
            : total >= 4 ? 'border-amber-400 text-amber-700 bg-amber-50'
            : 'border-red-400 text-red-700 bg-red-50'
          }`}>{total}</div>
        </div>
      </div>
    </div>
  )
}

export function Section10Childbirth() {
  const { register, watch, setValue } = useFormContext<CallData>()
  const motherStatus = watch('motherStatus')
  const watersBroke = watch('watersBroke')
  const babyPhotos: string[] = (watch('babyStickerPhotos') as string[] | undefined) ?? []
  const babyPhotoRef = useRef<HTMLInputElement>(null)

  const isActive = motherStatus && motherStatus !== 'לא רלוונטי'

  function handleBabyPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        const b64 = reader.result as string
        setValue('babyStickerPhotos', [...(watch('babyStickerPhotos') as string[] ?? []), b64], { shouldDirty: true })
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  function removeBabyPhoto(i: number) {
    setValue('babyStickerPhotos', babyPhotos.filter((_, idx) => idx !== i), { shouldDirty: true })
  }

  return (
    <section aria-labelledby="s10cb" className="space-y-6">
      <h2 id="s10cb" className="text-lg font-semibold text-[#1F4E78] border-b border-[#2E75B6]/30 pb-2">
        לידה וילוד
      </h2>

      <FormField label="מצב היולדת בהגעה" htmlFor="motherStatus">
        <select id="motherStatus" {...register('motherStatus')} className={s}>
          <option value="">בחר</option>
          {MOTHER_STATUS.map(x => <option key={x} value={x}>{x}</option>)}
        </select>
      </FormField>

      {isActive && (
        <>
          {/* 9a — פרטי לידה */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-3">מצב היולדת</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-5">

              <FormField label="שבוע הריון" htmlFor="pregnancyWeeks">
                <input id="pregnancyWeeks" type="number" min={20} max={42}
                  {...register('pregnancyWeeks', { valueAsNumber: true })} className={s} />
              </FormField>

              <FormField label="גרבידה (סה״כ הריונות)" htmlFor="gravida">
                <input id="gravida" type="number" min={1} max={20}
                  {...register('gravida', { valueAsNumber: true })} className={s} />
              </FormField>

              <FormField label="פארה (מספר לידות)" htmlFor="para">
                <input id="para" type="number" min={0} max={20}
                  {...register('para', { valueAsNumber: true })} className={s} />
              </FormField>

              <FormField label="שבירת מים">
                <Radio name="watersBroke" options={WATERS_BROKE} reg={register} />
              </FormField>

              {watersBroke === 'כן' && (
                <>
                  <FormField label="שעת שבירת מים" htmlFor="watersBrokeTime">
                    <input id="watersBrokeTime" type="time" {...register('watersBrokeTime')} className={s} />
                  </FormField>

                  <FormField label="צבע מי שפיר" htmlFor="amnioticFluidColor">
                    <select id="amnioticFluidColor" {...register('amnioticFluidColor')} className={s}>
                      <option value="">בחר</option>
                      {AMNIOTIC_COLOR.map(x => <option key={x} value={x}>{x}</option>)}
                    </select>
                  </FormField>
                </>
              )}

              <FormField label="תדירות כיווצים (דקות)">
                <NumberStepper value={watch('contractionInterval')}
                  onChange={v => setValue('contractionInterval', v)} min={1} max={30} step={1} />
              </FormField>

              <FormField label="עצמת כיווצים" htmlFor="contractionIntensity">
                <select id="contractionIntensity" {...register('contractionIntensity')} className={s}>
                  <option value="">בחר</option>
                  {CONTRACTION_INTENSITY.map(x => <option key={x} value={x}>{x}</option>)}
                </select>
              </FormField>

              <FormField label="דימום נרתיקי" htmlFor="vaginalBleeding">
                <select id="vaginalBleeding" {...register('vaginalBleeding')} className={s}>
                  <option value="">בחר</option>
                  {VAGINAL_BLEEDING.map(x => <option key={x} value={x}>{x}</option>)}
                </select>
              </FormField>

              <FormField label="שעת הלידה" htmlFor="deliveryTime">
                <input id="deliveryTime" type="time" {...register('deliveryTime')} className={s} />
              </FormField>

              <FormField label="סוג הלידה" htmlFor="deliveryType">
                <select id="deliveryType" {...register('deliveryType')} className={s}>
                  <option value="">בחר</option>
                  {DELIVERY_TYPE.map(x => <option key={x} value={x}>{x}</option>)}
                </select>
              </FormField>

            </div>
          </div>

          {/* 9b — מדדי ילוד */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-3">הערכת ילוד</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-5">

              <FormField label="מין הילוד" htmlFor="newbornSex">
                <div className="flex gap-4 mt-1">
                  {['זכר', 'נקבה'].map(v => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="radio" {...register('newbornSex')} value={v} className="w-4 h-4 accent-[#1F4E78]" />
                      {v}
                    </label>
                  ))}
                </div>
              </FormField>

              <FormField label="זמן הערכה" htmlFor="newbornVitalsTime">
                <input id="newbornVitalsTime" type="time" {...register('newbornVitalsTime')} className={s} />
              </FormField>

              <FormField label="דופק (לדקה)">
                <NumberStepper value={watch('newbornHeartRate')}
                  onChange={v => setValue('newbornHeartRate', v)}
                  min={0} max={220} step={5} defaultValue={140} />
              </FormField>

              <FormField label="נשימות (לדקה)">
                <NumberStepper value={watch('newbornRespRate')}
                  onChange={v => setValue('newbornRespRate', v)}
                  min={0} max={80} step={2} defaultValue={40} />
              </FormField>

              <FormField label="SpO₂ (%)">
                <NumberStepper value={watch('newbornSpo2')}
                  onChange={v => setValue('newbornSpo2', v)}
                  min={0} max={100} step={1} vitalKey="spo2" />
              </FormField>

              <FormField label="נשימה">
                <Radio name="newbornBreathing" options={NEWBORN_BREATHING} reg={register} />
              </FormField>

              <FormField label="טונוס שרירים">
                <Radio name="newbornTone" options={NEWBORN_TONE} reg={register} />
              </FormField>

              <FormField label="צבע">
                <Radio name="newbornColor" options={NEWBORN_COLOR} reg={register} />
              </FormField>

              <FormField label="בכה מיד אחרי הלידה?">
                <Radio name="newbornCried" options={NEWBORN_CRIED} reg={register} />
              </FormField>

            </div>
          </div>

          {/* 9c — APGAR */}
          <div className="space-y-6">
            <ApgarBlock minute="1"  suffix="1"  watch={watch} />
            <ApgarBlock minute="5"  suffix="5"  watch={watch} />
            <ApgarBlock minute="10" suffix="10" watch={watch} />
          </div>

          {/* 9d — פעולות על הילוד */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-3">פעולות על הילוד</h3>
            <div className="flex flex-wrap gap-3">
              {NEWBORN_ACTIONS.map(v => (
                <label key={v} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" {...register('newbornActions')} value={v}
                    className="w-4 h-4 accent-[#1F4E78]" />
                  {v}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="שליה ירדה?" htmlFor="placentaDelivered">
              <select id="placentaDelivered" {...register('placentaDelivered')} className={s}>
                <option value="">בחר</option>
                {PLACENTA.map(x => <option key={x} value={x}>{x}</option>)}
              </select>
            </FormField>

            <FormField label="דימום אחרי לידה" htmlFor="postPartumBleeding">
              <select id="postPartumBleeding" {...register('postPartumBleeding')} className={s}>
                <option value="">בחר</option>
                {POSTPARTUM_BLEEDING.map(x => <option key={x} value={x}>{x}</option>)}
              </select>
            </FormField>
          </div>

          <FormField label="הערות על הלידה" htmlFor="deliveryNotes">
            <textarea id="deliveryNotes" rows={3}
              {...register('deliveryNotes')} className={ta} />
          </FormField>

          {/* תמונת מדבקת תינוק */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">תמונת מדבקת ילוד / צמיד</p>
            <input ref={babyPhotoRef} type="file" accept="image/*" capture="environment" multiple
              className="hidden" onChange={handleBabyPhoto} />
            <button type="button" onClick={() => babyPhotoRef.current?.click()}
              className="flex items-center gap-2 h-11 px-4 rounded-md border-2 border-dashed border-[#2E75B6]/40 text-sm text-[#1F4E78] hover:bg-[#DDEBF7]/40 transition-colors">
              <Camera size={18} /> צלם מדבקת ילוד
            </button>
            {babyPhotos.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {babyPhotos.map((src, i) => (
                  <div key={i} className="relative w-28 h-20 rounded-md overflow-hidden border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`מדבקה ${i + 1}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeBabyPhoto(i)}
                      className="absolute top-0.5 left-0.5 bg-black/60 rounded-full p-0.5 text-white hover:bg-red-600">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}
