import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function scheduleMilestones(totalSeconds: number, enabled: boolean): Promise<void> {
  try {
    if (!enabled || Platform.OS === 'web') {
      console.log('[notificationsUtils] disabled or web');
      return;
    }
    const milestones = [12 * 3600, 16 * 3600];
    for (const s of milestones) {
      if (s <= totalSeconds) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: s >= 16 * 3600 ? '16 Hours! 🎉' : '12 Hours! 🎉',
            body: s >= 16 * 3600 ? 'You reached 16h – amazing work!' : 'Fat-burning mode! Keep going!'
          },
          trigger: { seconds: s, repeats: false } as Notifications.TimeIntervalTriggerInput,
        });
      }
    }
  } catch (e) {
    console.log('[notificationsUtils] schedule error', e);
  }
}
