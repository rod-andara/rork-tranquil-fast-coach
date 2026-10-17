import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import NetInfo from '@react-native-community/netinfo';
import { scheduleMilestones, cancelFastingNotifications } from '@/utils/notificationsUtils';
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
  darkModeSetByUser: boolean;
  onboardingComplete: boolean;
  isPremium: boolean;
  userName: string;
  hasHydrated: boolean;

  startFast: (planOrDuration: number | string) => void;
  endFast: () => void;
  setSelectedPlan: (plan: FastingPlan) => void;
  updatePlan: (plan: FastingPlan) => Promise<void>;
  setCustomDuration: (duration: number) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDarkMode: (enabled: boolean) => void;
  setDarkModeDefault: (defaultDark: boolean) => void;
  completeOnboarding: () => void;
  setPremium: (value: boolean) => void;
  setUserName: (name: string) => void;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
  reset: () => void;
}

const STORAGE_KEY = '@tranquil_fast_coach';

const defaultFastState = {
  currentFast: null as FastSession | null,
  fastHistory: [] as FastSession[],
  selectedPlan: '16:8' as FastingPlan,
  customDuration: 16,
  notificationsEnabled: true,
  isDarkMode: false,
  darkModeSetByUser: false,
  onboardingComplete: false,
  isPremium: false,
  userName: '',
};

export const useFastStore = create<FastState>((set, get) => ({
  ...defaultFastState,
  hasHydrated: false,

  // SPEC-27: Erase All Data. In-memory only; deliberately does not call
  // saveToStorage (storage was just cleared; onboarding persists naturally).
  reset: () => {
    set({ ...defaultFastState, hasHydrated: true });
  },

  startFast: (planOrDuration: number | string) => {
    const state = get();
    const isPlanString = typeof planOrDuration === 'string';

    const plannedDuration = isPlanString
      ? getPlanDuration(planOrDuration, state.customDuration)
      : planOrDuration;
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
        scheduleMilestones(Math.floor(plannedDuration / 1000), true);
      } catch (e) {
        // SPEC-20: dev-only; no notification telemetry in production.
        if (__DEV__) console.warn('[store] scheduleMilestones error', e);
      }
    }
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
    }
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
      // SPEC-20: cancel any milestone notifications still scheduled for this fast.
      cancelFastingNotifications();
      // SPEC-25: persist before any network work so killing the app mid-await
      // cannot resurrect the ended fast.
      await get().saveToStorage();
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
    }
  },

  setSelectedPlan: (plan: FastingPlan) => {
    set({ selectedPlan: plan });
    get().saveToStorage();
  },

  updatePlan: async (plan: FastingPlan) => {
    const { currentFast, customDuration, notificationsEnabled } = get();
    set({ selectedPlan: plan });
    if (currentFast) {
      // SPEC-25: adjust the running fast (keep id/startTime); never discard it.
      const plannedDuration = getPlanDuration(plan, customDuration);
      set({ currentFast: { ...currentFast, plan, plannedDuration } });
      cancelFastingNotifications();
      if (notificationsEnabled) {
        const elapsedSec = Math.floor((Date.now() - currentFast.startTime) / 1000);
        scheduleMilestones(Math.floor(plannedDuration / 1000), true, elapsedSec);
      }
    }
    await get().saveToStorage();
  },

  setCustomDuration: (duration: number) => {
    set({ customDuration: duration });
    get().saveToStorage();
  },

  setNotificationsEnabled: (enabled: boolean) => {
    set({ notificationsEnabled: enabled });
    // SPEC-20: if user disables notifications mid-fast, cancel any already-
    // scheduled milestones so they cannot fire later.
    if (!enabled) {
      cancelFastingNotifications();
    }
    get().saveToStorage();
  },

  setDarkMode: (enabled: boolean) => {
    set({ isDarkMode: enabled, darkModeSetByUser: true });
    get().saveToStorage();
  },

  setDarkModeDefault: (defaultDark: boolean) => {
    const state = get();
    if (state.darkModeSetByUser) return;
    set({ isDarkMode: defaultDark });
    state.saveToStorage();
  },

  completeOnboarding: () => {
    set({ onboardingComplete: true });
    get().saveToStorage();
  },

  setPremium: (value: boolean) => {
    set({ isPremium: value });
    get().saveToStorage();
  },

  setUserName: (name: string) => {
    set({ userName: name });
    get().saveToStorage();
  },

  loadFromStorage: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);

        // Migration: Check if custom duration needs to be reset
        // If user has 'custom' plan selected but customDuration is still default (16),
        // this indicates they saved a custom duration with the old broken code.
        // Reset their plan to 16:8 to avoid the timing bug.
        if (data.selectedPlan === 'custom' && data.customDuration === 16) {
          if (__DEV__) console.log('[FastStore] Migration: Resetting custom plan with default duration to 16:8');
          data.selectedPlan = '16:8';
          // Keep customDuration at 16 as default for future custom selections

          // Save the migrated data immediately
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }

        // SPEC-25: Pause was removed. Elapsed time is wall-clock from startTime,
        // so a session persisted as paused (build <= 104) simply resumes counting.
        if (data.currentFast && data.currentFast.isRunning === false) {
          data.currentFast = { ...data.currentFast, isRunning: true };
        }

        set({ ...data, hasHydrated: true });
      } else {
        // No stored data - still mark as hydrated
        set({ hasHydrated: true });
      }
    } catch (error) {
      if (__DEV__) console.error('Failed to load from storage:', error);
      // Even on error, mark as hydrated to prevent infinite loading
      set({ hasHydrated: true });
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
        darkModeSetByUser: state.darkModeSetByUser,
        onboardingComplete: state.onboardingComplete,
        isPremium: state.isPremium,
        userName: state.userName,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      if (__DEV__) console.error('Failed to save to storage:', error);
    }
  },
}));
