import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Play, Square } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { useFastStore } from '@/store/fastStore';
import CircularProgress from '@/components/CircularProgress';

export default function HomeScreen() {
  const { currentFast, selectedPlan, startFast, endFast } = useFastStore();
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [scaleAnim] = useState(new Animated.Value(1));

  const getPlanDuration = () => {
    const hours = parseInt(selectedPlan.split(':')[0]);
    return hours * 60 * 60 * 1000;
  };

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

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
    };
  };

  const getProgress = () => {
    if (!currentFast) return 0;
    const duration = getPlanDuration();
    return Math.min((elapsedTime / duration) * 100, 100);
  };

  const handleStartFast = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const duration = getPlanDuration();
    startFast(duration);
  };

  const handleEndFast = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    endFast();
  };

  const time = formatTime(elapsedTime);
  const progress = getProgress();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.greeting}>Welcome Back</Text>
            <Text style={styles.planText}>Current Plan: {selectedPlan}</Text>
          </View>

          <View style={styles.timerContainer}>
            <View style={styles.circularProgressWrapper}>
              <CircularProgress
                size={280}
                strokeWidth={16}
                progress={progress}
                color={colors.white}
                backgroundColor="rgba(255, 255, 255, 0.2)"
              />
              <View style={styles.timerContent}>
                <Text style={styles.timerLabel}>
                  {currentFast ? 'Fasting' : 'Ready to Start'}
                </Text>
                <View style={styles.timeDisplay}>
                  <View style={styles.timeUnit}>
                    <Text style={styles.timeValue}>{time.hours}</Text>
                    <Text style={styles.timeLabel}>hours</Text>
                  </View>
                  <Text style={styles.timeSeparator}>:</Text>
                  <View style={styles.timeUnit}>
                    <Text style={styles.timeValue}>{time.minutes}</Text>
                    <Text style={styles.timeLabel}>min</Text>
                  </View>
                  <Text style={styles.timeSeparator}>:</Text>
                  <View style={styles.timeUnit}>
                    <Text style={styles.timeValue}>{time.seconds}</Text>
                    <Text style={styles.timeLabel}>sec</Text>
                  </View>
                </View>
                {currentFast && (
                  <Text style={styles.progressText}>
                    {progress.toFixed(0)}% Complete
                  </Text>
                )}
              </View>
            </View>
          </View>

          <Animated.View style={[styles.buttonContainer, { transform: [{ scale: scaleAnim }] }]}>
            {currentFast ? (
              <TouchableOpacity
                style={[styles.button, styles.stopButton]}
                onPress={handleEndFast}
                activeOpacity={0.8}
              >
                <Square size={24} color={colors.error} fill={colors.error} />
                <Text style={[styles.buttonText, styles.stopButtonText]}>End Fast</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.startButton]}
                onPress={handleStartFast}
                activeOpacity={0.8}
              >
                <Play size={24} color={colors.primary} fill={colors.primary} />
                <Text style={[styles.buttonText, styles.startButtonText]}>Start Fast</Text>
              </TouchableOpacity>
            )}
          </Animated.View>

          {!currentFast && (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Ready to begin?</Text>
              <Text style={styles.infoText}>
                Start your {selectedPlan} fasting journey and track your progress
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  planText: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgressWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerLabel: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.md,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeUnit: {
    alignItems: 'center',
  },
  timeValue: {
    ...typography.h1,
    fontSize: 40,
    color: colors.white,
    fontWeight: '700' as const,
  },
  timeLabel: {
    ...typography.small,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
  },
  timeSeparator: {
    ...typography.h1,
    fontSize: 40,
    color: colors.white,
    fontWeight: '700' as const,
  },
  progressText: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.md,
  },
  buttonContainer: {
    marginBottom: spacing.xl,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.md,
  },
  startButton: {
    backgroundColor: colors.white,
  },
  stopButton: {
    backgroundColor: colors.white,
  },
  buttonText: {
    ...typography.h3,
  },
  startButtonText: {
    color: colors.primary,
  },
  stopButtonText: {
    color: colors.error,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: spacing.xl,
  },
  infoTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.body,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
  },
});
