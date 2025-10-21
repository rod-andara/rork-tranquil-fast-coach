import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Play, Square, Calendar, TrendingUp, Clock, Award } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useFastStore } from '@/store/fastStore';
import CircularProgress from '@/components/CircularProgress';
import StatCard from '@/components/StatCard';
import { formatTime, getPlanDuration } from '@/utils/fastingUtils';
import useFastTimer from '@/hooks/useFastTimer';

export default function HomeScreen() {
  const router = useRouter();
  const { currentFast, selectedPlan, startFast, endFast, fastHistory, isDarkMode } = useFastStore();
  const { elapsedMs, calculateProgress: calc } = useFastTimer();

  const progress = currentFast ? calc(elapsedMs, getPlanDuration(selectedPlan)) : 0;

  const totalFasts = fastHistory.length;
  const dayStreak = calculateDayStreak();
  const avgHours = calculateAvgHours();

  function calculateDayStreak(): number {
    if (fastHistory.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < fastHistory.length; i++) {
      const fastDate = new Date(fastHistory[i].startTime);
      fastDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today.getTime() - fastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  function calculateAvgHours(): number {
    if (fastHistory.length === 0) return 0;
    const totalHours = fastHistory.reduce((sum, fast) => {
      const duration = (fast.endTime || Date.now()) - fast.startTime;
      return sum + duration / (1000 * 60 * 60);
    }, 0);
    return Math.round((totalHours / fastHistory.length) * 10) / 10;
  }

  const handleStartFast = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    startFast(selectedPlan);
    router.push('/fast');
  };

  const handleEndFast = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    endFast();
  };

  return (
    <LinearGradient
      colors={isDarkMode ? ['#1a1625', '#1F2937'] : ['#FAFBFC', '#F3F4F6']}
      style={{ flex: 1 }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section - 24pt bottom margin */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
            Welcome Back!
          </Text>
          <Text className="text-base text-neutral-600 dark:text-neutral-400">
            Current Plan: {selectedPlan} Intermittent Fasting
          </Text>
        </View>

        {/* Timer Section - 24pt bottom margin */}
        <View className="items-center mb-6">
          <CircularProgress
            size={200}
            strokeWidth={12}
            progress={progress}
            color="#7C3AED"
            backgroundColor="#E5E7EB"
            isRunning={currentFast?.isRunning ?? false}
          >
            <View className="items-center">
              <Text
                className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-1"
                adjustsFontSizeToFit={true}
                numberOfLines={1}
                minimumFontScale={0.5}
              >
                {formatTime(elapsedMs)}
              </Text>
              <Text className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 tracking-wider">
                {currentFast ? 'FASTING' : 'READY TO START'}
              </Text>
            </View>
          </CircularProgress>
        </View>

        {/* Button Section - 32pt bottom margin for breathing room before stats */}
        <View className="mb-8">
          {currentFast ? (
            <TouchableOpacity
              className="flex-row items-center justify-center py-4 rounded-xl gap-2 bg-error-500 dark:bg-error-600 shadow-lg active:bg-error-600"
              onPress={handleEndFast}
              activeOpacity={0.8}
            >
              <Square size={20} color="#FFFFFF" />
              <Text className="text-base font-semibold text-white">Stop Fast</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="flex-row items-center justify-center py-4 rounded-xl gap-2 bg-primary-600 dark:bg-primary-500 shadow-lg active:bg-primary-700"
              onPress={handleStartFast}
              activeOpacity={0.8}
            >
              <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
              <Text className="text-base font-semibold text-white">Start Fast</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Section - Unified neutral backgrounds, 12pt gap between cards */}
        <View className="w-full mb-6">
          <View className="flex-row flex-wrap gap-3 w-full">
            <StatCard
              icon={Calendar}
              value={totalFasts}
              label="Total Fasts"
              iconColor="#7C3AED"
              iconBgColor="#F3F4F6"
            />
            <StatCard
              icon={TrendingUp}
              value={dayStreak}
              label="Day Streak"
              iconColor="#10B981"
              iconBgColor="#F3F4F6"
            />
            <StatCard
              icon={Clock}
              value={avgHours}
              label="Avg Hours"
              iconColor="#7C3AED"
              iconBgColor="#F3F4F6"
            />
          </View>
        </View>

        {/* Tip Card - 24pt bottom margin */}
        <View className="bg-primary-100 dark:bg-primary-900/20 p-4 rounded-lg border border-primary-200 dark:border-primary-700 mb-6">
          <View className="flex-row items-center gap-2 mb-2">
            <Award size={20} color="#7C3AED" />
            <Text className="text-base font-semibold text-neutral-700 dark:text-neutral-200">
              Fasting Tip
            </Text>
          </View>
          <Text className="text-sm text-neutral-700 dark:text-neutral-200 leading-5" testID="home-tip">
            {currentFast
              ? "Stay hydrated! Drink plenty of water, herbal tea, or black coffee during your fast."
              : `Start your ${selectedPlan} fasting journey and track your progress`}
          </Text>
        </View>

        {/* Change Plan Link */}
        <TouchableOpacity
          testID="change-plan-link"
          className="self-center mt-6 py-2 px-4"
          onPress={() => {
            console.log('Navigating to choose-plan');
            router.push('/onboarding/choose-plan');
          }}
          activeOpacity={0.7}
        >
          <Text className="text-base font-semibold text-primary-600 dark:text-primary-400">
            Change Plan
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

