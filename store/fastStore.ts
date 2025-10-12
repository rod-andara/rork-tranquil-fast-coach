import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type FastingPlan = '16:8' | '18:6' | '20:4' | 'custom';

export interface FastSession {
  id: string;
  startTime: number;
  endTime: number | null;
  plannedDuration: number;
  completed: boolean;
}

export interface FastState {
  currentFast: FastSession | null;
  fastHistory: FastSession[];
  selectedPlan: FastingPlan;
  customDuration: number;
  notificationsEnabled: boolean;
  onboardingComplete: boolean;
  
  startFast: (duration: number) => void;
  endFast: () => void;
  setSelectedPlan: (plan: FastingPlan) => void;
  setCustomDuration: (duration: number) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  completeOnboarding: () => void;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

const STORAGE_KEY = '@tranquil_fast_coach';

export const useFastStore = create<FastState>((set, get) => ({
  currentFast: null,
  fastHistory: [],
  selectedPlan: '16:8',
  customDuration: 16,
  notificationsEnabled: true,
  onboardingComplete: false,

  startFast: (duration: number) => {
    const newFast: FastSession = {
      id: Date.now().toString(),
      startTime: Date.now(),
      endTime: null,
      plannedDuration: duration,
      completed: false,
    };
    set({ currentFast: newFast });
    get().saveToStorage();
  },

  endFast: () => {
    const { currentFast, fastHistory } = get();
    if (currentFast) {
      const completedFast: FastSession = {
        ...currentFast,
        endTime: Date.now(),
        completed: true,
      };
      set({
        currentFast: null,
        fastHistory: [completedFast, ...fastHistory],
      });
      get().saveToStorage();
    }
  },

  setSelectedPlan: (plan: FastingPlan) => {
    set({ selectedPlan: plan });
    get().saveToStorage();
  },

  setCustomDuration: (duration: number) => {
    set({ customDuration: duration });
    get().saveToStorage();
  },

  setNotificationsEnabled: (enabled: boolean) => {
    set({ notificationsEnabled: enabled });
    get().saveToStorage();
  },

  completeOnboarding: () => {
    set({ onboardingComplete: true });
    get().saveToStorage();
  },

  loadFromStorage: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        set(data);
      }
    } catch (error) {
      console.error('Failed to load from storage:', error);
    }
  },

  saveToStorage: async () => {
    try {
      const state = get();
      const toSave = {
        currentFast: state.currentFast,
        fastHistory: state.fastHistory,
        selectedPlan: state.selectedPlan,
        customDuration: state.customDuration,
        notificationsEnabled: state.notificationsEnabled,
        onboardingComplete: state.onboardingComplete,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  },
}));
