'use client'

import { useFormContext } from 'react-hook-form'
import { FormField } from '@/components/form/FormField'
import { NumberStepper } from '@/components/form/NumberStepper'
import type { CallData } from '@/types/call'

const APPEARANCE = ['ורדרד', 'ציאנוטי', 'מזיע', 'חם', 'יבש', 'רועד', 'חיוור', 'צהבהב']
const FACE_SYM = ['סימטרי', 'אסימטריה ימין', 'אסימטריה שמאל']
const PUPIL_REACTION = ['מגיב', 'עצל', 'לא מגיב']
const CHEST = ['סימטרי', 'אסימטרי', 'תנועה פרדוקסלית']
const AUSCULTATION = ['נקי דו-צדדי', 'רחרחים', 'פצפוצים', 'נעדר ימין', 'נעדר שמאל', 'שריקה']
const ABDOMEN = ['רכה לא כואבת', 'כואבת', 'רגישה', 'קשה', 'נפוחה', 'גדלי אברים']
const PELVIS_STATUS = ['יציב', 'לא יציב', 'כאב בלחיצה']
const LIMB_STATUS = ['תקין', 'כאב', 'נפיחות', 'עיוות', 'פצע', 'חוסר תחושה', 'חולשה']
const PERIPH_PULSES = ['ממושמשים דו-צדדי', 'חלשים ימין', 'חלשים שמאל', 'נעדרים ימין', 'נעדרים שמאל']
const SKIN_COLOR = ['ורדרד', 'חיוור', 'ציאנוטי', 'אדום', 'צהוב']
const SKIN_TEMP = ['חם', 'נורמלי', 'קר']
const SKIN_MOISTURE = ['יבש', 'לח', 'מזיע']

const s = 'flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E78]'
const ta = 'flex w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E78] resize-none'

function Radio({ name, options, register }: { name: string; options: string[]; register: ReturnType<typeof useFormContext>['register'] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map(v => (
        <label key={v} className="flex items-center gap-1.5 cursor-pointer text-sm">
          <input type="radio" {...register(name)} value={v} className="w-4 h-4 accent-[#1F4E78]" />
          {v}
        </label>
      ))}
    </div>
  )
}

export function Section5PhysicalExam() {
  const { register, watch, setValue } = useFormContext<CallData>()

  return (
    <section aria-labelledby="s5pe" className="space-y-6">
      <h2 id="s5pe" className="text-lg font-semibold text-[#1F4E78] border-b border-[#2E75B6]/30 pb-2">
        בדיקה גופנית
      </h2>

      {/* מראה כללי */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3">BSI / מראה כללי</h3>
        <div className="flex flex-wrap gap-3">
          {APPEARANCE.map(v => (
            <label key={v} className="flex items-center gap-1.5 cursor-pointer text-sm">
              <input type="checkbox" {...register('generalAppearance')} value={v}
                className="w-4 h-4 accent-[#1F4E78]" />
              {v}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">

        {/* ראש */}
        <FormField label="ראש" htmlFor="headExam">
          <input id="headExam" type="text" placeholder="תקין / חבלה / פצע / דימום..."
            {...register('headExam')} className={s} />
        </FormField>

        {/* פנים */}
        <FormField label="פנים — סימטריה">
          <Radio name="faceSymmetry" options={FACE_SYM} register={register} />
        </FormField>

        {/* אישונים */}
        <FormField label="אישון ימין — גודל (מ״מ)">
          <div className="flex items-center gap-3">
            <NumberStepper
              value={watch('rightPupilSize')}
              onChange={v => setValue('rightPupilSize', v)}
              min={1} max={8} step={1} defaultValue={3} />
            <select {...register('rightPupilReaction')} className="flex h-11 rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">תגובה</option>
              {PUPIL_REACTION.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
        </FormField>

        <FormField label="אישון שמאל — גודל (מ״מ)">
          <div className="flex items-center gap-3">
            <NumberStepper
              value={watch('leftPupilSize')}
              onChange={v => setValue('leftPupilSize', v)}
              min={1} max={8} step={1} defaultValue={3} />
            <select {...register('leftPupilReaction')} className="flex h-11 rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">תגובה</option>
              {PUPIL_REACTION.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
        </FormField>

        {/* אף / אוזניים */}
        <FormField label="אף / אוזניים" htmlFor="noseEars">
          <input id="noseEars" type="text" placeholder="תקין / דימום / נוזל..."
            {...register('noseEars')} className={s} />
        </FormField>

        {/* פה */}
        <FormField label="פה / לשון" htmlFor="mouth">
          <input id="mouth" type="text" placeholder="תקין / לשון נשוכה / חסימה..."
            {...register('mouth')} className={s} />
        </FormField>

        {/* צוואר */}
        <FormField label="צוואר" htmlFor="neck">
          <input id="neck" type="text" placeholder="תקין / כאב / נפיחות / סטיית קנה..."
            {...register('neck')} className={s} />
        </FormField>

        {/* חזה — תנועה */}
        <FormField label="תנועת חזה">
          <Radio name="chestMovement" options={CHEST} register={register} />
        </FormField>

        {/* האזנה */}
        <FormField label="האזנה — חזה">
          <Radio name="chestAuscultation" options={AUSCULTATION} register={register} />
        </FormField>

        {/* בטן */}
        <FormField label="בטן">
          <Radio name="abdomen" options={ABDOMEN} register={register} />
        </FormField>

        {/* עמ"ש */}
        <FormField label="עמוד שדרה / גב" htmlFor="spine">
          <input id="spine" type="text" placeholder="תקין / כאב / עיוות / חוסר תחושה..."
            {...register('spine')} className={s} />
        </FormField>

        {/* אגן */}
        <FormField label="אגן">
          <Radio name="pelvis" options={PELVIS_STATUS} register={register} />
        </FormField>

        {/* גפיים עליונות */}
        <FormField label="גפה עליונה ימין" htmlFor="upperExtRight">
          <select id="upperExtRight" {...register('upperExtRight')} className={s}>
            <option value="">בחר</option>
            {LIMB_STATUS.map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </FormField>

        <FormField label="גפה עליונה שמאל" htmlFor="upperExtLeft">
          <select id="upperExtLeft" {...register('upperExtLeft')} className={s}>
            <option value="">בחר</option>
            {LIMB_STATUS.map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </FormField>

        {/* גפיים תחתונות */}
        <FormField label="גפה תחתונה ימין" htmlFor="lowerExtRight">
          <select id="lowerExtRight" {...register('lowerExtRight')} className={s}>
            <option value="">בחר</option>
            {LIMB_STATUS.map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </FormField>

        <FormField label="גפה תחתונה שמאל" htmlFor="lowerExtLeft">
          <select id="lowerExtLeft" {...register('lowerExtLeft')} className={s}>
            <option value="">בחר</option>
            {LIMB_STATUS.map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </FormField>

        {/* דפקים היקפיים */}
        <FormField label="דפקים היקפיים">
          <Radio name="peripheralPulses" options={PERIPH_PULSES} register={register} />
        </FormField>

        {/* עור */}
        <FormField label="צבע עור">
          <Radio name="skinColor" options={SKIN_COLOR} register={register} />
        </FormField>

        <FormField label="טמפרטורת עור">
          <Radio name="skinTemperature" options={SKIN_TEMP} register={register} />
        </FormField>

        <FormField label="לחות עור">
          <Radio name="skinMoisture" options={SKIN_MOISTURE} register={register} />
        </FormField>

        {/* CRT */}
        <FormField label="מילוי קפילרי CRT (שניות)">
          <NumberStepper
            value={watch('crt')}
            onChange={v => setValue('crt', v)}
            min={0} max={10} step={1} defaultValue={2}
            vitalKey="capillaryRefill" />
        </FormField>

      </div>

      {/* ממצאים נוספים */}
      <FormField label="ממצאים נוספים / הערות" htmlFor="physicalExamNotes">
        <textarea id="physicalExamNotes" rows={3}
          {...register('physicalExamNotes')} className={ta} />
      </FormField>

    </section>
  )
}
