// Global state management for NGINE using Zustand
import { create } from 'zustand'
import { Resolution, Checkin, GoalProof } from './api/supabase'
import { TodayStatus, IntegrityStatus } from './utils/realtime'

interface NgineState {
  // User data
  userId: string | null
  setUserId: (id: string | null) => void

  // Active resolution
  activeResolution: Resolution | null
  setActiveResolution: (resolution: Resolution | null) => void

  // Today's status
  todayStatus: TodayStatus | null
  setTodayStatus: (status: TodayStatus | null) => void

  // All resolutions (for future use)
  resolutions: Resolution[]
  setResolutions: (resolutions: Resolution[]) => void
  addResolution: (resolution: Resolution) => void
  updateResolution: (id: string, updates: Partial<Resolution>) => void

  // Check-ins
  checkins: Checkin[]
  setCheckins: (checkins: Checkin[]) => void
  addCheckin: (checkin: Checkin) => void
  updateCheckin: (id: string, updates: Partial<Checkin>) => void

  // Proofs
  proofs: GoalProof[]
  setProofs: (proofs: GoalProof[]) => void
  addProof: (proof: GoalProof) => void

  // Realtime connection status
  isOnline: boolean
  setIsOnline: (online: boolean) => void
  lastSync: Date | null
  setLastSync: (date: Date | null) => void

  // Optimistic updates tracking
  pendingCheckins: Set<string>
  addPendingCheckin: (id: string) => void
  removePendingCheckin: (id: string) => void
}

export const useNgineStore = create<NgineState>((set) => ({
  // User
  userId: null,
  setUserId: (id) => set({ userId: id }),

  // Active resolution
  activeResolution: null,
  setActiveResolution: (resolution) => set({ activeResolution: resolution }),

  // Today status
  todayStatus: null,
  setTodayStatus: (status) => set({ todayStatus: status }),

  // Resolutions
  resolutions: [],
  setResolutions: (resolutions) => set({ resolutions }),
  addResolution: (resolution) =>
    set((state) => ({
      resolutions: [...state.resolutions, resolution],
    })),
  updateResolution: (id, updates) =>
    set((state) => ({
      resolutions: state.resolutions.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
      activeResolution:
        state.activeResolution?.id === id
          ? { ...state.activeResolution, ...updates }
          : state.activeResolution,
    })),

  // Check-ins
  checkins: [],
  setCheckins: (checkins) => set({ checkins }),
  addCheckin: (checkin) =>
    set((state) => ({
      checkins: [checkin, ...state.checkins],
    })),
  updateCheckin: (id, updates) =>
    set((state) => ({
      checkins: state.checkins.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  // Proofs
  proofs: [],
  setProofs: (proofs) => set({ proofs }),
  addProof: (proof) =>
    set((state) => ({
      proofs: [proof, ...state.proofs],
    })),

  // Connection status
  isOnline: true,
  setIsOnline: (online) => set({ isOnline: online }),
  lastSync: null,
  setLastSync: (date) => set({ lastSync: date }),

  // Pending updates
  pendingCheckins: new Set(),
  addPendingCheckin: (id) =>
    set((state) => ({
      pendingCheckins: new Set([...state.pendingCheckins, id]),
    })),
  removePendingCheckin: (id) =>
    set((state) => {
      const newSet = new Set(state.pendingCheckins)
      newSet.delete(id)
      return { pendingCheckins: newSet }
    }),
}))

