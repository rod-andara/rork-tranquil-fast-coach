import { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { usePathname } from 'expo-router';
import { useFastStore } from '@/store/fastStore';
import { setupNotifications } from '@/services/notifications';

export default function AppSetup() {
  const isDarkMode = useFastStore((state) => state.isDarkMode);
  const pathname = usePathname();
  // Onboarding screens sit on dark video and the launch spinner on a dark background.
  const onDarkBackdrop = pathname === '/' || pathname.startsWith('/onboarding');
  const statusBarStyle = onDarkBackdrop || isDarkMode ? 'light' : 'dark';

  useEffect(() => {
    try {
      setupNotifications();
    } catch (e) {
      console.log('[App] setup error', e);
    }

    let webOnlineHandler: ((this: Window, ev: Event) => any) | undefined;
    let webOfflineHandler: ((this: Window, ev: Event) => any) | undefined;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      webOnlineHandler = () => console.log('[Network] online');
      webOfflineHandler = () => console.log('[Network] offline');
      window.addEventListener('online', webOnlineHandler);
      window.addEventListener('offline', webOfflineHandler);
    }

    return () => {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        if (webOnlineHandler) window.removeEventListener('online', webOnlineHandler);
        if (webOfflineHandler) window.removeEventListener('offline', webOfflineHandler);
      }
    };
  }, []);

  return <StatusBar style={statusBarStyle} />;
}
