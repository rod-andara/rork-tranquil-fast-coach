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
}

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

  // Actions
  addEntry: (entry: Omit<WeightEntry, 'id'>) => void;
  updateEntry: (id: string, updates: Partial<WeightEntry>) => void;
  deleteEntry: (id: string) => void;
  setGoal: (goal: WeightGoal | null) => void;
  setUnit: (unit: 'lbs' | 'kg') => void;
  setHealthConnected: (connected: boolean) => void;
  setLastHealthSync: (timestamp: number | null) => void;

  // Computed methods
  getCurrentWeight: () => number | null;
  getWeightChange: () => number | null;
  getProgressPercentage: () => number | null;
  getPredictedGoalDate: () => number | null;
  getAverageWeeklyChange: () => number | null;
}

const defaultState = {
  entries: [] as WeightEntry[],
  goal: null as WeightGoal | null,
  unit: 'lbs' as const,
  isHealthConnected: false,
  lastHealthSync: null as number | null,
};

export const useWeightStore = create<WeightState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      // Actions
      addEntry: (entry) => {
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
        set((state) => ({
          entries: (state.entries || []).filter((entry) => entry.id !== id),
        }));
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
            entries: convertedEntries,
            goal: convertedGoal,
          };
        });
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
        const startWeight = state.goal
          ? state.entries.find((e) => e.date >= state.goal!.startDate)?.weight ||
            state.entries[state.entries.length - 1].weight
          : state.entries[state.entries.length - 1].weight;

        return currentWeight - startWeight;
      },

      getProgressPercentage: () => {
        const state = get();
        if (!state.goal || state.entries.length === 0) return null;

        const currentWeight = state.entries[0].weight;
        const startWeight = state.entries.find((e) => e.date >= state.goal!.startDate)?.weight ||
          state.entries[state.entries.length - 1].weight;
        const goalWeight = state.goal.targetWeight;

        // Determine if this is a weight loss or weight gain goal
        const isWeightLoss = goalWeight < startWeight;

        // If current weight equals start weight, progress is 0%
        if (currentWeight === startWeight) return 0;

        // Check if goal is achieved
        if (
          (isWeightLoss && currentWeight <= goalWeight) || // Weight loss goal achieved
          (!isWeightLoss && currentWeight >= goalWeight)   // Weight gain goal achieved
        ) {
          return 100;
        }

        // Check for regression (moving away from goal)
        if (
          (isWeightLoss && currentWeight > startWeight) || // Weight increased when trying to lose
          (!isWeightLoss && currentWeight < startWeight)   // Weight decreased when trying to gain
        ) {
          return 0; // No progress if moving in wrong direction
        }

        // Calculate progress based on direction
        const totalChange = Math.abs(goalWeight - startWeight);
        const currentChange = Math.abs(currentWeight - startWeight);

        // Progress is how much of the total change has been achieved
        const progress = (currentChange / totalChange) * 100;

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
      version: 2,
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

        return stateWithDefaults;
      },
    }
  )
);
