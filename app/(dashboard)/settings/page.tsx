'use client'

import { useState, useEffect } from 'react'
import { Save, CheckCircle2, Download, Building2, Ambulance, RefreshCw, FileCode } from 'lucide-react'
import { FormField } from '@/components/form/FormField'
import { db } from '@/lib/offline/db'
import type { CallData, VitalSet } from '@/types/call'

const SETTINGS_KEY = 'pcr-settings'

interface AppSettings {
  // ארגון
  organizationName: string
  organizationId: string        // מספר עמותה / ח.פ.
  organizationLogo: string      // base64
  contactEmail: string
  contactPhone: string
  region: string
  // מספור
  formNumberPrefix: string
  // ברירות מחדל לקריאה
  ambulanceNumber: string
  defaultDriver: string
  defaultParamedic: string
  defaultEmt1: string
  stationName: string
  // סנכרון
  autoSyncEnabled: boolean
}

const defaultSettings: AppSettings = {
  organizationName: '',
  organizationId: '',
  organizationLogo: '',
  contactEmail: '',
  contactPhone: '',
  region: '',
  formNumberPrefix: 'PCR',
  ambulanceNumber: '',
  defaultDriver: '',
  defaultParamedic: '',
  defaultEmt1: '',
  stationName: '',
  autoSyncEnabled: true,
}

const s = 'flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E78]'

// ── HL7 FHIR R4 builder ──────────────────────────────────────
function buildFHIRBundle(callId: string, data: Record<string, unknown>, settings: AppSettings) {
  const d = data as Partial<CallData>
  const now = new Date().toISOString()
  const patientRef = `Patient/patient-${callId}`
  const encRef = `Encounter/enc-${callId}`

  const entries = []

  // Patient resource
  entries.push({
    fullUrl: patientRef,
    resource: {
      resourceType: 'Patient',
      id: `patient-${callId}`,
      identifier: d.patientId ? [{ system: 'urn:oid:1.2.352.1.1', value: d.patientId }] : [],
      name: [{
        family: d.patientLastName ?? '',
        given: [d.patientFirstName ?? '', d.patientFatherName ?? ''].filter(Boolean),
      }],
      gender: d.patientSex === 'זכר' ? 'male' : d.patientSex === 'נקבה' ? 'female' : 'unknown',
      birthDate: d.patientDob ?? undefined,
      telecom: [
        d.patientPhone ? { system: 'phone', value: d.patientPhone } : null,
        d.patientEmail ? { system: 'email', value: d.patientEmail } : null,
      ].filter(Boolean),
      address: (d.patientCity || d.patientStreet) ? [{
        city: d.patientCity,
        line: [d.patientStreet, d.patientHouseNumber].filter(Boolean) as string[],
        postalCode: d.patientPostalCode,
        country: 'IL',
      }] : [],
    }
  })

  // Encounter resource
  entries.push({
    fullUrl: encRef,
    resource: {
      resourceType: 'Encounter',
      id: `enc-${callId}`,
      status: 'finished',
      class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'EMER', display: 'emergency' },
      subject: { reference: patientRef },
      period: {
        start: d.callDate ? `${d.callDate}T${d.callReceivedTime ?? '00:00'}:00` : now,
      },
      serviceProvider: settings.organizationName ? { display: settings.organizationName } : undefined,
      location: (d.eventCity || d.eventStreet) ? [{
        location: { display: [d.eventStreet, d.eventHouseNumber, d.eventCity].filter(Boolean).join(' ') }
      }] : [],
    }
  })

  // Observations — vitals
  const vitals = (d.vitals ?? []) as VitalSet[]
  vitals.forEach((v, i) => {
    const obsBase = {
      resourceType: 'Observation',
      status: 'final',
      subject: { reference: patientRef },
      encounter: { reference: encRef },
      effectiveDateTime: d.callDate ? `${d.callDate}T${v.time}:00` : now,
    }

    if (v.pulseRate != null) entries.push({ fullUrl: `Observation/hr-${callId}-${i}`, resource: {
      ...obsBase, id: `hr-${callId}-${i}`,
      code: { coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }] },
      valueQuantity: { value: v.pulseRate, unit: 'beats/minute', system: 'http://unitsofmeasure.org', code: '/min' },
    }})

    if (v.bpSystolic != null && v.bpDiastolic != null) entries.push({ fullUrl: `Observation/bp-${callId}-${i}`, resource: {
      ...obsBase, id: `bp-${callId}-${i}`,
      code: { coding: [{ system: 'http://loinc.org', code: '55284-4', display: 'Blood pressure' }] },
      component: [
        { code: { coding: [{ code: '8480-6', display: 'Systolic BP' }] }, valueQuantity: { value: v.bpSystolic, unit: 'mmHg' } },
        { code: { coding: [{ code: '8462-4', display: 'Diastolic BP' }] }, valueQuantity: { value: v.bpDiastolic, unit: 'mmHg' } },
      ],
    }})

    if (v.spo2 != null) entries.push({ fullUrl: `Observation/spo2-${callId}-${i}`, resource: {
      ...obsBase, id: `spo2-${callId}-${i}`,
      code: { coding: [{ system: 'http://loinc.org', code: '59408-5', display: 'Oxygen saturation' }] },
      valueQuantity: { value: v.spo2, unit: '%', system: 'http://unitsofmeasure.org', code: '%' },
    }})

    if (v.respiratoryRate != null) entries.push({ fullUrl: `Observation/rr-${callId}-${i}`, resource: {
      ...obsBase, id: `rr-${callId}-${i}`,
      code: { coding: [{ system: 'http://loinc.org', code: '9279-1', display: 'Respiratory rate' }] },
      valueQuantity: { value: v.respiratoryRate, unit: 'breaths/minute' },
    }})

    if (v.bloodGlucose != null) entries.push({ fullUrl: `Observation/glu-${callId}-${i}`, resource: {
      ...obsBase, id: `glu-${callId}-${i}`,
      code: { coding: [{ system: 'http://loinc.org', code: '2339-0', display: 'Glucose' }] },
      valueQuantity: { value: v.bloodGlucose, unit: 'mg/dL' },
    }})
  })

  return {
    resourceType: 'Bundle',
    id: `bundle-${callId}`,
    type: 'transaction',
    timestamp: now,
    entry: entries,
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [saved, setSaved] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [activeTab, setActiveTab] = useState<'org' | 'defaults' | 'sync' | 'fhir'>('org')

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) {
      try { setSettings({ ...defaultSettings, ...JSON.parse(stored) }) } catch { /* skip */ }
    }
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

  async function exportAllFHIR() {
    setExporting(true)
    try {
      const calls = await db.calls.toArray()
      const bundles = calls.map(c => buildFHIRBundle(c.id, c.data, settings))
      const ndjson = bundles.map(b => JSON.stringify(b)).join('\n')
      const blob = new Blob([ndjson], { type: 'application/fhir+ndjson' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pcr-fhir-${new Date().toISOString().split('T')[0]}.ndjson`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  async function exportSingleFHIR(callId: string) {
    const call = await db.calls.get(callId)
    if (!call) return
    const bundle = buildFHIRBundle(call.id, call.data, settings)
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/fhir+json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fhir-${callId.slice(0, 8)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const TAB_CLASSES = (t: string) =>
    `px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors ${
      activeTab === t
        ? 'border-[#1F4E78] text-[#1F4E78]'
        : 'border-transparent text-gray-500 hover:text-gray-700'
    }`

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

      <h1 className="text-2xl font-bold text-[#1F4E78]">הגדרות</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-1">
        <button onClick={() => setActiveTab('org')} className={TAB_CLASSES('org')}>
          <Building2 size={14} className="inline ml-1.5" />ארגון
        </button>
        <button onClick={() => setActiveTab('defaults')} className={TAB_CLASSES('defaults')}>
          <Ambulance size={14} className="inline ml-1.5" />ברירות מחדל
        </button>
        <button onClick={() => setActiveTab('sync')} className={TAB_CLASSES('sync')}>
          <RefreshCw size={14} className="inline ml-1.5" />סנכרון
        </button>
        <button onClick={() => setActiveTab('fhir')} className={TAB_CLASSES('fhir')}>
          <FileCode size={14} className="inline ml-1.5" />HL7 FHIR
        </button>
      </div>

      {/* ── ארגון ── */}
      {activeTab === 'org' && (
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-800">פרטי הארגון</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="שם הארגון" htmlFor="organizationName" className="sm:col-span-2">
              <input id="organizationName" type="text" value={settings.organizationName}
                onChange={e => handleChange('organizationName', e.target.value)} className={s} />
            </FormField>
            <FormField label="מספר ח.פ. / עמותה" htmlFor="organizationId">
              <input id="organizationId" type="text" value={settings.organizationId}
                onChange={e => handleChange('organizationId', e.target.value)} className={s} />
            </FormField>
            <FormField label="אזור פעילות" htmlFor="region">
              <input id="region" type="text" value={settings.region}
                onChange={e => handleChange('region', e.target.value)} className={s} />
            </FormField>
            <FormField label="אימייל ארגוני" htmlFor="contactEmail">
              <input id="contactEmail" type="email" value={settings.contactEmail}
                onChange={e => handleChange('contactEmail', e.target.value)} className={s} />
            </FormField>
            <FormField label="טלפון ארגוני" htmlFor="contactPhone">
              <input id="contactPhone" type="tel" value={settings.contactPhone}
                onChange={e => handleChange('contactPhone', e.target.value)} className={s} />
            </FormField>
            <FormField label="קידומת מספר טופס" htmlFor="formNumberPrefix"
              helper={`דוגמה: ${settings.formNumberPrefix || 'PCR'}-20250101-001`}>
              <input id="formNumberPrefix" type="text" value={settings.formNumberPrefix}
                onChange={e => handleChange('formNumberPrefix', e.target.value)} className={s} />
            </FormField>
          </div>
        </section>
      )}

      {/* ── ברירות מחדל ── */}
      {activeTab === 'defaults' && (
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-800">ברירות מחדל לקריאה</h2>
          <p className="text-xs text-gray-500">יתמלאו אוטומטית בכל קריאה חדשה</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="שם תחנה" htmlFor="stationName">
              <input id="stationName" type="text" value={settings.stationName}
                onChange={e => handleChange('stationName', e.target.value)} className={s} />
            </FormField>
            <FormField label="מס׳ אמבולנס" htmlFor="ambulanceNumber">
              <input id="ambulanceNumber" type="text" value={settings.ambulanceNumber}
                onChange={e => handleChange('ambulanceNumber', e.target.value)} className={s} />
            </FormField>
            <FormField label="נהג ברירת מחדל" htmlFor="defaultDriver">
              <input id="defaultDriver" type="text" value={settings.defaultDriver}
                onChange={e => handleChange('defaultDriver', e.target.value)} className={s} />
            </FormField>
            <FormField label="פרמדיק ברירת מחדל" htmlFor="defaultParamedic">
              <input id="defaultParamedic" type="text" value={settings.defaultParamedic}
                onChange={e => handleChange('defaultParamedic', e.target.value)} className={s} />
            </FormField>
            <FormField label="חובש ברירת מחדל" htmlFor="defaultEmt1">
              <input id="defaultEmt1" type="text" value={settings.defaultEmt1}
                onChange={e => handleChange('defaultEmt1', e.target.value)} className={s} />
            </FormField>
          </div>
        </section>
      )}

      {/* ── סנכרון ── */}
      {activeTab === 'sync' && (
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800">הגדרות סנכרון</h2>
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
      )}

      {/* ── HL7 FHIR ── */}
      {activeTab === 'fhir' && (
        <div className="space-y-5">
          <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <FileCode size={22} className="text-[#1F4E78] shrink-0 mt-0.5" />
              <div>
                <h2 className="text-base font-semibold text-gray-800">ייצוא HL7 FHIR R4</h2>
                <p className="text-sm text-gray-500 mt-1">
                  מייצא את כל הקריאות כ-FHIR Bundle ב-NDJSON. כולל משאבי Patient, Encounter ו-Observation לסימנים חיוניים.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 space-y-1">
              <p className="font-medium">מה מיוצא:</p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-700">
                <li>Patient — פרטי מטופל + זיהוי</li>
                <li>Encounter — פרטי האירוע</li>
                <li>Observation — דופק, לחץ דם, SpO₂, נשימה, גלוקוז</li>
              </ul>
            </div>

            <button
              onClick={exportAllFHIR}
              disabled={exporting}
              className="flex items-center gap-2 h-11 px-6 rounded-md bg-[#1F4E78] text-white text-sm font-medium hover:bg-[#2E75B6] disabled:opacity-60 transition-colors"
            >
              {exporting
                ? <><RefreshCw size={16} className="animate-spin" /> מייצא...</>
                : <><Download size={16} /> ייצוא כל הקריאות (NDJSON)</>}
            </button>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">ייצוא קריאה בודדת</h3>
            <FHIRSingleExport onExport={exportSingleFHIR} />
          </section>
        </div>
      )}

      {/* כפתור שמירה — רק לטאבים שיש בהם שדות */}
      {activeTab !== 'fhir' && (
        <div className="flex justify-end">
          <button onClick={save}
            className="flex items-center gap-2 h-11 px-8 rounded-md bg-[#1F4E78] text-white text-sm font-medium hover:bg-[#2E75B6] transition-colors">
            {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
            {saved ? 'נשמר!' : 'שמור הגדרות'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── FHIR single export selector ─────────────────────────────
function FHIRSingleExport({ onExport }: { onExport: (id: string) => void }) {
  const [calls, setCalls] = useState<{ id: string; label: string }[]>([])
  const [selected, setSelected] = useState('')

  useEffect(() => {
    db.calls.orderBy('updatedAt').reverse().limit(50).toArray().then(rows => {
      setCalls(rows.map(c => {
        const d = c.data as Record<string, unknown>
        const name = [d.patientFirstName, d.patientLastName].filter(Boolean).join(' ') || 'לא ידוע'
        return { id: c.id, label: `${name} — ${c.id.slice(0, 8)}` }
      }))
    })
  }, [])

  const s2 = 'flex h-11 flex-1 rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E78]'

  return (
    <div className="flex gap-2">
      <select value={selected} onChange={e => setSelected(e.target.value)} className={s2}>
        <option value="">בחר קריאה...</option>
        {calls.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
      </select>
      <button
        onClick={() => selected && onExport(selected)}
        disabled={!selected}
        className="flex items-center gap-2 h-11 px-4 rounded-md border border-[#2E75B6] text-[#1F4E78] text-sm font-medium hover:bg-[#DDEBF7] disabled:opacity-40 transition-colors"
      >
        <Download size={15} />
        ייצוא
      </button>
    </div>
  )
}
