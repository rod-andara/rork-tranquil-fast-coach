import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import FastPlanCard from '@/components/FastPlanCard';
import { useFastStore, FastingPlan } from '@/store/fastStore';

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
  const { setSelectedPlan: saveSelectedPlan, updatePlan, onboardingComplete, completeOnboarding } = useFastStore();
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

  const handleContinue = async () => {
    try {
      if (onboardingComplete) {
        await updatePlan(selectedPlan);
        router.back();
      } else {
        saveSelectedPlan(selectedPlan);
        completeOnboarding();
        router.replace('/(tabs)/home');
      }
    } catch (e) {
      console.log('Failed to apply plan', e);
    }
  };

  const selectedPlanData = PLANS.find((p) => p.id === selectedPlan);

  return (
    <View className="flex-1 bg-neutral-100 dark:bg-neutral-900">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mb-8">
            <View className="mb-6">
              <ClockIllustration />
            </View>
            <Text className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 text-center mb-2">
              Choose Your Plan
            </Text>
            <Text className="text-base text-neutral-500 dark:text-neutral-400 text-center mb-6">
              Select a fasting schedule that fits your lifestyle
            </Text>

            <View className="flex-row gap-2 mt-4">
              <View className="w-2 h-2 rounded-full bg-purple-300 dark:bg-purple-400" />
              <View className="w-2 h-2 rounded-full bg-purple-300 dark:bg-purple-400" />
              <View className="w-6 h-2 rounded-full bg-primary-600" />
            </View>
          </View>

          <View className="gap-4">
            {PLANS.map((plan) => (
              <FastPlanCard
                key={plan.id}
                id={plan.id}
                title={plan.title}
                description={plan.description}
                fastHours={plan.fastHours}
                eatHours={plan.eatHours}
                popular={plan.popular}
                selected={selectedPlan === plan.id}
                onPress={async () => {
                  setSelectedPlan(plan.id);
                  if (onboardingComplete) {
                    await updatePlan(plan.id);
                  }
                }}
              />
            ))}
          </View>
        </ScrollView>

        <Animated.View
          className="px-6 pb-8 bg-neutral-100 dark:bg-neutral-900"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <TouchableOpacity
            className="bg-primary-600 dark:bg-primary-500 py-4 px-8 rounded-xl items-center shadow-lg active:bg-primary-700"
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text className="text-lg font-semibold text-white">
              Start {selectedPlanData?.title} Plan
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
