import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useFastStore } from "@/store/fastStore";
import AppSetup from "@/App";
import ErrorBoundary from "@/components/ErrorBoundary";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const Root = Platform.OS === 'web' ? View : GestureHandlerRootView;

function RootLayoutNav() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await useFastStore.getState().loadFromStorage();
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
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

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