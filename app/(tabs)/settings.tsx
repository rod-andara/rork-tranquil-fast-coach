import React, { useCallback } from 'react';
import { Text, View, ScrollView, Platform, TouchableOpacity, Alert } from 'react-native';
import { Bell, Moon, HelpCircle, Heart, Share2, Clock, LogOut } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFastStore } from '@/store/fastStore';
import { useRouter } from 'expo-router';
import ProfileCard from '@/components/ProfileCard';
import SwitchRow from '@/components/SwitchRow';
import ListItem from '@/components/ListItem';

export default function SettingsScreen() {
  const router = useRouter();
  const { notificationsEnabled, setNotificationsEnabled, isDarkMode, setDarkMode, selectedPlan } = useFastStore();

  // Use selector pattern for ProfileCard to ensure it updates with dark mode
  const isDark = useFastStore((state) => state.isDarkMode);

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
    <LinearGradient
      colors={isDarkMode ? ['#1a1625', '#1F2937'] : ['#FAFBFC', '#F3F4F6']}
      style={{ flex: 1 }}
      testID="settings-screen"
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 48, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="gap-2" testID="settings-header">
          <Text className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">Settings</Text>
          <Text className="text-base text-neutral-500 dark:text-neutral-400">
            Manage your account and preferences
          </Text>
        </View>

        {/* Profile Card */}
        <ProfileCard
          testID="profile-card"
          name="John Doe"
          email="john.doe@email.com"
          backgroundColor={isDarkMode ? "#1F2937" : "#FFFFFF"}
          textColor={isDarkMode ? "#F9FAFB" : "#111827"}
          subTextColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
          borderColor={isDarkMode ? "#374151" : "#E5E7EB"}
          onUpgradePress={() => {
            router.push('/paywall');
          }}
        />

        {/* Preferences Section */}
        <View className="gap-4">
          <Text className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Preferences</Text>
          <View className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm" testID="preferences-card">
            <SwitchRow
              testID="notifications-row"
              Icon={Bell}
              label="Notifications"
              description="Receive fasting reminders"
              value={notificationsEnabled}
              onValueChange={onToggleNotifications}
              iconColor="#7C3AED"
              textColor={isDarkMode ? "#F9FAFB" : "#111827"}
              subTextColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
            />
            <View className="border-b border-neutral-200 dark:border-neutral-700 my-4" />
            <SwitchRow
              testID="darkmode-row"
              Icon={Moon}
              label="Dark Mode"
              description="Toggle dark appearance"
              value={isDarkMode}
              onValueChange={onToggleDark}
              iconColor="#7C3AED"
              textColor={isDarkMode ? "#F9FAFB" : "#111827"}
              subTextColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
            />
          </View>
        </View>

        {/* Fasting Plan Section */}
        <View className="gap-4">
          <View className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm" testID="fasting-plan-card">
            <ListItem
              testID="fasting-plan-row"
              Icon={Clock}
              text="Fasting Plan"
              subtitle={`Current: ${selectedPlan}`}
              onPress={handleFastingPlan}
              iconColor="#7C3AED"
              textColor={isDarkMode ? "#F9FAFB" : "#111827"}
              chevronColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
              subTextColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
            />
          </View>
        </View>

        {/* Help & Support Section */}
        <View className="gap-4">
          <Text className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Help & Support</Text>
          <View className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm" testID="help-support-card">
            <ListItem
              testID="help-support-row"
              Icon={HelpCircle}
              text="Help & Support"
              onPress={handleHelpSupport}
              iconColor="#7C3AED"
              textColor={isDarkMode ? "#F9FAFB" : "#111827"}
              chevronColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
            />
            <View className="border-b border-neutral-200 dark:border-neutral-700 my-4" />
            <ListItem
              testID="rate-app-row"
              Icon={Heart}
              text="Rate App"
              onPress={handleRateApp}
              iconColor="#7C3AED"
              textColor={isDarkMode ? "#F9FAFB" : "#111827"}
              chevronColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
            />
            <View className="border-b border-neutral-200 dark:border-neutral-700 my-4" />
            <ListItem
              testID="share-row"
              Icon={Share2}
              text="Share with Friends"
              onPress={handleShare}
              iconColor="#7C3AED"
              textColor={isDarkMode ? "#F9FAFB" : "#111827"}
              chevronColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
            />
          </View>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity
          className="flex-row items-center justify-center gap-2 py-4 rounded-xl bg-error-500 dark:bg-error-600 shadow-lg active:bg-error-600"
          onPress={handleLogOut}
          activeOpacity={0.8}
          testID="logout-button"
        >
          <LogOut size={20} color="#FFFFFF" />
          <Text className="text-base font-semibold text-white">Log Out</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View className="items-center gap-2 py-6">
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">FastTrack v1.0.0</Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            Made with ❤️ for your wellness journey
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

