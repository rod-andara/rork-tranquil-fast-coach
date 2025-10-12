import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch, Platform } from 'react-native';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Pause, Play, XCircle, Bell, Lightbulb } from 'lucide-react-native';

import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { useFastStore } from '@/store/fastStore';
import CircularProgress from '@/components/CircularProgress';
import {
  formatTime,
  formatDate,
  calculateProgress,
  getFastingMessage,
  getPlanDuration,
} from '@/utils/fastingUtils';

export default function FastScreen() {
  const { selectedPlan, currentFast, endFast, notificationsEnabled, setNotificationsEnabled } = useFastStore();
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (currentFast && !isPaused) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - currentFast.startTime;
        setElapsedTime(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentFast, isPaused]);

  const progress = currentFast ? calculateProgress(elapsedTime, getPlanDuration(selectedPlan)) : 0;
  const targetEndTime = currentFast ? currentFast.startTime + getPlanDuration(selectedPlan) : 0;

  const handlePauseResume = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsPaused(!isPaused);
  };

  const handleEndFast = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    endFast();
  };

  if (!currentFast) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Your Fast' }} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Active Fast</Text>
          <Text style={styles.emptyText}>
            Start a fast from the Home screen to track your progress here.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Your Fast',
          headerRight: () => (
            <View style={styles.headerRight}>
              <Text style={styles.headerPlan}>{selectedPlan} Intermittent Fasting</Text>
            </View>
          ),
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.reminderCard}>
          <View style={styles.reminderLeft}>
            <Bell size={20} color={colors.textSecondary} />
            <View>
              <Text style={styles.reminderTitle}>Smart Reminders</Text>
              <Text style={styles.reminderSubtitle}>Get notified at key milestones</Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.timerSection}>
          <CircularProgress
            size={250}
            strokeWidth={16}
            progress={progress}
            color={colors.primary}
            backgroundColor={colors.border}
          >
            <View style={styles.timerContent}>
              <Text style={styles.timerValue}>{formatTime(elapsedTime)}</Text>
              <Text style={styles.timerLabel}>FASTING</Text>
            </View>
          </CircularProgress>
        </View>

        <Text style={styles.message}>{getFastingMessage(progress)}</Text>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Started</Text>
            <Text style={styles.detailValue}>{formatDate(currentFast.startTime)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Target End</Text>
            <Text style={styles.detailValue}>{formatDate(targetEndTime)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Progress</Text>
            <Text style={styles.detailValue}>{progress.toFixed(0)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.pauseButton]}
            onPress={handlePauseResume}
            activeOpacity={0.8}
          >
            {isPaused ? (
              <Play size={20} color={colors.white} fill={colors.white} />
            ) : (
              <Pause size={20} color={colors.white} />
            )}
            <Text style={styles.pauseButtonText}>{isPaused ? 'Resume' : 'Pause'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.endButton]}
            onPress={handleEndFast}
            activeOpacity={0.8}
          >
            <XCircle size={20} color={colors.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Lightbulb size={20} color={colors.primary} />
            <Text style={styles.tipsTitle}>Fasting Tips</Text>
          </View>
          <View style={styles.tips}>
            <TipItem text="Stay hydrated with water, tea, or black coffee" />
            <TipItem text="Listen to your body and rest when needed" />
            <TipItem text="Break your fast with nutritious whole foods" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function TipItem({ text }: { text: string }) {
  return (
    <View style={styles.tipItem}>
      <View style={styles.tipDot} />
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  headerRight: {
    marginRight: spacing.md,
  },
  headerPlan: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  reminderTitle: {
    ...typography.body,
    fontWeight: '600' as const,
    color: colors.text,
  },
  reminderSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  timerContent: {
    alignItems: 'center',
  },
  timerValue: {
    ...typography.h1,
    fontSize: 48,
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
  message: {
    ...typography.bodyLarge,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  detailsCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.body,
    fontWeight: '600' as const,
    color: colors.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
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
  pauseButton: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  pauseButtonText: {
    ...typography.h3,
    fontSize: 18,
    color: colors.white,
    fontWeight: '600' as const,
  },
  endButton: {
    width: 56,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.error,
  },
  tipsCard: {
    backgroundColor: '#F3E8FF',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tipsTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.text,
    fontWeight: '600' as const,
  },
  tips: {
    gap: spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  tipText: {
    ...typography.body,
    fontSize: 14,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
});
