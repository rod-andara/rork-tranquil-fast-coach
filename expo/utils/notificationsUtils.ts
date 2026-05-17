import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { setupNotifications } from '@/services/notifications';

let notificationsSetup = false;

// ---------------------------------------------------------------------------
// SPEC-20: Notifications Brand-Voice + Lifecycle Cleanup
// ---------------------------------------------------------------------------
// Tranquil Fast v1.0 ships with calm, factual, non-shaming milestone copy.
// No health claims, no metabolic/fat-burning language, no gamified hype.
// See expo/specs/SPEC-20-notifications-brand-voice-lifecycle-cleanup.md for
// the full rationale and the forbidden-terms list.
//
// All scheduled notifications are FASTING MILESTONES only. cancellation uses
// cancelAllScheduledNotificationsAsync() because there are no other scheduled
// notification types in v1.0. If v1.1 adds other notification types (e.g.,
// weight-entry reminders), migrate cancelFastingNotifications() to use
// identifier-based cancellation so unrelated schedules are not affected.
// ---------------------------------------------------------------------------

/**
 * Cancel any scheduled fasting milestone notifications. Safe to call at any
 * time. Logs errors only in development. Used at every lifecycle point where
 * the existing schedule becomes inaccurate: fast ended, paused, plan changed,
 * notifications disabled mid-fast.
 */
export async function cancelFastingNotifications(): Promise<void> {
  try {
    if (Platform.OS === 'web') return;
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (__DEV__) console.log('[notificationsUtils] cancelled all scheduled notifications');
  } catch (e) {
    if (__DEV__) console.log('[notificationsUtils] cancel error', e);
  }
}

export async function scheduleMilestones(totalSeconds: number, enabled: boolean): Promise<void> {
  try {
    if (!enabled || Platform.OS === 'web') {
      if (__DEV__) console.log('[notificationsUtils] disabled or web');
      return;
    }

    if (!notificationsSetup) {
      await setupNotifications();
      notificationsSetup = true;
    }

    // Clear any previously-scheduled milestones before scheduling new ones.
    await cancelFastingNotifications();
    if (__DEV__) console.log('[notificationsUtils] scheduling milestones for', totalSeconds, 'seconds');

    // SPEC-20: calm, factual, non-shaming copy. No emoji. No exclamation marks
    // unless necessary. No fat-burning / autophagy / maximum benefits / unlocked /
    // crushing / outstanding / amazing / metabolic / guaranteed language.
    const milestones = [
      {
        seconds: 12 * 3600,
        title: '12 hours of fasting',
        body: "You've reached the 12-hour mark. Listen to your body and break your fast when you're ready.",
      },
      {
        seconds: 16 * 3600,
        title: '16 hours of fasting',
        body: "You've reached your typical 16:8 window. There's no pressure to keep going — eat when it's right for you.",
      },
      {
        seconds: 18 * 3600,
        title: '18 hours of fasting',
        body: "You're at 18 hours. Stay hydrated, and remember: ending your fast is a choice, not a failure.",
      },
      {
        seconds: 20 * 3600,
        title: '20 hours of fasting',
        body: "You've reached 20 hours. Whenever you choose to break your fast, that's your win for today.",
      },
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
        if (__DEV__) console.log('[notificationsUtils] scheduled', milestone.title, 'at', milestone.seconds, 'seconds');
      }
    }
  } catch (e) {
    if (__DEV__) console.log('[notificationsUtils] schedule error', e);
  }
}
