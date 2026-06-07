import React, { useCallback, useEffect, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { PurchasesPackage } from 'react-native-purchases';
import { Check, X, RefreshCw, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFastStore } from '@/store/fastStore';
import {
  getCurrentOffering,
  purchasePackage,
  restorePurchases,
  checkSubscriptionStatus,
} from '@/services/revenuecat';
import { colors, spacing, typography } from '@/constants/theme';

export default function PaywallScreen() {
  const router = useRouter();
  const { isDarkMode, setPremium, isPremium } = useFastStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [purchasing, setPurchasing] = useState<boolean>(false);
  const [restoring, setRestoring] = useState<boolean>(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);

  const background = isDarkMode ? colors.backgroundDark : colors.background;
  const text = isDarkMode ? colors.textDark : colors.text;

  // Load offerings on mount
  useEffect(() => {
    loadOfferings();
  }, []);

  // If user is already premium, show success and redirect
  useEffect(() => {
    if (isPremium && !purchasing) {
      Alert.alert(
        'Already Premium! 🎉',
        "You're already a premium member. Enjoy all the features!",
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/home') }]
      );
    }
  }, [isPremium, purchasing, router]);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      const offering = await getCurrentOffering();

      if (offering && offering.availablePackages.length > 0) {
        setPackages(offering.availablePackages);
        // Select the first package by default (usually monthly)
        setSelectedPackage(offering.availablePackages[0]);
      } else {
        Alert.alert(
          'No Offerings Available',
          'Unable to load subscription options. Please try again later.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error) {
      console.error('[Paywall] Failed to load offerings:', error);
      Alert.alert(
        'Error',
        'Failed to load subscription options. Please try again.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert('Error', 'Please select a subscription plan');
      return;
    }

    try {
      setPurchasing(true);
      const result = await purchasePackage(selectedPackage);

      if (result.success) {
        // Update premium status
        setPremium(true);

        // Show success message
        Alert.alert(
          'Welcome to Premium! 🎉',
          'Your subscription is now active. Enjoy all premium features!',
          [{ text: 'Get Started', onPress: () => router.replace('/(tabs)/home') }]
        );
      } else if (result.error !== 'User cancelled') {
        // Don't show alert if user cancelled
        Alert.alert('Purchase Failed', result.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('[Paywall] Purchase error:', error);
      Alert.alert('Purchase Failed', 'Something went wrong. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setRestoring(true);
      const result = await restorePurchases();

      if (result.success) {
        // Update premium status
        setPremium(true);

        Alert.alert(
          'Purchases Restored! 🎉',
          'Your premium subscription has been restored.',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)/home') }]
        );
      } else {
        Alert.alert('No Purchases Found', 'No active purchases were found to restore.');
      }
    } catch (error) {
      console.error('[Paywall] Restore error:', error);
      Alert.alert('Restore Failed', 'Unable to restore purchases. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  const formatPrice = (pkg: PurchasesPackage): string => {
    return pkg.product.priceString;
  };

  const getPackageTitle = (pkg: PurchasesPackage): string => {
    // Extract package type from identifier or packageType
    const identifier = pkg.identifier.toLowerCase();
    if (identifier.includes('annual') || identifier.includes('year')) return 'Annual';
    if (identifier.includes('month')) return 'Monthly';
    if (identifier.includes('week')) return 'Weekly';
    return pkg.identifier;
  };

  const getPackageDescription = (pkg: PurchasesPackage): string => {
    const identifier = pkg.identifier.toLowerCase();
    if (identifier.includes('annual') || identifier.includes('year')) {
      return 'Best value - Save up to 40%';
    }
    if (identifier.includes('month')) {
      return 'Most popular plan';
    }
    if (identifier.includes('week')) {
      return 'Try it out';
    }
    return 'Premium access';
  };

  const premiumFeatures = [
    'Unlimited custom fasting plans',
    'Advanced analytics & insights',
    'Detailed progress reports',
    'Priority customer support',
    'Ad-free experience',
    'Export your data',
  ];

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: background }]} testID="paywall-loading">
        <Stack.Screen
          options={{
            title: 'Premium',
            headerRight: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
                <X size={20} color={text} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: text }]}>Loading subscription options...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: background }]} testID="paywall-screen">
      <Stack.Screen
        options={{
          title: 'Premium',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerIcon}
              accessibilityLabel="Close"
              testID="paywall-close"
            >
              <X size={20} color={text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={['#7C3AED', '#5B21B6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Sparkles size={48} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.heroTitle}>Upgrade to Premium</Text>
          <Text style={styles.heroSubtitle}>
            Unlock your full fasting potential with advanced features
          </Text>
        </LinearGradient>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <Text style={[styles.sectionTitle, { color: text }]}>Premium Features</Text>
          {premiumFeatures.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.checkIcon}>
                <Check size={18} color="#10B981" strokeWidth={3} />
              </View>
              <Text style={[styles.featureText, { color: text }]}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Package Selection */}
        <View style={styles.packagesContainer}>
          <Text style={[styles.sectionTitle, { color: text }]}>Choose Your Plan</Text>
          {packages.map((pkg, index) => {
            const isSelected = selectedPackage?.identifier === pkg.identifier;
            return (
              <TouchableOpacity
                key={pkg.identifier}
                style={[
                  styles.packageCard,
                  isSelected && styles.packageCardSelected,
                ]}
                onPress={() => setSelectedPackage(pkg)}
                activeOpacity={0.7}
                testID={`package-${index}`}
              >
                <View style={styles.packageInfo}>
                  <Text style={styles.packageTitle}>{getPackageTitle(pkg)}</Text>
                  <Text style={styles.packageDescription}>{getPackageDescription(pkg)}</Text>
                </View>
                <Text style={styles.packagePrice}>{formatPrice(pkg)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Purchase Button */}
        <TouchableOpacity
          style={[styles.purchaseButton, purchasing && styles.purchaseButtonDisabled]}
          onPress={handlePurchase}
          disabled={purchasing || !selectedPackage}
          activeOpacity={0.8}
          testID="purchase-button"
        >
          <LinearGradient
            colors={['#7C3AED', '#5B21B6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.purchaseGradient}
          >
            {purchasing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.purchaseButtonText}>
                Subscribe for {selectedPackage ? formatPrice(selectedPackage) : ''}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Restore Button */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={restoring}
          activeOpacity={0.7}
          testID="restore-button"
        >
          {restoring ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <>
              <RefreshCw size={16} color={colors.primary} />
              <Text style={styles.restoreButtonText}>Restore Purchases</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>
          Subscriptions auto-renew unless cancelled. You can manage or cancel your subscription in
          your App Store account settings.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  scrollContent: { paddingBottom: spacing.xxl },
  loadingText: { ...typography.body, marginTop: spacing.sm },
  headerIcon: { paddingHorizontal: spacing.md },

  // Hero Section
  hero: {
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  heroTitle: {
    ...typography.h1,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  heroSubtitle: {
    ...typography.body,
    color: '#E0E7FF',
    textAlign: 'center',
    maxWidth: 300,
  },

  // Features
  featuresContainer: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    ...typography.body,
    flex: 1,
  },

  // Packages
  packagesContainer: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  packageCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  packageCardSelected: {
    backgroundColor: '#EDE9FE',
    borderColor: '#7C3AED',
  },
  packageInfo: {
    flex: 1,
  },
  packageTitle: {
    ...typography.h4,
    color: '#111827',
  },
  packageDescription: {
    ...typography.caption,
    color: '#6B7280',
    marginTop: 2,
  },
  packagePrice: {
    ...typography.h3,
    color: '#7C3AED',
  },

  // Purchase Button
  purchaseButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  purchaseButtonText: {
    ...typography.h4,
    color: '#FFFFFF',
  },

  // Restore Button
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  restoreButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },

  // Footer
  footer: {
    ...typography.caption,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    lineHeight: 18,
  },
});
