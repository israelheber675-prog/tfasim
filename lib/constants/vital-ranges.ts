export type VitalLevel = 'normal' | 'warning' | 'danger' | 'unknown'

export interface VitalRange {
  min: number
  max: number
  normalMin: number
  normalMax: number
  warningMin: number
  warningMax: number
  unit: string
}

export const VITAL_RANGES = {
  pulseRate: { min: 0, max: 250, normalMin: 60, normalMax: 100, warningMin: 40, warningMax: 150, unit: 'bpm' },
  bpSystolic: { min: 30, max: 260, normalMin: 100, normalMax: 140, warningMin: 90, warningMax: 180, unit: 'mmHg' },
  bpDiastolic: { min: 20, max: 180, normalMin: 60, normalMax: 90, warningMin: 40, warningMax: 120, unit: 'mmHg' },
  respRate: { min: 0, max: 80, normalMin: 12, normalMax: 20, warningMin: 8, warningMax: 30, unit: '/min' },
  spo2: { min: 0, max: 100, normalMin: 94, normalMax: 100, warningMin: 90, warningMax: 93, unit: '%' },
  temperatureC: { min: 30.0, max: 43.0, normalMin: 36.0, normalMax: 37.8, warningMin: 35.0, warningMax: 39.0, unit: '°C' },
  bloodGlucose: { min: 10, max: 800, normalMin: 70, normalMax: 140, warningMin: 70, warningMax: 250, unit: 'mg/dL' },
  painScale: { min: 0, max: 10, normalMin: 0, normalMax: 3, warningMin: 4, warningMax: 6, unit: '' },
  gcsTotal: { min: 3, max: 15, normalMin: 13, normalMax: 15, warningMin: 9, warningMax: 12, unit: 'נקודות' },
  capillaryRefill: { min: 0, max: 10, normalMin: 0, normalMax: 2, warningMin: 2, warningMax: 4, unit: 'שניות' },
  newbornWeight: { min: 400, max: 6000, normalMin: 2500, normalMax: 4000, warningMin: 2500, warningMax: 4500, unit: 'גרם' },
  apgar: { min: 0, max: 10, normalMin: 7, normalMax: 10, warningMin: 4, warningMax: 6, unit: 'נקודות' },
  tourniquetTime: { min: 0, max: 180, normalMin: 0, normalMax: 90, warningMin: 90, warningMax: 120, unit: 'דקות' },
} as const

export type VitalKey = keyof typeof VITAL_RANGES

export function getVitalLevel(key: VitalKey, value: number): VitalLevel {
  const range = VITAL_RANGES[key]
  if (value < range.min || value > range.max) return 'danger'

  if (key === 'spo2') {
    if (value < 90) return 'danger'
    if (value < 94) return 'warning'
    return 'normal'
  }

  if (value >= range.normalMin && value <= range.normalMax) return 'normal'

  if (key === 'gcsTotal') {
    if (value <= 8) return 'danger'
    if (value <= 12) return 'warning'
    return 'normal'
  }

  const dangerLow = range.warningMin - (range.warningMin - range.min) / 2
  const dangerHigh = range.warningMax + (range.max - range.warningMax) / 2

  if (value < dangerLow || value > dangerHigh) return 'danger'
  if (value < range.normalMin || value > range.normalMax) return 'warning'
  return 'normal'
}

export const VITAL_LEVEL_COLORS: Record<VitalLevel, string> = {
  normal: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  danger: 'bg-red-50 text-red-800 border-red-200',
  unknown: 'bg-gray-50 text-gray-500 border-gray-200',
}
