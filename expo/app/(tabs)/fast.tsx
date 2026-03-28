import React, { useEffect, useRef, useState } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Switch, Platform, Animated } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Pause, Play, XCircle, Bell, Lightbulb } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useFastStore } from '@/store/fastStore';
import CircularProgress from '@/components/CircularProgress';
import { formatTime, formatDate, getFastingMessage, getPlanDuration } from '@/utils';
import useFastTimer from '@/hooks/useFastTimer';

export default function FastScreen() {
  const { selectedPlan, currentFast, endFast, notificationsEnabled, setNotificationsEnabled, pauseFast, isDarkMode } = useFastStore();
  const router = useRouter();
  const { elapsedMs, calculateProgress: calc } = useFastTimer();
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const progress = currentFast ? calc(elapsedMs, getPlanDuration(selectedPlan)) : 0;
  const targetEndTime = currentFast ? currentFast.startTime + getPlanDuration(selectedPlan) : 0;
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress, animatedWidth]);

  const handlePauseResume = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsPaused(!isPaused);
    pauseFast();
  };

  const handleEndFast = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    endFast();
  };

  if (!currentFast) {
    return (
      <LinearGradient
        colors={isDarkMode ? ['#1a1625', '#1F2937'] : ['#FAFBFC', '#F3F4F6']}
        style={{ flex: 1 }}
      >
        <Stack.Screen options={{ title: 'Your Fast' }} />
        <View className="flex-1 justify-center items-center px-8">
          <Text className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">
            No Active Fast
          </Text>
          <Text className="text-base text-neutral-500 dark:text-neutral-400 text-center">
            Start a fast from the Home screen to track your progress here.
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={isDarkMode ? ['#1a1625', '#1F2937'] : ['#FAFBFC', '#F3F4F6']}
      style={{ flex: 1 }}
    >
      <Stack.Screen
        options={{
          title: 'Your Fast',
          headerLeft: () => (
            <TouchableOpacity className="py-2 px-4" onPress={() => router.back()} activeOpacity={0.7} accessibilityRole="button" testID="fast-back">
              <Text className="text-base font-semibold text-primary-600 dark:text-primary-400">Back</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View className="mr-4">
              <Text className="text-sm text-neutral-500 dark:text-neutral-400">{selectedPlan} Intermittent Fasting</Text>
            </View>
          ),
        }}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Smart Reminders Card - 24pt bottom margin */}
        <View className="flex-row items-center justify-between bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm mb-6">
          <View className="flex-row items-center gap-2 flex-1">
            <Bell size={20} color="#6B7280" />
            <View>
              <Text className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
                Smart Reminders
              </Text>
              <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                Get notified at key milestones
              </Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#E5E7EB', true: '#7C3AED' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Timer Section - 24pt bottom margin */}
        <View className="items-center mb-6">
          <CircularProgress
            size={250}
            strokeWidth={16}
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
                {currentFast?.isRunning ? 'FASTING' : 'PAUSED'}
              </Text>
            </View>
          </CircularProgress>
        </View>

        {/* Encouragement Message - 24pt bottom margin, more breathing room */}
        <Text className="text-base text-primary-600 dark:text-primary-400 text-center mb-6 font-medium">
          {getFastingMessage(progress)}
        </Text>

        {/* Details Card - 24pt bottom margin */}
        <View className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base text-neutral-500 dark:text-neutral-400">Started</Text>
            <Text className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
              {formatDate(currentFast.startTime)}
            </Text>
          </View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base text-neutral-500 dark:text-neutral-400">Target End</Text>
            <Text className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
              {formatDate(targetEndTime)}
            </Text>
          </View>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base text-neutral-500 dark:text-neutral-400">Progress</Text>
            <Text className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
              {progress.toFixed(0)}%
            </Text>
          </View>
          {/* Progress Bar - true 0% width with visible border */}
          <View className="w-full mt-2">
            <View className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden w-full border border-neutral-300 dark:border-neutral-600">
              <Animated.View
                className="h-full bg-primary-600 rounded-full"
                style={{
                  width: animatedWidth.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%']
                  })
                }}
              />
            </View>
          </View>
        </View>

        {/* Action Buttons - 24pt bottom margin */}
        <View className="flex-row gap-4 mb-6">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center py-4 rounded-xl gap-2 bg-primary-600 dark:bg-primary-500 shadow-lg active:bg-primary-700"
            onPress={handlePauseResume}
            activeOpacity={0.8}
          >
            {isPaused ? (
              <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
            ) : (
              <Pause size={20} color="#FFFFFF" />
            )}
            <Text className="text-base font-semibold text-white">{isPaused ? 'Resume' : 'Pause'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-14 h-14 items-center justify-center rounded-xl bg-white dark:bg-neutral-800 border-2 border-error-500 shadow-lg active:bg-neutral-50 dark:active:bg-neutral-700"
            onPress={handleEndFast}
            activeOpacity={0.8}
          >
            <XCircle size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Tips Card */}
        <View className="bg-primary-100 dark:bg-primary-900/20 p-4 rounded-lg border border-primary-200 dark:border-primary-700">
          <View className="flex-row items-center gap-2 mb-4">
            <Lightbulb size={20} color="#7C3AED" />
            <Text className="text-base font-semibold text-neutral-700 dark:text-neutral-200">
              Fasting Tips
            </Text>
          </View>
          <View className="gap-2">
            <TipItem text="Stay hydrated with water, tea, or black coffee" />
            <TipItem text="Listen to your body and rest when needed" />
            <TipItem text="Break your fast with nutritious whole foods" />
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function TipItem({ text }: { text: string }) {
  return (
    <View className="flex-row items-start gap-2">
      <View className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2" />
      <Text className="text-sm text-neutral-700 dark:text-neutral-200 flex-1 leading-5">
        {text}
      </Text>
    </View>
  );
}

