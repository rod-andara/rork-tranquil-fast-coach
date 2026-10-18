import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WeightEntry {
  id: string;
  weight: number; // in lbs or kg
  date: number; // timestamp
  unit: 'lbs' | 'kg';
  note?: string;
  source: 'manual' | 'apple_health';
  healthId?: string; // HealthKit sample id for imported entries
  // Manual entries only (SPEC-26): consent is separate from delivery state.
  // opted_out = user kept it local, never exported; pending = consented, not yet
  // written to Apple Health; synced = written.
  healthExport?: 'opted_out' | 'pending' | 'synced';
}

// NOTE: `deletedHealthIds` (below) remembers HealthKit samples the user deleted
// locally so a full-history import doesn't bring them back.

export interface WeightGoal {
  targetWeight: number;
  unit: 'lbs' | 'kg';
  startDate: number;
  targetDate?: number;
}

interface WeightState {
  entries: WeightEntry[];
  goal: WeightGoal | null;
  unit: 'lbs' | 'kg';
  isHealthConnected: boolean;
  lastHealthSync: number | null;
  unitSetByUser: boolean;
  deletedHealthIds: string[];

  // Actions
  addEntry: (entry: Omit<WeightEntry, 'id'>) => void;
  updateEntry: (id: string, updates: Partial<WeightEntry>) => void;
  deleteEntry: (id: string) => void;
  setGoal: (goal: WeightGoal | null) => void;
  setUnit: (unit: 'lbs' | 'kg') => void;
  setUnitDefault: (unit: 'lbs' | 'kg') => void;
  setHealthConnected: (connected: boolean) => void;
  setLastHealthSync: (timestamp: number | null) => void;

  // Computed methods
  getCurrentWeight: () => number | null;
  getWeightChange: () => number | null;
  getProgressPercentage: () => number | null;
  getPredictedGoalDate: () => number | null;
  getAverageWeeklyChange: () => number | null;
  reset: () => void;
}

const defaultState = {
  entries: [] as WeightEntry[],
  goal: null as WeightGoal | null,
  unit: 'lbs' as const,
  isHealthConnected: false,
  lastHealthSync: null as number | null,
  unitSetByUser: false as boolean,
  deletedHealthIds: [] as string[],
};

/**
 * Shared baseline for "change" and goal progress. Without a goal: the oldest entry
 * (all-time). With a goal: the earliest entry at/after the goal start, else the most
 * recent entry before it, so a goal set after the latest sample starts at zero change.
 * Callers guarantee `entries` is non-empty.
 */
export function getBaselineWeight(entries: WeightEntry[], goal: WeightGoal | null): number {
  const oldestFirst = [...entries].sort((a, b) => a.date - b.date);
  if (!goal) return oldestFirst[0].weight;
  const atOrAfter = oldestFirst.find((e) => e.date >= goal.startDate);
  if (atOrAfter) return atOrAfter.weight;
  return oldestFirst[oldestFirst.length - 1].weight;
}

export const useWeightStore = create<WeightState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      // Actions
      addEntry: (entry) => {
        // Defense in depth against double imports (SPEC-26).
        if (
          entry.healthId &&
          ((get().entries || []).some((e) => e.healthId === entry.healthId) ||
            (get().deletedHealthIds || []).includes(entry.healthId))
        ) {
          return;
        }
        const newEntry: WeightEntry = {
          ...entry,
          id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
        };
        set((state) => ({
          entries: [...(state.entries || []), newEntry].sort((a, b) => b.date - a.date),
        }));
      },

      updateEntry: (id, updates) => {
        set((state) => ({
          entries: (state.entries || []).map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry
          ),
        }));
      },

      deleteEntry: (id) => {
        set((state) => {
          const removed = (state.entries || []).find((entry) => entry.id === id);
          return {
            entries: (state.entries || []).filter((entry) => entry.id !== id),
            deletedHealthIds: removed?.healthId
              ? [...(state.deletedHealthIds || []), removed.healthId]
              : state.deletedHealthIds || [],
          };
        });
      },

      setGoal: (goal) => {
        set({ goal });
      },

      setUnit: (newUnit) => {
        set((state) => {
          const oldUnit = state.unit;

          // If unit hasn't changed, no conversion needed
          if (oldUnit === newUnit) return state;

          // Conversion factors
          const LBS_TO_KG = 0.453592;
          const KG_TO_LBS = 2.20462;

          // Convert weight entries
          const convertedEntries = (state.entries || []).map((entry) => {
            let convertedWeight = entry.weight;

            if (oldUnit === 'lbs' && newUnit === 'kg') {
              convertedWeight = entry.weight * LBS_TO_KG;
            } else if (oldUnit === 'kg' && newUnit === 'lbs') {
              convertedWeight = entry.weight * KG_TO_LBS;
            }

            return {
              ...entry,
              weight: Math.round(convertedWeight * 10) / 10, // Round to 1 decimal
              unit: newUnit,
            };
          });

          // Convert goal weight if exists
          let convertedGoal = state.goal;
          if (convertedGoal) {
            let convertedTargetWeight = convertedGoal.targetWeight;

            if (oldUnit === 'lbs' && newUnit === 'kg') {
              convertedTargetWeight = convertedGoal.targetWeight * LBS_TO_KG;
            } else if (oldUnit === 'kg' && newUnit === 'lbs') {
              convertedTargetWeight = convertedGoal.targetWeight * KG_TO_LBS;
            }

            convertedGoal = {
              ...convertedGoal,
              targetWeight: Math.round(convertedTargetWeight * 10) / 10, // Round to 1 decimal
              unit: newUnit,
            };
          }

          return {
            ...state,
            unit: newUnit,
            unitSetByUser: true,
            entries: convertedEntries,
            goal: convertedGoal,
          };
        });
      },

      setUnitDefault: (newUnit) => {
        const { unitSetByUser } = get();
        if (!unitSetByUser) {
          get().setUnit(newUnit);
        }
      },

      // SPEC-27: Erase All Data. Replaces in-memory state with defaults; persist
      // then writes only these defaults, never the stale pre-erase state.
      reset: () => {
        set({ ...defaultState });
      },

      setHealthConnected: (connected) => {
        set({ isHealthConnected: connected });
      },

      setLastHealthSync: (timestamp) => {
        set({ lastHealthSync: timestamp });
      },

      // Computed methods
      getCurrentWeight: () => {
        const state = get();
        if (state.entries.length === 0) return null;
        return state.entries[0].weight;
      },

      getWeightChange: () => {
        const state = get();
        if (state.entries.length < 2) return null;

        const currentWeight = state.entries[0].weight;
        const startWeight = getBaselineWeight(state.entries, state.goal);

        return currentWeight - startWeight;
      },

      getProgressPercentage: () => {
        const state = get();
        if (!state.goal || state.entries.length === 0) return null;

        const currentWeight = state.entries[0].weight;
        const goalWeight = state.goal.targetWeight;

        const startWeight = getBaselineWeight(state.entries, state.goal);

        // SPEC-16: all weight-bearing logs are dev-only. In production these
        // never run, so the Sentry console integration cannot capture them as
        // breadcrumbs. Do NOT log weight/goal values in production.
        if (__DEV__) {
          console.log(`[WeightStore] Progress calculation:`, {
            currentWeight,
            startWeight,
            goalWeight,
            goalStartDate: new Date(state.goal.startDate).toISOString(),
          });
        }

        // Determine if this is a weight loss or weight gain goal
        const isWeightLoss = goalWeight < startWeight;

        // If current weight equals start weight, progress is 0%
        if (Math.abs(currentWeight - startWeight) < 0.01) {
          if (__DEV__) console.log(`[WeightStore] No progress yet (current === start)`);
          return 0;
        }

        // Check if goal is achieved
        if (
          (isWeightLoss && currentWeight <= goalWeight) || // Weight loss goal achieved
          (!isWeightLoss && currentWeight >= goalWeight)   // Weight gain goal achieved
        ) {
          if (__DEV__) console.log(`[WeightStore] Goal achieved!`);
          return 100;
        }

        // Check for regression (moving away from goal)
        if (
          (isWeightLoss && currentWeight > startWeight) || // Weight increased when trying to lose
          (!isWeightLoss && currentWeight < startWeight)   // Weight decreased when trying to gain
        ) {
          if (__DEV__) console.log(`[WeightStore] Regression detected (moving away from goal)`);
          return 0;
        }

        // Calculate progress based on direction
        const totalChange = Math.abs(goalWeight - startWeight);
        const currentChange = Math.abs(currentWeight - startWeight);

        // Progress is how much of the total change has been achieved
        const progress = (currentChange / totalChange) * 100;

        if (__DEV__) {
          console.log(`[WeightStore] Progress: ${progress.toFixed(1)}%`, {
            totalChange: totalChange.toFixed(2),
            currentChange: currentChange.toFixed(2),
          });
        }

        // Clamp between 0 and 100
        return Math.min(100, Math.max(0, progress));
      },

      getPredictedGoalDate: () => {
        const state = get();
        if (!state.goal || state.entries.length < 2) return null;

        const avgWeeklyChange = get().getAverageWeeklyChange();
        if (!avgWeeklyChange || avgWeeklyChange === 0) return null;

        const currentWeight = state.entries[0].weight;
        const remainingWeight = state.goal.targetWeight - currentWeight;

        // If already at or past goal
        if (
          (avgWeeklyChange > 0 && remainingWeight <= 0) ||
          (avgWeeklyChange < 0 && remainingWeight >= 0)
        ) {
          return Date.now();
        }

        const weeksRemaining = remainingWeight / avgWeeklyChange;
        const msRemaining = weeksRemaining * 7 * 24 * 60 * 60 * 1000;

        return Date.now() + msRemaining;
      },

      getAverageWeeklyChange: () => {
        const state = get();
        if (state.entries.length < 2) return null;

        // Calculate average weekly change over last 4 weeks
        const fourWeeksAgo = Date.now() - 28 * 24 * 60 * 60 * 1000;
        const recentEntries = state.entries.filter((e) => e.date >= fourWeeksAgo);

        if (recentEntries.length < 2) {
          // Fallback to all entries if less than 4 weeks of data
          const oldestEntry = state.entries[state.entries.length - 1];
          const newestEntry = state.entries[0];
          const weightChange = newestEntry.weight - oldestEntry.weight;
          const timeDiff = newestEntry.date - oldestEntry.date;
          const weeks = timeDiff / (7 * 24 * 60 * 60 * 1000);

          return weeks > 0 ? weightChange / weeks : null;
        }

        const oldestRecent = recentEntries[recentEntries.length - 1];
        const newestRecent = recentEntries[0];
        const weightChange = newestRecent.weight - oldestRecent.weight;
        const timeDiff = newestRecent.date - oldestRecent.date;
        const weeks = timeDiff / (7 * 24 * 60 * 60 * 1000);

        return weeks > 0 ? weightChange / weeks : null;
      },
    }),
    {
      name: 'weight-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 5,
      migrate: (persistedState: any, version) => {
        if (!persistedState) {
          return { ...defaultState };
        }

        const stateWithDefaults = {
          ...defaultState,
          ...persistedState,
        };

        if (version < 1) {
          stateWithDefaults.lastHealthSync = null;
        }

        if (version < 2) {
          stateWithDefaults.lastHealthSync = null;
        }

        if (version < 3) {
          stateWithDefaults.unitSetByUser = false;
        }

        if (version < 4) {
          // Legacy manual entries may already be in Apple Health (the entry modal
          // wrote them directly). Mark them synced so they aren't exported twice.
          stateWithDefaults.entries = (stateWithDefaults.entries || []).map((e: WeightEntry) =>
            e.source === 'manual' ? { ...e, healthSynced: true } : e
          );
        }

        if (version < 5) {
          // SPEC-26: replace boolean healthSynced with explicit consent state.
          // Conservative: legacy entries not known to be in Health are opted_out
          // so history is never silently exported.
          stateWithDefaults.entries = (stateWithDefaults.entries || []).map((e: any) => {
            const { healthSynced, ...rest } = e;
            if (rest.source !== 'manual') return rest;
            return { ...rest, healthExport: healthSynced === true ? 'synced' : 'opted_out' };
          });
        }

        return stateWithDefaults;
      },
    }
  )
);

// Resolves once the persisted weight store has been rehydrated (SPEC-26).
export const waitForWeightStoreHydration = (): Promise<void> =>
  new Promise((resolve) => {
    if (useWeightStore.persist.hasHydrated()) {
      resolve();
      return;
    }
    const unsub = useWeightStore.persist.onFinishHydration(() => {
      unsub();
      resolve();
    });
  });
