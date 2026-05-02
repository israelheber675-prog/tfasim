'use client'

import { useState, useEffect } from 'react'
import { Save, CheckCircle2 } from 'lucide-react'
import { FormField } from '@/components/form/FormField'

const SETTINGS_KEY = 'pcr-settings'

interface AppSettings {
  formNumberPrefix: string
  ambulanceNumber: string
  defaultDriver: string
  defaultParamedic: string
  defaultEmt1: string
  stationName: string
  autoSyncEnabled: boolean
}

const defaultSettings: AppSettings = {
  formNumberPrefix: 'PCR',
  ambulanceNumber: '',
  defaultDriver: '',
  defaultParamedic: '',
  defaultEmt1: '',
  stationName: '',
  autoSyncEnabled: true,
}

const s = 'flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E78]'

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) setSettings(JSON.parse(stored))
  }, [])

  function handleChange(key: keyof AppSettings, value: string | boolean) {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function save() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">

      <h1 className="text-2xl font-bold text-[#1F4E78]">הגדרות</h1>

      {/* מספור טפסים */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-800">מספור טפסים</h2>
        <FormField label="קידומת מספר טופס" htmlFor="formNumberPrefix"
          helper={`דוגמה: ${settings.formNumberPrefix}-20250101-001`}>
          <input id="formNumberPrefix" type="text" value={settings.formNumberPrefix}
            onChange={e => handleChange('formNumberPrefix', e.target.value)}
            className={s} />
        </FormField>
      </section>

      {/* פרטי תחנה וצוות */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-800">ברירות מחדל לקריאה</h2>
        <p className="text-xs text-gray-500">יתמלאו אוטומטית בכל קריאה חדשה</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="שם תחנה" htmlFor="stationName">
            <input id="stationName" type="text" value={settings.stationName}
              onChange={e => handleChange('stationName', e.target.value)}
              className={s} />
          </FormField>

          <FormField label="מס׳ אמבולנס" htmlFor="ambulanceNumber">
            <input id="ambulanceNumber" type="text" value={settings.ambulanceNumber}
              onChange={e => handleChange('ambulanceNumber', e.target.value)}
              className={s} />
          </FormField>

          <FormField label="נהג ברירת מחדל" htmlFor="defaultDriver">
            <input id="defaultDriver" type="text" value={settings.defaultDriver}
              onChange={e => handleChange('defaultDriver', e.target.value)}
              className={s} />
          </FormField>

          <FormField label="פרמדיק ברירת מחדל" htmlFor="defaultParamedic">
            <input id="defaultParamedic" type="text" value={settings.defaultParamedic}
              onChange={e => handleChange('defaultParamedic', e.target.value)}
              className={s} />
          </FormField>

          <FormField label="חובש ברירת מחדל" htmlFor="defaultEmt1">
            <input id="defaultEmt1" type="text" value={settings.defaultEmt1}
              onChange={e => handleChange('defaultEmt1', e.target.value)}
              className={s} />
          </FormField>
        </div>
      </section>

      {/* סנכרון */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-800">סנכרון</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={settings.autoSyncEnabled}
            onChange={e => handleChange('autoSyncEnabled', e.target.checked)}
            className="w-5 h-5 accent-[#1F4E78]" />
          <div>
            <p className="text-sm font-medium text-gray-700">סנכרון אוטומטי</p>
            <p className="text-xs text-gray-500">מסנכרן אוטומטית כשיש חיבור לאינטרנט</p>
          </div>
        </label>
      </section>

      {/* כפתור שמירה */}
      <div className="flex justify-end">
        <button onClick={save}
          className="flex items-center gap-2 h-11 px-8 rounded-md bg-[#1F4E78] text-white text-sm font-medium hover:bg-[#2E75B6] transition-colors">
          {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saved ? 'נשמר!' : 'שמור הגדרות'}
        </button>
      </div>

    </div>
  )
}
