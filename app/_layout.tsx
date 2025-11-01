import "../global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "nativewind";
import * as Sentry from "@sentry/react-native";

import { useFastStore } from "@/store/fastStore";
import { useWeightStore } from "@/store/weightStore";
import { initHealthKit } from "@/utils/appleHealth";
import AppSetup from "@/App";
import ErrorBoundary from "@/components/ErrorBoundary";

// Initialize Sentry for error tracking
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || "https://YOUR_DSN_HERE@o4508556583305216.ingest.us.sentry.io/4508556585926656",
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  // Set to true to enable debug mode (only in development)
  debug: __DEV__,
  environment: __DEV__ ? "development" : "production",
  // Enable native crash reporting
  enableNative: true,
  // Enable automatic session tracking
  enableAutoSessionTracking: true,
  // Session timeout (30 seconds)
  sessionTrackingIntervalMillis: 30000,
});

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const Root = Platform.OS === 'web' ? View : GestureHandlerRootView;

function RootLayoutNav() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      // Load store data from storage
      await useFastStore.getState().loadFromStorage();

      // If user has previously connected to Apple Health, reinitialize on app startup
      const isHealthConnected = useWeightStore.getState().isHealthConnected;
      if (isHealthConnected && Platform.OS === 'ios') {
        console.log('[App] User previously connected to Apple Health, reinitializing...');
        try {
          await initHealthKit();
          console.log('[App] HealthKit reinitialized successfully');
        } catch (error) {
          console.error('[App] Failed to reinitialize HealthKit:', error);
        }
      }

      setIsReady(true);
    };
    loadData();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="onboarding/welcome" 
        options={{ 
          headerShown: false,
          presentation: "card",
        }} 
      />
      <Stack.Screen 
        name="onboarding/track-succeed" 
        options={{ 
          headerShown: false,
          presentation: "card",
        }} 
      />
      <Stack.Screen 
        name="onboarding/choose-plan" 
        options={{ 
          headerShown: false,
          presentation: "card",
        }} 
      />
      <Stack.Screen name="paywall" options={{ headerShown: true, title: 'Premium' }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

function RootLayout() {
  const isDarkMode = useFastStore((state) => state.isDarkMode);
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    setColorScheme(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode, setColorScheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <Root style={{ flex: 1 }}>
        <ErrorBoundary>
          <AppSetup />
          <RootLayoutNav />
        </ErrorBoundary>
      </Root>
    </QueryClientProvider>
  );
}

// Wrap the root component with Sentry for error tracking
export default Sentry.wrap(RootLayout);