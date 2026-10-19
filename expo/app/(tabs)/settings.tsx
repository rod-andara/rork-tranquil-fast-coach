import React, { useCallback } from 'react';
import { Text, View, ScrollView, Platform, TouchableOpacity, Alert, Linking, Share } from 'react-native';
import { Bell, Moon, HelpCircle, Heart, Share2, Clock, Trash2, Scale, Shield, FileText, LifeBuoy } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as StoreReview from 'expo-store-review';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFastStore } from '@/store/fastStore';
import { useWeightStore } from '@/store/weightStore';
import { useRouter } from 'expo-router';
import SwitchRow from '@/components/SwitchRow';
import UnitSelectorRow from '@/components/UnitSelectorRow';
import ListItem from '@/components/ListItem';
import { LINKS } from '@/constants/links';
import { cancelFastingNotifications } from '@/utils/notificationsUtils';

export default function SettingsScreen() {
  const router = useRouter();
  const { notificationsEnabled, setNotificationsEnabled, isDarkMode, setDarkMode, selectedPlan, customDuration } = useFastStore();
  const { unit, setUnit } = useWeightStore();

  // Format custom duration for display
  const formatCustomDuration = useCallback(() => {
    const hours = Math.floor(customDuration);
    const minutes = Math.round((customDuration - hours) * 60);

    if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${minutes}m`;
  }, [customDuration]);

  // Get display text for current plan
  const getPlanDisplayText = useCallback(() => {
    if (selectedPlan === 'custom') {
      return `Custom (${formatCustomDuration()})`;
    }
    return selectedPlan;
  }, [selectedPlan, formatCustomDuration]);

  const onToggleNotifications = useCallback((val: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    } else {
      if (__DEV__) console.log('Haptics not available on web');
    }
    setNotificationsEnabled(val);
  }, [setNotificationsEnabled]);

  const onToggleDark = useCallback((val: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    } else {
      if (__DEV__) console.log('Haptics not available on web');
    }
    setDarkMode(val);
  }, [setDarkMode]);

  const onChangeUnit = useCallback((val: 'lbs' | 'kg') => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    } else {
      if (__DEV__) console.log('Haptics not available on web');
    }
    setUnit(val);
  }, [setUnit]);

  const handleFastingPlan = useCallback(() => {
    router.push('/onboarding/choose-plan?fromSettings=true');
  }, [router]);

  const handleHelpSupport = useCallback(async () => {
    const email = 'support@tranquilfast.app';
    const subject = 'Help & Support - Tranquil Fast Coach';
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert(
          'Email Not Available',
          `Please contact us at ${email}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error Opening Email',
        `Please contact us at ${email}`,
        [{ text: 'OK' }]
      );
    }
  }, []);

  const handleRateApp = useCallback(async () => {
    try {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        await StoreReview.requestReview();
      } else {
        Alert.alert(
          'Rate App',
          'Thank you for your support! Please rate us on the App Store.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      if (__DEV__) console.error('Error requesting review:', error);
      Alert.alert(
        'Rate App',
        'Thank you for your support! Please rate us on the App Store.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  const handleShare = useCallback(async () => {
    try {
      const result = await Share.share({
        message: 'Check out Tranquil Fast Coach! A simple and effective intermittent fasting tracker that helps you achieve your wellness goals. Download it now! https://tranquilfast.app',
        title: 'Tranquil Fast Coach',
      });

      if (result.action === Share.sharedAction) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      if (__DEV__) console.error('Error sharing:', error);
      Alert.alert(
        'Share Failed',
        'Unable to share at this time. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  const openLink = useCallback(async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        'Link Unavailable',
        'We couldn\'t open that page right now. Please try again in a moment.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  const handleEraseAllData = useCallback(() => {
    Alert.alert(
      'Erase All Data',
      'Erases all fasts, weights and settings on this device. Data already saved in Apple Health is not deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelFastingNotifications();
              await AsyncStorage.clear();
              useFastStore.getState().reset();
              useWeightStore.getState().reset();
              router.replace('/onboarding/welcome');
            } catch (error) {
              if (__DEV__) console.error('Failed to erase data:', error);
              Alert.alert('Something went wrong', 'We couldn\'t erase your data. Please try again.', [{ text: 'OK' }]);
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
            Manage your preferences
          </Text>
        </View>

        {/* Premium coming soon card */}
        <View
          className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm flex-row items-center gap-3"
          testID="premium-coming-soon-card"
        >
          <View className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 items-center justify-center">
            <Heart size={20} color="#7C3AED" />
          </View>
          <View style={{ flex: 1 }}>
            <Text className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
              Premium features coming soon
            </Text>
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">
              Advanced analytics and more — coming soon.
            </Text>
          </View>
        </View>

        {/* Preferences Section */}
        <View className="gap-4">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-100">PREFERENCES</Text>
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
            <View className="border-b border-neutral-200 dark:border-neutral-700 my-4" />
            <UnitSelectorRow
              testID="weight-unit-row"
              Icon={Scale}
              label="Weight Unit"
              description="Choose your preferred unit"
              value={unit}
              onValueChange={onChangeUnit}
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
              subtitle={`Current: ${getPlanDisplayText()}`}
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
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-100">HELP & SUPPORT</Text>
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
            <View className="border-b border-neutral-200 dark:border-neutral-700 my-4" />
            <ListItem
              testID="support-row"
              Icon={LifeBuoy}
              text="Support"
              onPress={() => openLink(LINKS.support)}
              iconColor="#7C3AED"
              textColor={isDarkMode ? "#F9FAFB" : "#111827"}
              chevronColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
            />
            <View className="border-b border-neutral-200 dark:border-neutral-700 my-4" />
            <ListItem
              testID="privacy-row"
              Icon={Shield}
              text="Privacy Policy"
              onPress={() => openLink(LINKS.privacy)}
              iconColor="#7C3AED"
              textColor={isDarkMode ? "#F9FAFB" : "#111827"}
              chevronColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
            />
            <View className="border-b border-neutral-200 dark:border-neutral-700 my-4" />
            <ListItem
              testID="terms-row"
              Icon={FileText}
              text="Terms of Use"
              onPress={() => openLink(LINKS.terms)}
              iconColor="#7C3AED"
              textColor={isDarkMode ? "#F9FAFB" : "#111827"}
              chevronColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
            />
          </View>
        </View>

        {/* Erase All Data Button */}
        <TouchableOpacity
          className="flex-row items-center justify-center gap-2 py-4 rounded-xl bg-error-500 dark:bg-error-600 shadow-lg active:bg-error-600"
          onPress={handleEraseAllData}
          activeOpacity={0.8}
          testID="erase-data-button"
        >
          <Trash2 size={20} color="#FFFFFF" />
          <Text className="text-base font-semibold text-white">Erase All Data</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View className="items-center gap-2 py-6">
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">Tranquil Fast Coach v1.0.0</Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            Made with ❤️ for your wellness journey
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

