import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import type { WebViewNavigation } from 'react-native-webview/lib/WebViewTypes';
import * as WebBrowser from 'expo-web-browser';
import { ExternalLink, X } from 'lucide-react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { useFastStore } from '@/store/fastStore';

const DEFAULT_PAYWALL_URL = process.env.EXPO_PUBLIC_PAYWALL_URL ?? 'https://buy.stripe.com/test_bWYeXYb1y0S41gA000';
const SUCCESS_URL_PREFIX = process.env.EXPO_PUBLIC_PAYWALL_SUCCESS_URL ?? 'https://tranquilfast.app/success';
const CANCEL_URL_PREFIX = process.env.EXPO_PUBLIC_PAYWALL_CANCEL_URL ?? 'https://tranquilfast.app/cancel';

export default function PaywallScreen() {
  const router = useRouter();
  const webRef = useRef<WebView>(null);
  const { isDarkMode, setPremium } = useFastStore();
  const [loading, setLoading] = useState<boolean>(true);

  const background = isDarkMode ? colors.backgroundDark : colors.background;
  const text = isDarkMode ? colors.textDark : colors.text;

  const uri = useMemo(() => DEFAULT_PAYWALL_URL, []);

  const handleSuccess = useCallback(() => {
    try {
      setPremium(true);
    } catch (e) {
      console.log('Failed to set premium', e);
    }
    router.replace('/(tabs)/home');
  }, [router, setPremium]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const onNavChange = useCallback(
    (navState: WebViewNavigation) => {
      const url = navState?.url ?? '';
      if (url.startsWith(SUCCESS_URL_PREFIX)) {
        handleSuccess();
      } else if (url.startsWith(CANCEL_URL_PREFIX)) {
        handleCancel();
      }
    },
    [handleSuccess, handleCancel]
  );

  useEffect(() => {
    if (Platform.OS === 'web') {
      WebBrowser.openBrowserAsync(uri).finally(() => {
        router.back();
      });
    }
  }, [router, uri]);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { backgroundColor: background }]} testID="paywall-web-fallback">
        <Stack.Screen options={{ title: 'Premium', headerBackTitle: 'Back' }} />
        <View style={styles.center}>
          <Text style={[styles.title, { color: text }]}>Opening secure checkout…</Text>
          <ActivityIndicator color={colors.primary} />
          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => WebBrowser.openBrowserAsync(uri)}
            testID="open-checkout-again"
            accessibilityRole="button"
            accessibilityLabel="Open checkout again in browser"
          >
            <Text style={styles.link}>Open again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: background }]} testID="paywall-screen">
      <Stack.Screen
        options={{
          title: 'Premium',
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => WebBrowser.openBrowserAsync(uri)}
                style={styles.headerIcon}
                accessibilityLabel="Open checkout in browser"
                testID="paywall-open-browser"
              >
                <ExternalLink size={18} color={text} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.headerIcon}
                accessibilityLabel="Close paywall"
                testID="paywall-close"
              >
                <X size={20} color={text} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <WebView
        ref={webRef}
        source={{ uri }}
        startInLoadingState
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={onNavChange}
        style={styles.webview}
        testID="paywall-webview"
      />
      {loading && (
        <View style={styles.loader} pointerEvents="none">
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  title: { ...typography.h3 },
  linkBtn: { padding: spacing.sm },
  link: { color: colors.primary, ...typography.body, fontWeight: '600' as const },
  headerIcon: { paddingHorizontal: spacing.md },
});
