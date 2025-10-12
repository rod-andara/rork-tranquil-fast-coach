import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Clock, Zap, Moon } from 'lucide-react-native';

import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { useFastStore, FastingPlan } from '@/store/fastStore';

const PLANS = [
  {
    id: '16:8' as FastingPlan,
    title: '16:8',
    subtitle: 'Beginner Friendly',
    description: '16 hours fasting, 8 hours eating',
    icon: Clock,
    color: colors.primary,
  },
  {
    id: '18:6' as FastingPlan,
    title: '18:6',
    subtitle: 'Intermediate',
    description: '18 hours fasting, 6 hours eating',
    icon: Zap,
    color: colors.secondary,
  },
  {
    id: '20:4' as FastingPlan,
    title: '20:4',
    subtitle: 'Advanced',
    description: '20 hours fasting, 4 hours eating',
    icon: Moon,
    color: colors.primaryDark,
  },
];

export default function FastScreen() {
  const { selectedPlan, setSelectedPlan, currentFast, startFast, endFast } = useFastStore();

  const getPlanDuration = (plan: FastingPlan) => {
    const hours = parseInt(plan.split(':')[0]);
    return hours * 60 * 60 * 1000;
  };

  const handleSelectPlan = (plan: FastingPlan) => {
    setSelectedPlan(plan);
  };

  const handleStartFast = (plan: FastingPlan) => {
    const duration = getPlanDuration(plan);
    startFast(duration);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Fast</Text>
          <Text style={styles.subtitle}>
            Select a fasting plan that fits your lifestyle
          </Text>
        </View>

        <View style={styles.plans}>
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            const isActive = currentFast !== null;

            return (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  isSelected && styles.planCardSelected,
                ]}
                onPress={() => handleSelectPlan(plan.id)}
                activeOpacity={0.7}
                disabled={isActive}
              >
                <View style={[styles.iconContainer, { backgroundColor: plan.color }]}>
                  <Icon size={32} color={colors.white} strokeWidth={2} />
                </View>

                <View style={styles.planInfo}>
                  <View style={styles.planHeader}>
                    <Text style={styles.planTitle}>{plan.title}</Text>
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedText}>SELECTED</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
                  <Text style={styles.planDescription}>{plan.description}</Text>
                </View>

                {isSelected && !isActive && (
                  <TouchableOpacity
                    style={[styles.startButton, { backgroundColor: plan.color }]}
                    onPress={() => handleStartFast(plan.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.startButtonText}>Start</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {currentFast && (
          <View style={styles.activeCard}>
            <Text style={styles.activeTitle}>Fast in Progress</Text>
            <Text style={styles.activeText}>
              You're currently on a {selectedPlan} fast. Go to Home to see your progress.
            </Text>
            <TouchableOpacity
              style={styles.endButton}
              onPress={endFast}
              activeOpacity={0.8}
            >
              <Text style={styles.endButtonText}>End Fast</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Fasting Tips</Text>
          <View style={styles.tips}>
            <TipItem text="Stay hydrated with water, tea, or black coffee" />
            <TipItem text="Listen to your body and adjust as needed" />
            <TipItem text="Break your fast with nutritious, whole foods" />
            <TipItem text="Be consistent for best results" />
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
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  plans: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  planCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.sm,
  },
  planCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  planTitle: {
    ...typography.h3,
    color: colors.text,
  },
  selectedBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  selectedText: {
    ...typography.small,
    fontSize: 10,
    fontWeight: '700' as const,
    color: colors.white,
  },
  planSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  planDescription: {
    ...typography.caption,
    color: colors.text,
  },
  startButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  startButtonText: {
    ...typography.body,
    fontWeight: '600' as const,
    color: colors.white,
  },
  activeCard: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
  },
  activeTitle: {
    ...typography.h3,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  activeText: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.md,
  },
  endButton: {
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  endButtonText: {
    ...typography.body,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  tipsCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipsTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
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
    color: colors.text,
    flex: 1,
  },
});
