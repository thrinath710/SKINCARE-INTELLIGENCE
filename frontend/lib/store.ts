'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SkinCondition = 'good' | 'okay' | 'bad';

export interface UserProfile {
  skin_type: string;
  skin_concerns: string[];
  climate_zone: string;
  budget_range: string;
  onboarded: boolean;
}

export interface RoutineProduct {
  id: string;
  name: string;
  time: 'am' | 'pm';
}

export interface ProgressLog {
  id: string;
  date: string;
  condition: SkinCondition;
  notes: string;
}

interface AppState {
  profile: UserProfile | null;
  routine: RoutineProduct[];
  logs: ProgressLog[];

  setProfile: (profile: UserProfile) => void;

  addToRoutine: (product: RoutineProduct) => void;
  removeFromRoutine: (id: string) => void;
  reorderRoutine: (routine: RoutineProduct[]) => void;

  addLog: (log: ProgressLog) => void;
  setLogs: (logs: ProgressLog[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      profile: null,

      routine: [],

      logs: [],

      setProfile: (profile) =>
        set({
          profile,
        }),

      addToRoutine: (product) =>
        set((state) => ({
          routine: [...state.routine, product],
        })),

      removeFromRoutine: (id) =>
        set((state) => ({
          routine: state.routine.filter((p) => p.id !== id),
        })),

      reorderRoutine: (routine) =>
        set({
          routine,
        }),

      addLog: (log) =>
        set((state) => ({
          logs: [log, ...state.logs],
        })),

      setLogs: (logs) =>
        set({
          logs,
        }),
    }),
    {
      name: 'skincare-app-store',
    }
  )
);