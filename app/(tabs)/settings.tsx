import React, { useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, Platform, TouchableOpacity, Alert } from 'react-native';
import { Bell, Moon, HelpCircle, Heart, Share2, Clock, LogOut } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { useFastStore } from '@/store/fastStore';
import { useRouter } from 'expo-router';
import ProfileCard from '@/components/ProfileCard';
import SwitchRow from '@/components/SwitchRow';
import ListItem from '@/components/ListItem';

export default function SettingsScreen() {
  const router = useRouter();
  const { notificationsEnabled, setNotificationsEnabled, isDarkMode, setDarkMode, selectedPlan } = useFastStore();

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

  const handleFastingPlan = useCallback(() => {
    router.push('/onboarding/choose-plan');
  }, [router]);

  const handleHelpSupport = useCallback(() => {
    Alert.alert('Help & Support', 'Contact us at support@fasttrack.com or visit our FAQ section.');
  }, []);

  const handleRateApp = useCallback(() => {
    Alert.alert('Rate App', 'Thank you for your support! Please rate us on the App Store.');
  }, []);

  const handleShare = useCallback(() => {
    Alert.alert('Share with Friends', 'Share FastTrack with your friends and help them on their wellness journey!');
  }, []);

  const handleLogOut = useCallback(() => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out? Your data will be cleared.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              router.replace('/onboarding/welcome');
            } catch (error) {
              console.error('Failed to clear storage:', error);
            }
          },
        },
      ]
    );
  }, [router]);

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
          <View style={[styles.card, { backgroundColor: surface, borderColor: border }]} testID="fasting-plan-card">
            <ListItem
              testID="fasting-plan-row"
              Icon={Clock}
              text="Fasting Plan"
              subtitle={`Current: ${selectedPlan}`}
              onPress={handleFastingPlan}
              iconColor={colors.primary}
              textColor={text}
              chevronColor={textSecondary}
              subTextColor={textSecondary}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>Help & Support</Text>
          <View style={[styles.card, { backgroundColor: surface, borderColor: border }]} testID="help-support-card">
            <ListItem
              testID="help-support-row"
              Icon={HelpCircle}
              text="Help & Support"
              onPress={handleHelpSupport}
              iconColor={colors.primary}
              textColor={text}
              chevronColor={textSecondary}
            />
            <View style={[styles.divider, { borderBottomColor: border }]} />
            <ListItem
              testID="rate-app-row"
              Icon={Heart}
              text="Rate App"
              onPress={handleRateApp}
              iconColor={colors.primary}
              textColor={text}
              chevronColor={textSecondary}
            />
            <View style={[styles.divider, { borderBottomColor: border }]} />
            <ListItem
              testID="share-row"
              Icon={Share2}
              text="Share with Friends"
              onPress={handleShare}
              iconColor={colors.primary}
              textColor={text}
              chevronColor={textSecondary}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: isDarkMode ? '#DC2626' : '#EF4444' }]}
          onPress={handleLogOut}
          activeOpacity={0.8}
          testID="logout-button"
        >
          <LogOut size={20} color="#FFFFFF" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: textSecondary }]}>FastTrack v1.0.0</Text>
          <Text style={[styles.footerText, { color: textSecondary }]}>Made with ❤️ for your wellness journey</Text>
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  logoutText: {
    ...typography.body,
    fontWeight: '700',
    color: '#FFFFFF',
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
