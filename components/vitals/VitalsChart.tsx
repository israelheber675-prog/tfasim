'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useState } from 'react'
import type { VitalSet } from '@/types/call'

interface Props {
  vitals: VitalSet[]
}

const SERIES = [
  { key: 'pulseRate',       name: 'דופק',       color: '#DC2626', unit: 'bpm',   yMin: 20,  yMax: 200 },
  { key: 'spo2',            name: 'SpO₂',       color: '#2563EB', unit: '%',     yMin: 70,  yMax: 100 },
  { key: 'respiratoryRate', name: 'נשימה',      color: '#059669', unit: '/min',  yMin: 0,   yMax: 50  },
  { key: 'bpSystolic',      name: 'ל"ד סיסטולי',color: '#7C3AED', unit: 'mmHg', yMin: 50,  yMax: 220 },
  { key: 'bloodGlucose',    name: 'גלוקוז',     color: '#D97706', unit: 'mg/dL', yMin: 40,  yMax: 400 },
] as const

// Normal ranges for reference lines
const NORMAL_RANGES: Record<string, { low: number; high: number; dangerLow?: number; dangerHigh?: number }> = {
  pulseRate:       { low: 60,  high: 100, dangerLow: 40,  dangerHigh: 150 },
  spo2:            { low: 94,  high: 100, dangerLow: 90 },
  respiratoryRate: { low: 12,  high: 20,  dangerLow: 8,   dangerHigh: 30  },
  bpSystolic:      { low: 100, high: 140, dangerLow: 90,  dangerHigh: 180 },
  bloodGlucose:    { low: 70,  high: 140, dangerLow: 50,  dangerHigh: 300 },
}

type SeriesKey = typeof SERIES[number]['key']

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string; unit?: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm min-w-[140px]" dir="rtl">
      <p className="font-bold text-gray-700 mb-2">⏱ {label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-semibold ml-auto">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export function VitalsChart({ vitals }: Props) {
  const [hidden, setHidden] = useState<Set<SeriesKey>>(new Set())
  const [activeKey, setActiveKey] = useState<SeriesKey | null>(null)

  if (!vitals || vitals.length === 0) return null

  const data = vitals.map(v => ({
    time:           v.time ?? '',
    pulseRate:      v.pulseRate,
    spo2:           v.spo2,
    respiratoryRate:v.respiratoryRate,
    bpSystolic:     v.bpSystolic,
    bloodGlucose:   v.bloodGlucose,
  }))

  function toggle(key: SeriesKey) {
    setHidden(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // Determine y-axis domain from visible series
  const visible = SERIES.filter(s => !hidden.has(s.key))
  const yMin = visible.length > 0 ? Math.min(...visible.map(s => s.yMin)) : 0
  const yMax = visible.length > 0 ? Math.max(...visible.map(s => s.yMax)) : 200

  // Reference lines for the active/focused series
  const focused = activeKey ? NORMAL_RANGES[activeKey] : null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#1F4E78]">גרף סימנים חיוניים</h3>
        <p className="text-xs text-gray-400">{vitals.length} מדידות</p>
      </div>

      {/* Toggle buttons */}
      <div className="flex flex-wrap gap-2">
        {SERIES.map(s => (
          <button
            key={s.key}
            onClick={() => toggle(s.key)}
            onMouseEnter={() => setActiveKey(s.key)}
            onMouseLeave={() => setActiveKey(null)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              hidden.has(s.key)
                ? 'border-gray-200 text-gray-400 bg-white'
                : 'text-white border-transparent'
            }`}
            style={hidden.has(s.key) ? {} : { backgroundColor: s.color }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {s.name}
            <span className="opacity-70">{s.unit}</span>
          </button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: 10, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            width={35}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Normal range reference lines for hovered series */}
          {focused && (
            <>
              <ReferenceLine y={focused.high}  stroke="#10B981" strokeDasharray="4 2" strokeWidth={1} opacity={0.6} />
              <ReferenceLine y={focused.low}   stroke="#10B981" strokeDasharray="4 2" strokeWidth={1} opacity={0.6} />
              {focused.dangerHigh && <ReferenceLine y={focused.dangerHigh} stroke="#EF4444" strokeDasharray="4 2" strokeWidth={1} opacity={0.5} />}
              {focused.dangerLow  && <ReferenceLine y={focused.dangerLow}  stroke="#EF4444" strokeDasharray="4 2" strokeWidth={1} opacity={0.5} />}
            </>
          )}

          {SERIES.map(s => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={hidden.has(s.key) ? 0 : activeKey === s.key ? 3 : 2}
              dot={{ r: 4, fill: s.color, strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              hide={hidden.has(s.key)}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {vitals.length === 1 && (
        <p className="text-xs text-gray-400 text-center">הוסף מדידה נוספת כדי לראות מגמה</p>
      )}
    </div>
  )
}
