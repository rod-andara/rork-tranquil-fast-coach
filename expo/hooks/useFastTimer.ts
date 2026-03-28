import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import { useFastStore } from '@/store/fastStore';
import { storageKeys } from '@/utils';

const TASK_NAME = 'fast-timer';

export interface UseFastTimerResult {
  elapsedMs: number;
  formatTime: (ms: number) => string;
  calculateProgress: (elapsed: number, total: number) => number;
}

export default function useFastTimer(): UseFastTimerResult {
  const currentFast = useFastStore((s) => s.currentFast);
  const isRunning = Boolean(currentFast?.isRunning ?? currentFast);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(storageKeys.elapsedMs);
        const parsed = stored ? Number(stored) : 0;
        if (mounted) setElapsedMs(Number.isFinite(parsed) ? parsed : 0);
      } catch (e) {
        console.log('[useFastTimer] load elapsed error', e);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isRunning && currentFast) {
      const tick = async () => {
        const elapsed = Date.now() - currentFast.startTime;
        setElapsedMs(elapsed);
        try {
          await AsyncStorage.setItem(storageKeys.elapsedMs, String(elapsed));
        } catch (e) {
          console.log('[useFastTimer] save elapsed error', e);
        }
      };
      tick();
      interval = setInterval(tick, 1000);
    } else {
      setElapsedMs(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, currentFast]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', async (next) => {
      appState.current = next;
    });
    return () => sub.remove();
  }, []);

  const formatTime = useCallback((ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (v: number) => v.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }, []);

  const calculateProgress = useCallback((elapsed: number, total: number) => {
    if (!total) return 0;
    const pct = (elapsed / total) * 100;
    return Math.min(Math.max(pct, 0), 100);
  }, []);

  return { elapsedMs, formatTime, calculateProgress };
}

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    const state = useFastStore.getState();
    const start = state.currentFast?.startTime ?? 0;
    const elapsed = start ? Date.now() - start : 0;
    await AsyncStorage.setItem(storageKeys.elapsedMs, String(elapsed));
  } catch (e) {
    console.log('[fast-timer task] error', e);
  }
});
