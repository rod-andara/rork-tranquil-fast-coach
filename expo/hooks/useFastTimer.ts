import { useCallback, useEffect, useState } from 'react';
import { useFastStore } from '@/store/fastStore';

export interface UseFastTimerResult {
  elapsedMs: number;
  formatTime: (ms: number) => string;
  calculateProgress: (elapsed: number, total: number) => number;
}

export default function useFastTimer(): UseFastTimerResult {
  const currentFast = useFastStore((s) => s.currentFast);
  const [elapsedMs, setElapsedMs] = useState<number>(0);

  // Elapsed is always wall-clock from startTime while a fast exists (SPEC-25: no pause).
  useEffect(() => {
    if (!currentFast) {
      setElapsedMs(0);
      return;
    }
    const tick = () => setElapsedMs(Date.now() - currentFast.startTime);
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [currentFast]);

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
