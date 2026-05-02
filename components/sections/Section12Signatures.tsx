'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { FormField } from '@/components/form/FormField'
import { SignaturePad } from '@/components/form/SignaturePad'
import type { CallData } from '@/types/call'

const s = 'flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E78]'

export function Section12Signatures() {
  const { register, watch, control } = useFormContext<CallData>()
  const evacuationStatus = watch('evacuationStatus')

  const isRefusalTreatment = evacuationStatus === 'refused_treatment'
  const isRefusalEvacuation = evacuationStatus === 'refused_transport'
  const guardianSigned = watch('guardianSigned')

  return (
    <section aria-labelledby="s12sigs" className="space-y-6">
      <h2 id="s12sigs" className="text-lg font-semibold text-[#1F4E78] border-b border-[#2E75B6]/30 pb-2">
        הסכמות וחתימות
      </h2>

      {/* חתימת הסכמה */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3">הסכמה לטיפול</h3>
        <Controller name="consentSignature" control={control}
          render={({ field }) => (
            <SignaturePad label="חתימת המטופל / אפוטרופוס — הסכמה לטיפול"
              value={field.value} onChange={field.onChange} />
          )} />
      </div>

      {/* סירוב טיפול */}
      {isRefusalTreatment && (
        <div className="space-y-4 bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-red-700">סירוב טיפול</h3>
          <p className="text-xs text-red-600">
            המטופל/ת מסרב/ת לטיפול. נדרשת חתימה על כתב סירוב.
          </p>
          <Controller name="refusalTreatmentSignature" control={control}
            render={({ field }) => (
              <SignaturePad label="חתימת המטופל — סירוב טיפול"
                value={field.value} onChange={field.onChange} />
            )} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <FormField label="שם העד לסירוב" htmlFor="witnessNameTreatment">
              <input id="witnessNameTreatment" type="text"
                {...register('witnessName')} className={s} />
            </FormField>
            <Controller name="witnessSignature" control={control}
              render={({ field }) => (
                <SignaturePad label="חתימת עד"
                  value={field.value} onChange={field.onChange} />
              )} />
          </div>
        </div>
      )}

      {/* סירוב פינוי */}
      {isRefusalEvacuation && (
        <div className="space-y-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-amber-700">סירוב פינוי</h3>
          <p className="text-xs text-amber-700">
            המטופל/ת מסרב/ת לפינוי לבית חולים. נדרשת חתימה על כתב סירוב.
          </p>
          <Controller name="refusalEvacuationSignature" control={control}
            render={({ field }) => (
              <SignaturePad label="חתימת המטופל — סירוב פינוי"
                value={field.value} onChange={field.onChange} />
            )} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <FormField label="שם העד לסירוב" htmlFor="witnessNameEvac">
              <input id="witnessNameEvac" type="text"
                {...register('witnessName')} className={s} />
            </FormField>
            <Controller name="witnessSignature" control={control}
              render={({ field }) => (
                <SignaturePad label="חתימת עד"
                  value={field.value} onChange={field.onChange} />
              )} />
          </div>
        </div>
      )}

      {/* אפוטרופוס */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3">חתימת אפוטרופוס (אם רלוונטי)</h3>
        <FormField label="האם אפוטרופוס חתם?">
          <div className="flex gap-4 mt-1">
            {['כן', 'לא'].map(v => (
              <label key={v} className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="radio" {...register('guardianSigned')} value={v}
                  className="w-4 h-4 accent-[#1F4E78]" />
                {v}
              </label>
            ))}
          </div>
        </FormField>

        {guardianSigned === 'כן' && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="שם האפוטרופוס" htmlFor="guardianName">
                <input id="guardianName" type="text" {...register('guardianName')} className={s} />
              </FormField>
              <FormField label="קרבה למטופל" htmlFor="guardianRelation">
                <input id="guardianRelation" type="text" {...register('guardianRelation')} className={s} />
              </FormField>
              <FormField label="ת.ז. אפוטרופוס" htmlFor="guardianId">
                <input id="guardianId" type="text" maxLength={9} {...register('guardianId')} className={s} />
              </FormField>
            </div>
            <Controller name="guardianSignature" control={control}
              render={({ field }) => (
                <SignaturePad label="חתימת אפוטרופוס"
                  value={field.value} onChange={field.onChange} />
              )} />
          </div>
        )}
      </div>

      {/* חתימות צוות */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3">חתימות אנשי הצוות</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
          <Controller name="crewLeaderSignature" control={control}
            render={({ field }) => (
              <SignaturePad label="חתימת אחראי הקריאה / בכיר"
                value={field.value} onChange={field.onChange} />
            )} />
          <FormField label="שעת סגירת הטופס" htmlFor="formClosedTime">
            <input id="formClosedTime" type="time" {...register('formClosedTime')} className={s} />
          </FormField>
        </div>
      </div>

    </section>
  )
}
