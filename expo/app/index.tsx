import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useFastStore } from '@/store/fastStore';

export default function Index() {
  const { hasHydrated, onboardingComplete } = useFastStore();

  if (__DEV__) console.log('[Index] Rendering index page');
  if (__DEV__) console.log('[Index] hasHydrated:', hasHydrated);
  if (__DEV__) console.log('[Index] onboardingComplete:', onboardingComplete);

  // Wait for hydration to complete before making routing decision
  if (!hasHydrated) {
    if (__DEV__) console.log('[Index] Showing loading spinner - waiting for hydration');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1F2937' }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  // After hydration, redirect based on onboarding status
  if (onboardingComplete) {
    if (__DEV__) console.log('[Index] Redirecting to /(tabs)/home - onboarding is complete');
    return <Redirect href="/(tabs)/home" />;
  }

  if (__DEV__) console.log('[Index] Redirecting to /onboarding/welcome - onboarding not complete');
  return <Redirect href="/onboarding/welcome" />;
}
