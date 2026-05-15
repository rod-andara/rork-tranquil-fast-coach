import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
  PurchasesStoreProduct,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Sentry from '@sentry/react-native';

// ---------------------------------------------------------------------------
// SPEC-17: RevenueCat Runtime Disablement for v1 Free Launch
// ---------------------------------------------------------------------------
// Tranquil Fast v1.0 ships free with no paywall and no in-app purchases.
// RevenueCat code stays in the repo for v1.1 reactivation, but the SDK must
// be COMPLETELY DORMANT in v1.0 — no network calls, no anonymous IDs, no
// Sentry noise. See expo/specs/SPEC-17-revenuecat-runtime-disablement-v1.md
// for rationale, App Privacy label impact, and the v1.1 reactivation
// checklist.
//
// To enable in v1.1: set EXPO_PUBLIC_ENABLE_REVENUECAT="true" in EAS env
// AND provision EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY with the real key.
// ---------------------------------------------------------------------------

export const REVENUECAT_ENABLED =
  process.env.EXPO_PUBLIC_ENABLE_REVENUECAT === 'true';

// RevenueCat API Keys — sourced exclusively from EAS env vars (no fallback).
// Placeholder fallbacks were removed per SPEC-17 §4.2.
const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY;
const REVENUECAT_ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY;

// Track if RevenueCat has been initialized
let isInitialized = false;

/**
 * Initialize RevenueCat SDK.
 * Call this once when the app starts.
 *
 * SPEC-17: short-circuits to `false` immediately when REVENUECAT_ENABLED
 * is false (the v1.0 ship state). No network calls, no anonymous ID
 * generation, no Sentry reporting on the disabled path — disablement is
 * intentional, not a failure.
 */
export const initializeRevenueCat = async (): Promise<boolean> => {
  // SPEC-17: hard short-circuit when feature flag is off.
  if (!REVENUECAT_ENABLED) {
    return false;
  }

  if (isInitialized) {
    if (__DEV__) console.log('[RevenueCat] Already initialized');
    return true;
  }

  const apiKey = Platform.OS === 'ios' ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;
  if (!apiKey) {
    // Enabled but key missing — fail gracefully, do NOT call Purchases.configure.
    if (__DEV__) {
      console.warn(
        '[RevenueCat] EXPO_PUBLIC_ENABLE_REVENUECAT is true but no API key ' +
        'is provisioned for this platform. Set EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY ' +
        '(or _GOOGLE_) in EAS env before enabling.'
      );
    }
    return false;
  }

  // Skip RevenueCat in Expo Go — native StoreKit is not available
  const isExpoGo = Constants.appOwnership === 'expo';
  if (isExpoGo) {
    if (__DEV__) console.log('[RevenueCat] Skipping initialization in Expo Go (native store unavailable)');
    return false;
  }

  try {
    if (__DEV__) console.log('[RevenueCat] Initializing...');

    // Set log level (warn in both dev and production to prevent memory issues)
    // Verbose logging can cause memory accumulation in long sessions
    Purchases.setLogLevel(LOG_LEVEL.WARN);

    // Configure RevenueCat
    await Purchases.configure({ apiKey });

    isInitialized = true;
    if (__DEV__) console.log('[RevenueCat] Initialized successfully');
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isInvalidKey = errorMessage.includes('Invalid API Key');

    if (isInvalidKey) {
      if (__DEV__) console.warn('[RevenueCat] Initialization skipped — invalid API key:', errorMessage);
    } else {
      if (__DEV__) console.error('[RevenueCat] Initialization failed:', error);
      Sentry.captureException(error instanceof Error ? error : new Error(errorMessage), {
        tags: { feature: 'revenuecat', operation: 'initialize' },
        contexts: {
          revenuecat: {
            platform: Platform.OS,
            error_message: errorMessage,
          },
        },
      });
    }

    return false;
  }
};

/**
 * Check if user has an active premium subscription
 * @returns Promise<boolean> - true if user is premium, false otherwise
 */
export const checkSubscriptionStatus = async (): Promise<boolean> => {
  if (!REVENUECAT_ENABLED) return false; // SPEC-17

  try {
    const customerInfo = await Purchases.getCustomerInfo();

    // Check if user has any active entitlements
    const hasActiveEntitlement = typeof customerInfo.entitlements.active['premium'] !== 'undefined';

    if (__DEV__) console.log('[RevenueCat] Subscription status:', hasActiveEntitlement ? 'Premium' : 'Free');

    return hasActiveEntitlement;
  } catch (error) {
    if (__DEV__) console.error('[RevenueCat] Failed to check subscription status:', error);

    // Track error in Sentry
    Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
      tags: { feature: 'revenuecat', operation: 'check_subscription' },
    });

    return false;
  }
};

/**
 * Get current offerings from RevenueCat
 * @returns Promise<PurchasesOffering | null> - Current offering or null if error
 */
export const getCurrentOffering = async (): Promise<PurchasesOffering | null> => {
  if (!REVENUECAT_ENABLED) return null; // SPEC-17

  try {
    if (__DEV__) console.log('[RevenueCat] Fetching offerings...');

    const offerings = await Purchases.getOfferings();

    if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
      if (__DEV__) {
        console.log('[RevenueCat] Current offering:', offerings.current.identifier);
        console.log('[RevenueCat] Available packages:', offerings.current.availablePackages.length);
      }
      return offerings.current;
    }

    if (__DEV__) console.warn('[RevenueCat] No offerings available');
    return null;
  } catch (error) {
    if (__DEV__) console.error('[RevenueCat] Failed to get offerings:', error);

    // Track error in Sentry
    Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
      tags: { feature: 'revenuecat', operation: 'get_offerings' },
    });

    return null;
  }
};

/**
 * Purchase a package
 * @param packageToPurchase - The package to purchase
 * @returns Promise<{success: boolean, customerInfo?: CustomerInfo, error?: string}>
 */
export const purchasePackage = async (
  packageToPurchase: PurchasesPackage
): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> => {
  // SPEC-17: disabled in v1.0 — no purchase path exists.
  if (!REVENUECAT_ENABLED) {
    return { success: false, error: 'RevenueCat disabled' };
  }

  try {
    if (__DEV__) console.log('[RevenueCat] Purchasing package:', packageToPurchase.identifier);

    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);

    // Check if purchase was successful
    const isPremium = typeof customerInfo.entitlements.active['premium'] !== 'undefined';

    if (isPremium) {
      if (__DEV__) console.log('[RevenueCat] Purchase successful! User is now premium');
      return { success: true, customerInfo };
    } else {
      if (__DEV__) console.warn('[RevenueCat] Purchase completed but user is not premium');
      return { success: false, error: 'Purchase completed but entitlement not active' };
    }
  } catch (error: any) {
    if (__DEV__) console.error('[RevenueCat] Purchase failed:', error);

    // Check if user cancelled
    if (error.userCancelled) {
      if (__DEV__) console.log('[RevenueCat] User cancelled the purchase');
      return { success: false, error: 'User cancelled' };
    }

    // Track purchase error in Sentry
    Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
      tags: { feature: 'revenuecat', operation: 'purchase' },
      contexts: {
        revenuecat: {
          package_id: packageToPurchase.identifier,
          user_cancelled: error.userCancelled || false,
          error_message: error instanceof Error ? error.message : String(error),
        },
      },
    });

    return {
      success: false,
      error: error.message || 'Purchase failed',
    };
  }
};

/**
 * Restore previous purchases
 * @returns Promise<{success: boolean, customerInfo?: CustomerInfo, error?: string}>
 */
export const restorePurchases = async (): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> => {
  // SPEC-17: disabled in v1.0.
  if (!REVENUECAT_ENABLED) {
    return { success: false, error: 'RevenueCat disabled' };
  }

  try {
    if (__DEV__) console.log('[RevenueCat] Restoring purchases...');

    const customerInfo = await Purchases.restorePurchases();

    // Check if user has active entitlements
    const isPremium = typeof customerInfo.entitlements.active['premium'] !== 'undefined';

    if (isPremium) {
      if (__DEV__) console.log('[RevenueCat] Purchases restored! User is premium');
      return { success: true, customerInfo };
    } else {
      if (__DEV__) console.log('[RevenueCat] No active purchases to restore');
      return { success: false, error: 'No active purchases found' };
    }
  } catch (error) {
    if (__DEV__) console.error('[RevenueCat] Failed to restore purchases:', error);

    // Track error in Sentry
    Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
      tags: { feature: 'revenuecat', operation: 'restore_purchases' },
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Restore failed',
    };
  }
};

/**
 * Get customer info (subscription details)
 * @returns Promise<CustomerInfo | null>
 */
export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  if (!REVENUECAT_ENABLED) return null; // SPEC-17

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    if (__DEV__) console.error('[RevenueCat] Failed to get customer info:', error);

    // Track error in Sentry
    Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
      tags: { feature: 'revenuecat', operation: 'get_customer_info' },
    });

    return null;
  }
};

/**
 * Get active subscription details
 * @returns Promise<{isActive: boolean, expirationDate?: string, productId?: string}>
 */
export const getActiveSubscription = async (): Promise<{
  isActive: boolean;
  expirationDate?: string;
  productId?: string;
}> => {
  if (!REVENUECAT_ENABLED) return { isActive: false }; // SPEC-17

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const premiumEntitlement = customerInfo.entitlements.active['premium'];

    if (premiumEntitlement) {
      return {
        isActive: true,
        expirationDate: premiumEntitlement.expirationDate || undefined,
        productId: premiumEntitlement.productIdentifier,
      };
    }

    return { isActive: false };
  } catch (error) {
    if (__DEV__) console.error('[RevenueCat] Failed to get active subscription:', error);
    return { isActive: false };
  }
};

/**
 * Identify user in RevenueCat (optional, for analytics)
 * @param userId - User ID to identify
 */
export const identifyUser = async (userId: string): Promise<void> => {
  if (!REVENUECAT_ENABLED) return; // SPEC-17

  try {
    await Purchases.logIn(userId);
    if (__DEV__) console.log('[RevenueCat] User identified:', userId);
  } catch (error) {
    if (__DEV__) console.error('[RevenueCat] Failed to identify user:', error);

    // Track error in Sentry
    Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
      tags: { feature: 'revenuecat', operation: 'identify_user' },
    });
  }
};

/**
 * Log out user from RevenueCat (clears cached data)
 */
export const logoutUser = async (): Promise<void> => {
  if (!REVENUECAT_ENABLED) return; // SPEC-17

  try {
    await Purchases.logOut();
    if (__DEV__) console.log('[RevenueCat] User logged out');
  } catch (error) {
    if (__DEV__) console.error('[RevenueCat] Failed to logout user:', error);
  }
};
