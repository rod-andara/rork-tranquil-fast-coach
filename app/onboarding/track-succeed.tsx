import { router } from 'expo-router';
import { TrendingUp } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, spacing, typography, borderRadius } from '@/constants/theme';

export default function TrackSucceedScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={[colors.primaryLight, colors.secondary]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <TrendingUp size={64} color={colors.white} strokeWidth={1.5} />
          </View>

          <Text style={styles.title}>Track & Succeed</Text>
          <Text style={styles.subtitle}>
            Monitor your progress with beautiful insights and stay motivated on your journey
          </Text>

          <View style={styles.benefits}>
            <BenefitCard
              title="Visual Progress"
              description="See your fasting streaks and achievements"
            />
            <BenefitCard
              title="Smart Reminders"
              description="Get notified when it's time to start or end your fast"
            />
            <BenefitCard
              title="Detailed Stats"
              description="Track your fasting hours, weight, and wellness metrics"
            />
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/onboarding/choose-plan')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

function BenefitCard({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.benefitCard}>
      <Text style={styles.benefitTitle}>{title}</Text>
      <Text style={styles.benefitDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryLight,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    fontSize: 36,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.bodyLarge,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  benefits: {
    gap: spacing.md,
    alignSelf: 'stretch',
  },
  benefitCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  benefitTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  benefitDescription: {
    ...typography.body,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  footer: {
    gap: spacing.md,
  },
  button: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.h3,
    color: colors.primary,
  },
  skipText: {
    ...typography.body,
    color: colors.white,
    textAlign: 'center',
  },
});
