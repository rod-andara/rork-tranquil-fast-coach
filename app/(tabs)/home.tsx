import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Play, Square, Calendar, TrendingUp, Clock, Award } from 'lucide-react-native';

import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { useFastStore } from '@/store/fastStore';
import CircularProgress from '@/components/CircularProgress';
import StatCard from '@/components/StatCard';
import { formatTime, calculateProgress, getPlanDuration } from '@/utils/fastingUtils';

export default function HomeScreen() {
  const router = useRouter();
  const { currentFast, selectedPlan, startFast, endFast, fastHistory } = useFastStore();
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  useEffect(() => {
    if (currentFast) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - currentFast.startTime;
        setElapsedTime(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setElapsedTime(0);
    }
  }, [currentFast]);

  const progress = currentFast ? calculateProgress(elapsedTime, getPlanDuration(selectedPlan)) : 0;

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
    const duration = getPlanDuration(selectedPlan);
    startFast(duration);
    router.push('/fast');
  };

  const handleEndFast = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    endFast();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome Back, User!</Text>
          <Text style={styles.subtitle}>Current Plan: {selectedPlan} Intermittent Fasting</Text>
        </View>

        <View style={styles.timerSection}>
          <CircularProgress
            size={200}
            strokeWidth={12}
            progress={progress}
            color={colors.primary}
            backgroundColor={colors.border}
          >
            <View style={styles.timerContent}>
              <Text style={styles.timerValue}>{formatTime(elapsedTime)}</Text>
              <Text style={styles.timerLabel}>
                {currentFast ? 'FASTING' : 'READY TO START'}
              </Text>
            </View>
          </CircularProgress>
        </View>

        <View style={styles.buttonContainer}>
          {currentFast ? (
            <TouchableOpacity
              style={[styles.button, styles.stopButton]}
              onPress={handleEndFast}
              activeOpacity={0.8}
            >
              <Square size={20} color={colors.white} />
              <Text style={styles.stopButtonText}>Stop Fast</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.startButton]}
              onPress={handleStartFast}
              activeOpacity={0.8}
            >
              <Play size={20} color={colors.white} fill={colors.white} />
              <Text style={styles.startButtonText}>Start Fast</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statsSection}>
          <StatCard
            icon={Calendar}
            value={totalFasts}
            label="Total Fasts"
            iconColor={colors.primary}
            iconBgColor="#F3E8FF"
          />
          <StatCard
            icon={TrendingUp}
            value={dayStreak}
            label="Day Streak"
            iconColor={colors.success}
            iconBgColor="#D1FAE5"
          />
          <StatCard
            icon={Clock}
            value={avgHours}
            label="Avg Hours"
            iconColor={colors.secondary}
            iconBgColor="#FCE7F3"
          />
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Award size={20} color={colors.primary} />
            <Text style={styles.tipTitle}>Fasting Tip</Text>
          </View>
          <Text style={styles.tipText}>
            {currentFast
              ? "Stay hydrated! Drink plenty of water, herbal tea, or black coffee during your fast."
              : "Ready to begin? Start your fasting journey and unlock the benefits of intermittent fasting."}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.h1,
    fontSize: 28,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  timerContent: {
    alignItems: 'center',
  },
  timerValue: {
    ...typography.h1,
    fontSize: 36,
    color: colors.text,
    fontWeight: '700' as const,
    marginBottom: spacing.xs,
  },
  timerLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600' as const,
    letterSpacing: 1,
  },
  buttonContainer: {
    marginBottom: spacing.xl,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.md,
  },
  startButton: {
    backgroundColor: colors.primary,
  },
  stopButton: {
    backgroundColor: colors.error,
  },
  startButtonText: {
    ...typography.h3,
    fontSize: 18,
    color: colors.white,
    fontWeight: '600' as const,
  },
  stopButtonText: {
    ...typography.h3,
    fontSize: 18,
    color: colors.white,
    fontWeight: '600' as const,
  },
  statsSection: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  tipCard: {
    backgroundColor: '#F3E8FF',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tipTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.text,
    fontWeight: '600' as const,
  },
  tipText: {
    ...typography.body,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
