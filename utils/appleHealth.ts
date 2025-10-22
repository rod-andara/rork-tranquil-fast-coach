import AppleHealthKit, {
  HealthKitPermissions,
  HealthValue,
  HealthUnit,
} from 'react-native-health';
import { Platform } from 'react-native';
import { useWeightStore, WeightEntry } from '@/store/weightStore';

// Check if HealthKit is available (iOS only, not simulator)
export const isHealthKitAvailable = (): boolean => {
  if (Platform.OS !== 'ios') {
    return false;
  }
  // Note: HealthKit is available on simulator in newer iOS versions,
  // but some features may not work properly
  return true;
};

// Initialize HealthKit and request permissions
export const initHealthKit = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!isHealthKitAvailable()) {
      resolve(false);
      return;
    }

    const permissions: HealthKitPermissions = {
      permissions: {
        read: [AppleHealthKit.Constants.Permissions.Weight],
        write: [AppleHealthKit.Constants.Permissions.Weight],
      },
    };

    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      if (error) {
        console.error('[ERROR] Cannot grant HealthKit permissions:', error);
        resolve(false);
        return;
      }
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
    if (!isHealthKitAvailable()) {
      reject(new Error('HealthKit is not available'));
      return;
    }

    const options = {
      startDate: startDate ? startDate.toISOString() : undefined,
      limit: limit || 100,
      ascending: false,
    };

    AppleHealthKit.getWeightSamples(
      options,
      (err: Object, results: HealthValue[]) => {
        if (err) {
          console.error('[ERROR] Failed to get weight from Health:', err);
          reject(err);
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
    if (!isHealthKitAvailable()) {
      reject(new Error('HealthKit is not available'));
      return;
    }

    // Convert to pounds (Apple Health's preferred unit)
    const weightInLbs = unit === 'kg' ? convertWeight(weight, 'kg', 'lbs') : weight;

    const options = {
      value: weightInLbs,
      date: date ? date.toISOString() : new Date().toISOString(),
    };

    AppleHealthKit.saveWeight(options, (err: Object, result: boolean) => {
      if (err) {
        console.error('[ERROR] Failed to save weight to Health:', err);
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

// Sync weight data bidirectionally
export const syncWeightData = async (
  direction: 'import' | 'export' | 'both' = 'both'
): Promise<{ imported: number; exported: number }> => {
  let imported = 0;
  let exported = 0;

  try {
    if (direction === 'import' || direction === 'both') {
      // Import from Apple Health
      const lastSync = useWeightStore.getState().lastHealthSync;
      const startDate = lastSync ? new Date(lastSync) : undefined;

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

      for (const entry of manualEntries) {
        await saveWeightToHealth(entry.weight, entry.unit, new Date(entry.date));
        exported++;
      }
    }

    // Update last sync timestamp
    useWeightStore.getState().setLastHealthSync(Date.now());

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
