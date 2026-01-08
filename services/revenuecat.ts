import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
  PurchasesStoreProduct,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';

// RevenueCat API Keys from environment variables
const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY || 'appl_YOUR_API_KEY_HERE';
const REVENUECAT_ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY || 'goog_YOUR_API_KEY_HERE';

// Track if RevenueCat has been initialized
let isInitialized = false;

/**
 * Initialize RevenueCat SDK
 * Call this once when the app starts
 */
export const initializeRevenueCat = async (): Promise<boolean> => {
  if (isInitialized) {
    console.log('[RevenueCat] Already initialized');
    return true;
  }

  try {
    console.log('[RevenueCat] Initializing...');

    // Set log level (verbose in dev, warn in production)
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.WARN);

    // Configure RevenueCat
    if (Platform.OS === 'ios') {
      await Purchases.configure({ apiKey: REVENUECAT_IOS_KEY });
    } else if (Platform.OS === 'android') {
      await Purchases.configure({ apiKey: REVENUECAT_ANDROID_KEY });
    } else {
      console.warn('[RevenueCat] Platform not supported:', Platform.OS);
      return false;
    }

    isInitialized = true;
    console.log('[RevenueCat] Initialized successfully');
    return true;
  } catch (error) {
    console.error('[RevenueCat] Initialization failed:', error);

    // Track initialization error in Sentry
    Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
      tags: { feature: 'revenuecat', operation: 'initialize' },
      contexts: {
        revenuecat: {
          platform: Platform.OS,
          error_message: error instanceof Error ? error.message : String(error),
        },
      },
    });

    return false;
  }
};

/**
 * Check if user has an active premium subscription
 * @returns Promise<boolean> - true if user is premium, false otherwise
 */
export const checkSubscriptionStatus = async (): Promise<boolean> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();

    // Check if user has any active entitlements
    const hasActiveEntitlement = typeof customerInfo.entitlements.active['premium'] !== 'undefined';

    console.log('[RevenueCat] Subscription status:', hasActiveEntitlement ? 'Premium' : 'Free');

    return hasActiveEntitlement;
  } catch (error) {
    console.error('[RevenueCat] Failed to check subscription status:', error);

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
  try {
    console.log('[RevenueCat] Fetching offerings...');

    const offerings = await Purchases.getOfferings();

    if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
      console.log('[RevenueCat] Current offering:', offerings.current.identifier);
      console.log('[RevenueCat] Available packages:', offerings.current.availablePackages.length);
      return offerings.current;
    }

    console.warn('[RevenueCat] No offerings available');
    return null;
  } catch (error) {
    console.error('[RevenueCat] Failed to get offerings:', error);

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
  try {
    console.log('[RevenueCat] Purchasing package:', packageToPurchase.identifier);

    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);

    // Check if purchase was successful
    const isPremium = typeof customerInfo.entitlements.active['premium'] !== 'undefined';

    if (isPremium) {
      console.log('[RevenueCat] Purchase successful! User is now premium');
      return { success: true, customerInfo };
    } else {
      console.warn('[RevenueCat] Purchase completed but user is not premium');
      return { success: false, error: 'Purchase completed but entitlement not active' };
    }
  } catch (error: any) {
    console.error('[RevenueCat] Purchase failed:', error);

    // Check if user cancelled
    if (error.userCancelled) {
      console.log('[RevenueCat] User cancelled the purchase');
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
  try {
    console.log('[RevenueCat] Restoring purchases...');

    const customerInfo = await Purchases.restorePurchases();

    // Check if user has active entitlements
    const isPremium = typeof customerInfo.entitlements.active['premium'] !== 'undefined';

    if (isPremium) {
      console.log('[RevenueCat] Purchases restored! User is premium');
      return { success: true, customerInfo };
    } else {
      console.log('[RevenueCat] No active purchases to restore');
      return { success: false, error: 'No active purchases found' };
    }
  } catch (error) {
    console.error('[RevenueCat] Failed to restore purchases:', error);

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
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Failed to get customer info:', error);

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
    console.error('[RevenueCat] Failed to get active subscription:', error);
    return { isActive: false };
  }
};

/**
 * Identify user in RevenueCat (optional, for analytics)
 * @param userId - User ID to identify
 */
export const identifyUser = async (userId: string): Promise<void> => {
  try {
    await Purchases.logIn(userId);
    console.log('[RevenueCat] User identified:', userId);
  } catch (error) {
    console.error('[RevenueCat] Failed to identify user:', error);

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
  try {
    await Purchases.logOut();
    console.log('[RevenueCat] User logged out');
  } catch (error) {
    console.error('[RevenueCat] Failed to logout user:', error);
  }
};
