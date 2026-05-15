import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuidv4 } from 'uuid'
import type { MCIIncident, MCIPatient, TriageColor } from '@/types/call'
import { db } from '@/lib/offline/db'

interface MCIState {
  incident: MCIIncident | null
  saving: boolean

  // Actions
  initNewIncident: () => void
  loadIncident: (incident: MCIIncident) => void
  setIncidentField: <K extends keyof MCIIncident>(key: K, value: MCIIncident[K]) => void
  addPatient: (color: TriageColor) => MCIPatient
  updatePatient: (id: string, patch: Partial<MCIPatient>) => void
  removePatient: (id: string) => void
  save: () => Promise<string>
  reset: () => void
}

function nowDate() {
  return new Date().toISOString().split('T')[0]
}
function nowTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export const useMCIStore = create<MCIState>()(
  immer((set, get) => ({
    incident: null,
    saving: false,

    initNewIncident: () =>
      set((state) => {
        const id = uuidv4()
        state.incident = {
          id,
          date: nowDate(),
          time: nowTime(),
          patients: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          synced: false,
        }
      }),

    loadIncident: (incident) =>
      set((state) => {
        state.incident = incident
      }),

    setIncidentField: (key, value) =>
      set((state) => {
        if (!state.incident) return
        ;(state.incident as MCIIncident)[key] = value
      }),

    addPatient: (color) => {
      const patient: MCIPatient = {
        id: uuidv4(),
        triageColor: color,
        createdAt: Date.now(),
      }
      set((state) => {
        state.incident?.patients.push(patient)
      })
      return patient
    },

    updatePatient: (id, patch) =>
      set((state) => {
        if (!state.incident) return
        const idx = state.incident.patients.findIndex((p) => p.id === id)
        if (idx >= 0) Object.assign(state.incident.patients[idx], patch)
      }),

    removePatient: (id) =>
      set((state) => {
        if (!state.incident) return
        state.incident.patients = state.incident.patients.filter((p) => p.id !== id)
      }),

    save: async () => {
      const { incident } = get()
      if (!incident) throw new Error('No incident')
      set((s) => { s.saving = true })
      const updated = { ...incident, updatedAt: Date.now() }
      await db.mciIncidents.put(updated)
      set((s) => {
        s.incident = updated
        s.saving = false
      })
      return updated.id
    },

    reset: () =>
      set((state) => {
        state.incident = null
        state.saving = false
      }),
  }))
)
