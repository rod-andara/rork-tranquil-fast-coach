import React, { useCallback } from 'react';
import { Text, View, ScrollView, Platform, TouchableOpacity, Alert, Linking, Share } from 'react-native';
import { Bell, Moon, HelpCircle, Heart, Share2, Clock, LogOut, Scale } from 'lucide-react-native';
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

export default function SettingsScreen() {
  const router = useRouter();
  const { notificationsEnabled, setNotificationsEnabled, isDarkMode, setDarkMode, selectedPlan, customDuration, isPremium } = useFastStore();
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

  const onChangeUnit = useCallback((val: 'lbs' | 'kg') => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    } else {
      console.log('Haptics not available on web');
    }
    setUnit(val);
  }, [setUnit]);

  const handleFastingPlan = useCallback(() => {
    router.push('/onboarding/choose-plan?fromSettings=true');
  }, [router]);

  const handleHelpSupport = useCallback(async () => {
    const email = 'support@tranquilfastcoach.com';
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
      console.error('Error requesting review:', error);
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
        message: 'Check out Tranquil Fast Coach! A simple and effective intermittent fasting tracker that helps you achieve your wellness goals. Download it now!',
        title: 'Tranquil Fast Coach',
      });

      if (result.action === Share.sharedAction) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert(
        'Share Failed',
        'Unable to share at this time. Please try again later.',
        [{ text: 'OK' }]
      );
    }
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
            Manage your preferences
          </Text>
        </View>

        {/* Premium Card - Show different UI based on premium status */}
        {isPremium ? (
          <LinearGradient
            colors={['#8B5CF6', '#A855F7', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 18,
              paddingHorizontal: 20,
              borderRadius: 28,
              marginHorizontal: 16,
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
            }}
            testID="premium-active-card"
          >
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: 'rgba(255, 255, 255, 0.3)',
            }}>
              <Heart size={28} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2.5} />
            </View>
            <View style={{ marginLeft: 16, flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 19,
                  fontWeight: '700',
                  letterSpacing: 0.5,
                }}>
                  Premium Active
                </Text>
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: '#10B981',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 8,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}>✓</Text>
                </View>
              </View>
              <Text style={{
                color: '#FFFFFF',
                fontSize: 14,
                opacity: 0.95,
                marginTop: 3,
                fontWeight: '500',
              }}>
                Enjoying all premium features
              </Text>
            </View>
          </LinearGradient>
        ) : (
          <TouchableOpacity
            className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm flex-row items-center justify-between"
            onPress={() => router.push('/paywall')}
            activeOpacity={0.8}
            testID="upgrade-premium-card"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 items-center justify-center">
                <Heart size={20} color="#7C3AED" fill="#7C3AED" />
              </View>
              <View>
                <Text className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                  Upgrade to Premium
                </Text>
                <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                  Unlock all features
                </Text>
              </View>
            </View>
            <Text className="text-2xl text-neutral-400">›</Text>
          </TouchableOpacity>
        )}

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

