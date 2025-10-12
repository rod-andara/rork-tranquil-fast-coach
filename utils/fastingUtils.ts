export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function formatTimeDetailed(ms: number): {
  hours: string;
  minutes: string;
  seconds: string;
} {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0'),
  };
}

export function calculateProgress(elapsed: number, total: number): number {
  if (total === 0) return 0;
  return Math.min((elapsed / total) * 100, 100);
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

export function getFastingMessage(progressPercent: number): string {
  if (progressPercent < 10) {
    return "Great start! Your body is beginning to adapt.";
  } else if (progressPercent < 25) {
    return "You're doing well! Stay hydrated.";
  } else if (progressPercent < 50) {
    return "Excellent progress! Your body is adapting.";
  } else if (progressPercent < 75) {
    return "Great progress! Your body is adapting.";
  } else if (progressPercent < 90) {
    return "Almost there! You're in the final stretch.";
  } else {
    return "Amazing! You're about to complete your fast!";
  }
}

export function getPlanDuration(plan: string): number {
  const hours = parseInt(plan.split(':')[0]);
  return hours * 60 * 60 * 1000;
}
