'use client'

import { useMemo } from 'react'
import type { CallData } from '@/types/call'

// שדות חשובים לכל שלב
const STEP_FIELDS: Record<number, (keyof CallData)[]> = {
  1: ['callDate', 'callType', 'callPriority', 'eventCity', 'ambulanceNumber'],
  2: ['patientFirstName', 'patientLastName', 'patientId', 'patientSex', 'patientAge'],
  3: ['chiefComplaintFreeText', 'caseNarrative'],
  4: ['hasMedicalHistory', 'hasAllergies'],
  5: ['vitals', 'avpu'],
  6: ['treatments'],
  7: [],
  8: ['evacuationStatus', 'evacuationDestination'],
  9: ['crewLeaderSignature'],
}

function isFilled(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return false
  if (Array.isArray(value)) return value.length > 0
  return true
}

export function useFormProgress(data: Partial<CallData>) {
  return useMemo(() => {
    const stepResults = Object.entries(STEP_FIELDS).map(([stepStr, fields]) => {
      const step = Number(stepStr)
      if (fields.length === 0) return { step, pct: 100, filled: 0, total: 0 }
      const filled = fields.filter(f => isFilled(data[f])).length
      return { step, pct: Math.round((filled / fields.length) * 100), filled, total: fields.length }
    })

    const totalFields = stepResults.reduce((a, s) => a + s.total, 0)
    const totalFilled = stepResults.reduce((a, s) => a + s.filled, 0)
    const overall = totalFields > 0 ? Math.round((totalFilled / totalFields) * 100) : 0

    return { stepResults, overall }
  }, [data])
}
