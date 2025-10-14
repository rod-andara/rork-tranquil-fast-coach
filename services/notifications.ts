import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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


