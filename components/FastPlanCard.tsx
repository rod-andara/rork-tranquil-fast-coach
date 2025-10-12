import { Check } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { borderRadius, colors, spacing, typography } from '@/constants/theme';

export interface FastPlanCardProps {
  id: string;
  title: string;
  description: string;
  fastHours: number;
  eatHours: number;
  popular?: boolean;
  selected: boolean;
  onPress: () => void;
}

export default function FastPlanCard({
  title,
  description,
  fastHours,
  eatHours,
  popular = false,
  selected,
  onPress,
}: FastPlanCardProps) {
  const totalHours = 24;
  const fastPercentage = (fastHours / totalHours) * 100;
  const eatPercentage = (eatHours / totalHours) * 100;

  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {popular && (
        <View style={styles.popularBadgeInline}>
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>
        {selected && (
          <View style={styles.checkContainer}>
            <Check size={20} color={colors.white} strokeWidth={3} />
          </View>
        )}
      </View>

      <Text style={styles.description}>{description}</Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFast,
              { width: `${fastPercentage}%` },
            ]}
          />
          <View
            style={[
              styles.progressEat,
              { width: `${eatPercentage}%` },
            ]}
          />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>{fastHours}h Fast</Text>
          <Text style={styles.progressLabel}>{eatHours}h Eat</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F5F3FF',
  },
  popularBadgeInline: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  popularText: {
    ...typography.small,
    fontWeight: '700' as const,
    color: colors.white,
    fontSize: 11,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.h2,
    fontSize: 28,
    color: colors.text,
  },
  checkContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  progressContainer: {
    gap: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  progressFast: {
    backgroundColor: colors.primary,
    height: '100%',
  },
  progressEat: {
    backgroundColor: '#E9D5FF',
    height: '100%',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600' as const,
  },
});
