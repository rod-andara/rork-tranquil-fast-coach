import { Alert } from 'react-native';
import { formatTime, formatTimeDetailed, calculateProgress, formatDate, getPlanDuration } from './fastingUtils';

export function getFastingMessage(progress: number): string {
  if (progress < 25) return 'Great start! 💪';
  if (progress < 50) return 'Amazing! 🔥';
  if (progress < 75) return "You're cruising! 🚀";
  if (progress < 90) return 'Final stretch! 🏁';
  return 'Almost there—finish strong! 🌟';
}

export function errorHandler(err: unknown, context: string): void {
  const message = err instanceof Error ? err.message : String(err);
  if (__DEV__) console.error(`[Error] ${context}:`, err);
  try {
    Alert.alert(context, message);
  } catch {}
}

export const storageKeys = {
  root: '@tranquil_fast_coach',
  elapsedMs: '@fast_elapsed_ms',
  currentFast: 'currentFast',
  history: 'history',
} as const;

export { formatTime, formatTimeDetailed, calculateProgress, formatDate, getPlanDuration };
