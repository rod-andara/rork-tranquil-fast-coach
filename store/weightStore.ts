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
  setLastHealthSync: (timestamp: number) => void;

  // Computed methods
  getCurrentWeight: () => number | null;
  getWeightChange: () => number | null;
  getProgressPercentage: () => number | null;
  getPredictedGoalDate: () => number | null;
  getAverageWeeklyChange: () => number | null;
}

export const useWeightStore = create<WeightState>()(
  persist(
    (set, get) => ({
      entries: [],
      goal: null,
      unit: 'lbs',
      isHealthConnected: false,
      lastHealthSync: null,

      // Actions
      addEntry: (entry) => {
        const newEntry: WeightEntry = {
          ...entry,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        };
        set((state) => ({
          entries: [...state.entries, newEntry].sort((a, b) => b.date - a.date),
        }));
      },

      updateEntry: (id, updates) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry
          ),
        }));
      },

      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        }));
      },

      setGoal: (goal) => {
        set({ goal });
      },

      setUnit: (unit) => {
        set({ unit });
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

        const totalChange = state.goal.targetWeight - startWeight;
        const currentChange = currentWeight - startWeight;

        if (totalChange === 0) return 100;

        return Math.min(100, Math.max(0, (currentChange / totalChange) * 100));
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
    }
  )
);
