import React, { useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, Platform } from 'react-native';
import { Bell, ChevronRight, Crown, Moon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { useFastStore } from '@/store/fastStore';
import { useRouter } from 'expo-router';
import ProfileCard from '@/components/ProfileCard';
import SwitchRow from '@/components/SwitchRow';

export default function SettingsScreen() {
  const router = useRouter();
  const { notificationsEnabled, setNotificationsEnabled, isDarkMode, setDarkMode } = useFastStore();

  const bg = isDarkMode ? colors.backgroundDark : colors.background;
  const text = isDarkMode ? colors.textDark : colors.text;
  const textSecondary = isDarkMode ? colors.textSecondaryDark : colors.textSecondary;
  const surface = isDarkMode ? colors.surfaceDark : colors.white;
  const border = isDarkMode ? colors.borderDark : colors.border;

  const onToggleNotifications = useCallback((val: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    } else {
      console.log('Haptics not available on web');
    }
    setNotificationsEnabled(val);
  }, [setNotificationsEnabled]);

  const onToggleDark = useCallback((val: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    } else {
      console.log('Haptics not available on web');
    }
    setDarkMode(val);
  }, [setDarkMode]);

  return (
    <View style={[styles.container, { backgroundColor: bg }]} testID="settings-screen">
      <ScrollView contentContainerStyle={[styles.scrollContent]} showsVerticalScrollIndicator={false}>
        <View style={styles.header} testID="settings-header">
          <Text style={[styles.title, { color: text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: textSecondary }]}>Manage your account and preferences</Text>
        </View>

        <ProfileCard
          testID="profile-card"
          name="John Doe"
          email="john.doe@email.com"
          backgroundColor={surface}
          textColor={text}
          subTextColor={textSecondary}
          borderColor={border}
          onUpgradePress={() => router.push('/onboarding/choose-plan')}
        />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>Preferences</Text>
          <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}
            testID="preferences-card">
            <SwitchRow
              testID="notifications-row"
              Icon={Bell}
              label="Notifications"
              description="Receive fasting reminders"
              value={notificationsEnabled}
              onValueChange={onToggleNotifications}
              iconColor={colors.primary}
              textColor={text}
              subTextColor={textSecondary}
            />
            <View style={[styles.divider, { borderBottomColor: border }]} />
            <SwitchRow
              testID="darkmode-row"
              Icon={Moon}
              label="Dark Mode"
              description="Toggle dark appearance"
              value={isDarkMode}
              onValueChange={onToggleDark}
              iconColor={colors.primary}
              textColor={text}
              subTextColor={textSecondary}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: surface, borderColor: border }]} testID="upgrade-row">
            <View style={styles.rowLeft}>
              <Crown size={22} color={colors.primary} />
              <Text style={[styles.rowLabel, { color: text }]}>Upgrade to Premium</Text>
            </View>
            <ChevronRight size={20} color={textSecondary} />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: textSecondary }]}>FastTrack v1.0.0</Text>
          <Text style={[styles.footerText, { color: textSecondary }]}>Made with ❤ for your wellness journey</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    ...typography.h1,
  },
  subtitle: {
    ...typography.body,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 18,
  },
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    ...shadows.sm,
  },
  divider: {
    borderBottomWidth: 1,
    marginVertical: spacing.md,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowLabel: {
    ...typography.body,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  footerText: {
    ...typography.caption,
  },
});
