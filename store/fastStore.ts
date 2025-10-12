import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import * as Haptics from 'expo-haptics';
import NetInfo from '@react-native-community/netinfo';
import { scheduleMilestones } from '@/services/notifications';
import { getPlanDuration } from '@/utils';
import { supabaseUpsertFast } from '@/services/supabase';
import { enqueueOffline } from '@/services/offline-sync';

export type FastingPlan = '14:10' | '16:8' | '18:6' | '20:4' | '23:1' | 'custom';

export interface FastSession {
  id: string;
  startTime: number;
  endTime: number | null;
  plannedDuration: number;
  completed: boolean;
  plan?: string;
  elapsedMs?: number;
  isRunning?: boolean;
}

export interface FastState {
  currentFast: FastSession | null;
  fastHistory: FastSession[];
  selectedPlan: FastingPlan;
  customDuration: number;
  notificationsEnabled: boolean;
  isDarkMode: boolean;
  onboardingComplete: boolean;
  
  startFast: (planOrDuration: number | string) => void;
  pauseFast: () => void;
  endFast: () => void;
  setSelectedPlan: (plan: FastingPlan) => void;
  updatePlan: (plan: FastingPlan) => Promise<void>;
  setCustomDuration: (duration: number) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDarkMode: (enabled: boolean) => void;
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
  isDarkMode: false,
  onboardingComplete: false,

  startFast: (planOrDuration: number | string) => {
    const state = get();
    const isPlanString = typeof planOrDuration === 'string';
    const plannedDuration = isPlanString ? getPlanDuration(planOrDuration) : planOrDuration;
    const planName = isPlanString ? (planOrDuration as string) : state.selectedPlan;
    const newFast: FastSession = {
      id: Date.now().toString(),
      startTime: Date.now(),
      endTime: null,
      plannedDuration,
      completed: false,
      plan: planName,
      elapsedMs: 0,
      isRunning: true,
    };
    set({ currentFast: newFast });
    if (state.notificationsEnabled) {
      try {
        scheduleMilestones(Math.floor(plannedDuration / 1000));
      } catch (e) {
        console.log('[store] scheduleMilestones error', e);
      }
    }
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    get().saveToStorage();
  },

  pauseFast: () => {
    const { currentFast } = get();
    if (!currentFast) return;
    const toggled = { ...currentFast, isRunning: !currentFast.isRunning };
    set({ currentFast: toggled });
    get().saveToStorage();
  },

  endFast: async () => {
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
      try {
        const state = await NetInfo.fetch();
        if (state.isConnected) {
          await supabaseUpsertFast({ user_id: 'stub', ...completedFast });
        } else {
          enqueueOffline({ type: 'upsertFast', payload: { user_id: 'stub', ...completedFast } });
        }
      } catch (e) {
        enqueueOffline({ type: 'upsertFast', payload: { user_id: 'stub', ...completedFast } });
      }
      get().saveToStorage();
    }
  },

  setSelectedPlan: (plan: FastingPlan) => {
    set({ selectedPlan: plan });
    get().saveToStorage();
  },

  updatePlan: async (plan: FastingPlan) => {
    const { currentFast } = get();
    if (currentFast) {
      set({ currentFast: null });
    }
    set({ selectedPlan: plan });
    await get().saveToStorage();
  },

  setCustomDuration: (duration: number) => {
    set({ customDuration: duration });
    get().saveToStorage();
  },

  setNotificationsEnabled: (enabled: boolean) => {
    set({ notificationsEnabled: enabled });
    get().saveToStorage();
  },

  setDarkMode: (enabled: boolean) => {
    set({ isDarkMode: enabled });
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
        isDarkMode: state.isDarkMode,
        onboardingComplete: state.onboardingComplete,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  },
}));
