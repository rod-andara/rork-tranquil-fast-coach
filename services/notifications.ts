import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useFastStore } from '@/store/fastStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function setupNotifications(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      console.log('[notifications] Web platform: skipping permissions');
      return;
    }
    const { status } = await Notifications.requestPermissionsAsync();
    console.log('[notifications] permission', status);
  } catch (e) {
    console.log('[notifications] setup error', e);
  }
}

export async function scheduleMilestones(totalSeconds: number): Promise<void> {
  try {
    const enabled = useFastStore.getState().notificationsEnabled;
    if (!enabled || Platform.OS === 'web') {
      console.log('[notifications] disabled or web');
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
    console.log('[notifications] schedule error', e);
  }
}
