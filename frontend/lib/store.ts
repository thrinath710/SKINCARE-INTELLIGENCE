'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from './api-client';

export type SkinCondition = 'good' | 'okay' | 'bad';

export interface UserProfile {
  skin_type: string;
  skin_concerns: string[];
  climate_zone: string;
  budget_range: string;
  onboarded: boolean;
}

export interface RoutineProduct extends Product {
  time_of_day: 'morning' | 'evening';
  step_order: number;
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

  addToRoutine: (
    product: Product,
    timeOfDay: 'morning' | 'evening'
  ) => void;

  removeFromRoutine: (id: string) => void;

  reorderRoutine: (
    timeOfDay: 'morning' | 'evening',
    oldIndex: number,
    newIndex: number
  ) => void;

  addLog: (log: ProgressLog) => void;
  setLogs: (logs: ProgressLog[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: null,
      routine: [],
      logs: [],

      setProfile: (profile) =>
        set({
          profile,
        }),

      addToRoutine: (product, timeOfDay) =>
        set((state) => {
          const sameTimeProducts = state.routine.filter(
            (p) => p.time_of_day === timeOfDay
          );

          const routineProduct: RoutineProduct = {
            ...product,
            id: `${product.id}-${timeOfDay}-${Date.now()}`,
            time_of_day: timeOfDay,
            step_order: sameTimeProducts.length,
          };

          return {
            routine: [...state.routine, routineProduct],
          };
        }),

      removeFromRoutine: (id) =>
        set((state) => ({
          routine: state.routine.filter((p) => p.id !== id),
        })),

      reorderRoutine: (timeOfDay, oldIndex, newIndex) =>
        set((state) => {
          const sameTimeProducts = state.routine
            .filter((p) => p.time_of_day === timeOfDay)
            .sort((a, b) => a.step_order - b.step_order);

          const otherProducts = state.routine.filter(
            (p) => p.time_of_day !== timeOfDay
          );

          const reordered = [...sameTimeProducts];

          const [moved] = reordered.splice(oldIndex, 1);

          reordered.splice(newIndex, 0, moved);

          const updated = reordered.map((product, index) => ({
            ...product,
            step_order: index,
          }));

          return {
            routine: [...otherProducts, ...updated],
          };
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