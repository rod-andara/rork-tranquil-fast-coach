// CRITICAL: Import reanimated BEFORE global.css
// NativeWind's CSS transforms use Reanimated for animations
// Reanimated must be available when global.css initializes
import 'react-native-reanimated';
import "../global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { Appearance, Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "nativewind";
import * as Sentry from "@sentry/react-native";
import * as Localization from 'expo-localization';

import { useFastStore } from "@/store/fastStore";
import { useWeightStore } from "@/store/weightStore";
import { initHealthKit } from "@/utils/appleHealth";
import { initializeRevenueCat, checkSubscriptionStatus, REVENUECAT_ENABLED } from "@/services/revenuecat";
import AppSetup from "@/App";
import ErrorBoundary from "@/components/ErrorBoundary";

// ---------------------------------------------------------------------------
// SPEC-16: Sentry Privacy Hardening
// ---------------------------------------------------------------------------
// Tranquil Fast is a privacy-first weight/fasting app. Sentry is configured for
// minimal crash reporting only — no health, weight, fasting, or user-identifying
// data may leave the device. See expo/specs/SPEC-16-sentry-privacy-hardening.md
// for the full rationale, before/after posture, and acceptance criteria.
// ---------------------------------------------------------------------------

// Keys that must never appear in any Sentry payload. Used by the redactor below
// as a defense-in-depth scrub on every outgoing event and breadcrumb.
const SENSITIVE_KEYS = new Set([
  'weight', 'currentWeight', 'startWeight', 'goalWeight', 'targetWeight',
  'bodyMass', 'fastingHistory', 'fastingDuration', 'fastStart', 'fastEnd',
  'userName', 'name', 'healthData', 'appleHealth', 'healthkit',
  'goalStartDate', 'options',
]);

function redactSensitive<T>(input: T): T {
  if (input === null || input === undefined) return input;
  if (Array.isArray(input)) {
    return input.map((v) => redactSensitive(v)) as unknown as T;
  }
  if (typeof input === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(k)) {
        out[k] = '[redacted]';
      } else {
        out[k] = redactSensitive(v);
      }
    }
    return out as T;
  }
  return input;
}

// Initialize Sentry — minimal crash reporting only.
Sentry.init({
  // DSN comes exclusively from the EAS secret EXPO_PUBLIC_SENTRY_DSN.
  // If unset at build time, the SDK no-ops gracefully (no events sent).
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
  debug: __DEV__,

  // --- Minimal crash reporting only ---
  enableNative: true,                   // native iOS crashes — keep
  attachStacktrace: false,

  // --- Disabled tracing/telemetry surfaces (SPEC-16 §4.3) ---
  tracesSampleRate: 0,                  // no performance tracing
  enableAutoPerformanceTracing: false,
  enableUserInteractionTracing: false,  // no auto touch breadcrumbs
  enableAutoSessionTracking: false,     // no session start/stop events

  // --- PII safety ---
  sendDefaultPii: false,
  maxBreadcrumbs: 30,

  // --- Defense-in-depth: drop console breadcrumbs entirely in prod ---
  beforeBreadcrumb(breadcrumb) {
    if (!__DEV__ && breadcrumb.category === 'console') return null;
    if (breadcrumb.data) {
      breadcrumb.data = redactSensitive(breadcrumb.data);
    }
    return breadcrumb;
  },

  // --- Final-stage outbound scrub of every event payload ---
  beforeSend(event) {
    if (event.contexts) event.contexts = redactSensitive(event.contexts);
    if (event.extra) event.extra = redactSensitive(event.extra);
    if (event.tags) event.tags = redactSensitive(event.tags);
    if (event.request) event.request = redactSensitive(event.request);
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((b) => ({
        ...b,
        data: b.data ? redactSensitive(b.data) : b.data,
      }));
    }
    return event;
  },
});

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const Root = Platform.OS === 'web' ? View : GestureHandlerRootView;

function RootLayoutNav() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load store data from storage
        await useFastStore.getState().loadFromStorage();

        // Auto-detect dark mode on first launch (no-op if user already chose)
        const systemColorScheme = Appearance.getColorScheme();
        useFastStore.getState().setDarkModeDefault(systemColorScheme === 'dark');

        // Auto-detect unit preference on first launch
        const { setUnitDefault } = useWeightStore.getState();
        const locales = Localization.getLocales();
        const regionCode = locales[0]?.regionCode ?? '';
        const imperialRegions = ['US', 'LR', 'MM'];
        const detectedUnit = imperialRegions.includes(regionCode) ? 'lbs' : 'kg';
        setUnitDefault(detectedUnit);

        // RevenueCat — gated by EXPO_PUBLIC_ENABLE_REVENUECAT (SPEC-17).
        // For v1.0 (free launch), this is disabled. The whole block is a no-op
        // when REVENUECAT_ENABLED is false: no network calls, no anonymous ID
        // generation, no Sentry noise. Re-enable in v1.1 by setting the env var
        // and provisioning EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY.
        if (REVENUECAT_ENABLED) {
          try {
            const ok = await initializeRevenueCat();
            if (ok) {
              const isPremium = await checkSubscriptionStatus();
              useFastStore.getState().setPremium(isPremium);
            }
          } catch (error) {
            if (__DEV__) console.error('[App] RevenueCat init error:', error);
          }
        }
      } catch (error) {
        if (__DEV__) console.error('[App] Error during startup:', error);
      }

      // If user has previously connected to Apple Health, reinitialize on app startup
      const isHealthConnected = useWeightStore.getState().isHealthConnected;
      if (isHealthConnected && Platform.OS === 'ios') {
        try {
          await initHealthKit();
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
        name="onboarding/health-sync"
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
      {/*
        SPEC-17: paywall route deliberately NOT registered in v1.0.
        RevenueCat is disabled (EXPO_PUBLIC_ENABLE_REVENUECAT !== 'true'), so the
        paywall has no offerings and no purchase flow. The file app/paywall.tsx is
        retained for v1.1 reactivation — restore this <Stack.Screen> line when
        re-enabling premium subscriptions.
      */}
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