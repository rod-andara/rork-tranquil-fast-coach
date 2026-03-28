import React, { memo } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight, Crown, User2 } from 'lucide-react-native';
import { borderRadius, colors, shadows, spacing, typography } from '@/constants/theme';

interface ProfileCardProps {
  testID?: string;
  name: string;
  email: string;
  onUpgradePress?: () => void;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  subTextColor?: string;
}

function ProfileCard({ testID, name, email, onUpgradePress, backgroundColor = colors.white, borderColor = colors.border, textColor = colors.text, subTextColor = colors.textSecondary }: ProfileCardProps) {
  return (
    <View style={[styles.card, { backgroundColor, borderColor }]} testID={testID}>
      <View style={styles.topRow}>
        <View style={styles.avatar} testID="profile-avatar">
          <User2 size={24} color={colors.inactive} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: textColor }]}>{name}</Text>
          <Text style={[styles.email, { color: subTextColor }]}>{email}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.upgradeRow}
        onPress={onUpgradePress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Upgrade to Premium"
        testID="upgrade-cta"
      >
        <View style={styles.upgradeLeft}>
          <Crown size={18} color={colors.primary} />
          <Text style={[styles.upgradeText, { color: textColor }]}>Upgrade to Premium</Text>
        </View>
        <ChevronRight size={18} color={subTextColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.body,
    fontWeight: '700',
  },
  email: {
    ...typography.caption,
  },
  upgradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  upgradeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  upgradeText: {
    ...typography.body,
    fontWeight: '600',
  },
});

export default memo(ProfileCard);
