import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import FastPlanCard from '@/components/FastPlanCard';
import VideoBackground from '@/components/VideoBackground';
import { CustomDurationModal } from '@/components/CustomDurationModal';
import { useFastStore, FastingPlan } from '@/store/fastStore';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';

const PLANS = [
  {
    id: '16:8' as FastingPlan,
    title: '16:8',
    description: 'Fast for 16 hours, eat within an 8-hour window. Perfect for beginners.',
    fastHours: 16,
    eatHours: 8,
    popular: true,
  },
  {
    id: '18:6' as FastingPlan,
    title: '18:6',
    description: 'Fast for 18 hours, eat within a 6-hour window. Great for weight loss.',
    fastHours: 18,
    eatHours: 6,
    popular: false,
  },
  {
    id: '20:4' as FastingPlan,
    title: '20:4 (Warrior)',
    description: 'Fast for 20 hours with a 4-hour eating window. Advanced fasting.',
    fastHours: 20,
    eatHours: 4,
    popular: false,
  },
  {
    id: '23:1' as FastingPlan,
    title: 'OMAD (23:1)',
    description: 'One meal a day. Maximum fasting benefits for experienced fasters.',
    fastHours: 23,
    eatHours: 1,
    popular: false,
  },
  {
    id: '14:10' as FastingPlan,
    title: '14:10',
    description: 'Fast for 14 hours, eat within 10 hours. Gentle introduction to fasting.',
    fastHours: 14,
    eatHours: 10,
    popular: false,
  },
  {
    id: 'custom' as FastingPlan,
    title: 'Custom',
    description: 'Create your own fasting schedule between 4 and 48 hours.',
    fastHours: 16,
    eatHours: 8,
    popular: false,
  },
];

function ClockIllustration() {
  return (
    <Svg width="120" height="120" viewBox="0 0 120 120">
      <Circle cx="60" cy="60" r="50" fill="#E0E7FF" />
      <Circle cx="60" cy="60" r="45" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="2" />
      <Path d="M60 60 L60 30" stroke="#6B7280" strokeWidth="3" strokeLinecap="round" />
      <Path d="M60 60 L80 60" stroke="#6B7280" strokeWidth="3" strokeLinecap="round" />
      <Circle cx="60" cy="60" r="4" fill="#6B7280" />
      <Circle cx="60" cy="20" r="3" fill="#D1D5DB" />
      <Circle cx="60" cy="100" r="3" fill="#D1D5DB" />
      <Circle cx="20" cy="60" r="3" fill="#D1D5DB" />
      <Circle cx="100" cy="60" r="3" fill="#D1D5DB" />
    </Svg>
  );
}

export default function ChoosePlanScreen() {
  const [selectedPlan, setSelectedPlan] = useState<FastingPlan>('16:8');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const fromSettings = params.fromSettings === 'true';
  const {
    setSelectedPlan: saveSelectedPlan,
    updatePlan,
    onboardingComplete,
    completeOnboarding,
    isDarkMode,
    startFast,
    customDuration,
    setCustomDuration,
  } = useFastStore();
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

  const handleSaveCustomDuration = (hours: number, minutes: number) => {
    // Convert hours and minutes to total hours (decimal)
    const totalHours = hours + minutes / 60;
    setCustomDuration(totalHours);
    setSelectedPlan('custom');

    if (fromSettings) {
      updatePlan('custom');
    }
  };

  const formatCustomDuration = () => {
    const hours = Math.floor(customDuration);
    const minutes = Math.round((customDuration - hours) * 60);

    if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const handleContinue = () => {
    console.log('[ChoosePlan] ========== BUTTON PRESSED ==========');
    console.log('[ChoosePlan] handleContinue called, selectedPlan:', selectedPlan);
    console.log('[ChoosePlan] onboardingComplete:', onboardingComplete);
    console.log('[ChoosePlan] fromSettings:', fromSettings);

    try {
      if (fromSettings) {
        // Changing plan from Settings - just update and go back
        console.log('[ChoosePlan] Updating plan from Settings');
        updatePlan(selectedPlan);
        router.back();
      } else {
        // Completing onboarding for first time
        console.log('[ChoosePlan] Step 1: Saving selected plan');
        saveSelectedPlan(selectedPlan);

        console.log('[ChoosePlan] Step 2: Marking onboarding as complete');
        completeOnboarding();

        console.log('[ChoosePlan] Step 3: Navigating to Home tab (user will manually start fast)');
        // Replace the entire onboarding stack with the Home tab
        // User will manually start the fast from the Home screen
        router.replace('/(tabs)/home');
      }
    } catch (e) {
      console.error('[ChoosePlan] ERROR in handleContinue:', e);
      console.error('[ChoosePlan] Error stack:', (e as Error).stack);
      alert(`Error: ${(e as Error).message}`);
    }
  };

  const selectedPlanData = PLANS.find((p) => p.id === selectedPlan);

  return (
    <VideoBackground
      source={require('@/assets/videos/choose-plan-bg.mp4')}
      gradientColors={['rgba(124, 58, 237, 0.6)', 'rgba(31, 41, 55, 0.85)']}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.illustrationContainer}>
              <ClockIllustration />
            </View>
            <Text style={[styles.title, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
              Choose Your Plan
            </Text>
            <Text style={[styles.subtitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
              Select a fasting schedule that fits your lifestyle
            </Text>

            <View style={styles.dotsContainer}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={[styles.dot, styles.dotActive]} />
            </View>
          </View>

          <View style={styles.plans}>
            {PLANS.map((plan) => (
              <FastPlanCard
                key={plan.id}
                id={plan.id}
                title={plan.id === 'custom' && selectedPlan === 'custom' ? `Custom (${formatCustomDuration()})` : plan.title}
                description={plan.description}
                fastHours={plan.fastHours}
                eatHours={plan.eatHours}
                popular={plan.popular}
                selected={selectedPlan === plan.id}
                isDarkMode={isDarkMode}
                onPress={async () => {
                  if (plan.id === 'custom') {
                    setShowCustomModal(true);
                  } else {
                    setSelectedPlan(plan.id);
                    if (fromSettings) {
                      await updatePlan(plan.id);
                    }
                  }
                }}
              />
            ))}
          </View>
        </ScrollView>

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
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              Start {selectedPlan === 'custom' ? `Custom (${formatCustomDuration()})` : selectedPlanData?.title} Plan
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <CustomDurationModal
          visible={showCustomModal}
          onClose={() => setShowCustomModal(false)}
          onSave={handleSaveCustomDuration}
          initialHours={Math.floor(customDuration)}
          initialMinutes={Math.round((customDuration - Math.floor(customDuration)) * 60)}
        />
      </SafeAreaView>
    </VideoBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Will be overridden by inline style
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  illustrationContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    fontSize: 28,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: '700' as const,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
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
  plans: {
    gap: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
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
