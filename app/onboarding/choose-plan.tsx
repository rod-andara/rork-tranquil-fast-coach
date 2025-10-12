import { router } from 'expo-router';
import { Clock } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { useFastStore, FastingPlan } from '@/store/fastStore';

const PLANS = [
  {
    id: '16:8' as FastingPlan,
    title: '16:8',
    subtitle: 'Beginner Friendly',
    description: '16 hours fasting, 8 hours eating',
    popular: true,
  },
  {
    id: '18:6' as FastingPlan,
    title: '18:6',
    subtitle: 'Intermediate',
    description: '18 hours fasting, 6 hours eating',
    popular: false,
  },
  {
    id: '20:4' as FastingPlan,
    title: '20:4',
    subtitle: 'Advanced',
    description: '20 hours fasting, 4 hours eating',
    popular: false,
  },
];

export default function ChoosePlanScreen() {
  const [selectedPlan, setSelectedPlan] = useState<FastingPlan>('16:8');
  const { setSelectedPlan: saveSelectedPlan, completeOnboarding } = useFastStore();

  const handleContinue = () => {
    saveSelectedPlan(selectedPlan);
    completeOnboarding();
    router.replace('/home');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={[colors.secondary, colors.primary]}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Clock size={48} color={colors.white} strokeWidth={1.5} />
            </View>
            <Text style={styles.title}>Choose Your Plan</Text>
            <Text style={styles.subtitle}>
              Select a fasting schedule that fits your lifestyle
            </Text>
          </View>

          <View style={styles.plans}>
            {PLANS.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  selectedPlan === plan.id && styles.planCardSelected,
                ]}
                onPress={() => setSelectedPlan(plan.id)}
                activeOpacity={0.8}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>POPULAR</Text>
                  </View>
                )}
                <Text style={styles.planTitle}>{plan.title}</Text>
                <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
                <Text style={styles.planDescription}>{plan.description}</Text>
                {selectedPlan === plan.id && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Start My Journey</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    fontSize: 32,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  plans: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  planCardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: colors.white,
  },
  popularBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  popularText: {
    ...typography.small,
    fontWeight: '700' as const,
    color: colors.white,
  },
  planTitle: {
    ...typography.h2,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  planSubtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.sm,
  },
  planDescription: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  checkmark: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
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
  backText: {
    ...typography.body,
    color: colors.white,
    textAlign: 'center',
  },
});
