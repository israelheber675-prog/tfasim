import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuidv4 } from 'uuid'
import type { CallData, VitalSet, Treatment, MedicationGiven, IVAccess } from '@/types/call'

interface CallState {
  callId: string | null
  data: CallData
  isDirty: boolean
  lastSavedAt: number | null

  // Actions
  initNewCall: () => void
  loadCall: (callId: string, data: CallData) => void
  setField: <K extends keyof CallData>(key: K, value: CallData[K]) => void
  setFields: (fields: Partial<CallData>) => void
  addVitalSet: (vital: VitalSet) => void
  updateVitalSet: (index: number, vital: Partial<VitalSet>) => void
  removeVitalSet: (index: number) => void
  addTreatment: (treatment: Treatment) => void
  removeTreatment: (index: number) => void
  addMedication: (med: MedicationGiven) => void
  removeMedication: (index: number) => void
  addIVAccess: (iv: IVAccess) => void
  removeIVAccess: (index: number) => void
  markSaved: () => void
  resetCall: () => void
}

const emptyCall = (): CallData => ({
  vitals: [],
  treatments: [],
  medications_given: [],
  ivAccess: [],
  chronicConditions: [],
  allergies: [],
  teamComposition: [],
})

export const useCallStore = create<CallState>()(
  immer((set) => ({
    callId: null,
    data: emptyCall(),
    isDirty: false,
    lastSavedAt: null,

    initNewCall: () =>
      set((state) => {
        state.callId = uuidv4()
        state.data = emptyCall()
        // Pre-fill crew defaults from settings
        try {
          const raw = typeof window !== 'undefined' ? localStorage.getItem('pcr-settings') : null
          if (raw) {
            const s = JSON.parse(raw) as Record<string, string>
            if (s.ambulanceNumber) state.data.ambulanceNumber = s.ambulanceNumber
            if (s.defaultDriver)   state.data.driver          = s.defaultDriver
            if (s.defaultParamedic) state.data.paramedic      = s.defaultParamedic
            if (s.defaultEmt1)     state.data.emt1            = s.defaultEmt1
          }
        } catch { /* skip */ }
        state.isDirty = false
        state.lastSavedAt = null
      }),

    loadCall: (callId, data) =>
      set((state) => {
        state.callId = callId
        state.data = data
        state.isDirty = false
        state.lastSavedAt = Date.now()
      }),

    setField: (key, value) =>
      set((state) => {
        ;(state.data as CallData)[key] = value
        state.isDirty = true
      }),

    setFields: (fields) =>
      set((state) => {
        Object.assign(state.data, fields)
        state.isDirty = true
      }),

    addVitalSet: (vital) =>
      set((state) => {
        state.data.vitals = [...(state.data.vitals ?? []), vital]
        state.isDirty = true
      }),

    updateVitalSet: (index, vital) =>
      set((state) => {
        if (state.data.vitals?.[index]) {
          Object.assign(state.data.vitals[index], vital)
          state.isDirty = true
        }
      }),

    removeVitalSet: (index) =>
      set((state) => {
        state.data.vitals?.splice(index, 1)
        state.isDirty = true
      }),

    addTreatment: (treatment) =>
      set((state) => {
        state.data.treatments = [...(state.data.treatments ?? []), treatment]
        state.isDirty = true
      }),

    removeTreatment: (index) =>
      set((state) => {
        state.data.treatments?.splice(index, 1)
        state.isDirty = true
      }),

    addMedication: (med) =>
      set((state) => {
        state.data.medications_given = [...(state.data.medications_given ?? []), med]
        state.isDirty = true
      }),

    removeMedication: (index) =>
      set((state) => {
        state.data.medications_given?.splice(index, 1)
        state.isDirty = true
      }),

    addIVAccess: (iv) =>
      set((state) => {
        state.data.ivAccess = [...(state.data.ivAccess ?? []), iv]
        state.isDirty = true
      }),

    removeIVAccess: (index) =>
      set((state) => {
        state.data.ivAccess?.splice(index, 1)
        state.isDirty = true
      }),

    markSaved: () =>
      set((state) => {
        state.isDirty = false
        state.lastSavedAt = Date.now()
      }),

    resetCall: () =>
      set((state) => {
        state.callId = null
        state.data = emptyCall()
        state.isDirty = false
        state.lastSavedAt = null
      }),
  }))
)
