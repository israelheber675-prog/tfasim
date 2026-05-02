'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { FormField } from '@/components/form/FormField'
import { CHRONIC_CONDITIONS, MED_ALLERGIES, FOOD_ALLERGIES } from '@/lib/constants/lists'
import type { CallData } from '@/types/call'

const INFO_SOURCES = ['המטופל', 'בן משפחה', 'מסמך רפואי', 'אחר']
const ALLERGY_STATUS = ['ללא אלרגיות ידועות', 'רגישות לתרופות', 'רגישות לתרופות ומזון', 'רגישות למזון', 'רגישות אחרת', 'לא ידוע']
const ADVANCE_DIRECTIVES = ['אין', 'הוראות מקדימות', 'DNR', 'לא ידוע']
const SMOKING = ['לא מעשן', 'מעשן', 'אלכוהוליסט', 'משתמש בסמים', 'לשעבר']
const PREGNANCY_STATUS = ['לא רלוונטי', 'לא', 'כן', 'לא ידוע']

const s = 'flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E78]'
const ta = 'flex w-full rounded-md border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E78] resize-none'

function ChipMulti({ options, value, onChange }: {
  options: readonly string[]
  value: string[]
  onChange: (v: string[]) => void
}) {
  const toggle = (item: string) =>
    onChange(value.includes(item) ? value.filter(x => x !== item) : [...value, item])
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button key={o} type="button" onClick={() => toggle(o)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            value.includes(o)
              ? 'bg-[#1F4E78] text-white border-[#1F4E78]'
              : 'bg-white text-gray-700 border-gray-300 hover:border-[#2E75B6]'
          }`}>{o}</button>
      ))}
    </div>
  )
}

export function Section4MedicalHistory() {
  const { register, control, watch } = useFormContext<CallData>()
  const hasMedHistory = watch('hasMedicalHistory')
  const hasAllergies = watch('hasAllergies')
  const allergyStatus = watch('allergyStatus') ?? ''
  const takesMeds = watch('takesMedications')
  const pregnancyStatus = watch('pregnancyStatus')
  const advDir = watch('advanceDirectives')
  const patientSex = watch('patientSex')
  const patientAge = watch('patientAge') ?? 0

  const showDrugAllergies = allergyStatus.includes('תרופות')
  const showFoodAllergies = allergyStatus.includes('מזון')
  const showPregnancy = (patientSex === 'female') && patientAge >= 12 && patientAge <= 55

  return (
    <section aria-labelledby="s4" className="space-y-6">
      <h2 id="s4" className="text-lg font-semibold text-[#1F4E78] border-b border-[#2E75B6]/30 pb-2">
        רקע רפואי ואלרגיות
      </h2>

      {/* שאלת סף — רקע רפואי */}
      <div className="bg-[#DDEBF7]/40 rounded-xl border border-[#2E75B6]/20 p-4">
        <FormField label="האם יש רקע רפואי ידוע?">
          <div className="flex gap-4 mt-1">
            {['כן', 'לא', 'לא ידוע'].map(v => (
              <label key={v} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" {...register('hasMedicalHistory')} value={v}
                  className="w-4 h-4 accent-[#1F4E78]" />
                <span className="text-sm font-medium">{v}</span>
              </label>
            ))}
          </div>
        </FormField>
      </div>

      {/* 3a — רקע — נפתח רק אם כן */}
      {hasMedHistory === 'כן' && <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3">רקע ומחלות כרוניות</h3>

        <div className="space-y-5">
          <FormField label="מקור המידע" htmlFor="infoSource">
            <select id="infoSource" {...register('infoSource')} className={s}>
              <option value="">בחר</option>
              {INFO_SOURCES.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </FormField>

          <FormField label="מחלות רקע">
            <Controller name="chronicConditions" control={control} defaultValue={[]}
              render={({ field }) => (
                <ChipMulti options={CHRONIC_CONDITIONS}
                  value={field.value ?? []} onChange={field.onChange} />
              )} />
          </FormField>

          <FormField label="פירוט מחלות רקע / אחר" htmlFor="chronicConditionsOther">
            <input id="chronicConditionsOther" type="text" {...register('chronicConditionsOther')} className={s} />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="ניתוחים קודמים" htmlFor="previousSurgeries">
              <textarea id="previousSurgeries" rows={2}
                {...register('previousSurgeries')} className={ta} />
            </FormField>

            <FormField label="אשפוזים אחרונים (3 חודשים)" htmlFor="recentHospitalizations">
              <textarea id="recentHospitalizations" rows={2}
                {...register('recentHospitalizations')} className={ta} />
            </FormField>
          </div>
        </div>
      </div>}

      {/* 3b — תרופות */}
      {hasMedHistory === 'כן' && <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3">תרופות קבועות</h3>
        <div className="space-y-4">
          <FormField label="לוקח/ת תרופות קבועות?" htmlFor="takesMedications">
            <div className="flex gap-4 mt-1">
              {['כן', 'לא', 'לא ידוע'].map(v => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" {...register('takesMedications')} value={v}
                    className="w-4 h-4 accent-[#1F4E78]" />
                  <span className="text-sm">{v}</span>
                </label>
              ))}
            </div>
          </FormField>

          {takesMeds === 'כן' && (
            <FormField label="פירוט תרופות ומינונים" htmlFor="medications">
              <textarea id="medications" rows={4}
                placeholder="שם תרופה, מינון, תדירות..."
                {...register('medications')} className={ta} />
            </FormField>
          )}
        </div>
      </div>}

      {/* שאלת סף — אלרגיות */}
      <div className="bg-[#DDEBF7]/40 rounded-xl border border-[#2E75B6]/20 p-4">
        <FormField label="האם יש אלרגיות ידועות?">
          <div className="flex gap-4 mt-1">
            {['כן', 'לא', 'לא ידוע'].map(v => (
              <label key={v} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" {...register('hasAllergies')} value={v}
                  className="w-4 h-4 accent-[#1F4E78]" />
                <span className="text-sm font-medium">{v}</span>
              </label>
            ))}
          </div>
        </FormField>
      </div>

      {/* 3c — אלרגיות — נפתח רק אם כן */}
      {hasAllergies === 'כן' && <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3">אלרגיות ורגישויות</h3>
        <div className="space-y-4">
          <FormField label="סטטוס אלרגיות" htmlFor="allergyStatus">
            <select id="allergyStatus" {...register('allergyStatus')} className={s}>
              <option value="">בחר</option>
              {ALLERGY_STATUS.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </FormField>

          {showDrugAllergies && (
            <FormField label="אלרגיות לתרופות">
              <Controller name="allergies" control={control} defaultValue={[]}
                render={({ field }) => (
                  <ChipMulti options={MED_ALLERGIES}
                    value={field.value ?? []} onChange={field.onChange} />
                )} />
            </FormField>
          )}

          {showFoodAllergies && (
            <FormField label="אלרגיות למזון">
              <Controller name="foodAllergies" control={control} defaultValue={[]}
                render={({ field }) => (
                  <ChipMulti options={FOOD_ALLERGIES}
                    value={field.value ?? []} onChange={field.onChange} />
                )} />
            </FormField>
          )}

          <FormField label="פירוט אלרגיות / תגובה" htmlFor="allergyDetail">
            <input id="allergyDetail" type="text" {...register('allergyDetail')} className={s} />
          </FormField>

          <FormField label="עונד צמיד התראה רפואי" htmlFor="medicalAlertBracelet">
            <div className="flex gap-4 mt-1">
              {['כן', 'לא'].map(v => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" {...register('medicalAlertBracelet')} value={v}
                    className="w-4 h-4 accent-[#1F4E78]" />
                  <span className="text-sm">{v}</span>
                </label>
              ))}
            </div>
          </FormField>
        </div>
      </div>}

      {/* 3d — הריון */}
      {showPregnancy && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">מצב הריון</h3>
          <div className="space-y-4">
            <FormField label="בהריון?" htmlFor="pregnancyStatus">
              <div className="flex gap-4 mt-1">
                {PREGNANCY_STATUS.map(v => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" {...register('pregnancyStatus')} value={v}
                      className="w-4 h-4 accent-[#1F4E78]" />
                    <span className="text-sm">{v}</span>
                  </label>
                ))}
              </div>
            </FormField>

            {pregnancyStatus === 'כן' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="שבוע הריון" htmlFor="pregnancyWeeks">
                  <input id="pregnancyWeeks" type="number" min={1} max={42}
                    {...register('pregnancyWeeks', { valueAsNumber: true })} className={s} />
                </FormField>

                <FormField label="סיבוכי הריון ידועים" htmlFor="pregnancyComplications">
                  <input id="pregnancyComplications" type="text" {...register('pregnancyComplications')} className={s} />
                </FormField>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3e — הוראות מקדימות */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3">הוראות מקדימות ומידע משלים</h3>
        <div className="space-y-4">
          <FormField label="הוראות מקדימות / DNR" htmlFor="advanceDirectives">
            <select id="advanceDirectives" {...register('advanceDirectives')} className={s}>
              <option value="">בחר</option>
              {ADVANCE_DIRECTIVES.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </FormField>

          {(advDir === 'הוראות מקדימות' || advDir === 'DNR') && (
            <FormField label="פירוט המסמך" htmlFor="advanceDirectivesDetail">
              <textarea id="advanceDirectivesDetail" rows={2}
                {...register('advanceDirectivesDetail')} className={ta} />
            </FormField>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="שם רופא משפחה" htmlFor="familyDoctorName">
              <input id="familyDoctorName" type="text" {...register('familyDoctorName')} className={s} />
            </FormField>

            <FormField label="טלפון רופא משפחה" htmlFor="familyDoctorPhone">
              <input id="familyDoctorPhone" type="tel" maxLength={10}
                {...register('familyDoctorPhone')} className={s} />
            </FormField>
          </div>

          <FormField label="עישון / אלכוהול / סמים" htmlFor="smokingAlcoholDrugs">
            <div className="flex flex-wrap gap-3 mt-1">
              {SMOKING.map(v => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" value={v}
                    {...register('smokingAlcoholDrugs')}
                    className="w-4 h-4 accent-[#1F4E78]" />
                  <span className="text-sm">{v}</span>
                </label>
              ))}
            </div>
          </FormField>

          <FormField label="ארוחה / שתייה אחרונה" htmlFor="lastMeal">
            <input id="lastMeal" type="text" placeholder="מה ומתי אכל/שתה לאחרונה"
              {...register('lastMeal')} className={s} />
          </FormField>
        </div>
      </div>
    </section>
  )
}
