'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowRight, Pencil, Cloud, CloudOff, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { db, type DraftCall } from '@/lib/offline/db'
import { syncAll } from '@/lib/offline/sync'

type Data = Record<string, unknown>

function Row({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="flex gap-2 py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 min-w-[160px] shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800">{String(value)}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-1">
      <h2 className="text-sm font-bold text-[#1F4E78] mb-3 pb-2 border-b border-[#2E75B6]/20">{title}</h2>
      {children}
    </div>
  )
}

export default function CallDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [call, setCall] = useState<DraftCall | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    db.calls.get(id).then(c => {
      setCall(c ?? null)
      setLoading(false)
    })
  }, [id])

  async function handleSync() {
    setSyncing(true)
    await syncAll()
    const updated = await db.calls.get(id)
    setCall(updated ?? null)
    setSyncing(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-[#1F4E78]" size={32} />
    </div>
  )

  if (!call) return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-4">
      <p className="text-gray-500">הקריאה לא נמצאה</p>
      <Link href="/calls" className="text-[#2E75B6] underline text-sm">חזור לרשימת קריאות</Link>
    </div>
  )

  const d = call.data as Data
  const get = (k: string) => d[k] as string | undefined

  const patientName = [get('patientFirstName'), get('patientLastName')].filter(Boolean).join(' ') || 'לא ידוע'
  const formNum = get('formNumber') || id.slice(0, 8).toUpperCase()

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

      {/* כותרת */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}
            className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-gray-100">
            <ArrowRight size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#1F4E78]">{patientName}</h1>
            <p className="text-xs text-gray-400 font-mono">#{formNum}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* סנכרון */}
          {call.syncError ? (
            <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
              <AlertCircle size={12} /> שגיאת סנכרון
            </span>
          ) : call.synced ? (
            <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <Cloud size={12} /> מסונכרן
            </span>
          ) : (
            <button onClick={handleSync} disabled={syncing}
              className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full hover:bg-amber-100 disabled:opacity-60">
              {syncing ? <Loader2 size={12} className="animate-spin" /> : <CloudOff size={12} />}
              {syncing ? 'מסנכרן...' : 'סנכרן עכשיו'}
            </button>
          )}

          <Link href={`/calls/${id}/edit`}
            className="flex items-center gap-1.5 h-9 px-4 rounded-md bg-[#1F4E78] text-white text-sm hover:bg-[#2E75B6] transition-colors">
            <Pencil size={14} />
            ערוך
          </Link>
        </div>
      </div>

      {/* פרטי האירוע */}
      <Section title="פרטי האירוע">
        <Row label="תאריך" value={get('callDate')} />
        <Row label="משמרת" value={get('shift')} />
        <Row label="סוג קריאה" value={get('callType')} />
        <Row label="דחיפות" value={get('callPriority')} />
        <Row label="מס׳ אירוע" value={get('incidentNumber')} />
        <Row label="כתובת" value={[get('eventStreet'), get('eventHouseNumber'), get('eventCity')].filter(Boolean).join(' ')} />
        <Row label="שעת קבלת אירוע" value={get('callReceivedTime')} />
        <Row label="שעת הגעה לזירה" value={get('arrivalTime')} />
        <Row label="שעת מגע מטופל" value={get('patientContactTime')} />
        <Row label="שעת עזיבת זירה" value={get('sceneTime')} />
        <Row label="שעת הגעה לח״ב" value={get('hospitalArrivalTime')} />
        <Row label="אמבולנס" value={get('ambulanceNumber')} />
        <Row label="נהג" value={get('driver')} />
        <Row label="פרמדיק" value={get('paramedic')} />
      </Section>

      {/* פרטי מטופל */}
      <Section title="פרטי מטופל">
        <Row label="שם פרטי" value={get('patientFirstName')} />
        <Row label="שם משפחה" value={get('patientLastName')} />
        <Row label="ת.ז." value={get('patientId')} />
        <Row label="תאריך לידה" value={get('patientDob')} />
        <Row label="גיל" value={get('patientAge')} />
        <Row label="מין" value={get('patientSex')} />
        <Row label="טלפון" value={get('patientPhone')} />
        <Row label="כתובת" value={[get('patientStreet'), get('patientHouseNumber'), get('patientCity')].filter(Boolean).join(' ')} />
        <Row label="קופת חולים" value={get('healthFund')} />
        <Row label="איש קשר" value={get('contactName')} />
        <Row label="טלפון איש קשר" value={get('contactPhone')} />
      </Section>

      {/* תלונה */}
      {(get('caseNarrative') || get('chiefComplaintFreeText')) && (
        <Section title="תלונה עיקרית">
          {get('chiefComplaint') && (
            <Row label="תלונה" value={Array.isArray(d['chiefComplaint'])
              ? (d['chiefComplaint'] as string[]).join(' ، ')
              : get('chiefComplaint')} />
          )}
          <Row label="נרטיב" value={get('caseNarrative')} />
          <Row label="עצמת כאב" value={get('painScore') ? `${get('painScore')}/10` : undefined} />
        </Section>
      )}

      {/* סימנים חיוניים */}
      {Array.isArray(d['vitals']) && (d['vitals'] as unknown[]).length > 0 && (
        <Section title="סימנים חיוניים">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="py-1 pr-2 text-right font-medium">שעה</th>
                  <th className="py-1 px-2 text-right font-medium">דופק</th>
                  <th className="py-1 px-2 text-right font-medium">ל״ד</th>
                  <th className="py-1 px-2 text-right font-medium">נשימה</th>
                  <th className="py-1 px-2 text-right font-medium">SpO₂</th>
                  <th className="py-1 px-2 text-right font-medium">גלוקוז</th>
                </tr>
              </thead>
              <tbody>
                {(d['vitals'] as Record<string, unknown>[]).map((v, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-1.5 pr-2">{String(v.time ?? '')}</td>
                    <td className="py-1.5 px-2">{String(v.pulseRate ?? '—')}</td>
                    <td className="py-1.5 px-2">{v.bpSystolic ? `${v.bpSystolic}/${v.bpDiastolic}` : '—'}</td>
                    <td className="py-1.5 px-2">{String(v.respiratoryRate ?? '—')}</td>
                    <td className="py-1.5 px-2">{v.spo2 ? `${v.spo2}%` : '—'}</td>
                    <td className="py-1.5 px-2">{String(v.bloodGlucose ?? '—')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* פינוי */}
      <Section title="פינוי">
        <Row label="סטטוס" value={get('evacuationStatus')} />
        <Row label="יעד" value={get('evacuationDestination')} />
        <Row label="בית חולים" value={get('hospital')} />
        <Row label="מחלקה" value={get('hospitalDepartment')} />
        <Row label="טריאז׳" value={get('triageColor')} />
        <Row label="מקבל המטופל" value={get('handoffPersonName')} />
      </Section>

      {/* הערות */}
      {get('notes') && (
        <Section title="הערות">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{get('notes')}</p>
        </Section>
      )}

      <p className="text-xs text-center text-gray-400 pb-6">
        עודכן לאחרונה: {new Date(call.updatedAt).toLocaleString('he-IL')}
      </p>
    </div>
  )
}
