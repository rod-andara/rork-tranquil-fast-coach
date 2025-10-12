import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors, spacing, typography, borderRadius } from '@/constants/theme';

function CelebratingIllustration() {
  return (
    <Svg width="200" height="200" viewBox="0 0 200 200">
      <Circle cx="100" cy="60" r="25" fill="#6D28D9" />
      <Path
        d="M75 85 Q75 75 85 75 L115 75 Q125 75 125 85 L125 110 Q125 120 115 120 L85 120 Q75 120 75 110 Z"
        fill="#A78BFA"
      />
      <Path
        d="M60 80 L75 95 L75 110 L60 95 Z"
        fill="#FDE68A"
      />
      <Path
        d="M125 95 L140 80 L140 95 L125 110 Z"
        fill="#FDE68A"
      />
      <Rect x="50" y="75" width="10" height="10" fill="#A78BFA" />
      <Rect x="140" y="75" width="10" height="10" fill="#A78BFA" />
      <Path
        d="M85 120 L70 145 Q65 155 75 160 L85 155 Z"
        fill="#A78BFA"
      />
      <Path
        d="M115 120 L130 145 Q135 155 125 160 L115 155 Z"
        fill="#A78BFA"
      />
      <Circle cx="90" cy="55" r="3" fill="#1F2937" />
      <Circle cx="110" cy="55" r="3" fill="#1F2937" />
      <Path
        d="M90 65 Q100 70 110 65"
        stroke="#1F2937"
        strokeWidth="2"
        fill="none"
      />
    </Svg>
  );
}

export default function TrackSucceedScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.illustrationContainer}>
            <CelebratingIllustration />
          </View>

          <Text style={styles.title}>Track & Succeed</Text>
          <Text style={styles.subtitle}>
            Monitor your progress, build streaks, and celebrate every milestone on your journey.
          </Text>

          <View style={styles.dotsContainer}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>
        </View>

        <Animated.View
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/onboarding/choose-plan')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  illustrationContainer: {
    width: 280,
    height: 280,
    backgroundColor: '#E9D5FF',
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.h1,
    fontSize: 32,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontWeight: '700' as const,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: '#D8B4FE',
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  footer: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.h3,
    fontSize: 18,
    color: colors.white,
  },
});
