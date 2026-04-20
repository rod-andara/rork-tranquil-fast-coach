import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Heart } from 'lucide-react-native';

import VideoBackground from '@/components/VideoBackground';
import { spacing, borderRadius } from '@/constants/theme';
import { initHealthKit } from '@/utils/appleHealth';
import { useWeightStore } from '@/store/weightStore';

export default function HealthSyncScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [isConnecting, setIsConnecting] = useState(false);
  const { setHealthConnected } = useWeightStore();

  // Auto-skip on Android (HealthKit is iOS only)
  useEffect(() => {
    if (Platform.OS !== 'ios') {
      router.replace('/onboarding/choose-plan');
    }
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const success = await initHealthKit();
      if (success) {
        setHealthConnected(true);
        router.push('/onboarding/choose-plan');
      } else {
        // Permission denied or failed -- still let user continue
        router.push('/onboarding/choose-plan');
      }
    } catch (error) {
      console.error('[HealthSync] Failed to init HealthKit:', error);
      router.push('/onboarding/choose-plan');
    } finally {
      setIsConnecting(false);
    }
  };

  if (Platform.OS !== 'ios') return null;

  return (
    <VideoBackground source={require('@/assets/videos/track-succeed.mp4')}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <Animated.View
          style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <BlurView intensity={20} tint="dark" style={styles.textContainer}>
            <View style={styles.iconContainer}>
              <Heart size={48} color="#EF4444" fill="#EF4444" />
            </View>
            <Text style={styles.title}>Apple Health</Text>
            <Text style={styles.subtitle}>
              Sync your weight data with Apple Health to track your progress automatically
            </Text>
          </BlurView>

          {/* Progress Dots (4 total) */}
          <View style={styles.dotsContainer}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>
        </Animated.View>

        <Animated.View
          style={[styles.footer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={handleConnect}
            activeOpacity={0.8}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Connect Apple Health</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/onboarding/choose-plan')}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </VideoBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingHorizontal: spacing.lg },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: spacing.xxl },
  textContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: spacing.xl,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
    alignItems: 'center',
  },
  iconContainer: { marginBottom: spacing.lg },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 48,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.95,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  dotsContainer: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xxl },
  dot: { width: 8, height: 8, borderRadius: borderRadius.full, backgroundColor: 'rgba(255, 255, 255, 0.4)' },
  dotActive: { backgroundColor: '#FFFFFF', width: 24 },
  footer: { paddingBottom: spacing.xl, gap: spacing.md },
  button: {
    backgroundColor: '#EF4444',
    paddingVertical: spacing.md + 4,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  skipText: { fontSize: 16, fontWeight: '500', color: '#FFFFFF', textAlign: 'center', opacity: 0.8 },
});
