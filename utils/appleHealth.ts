import AppleHealthKit, {
  HealthKitPermissions,
  HealthValue,
  HealthUnit,
} from 'react-native-health';
import { Platform } from 'react-native';
import { useWeightStore, WeightEntry } from '@/store/weightStore';

const TEN_YEARS_IN_MS = 10 * 365 * 24 * 60 * 60 * 1000;

// Track if HealthKit has been successfully initialized
let healthKitInitialized = false;

type HealthPermission = HealthKitPermissions['permissions']['read'][number];

const resolveWeightPermission = (): HealthPermission => {
  const fallback = 'Weight' as HealthPermission;

  const permission =
    (AppleHealthKit?.Constants?.Permissions?.Weight as HealthPermission | undefined) ??
    (AppleHealthKit?.Constants?.Permissions?.BodyMass as HealthPermission | undefined);

  if (!permission) {
    console.warn(
      '[HealthKit] Weight permission constant is unavailable on the native module, falling back to string literal'
    );
    return fallback;
  }

  return permission;
};

// Get canonical HealthKit unit constant for weight
const getHKWeightUnit = (unit: 'lbs' | 'kg'): HealthUnit => {
  const Units = AppleHealthKit?.Constants?.Units;
  if (!Units) {
    throw new Error('[HealthKit] Unit constants not available - HealthKit may not be initialized');
  }
  // Use canonical HKUnit constants from the library (try both casing variations)
  const hkUnit = unit === 'kg'
    ? ((Units as any).kilogram ?? (Units as any).Kilogram)
    : ((Units as any).pound ?? (Units as any).Pound);

  if (!hkUnit) {
    throw new Error(`[HealthKit] Could not resolve unit constant for "${unit}"`);
  }

  return hkUnit;
};

const ensureNativeAvailability = async (): Promise<boolean> => {
  if (typeof AppleHealthKit?.isAvailable !== 'function') {
    return true;
  }

  return new Promise((resolve) => {
    (AppleHealthKit.isAvailable as any)((error: string | null, available: boolean) => {
      if (error) {
        console.error('[HealthKit] isAvailable reported an error:', error);
        // Continue with the init flow so we can still surface the permission prompt.
        resolve(true);
        return;
      }

      if (!available) {
        console.warn(
          '[HealthKit] Native module reports HealthKit is not available on device — continuing to request permissions'
        );
      }

      resolve(available);
    });
  });
};

const getDefaultStartDate = (): Date => {
  return new Date(Date.now() - TEN_YEARS_IN_MS);
};

// Check if device supports HealthKit (mirrors library's capability check)
export const isHealthKitSupported = (): boolean => {
  return Platform.OS === 'ios';
};

// Check if HealthKit is both supported AND initialized (ready to use)
export const isHealthKitReady = (): boolean => {
  return isHealthKitSupported() && healthKitInitialized;
};

// Deprecated: Use isHealthKitReady() instead
// Kept for backward compatibility
export const isHealthKitAvailable = (): boolean => {
  return isHealthKitReady();
};

// Initialize HealthKit and request permissions
export const initHealthKit = async (): Promise<boolean> => {
  const { setHealthConnected } = useWeightStore.getState();

  if (Platform.OS !== 'ios') {
    console.log('[HealthKit] Not available - not on iOS platform');
    setHealthConnected(false);
    healthKitInitialized = false;
    return false;
  }

  const available = await ensureNativeAvailability();
  if (!available) {
    console.warn('[HealthKit] Proceeding with init even though availability check returned false');
  }

  const weightPermission = resolveWeightPermission();

  return new Promise((resolve) => {
    console.log('[HealthKit] ===== INIT HEALTHKIT CALLED =====');
    console.log('[HealthKit] Platform:', Platform.OS);
    console.log('[HealthKit] AppleHealthKit module:', typeof AppleHealthKit);
    console.log('[HealthKit] AppleHealthKit.Constants:', typeof AppleHealthKit?.Constants);
    console.log('[HealthKit] AppleHealthKit.initHealthKit:', typeof AppleHealthKit?.initHealthKit);

    console.log('[HealthKit] Platform check passed, requesting permissions...');

    const permissions: HealthKitPermissions = {
      permissions: {
        read: [weightPermission],
        write: [weightPermission],
      },
    };

    console.log('[HealthKit] Permissions object:', JSON.stringify(permissions));

    if (typeof AppleHealthKit?.initHealthKit !== 'function') {
      console.error('[HealthKit] initHealthKit is not a function on the native module');
      setHealthConnected(false);
      resolve(false);
      return;
    }

    (AppleHealthKit.initHealthKit as any)(permissions, (error: string | null, result?: boolean) => {
      console.log('[HealthKit] initHealthKit callback fired');
      console.log('[HealthKit] error:', error);
      console.log('[HealthKit] error type:', typeof error);

      if (error) {
        console.error('[HealthKit] Cannot grant permissions:', error);
        console.error('[HealthKit] Full error details:', JSON.stringify(error));
        setHealthConnected(false);
        healthKitInitialized = false;
        resolve(false);
        return;
      }

      if (result === false) {
        console.error('[HealthKit] initHealthKit returned a false result');
        setHealthConnected(false);
        healthKitInitialized = false;
        resolve(false);
        return;
      }

      console.log('[HealthKit] Successfully initialized and permissions granted');
      setHealthConnected(true);
      healthKitInitialized = true;  // ✅ Critical: mark as initialized
      resolve(true);
    });
  });
};

// Convert weight between units
export const convertWeight = (
  weight: number,
  fromUnit: 'lbs' | 'kg',
  toUnit: 'lbs' | 'kg'
): number => {
  if (fromUnit === toUnit) return weight;

  if (fromUnit === 'lbs' && toUnit === 'kg') {
    return weight * 0.453592;
  } else {
    return weight * 2.20462;
  }
};

// Get weight data from Apple Health
export const getWeightFromHealth = (
  startDate?: Date,
  limit?: number
): Promise<WeightEntry[]> => {
  return new Promise((resolve, reject) => {
    if (!isHealthKitReady()) {
      reject(new Error('HealthKit is not ready. Ensure it is initialized first.'));
      return;
    }

    const effectiveStartDate = startDate ?? getDefaultStartDate();

    const options = {
      startDate: effectiveStartDate.toISOString(),
      limit: limit || 100,
      ascending: false,
    };

    console.log('[HealthKit] Getting weight samples with options:', options);

    if (typeof AppleHealthKit?.getWeightSamples !== 'function') {
      reject(new Error('getWeightSamples is not available on the native module'));
      return;
    }

    AppleHealthKit.getWeightSamples(
      options,
      (err: Object, results: HealthValue[]) => {
        if (err) {
          console.error('[ERROR] Failed to get weight from Health:', err);
          reject(err);
          return;
        }

        if (!results || results.length === 0) {
          console.log('[HealthKit] No weight samples found');
          resolve([]);
          return;
        }

        const userUnit = useWeightStore.getState().unit;

        const entries: WeightEntry[] = results.map((sample) => {
          // Apple Health stores weight in pounds
          const weightInLbs = sample.value;
          const weight =
            userUnit === 'kg'
              ? convertWeight(weightInLbs, 'lbs', 'kg')
              : weightInLbs;

          return {
            id: sample.id || `health-${sample.startDate}`,
            weight: Math.round(weight * 10) / 10, // Round to 1 decimal
            date: new Date(sample.startDate).getTime(),
            unit: userUnit,
            source: 'apple_health' as const,
          };
        });

        console.log(`[HealthKit] Retrieved ${entries.length} weight samples`);
        resolve(entries);
      }
    );
  });
};

// Save weight to Apple Health
export const saveWeightToHealth = (
  weight: number,
  unit: 'lbs' | 'kg',
  date?: Date
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    // Check if HealthKit is initialized first
    if (!healthKitInitialized) {
      const errorMsg = 'HealthKit is not initialized. Call initHealthKit() first.';
      console.error(`[HealthKit] ${errorMsg}`);
      reject(new Error(errorMsg));
      return;
    }

    if (Platform.OS !== 'ios') {
      const errorMsg = 'HealthKit is only available on iOS';
      console.error(`[HealthKit] ${errorMsg}`);
      reject(new Error(errorMsg));
      return;
    }

    try {
      // Pass the actual value with the canonical unit constant
      // Don't pre-convert - let HealthKit handle the value with the correct unit
      const hkUnit = getHKWeightUnit(unit);

      const options = {
        value: weight,
        unit: hkUnit,
        date: (date ?? new Date()).toISOString(),
      };

      console.log(`[HealthKit] Saving weight: ${weight} ${unit} (HKUnit: ${hkUnit})`);

      if (typeof AppleHealthKit?.saveWeight !== 'function') {
        const errorMsg = 'saveWeight is not available on the native module';
        console.error(`[HealthKit] ${errorMsg}`);
        reject(new Error(errorMsg));
        return;
      }

      AppleHealthKit.saveWeight(options, (err: string | null, result: HealthValue) => {
        if (err) {
          console.error('[HealthKit] Error saving weight:', err);
          reject(new Error(String(err)));
          return;
        }
        console.log('[HealthKit] Successfully saved weight to Health');
        resolve(Boolean(result));
      });
    } catch (error) {
      console.error('[HealthKit] Exception in saveWeightToHealth:', error);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
};

// Sync weight data bidirectionally
export const syncWeightData = async (
  direction: 'import' | 'export' | 'both' = 'both'
): Promise<{ imported: number; exported: number }> => {
  let imported = 0;
  let exported = 0;

  if (!isHealthKitReady()) {
    throw new Error('HealthKit is not ready. Ensure it is initialized first.');
  }

  try {
    console.log(`[HealthKit] Starting sync, direction: ${direction}`);

    if (direction === 'import' || direction === 'both') {
      // Import from Apple Health
      const lastSync = useWeightStore.getState().lastHealthSync;
      const startDate =
        typeof lastSync === 'number' && Number.isFinite(lastSync)
          ? new Date(lastSync)
          : undefined;

      console.log('[HealthKit] Importing from Apple Health...');
      const healthEntries = await getWeightFromHealth(startDate);

      // Filter out entries that already exist (by date)
      const existingDates = new Set(
        useWeightStore.getState().entries.map((e) => e.date)
      );

      const newEntries = healthEntries.filter(
        (entry) => !existingDates.has(entry.date)
      );

      // Add new entries to store
      newEntries.forEach((entry) => {
        useWeightStore.getState().addEntry({
          weight: entry.weight,
          date: entry.date,
          unit: entry.unit,
          source: 'apple_health',
        });
      });

      imported = newEntries.length;
      console.log(`[HealthKit] Imported ${imported} new entries`);
    }

    if (direction === 'export' || direction === 'both') {
      // Export manual entries to Apple Health
      const lastSync = useWeightStore.getState().lastHealthSync;
      const manualEntries = useWeightStore
        .getState()
        .entries.filter(
          (e) =>
            e.source === 'manual' && (!lastSync || e.date > lastSync)
        );

      console.log(`[HealthKit] Exporting ${manualEntries.length} manual entries to Apple Health...`);
      for (const entry of manualEntries) {
        await saveWeightToHealth(entry.weight, entry.unit, new Date(entry.date));
        exported++;
      }
      console.log(`[HealthKit] Exported ${exported} entries`);
    }

    if (imported > 0 || exported > 0) {
      useWeightStore.getState().setLastHealthSync(Date.now());
      console.log('[HealthKit] Updated last sync timestamp');
    } else {
      console.log('[HealthKit] Skipping last sync update - no changes detected');
    }

    console.log(`[HealthKit] Sync completed: ${imported} imported, ${exported} exported`);
    return { imported, exported };
  } catch (error) {
    console.error('[ERROR] Failed to sync weight data:', error);
    throw error;
  }
};

// Calculate BMI
export const calculateBMI = (
  weight: number,
  heightInches: number,
  unit: 'lbs' | 'kg'
): number => {
  const weightInLbs = unit === 'kg' ? convertWeight(weight, 'kg', 'lbs') : weight;

  // BMI = (weight in lbs / (height in inches)^2) × 703
  const bmi = (weightInLbs / (heightInches * heightInches)) * 703;

  return Math.round(bmi * 10) / 10; // Round to 1 decimal
};

// Get BMI category
export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

// Get BMI color (for UI)
export const getBMIColor = (bmi: number): string => {
  if (bmi < 18.5) return '#3B82F6'; // Blue
  if (bmi < 25) return '#10B981'; // Green
  if (bmi < 30) return '#F59E0B'; // Orange
  return '#EF4444'; // Red
};
