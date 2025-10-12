import { Redirect } from 'expo-router';
import { useFastStore } from '@/store/fastStore';

export default function Index() {
  const { onboardingComplete } = useFastStore();

  if (onboardingComplete) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/onboarding/welcome" />;
}
