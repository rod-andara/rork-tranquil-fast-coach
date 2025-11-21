import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { setupNotifications } from '@/services/notifications';

let notificationsSetup = false;

export async function scheduleMilestones(totalSeconds: number, enabled: boolean): Promise<void> {
  try {
    if (!enabled || Platform.OS === 'web') {
      console.log('[notificationsUtils] disabled or web');
      return;
    }

    if (!notificationsSetup) {
      await setupNotifications();
      notificationsSetup = true;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[notificationsUtils] scheduling milestones for', totalSeconds, 'seconds');

    const milestones = [
      { seconds: 12 * 3600, title: '12 Hours Complete! 🎉', body: 'Fat-burning mode activated! Keep going!' },
      { seconds: 16 * 3600, title: '16 Hours Complete! 🔥', body: 'Amazing work! Peak autophagy zone!' },
      { seconds: 18 * 3600, title: '18 Hours Complete! 💪', body: 'Incredible dedication! You\'re crushing it!' },
      { seconds: 20 * 3600, title: '20 Hours Complete! ⭐', body: 'Outstanding! Maximum benefits unlocked!' },
    ];

    for (const milestone of milestones) {
      if (milestone.seconds <= totalSeconds) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: milestone.title,
            body: milestone.body,
          },
          trigger: {
            type: 'timeInterval',
            seconds: milestone.seconds,
            repeats: false,
          } as Notifications.TimeIntervalTriggerInput,
        });
        console.log('[notificationsUtils] scheduled', milestone.title, 'at', milestone.seconds, 'seconds');
      }
    }
  } catch (e) {
    console.log('[notificationsUtils] schedule error', e);
  }
}
