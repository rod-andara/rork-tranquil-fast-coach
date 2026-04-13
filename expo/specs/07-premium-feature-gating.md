# SPEC-07: Premium Feature Gating

**Status:** pending
**Priority:** P1 (should fix)
**Estimated Effort:** high (90+ min)

## Problem
The paywall exists and RevenueCat integration works, but no features are actually gated behind premium. Non-premium users can access everything, making there no incentive to subscribe.

## Root Cause
`isPremium` is only checked in two places: `settings.tsx` (to show "Premium Active" vs "Upgrade" card) and `paywall.tsx` (purchase flow). No actual feature checks exist.

## Recommended Premium Gates

Based on the paywall's feature list (`paywall.tsx` lines ~200-250):

| Feature | Gate Location | Free Behavior |
|---------|--------------|---------------|
| Custom fasting plans | `choose-plan.tsx` | Show lock icon, redirect to paywall |
| Advanced chart ranges (90d, all) | `WeightChart.tsx` | Show paywall when tapping 90d/all |
| Detailed fasting statistics | `progress.tsx` | Show basic stats, blur detailed ones |

Keep free:
- Standard plans (14:10, 16:8, 18:6, 20:4, 23:1)
- Basic weight tracking
- 7d and 30d chart views
- Learn tab content
- Apple Health sync

## Exact Fix

### File 1: Create `expo/components/PremiumGate.tsx`

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Lock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useFastStore } from '@/store/fastStore';
import { BlurView } from 'expo-blur';

interface PremiumGateProps {
  children: React.ReactNode;
  feature?: string;
}

export default function PremiumGate({ children, feature }: PremiumGateProps) {
  const { isPremium, isDarkMode } = useFastStore();
  const router = useRouter();

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.blurContainer}>
        {children}
        <BlurView
          intensity={20}
          tint={isDarkMode ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={styles.overlay}>
        <Lock size={24} color="#7C3AED" />
        <Text style={[styles.text, isDarkMode && styles.textDark]}>
          {feature || 'Premium Feature'}
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/paywall')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Unlock Premium</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', overflow: 'hidden', borderRadius: 12 },
  blurContainer: { opacity: 0.5 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  text: { fontSize: 14, fontWeight: '600', color: '#374151' },
  textDark: { color: '#D1D5DB' },
  button: {
    backgroundColor: '#7C3AED',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 4,
  },
  buttonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});
```

### File 2: `expo/app/onboarding/choose-plan.tsx`

Find where the "Custom" plan card is rendered. When tapped by a non-premium user, redirect to paywall instead of showing the custom duration modal.

Add to the plan selection handler:
```typescript
const { isPremium } = useFastStore();

// When user taps Custom plan:
if (plan === 'custom' && !isPremium) {
  router.push('/paywall');
  return;
}
```

Add a lock icon overlay on the Custom plan card for non-premium users.

### File 3: `expo/components/WeightChart.tsx`

Gate the 90d and "all" time range buttons. When a non-premium user taps them, show an alert directing to paywall.

In the time range button `onPress`:
```typescript
onPress={() => {
  if ((range === '90d' || range === 'all') && !isPremium) {
    Alert.alert(
      'Premium Feature',
      'Upgrade to Premium to view extended weight trends.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upgrade', onPress: () => router.push('/paywall') },
      ]
    );
    return;
  }
  setSelectedRange(range);
}}
```

Add imports: `Alert` from react-native, `useRouter` from expo-router, and get `isPremium` from `useFastStore`.

Add a small lock icon next to the 90d and "all" labels for non-premium users.

## Files to Read Before Starting
1. `expo/app/paywall.tsx` (understand the paywall screen)
2. `expo/app/onboarding/choose-plan.tsx` (find Custom plan selection logic)
3. `expo/components/WeightChart.tsx` (time range buttons)
4. `expo/store/fastStore.ts` (find `isPremium`)

## Files to Modify
- Create: `expo/components/PremiumGate.tsx`
- Modify: `expo/app/onboarding/choose-plan.tsx`
- Modify: `expo/components/WeightChart.tsx`

## Verification Steps
1. `npx tsc --noEmit` passes
2. With `isPremium: false`:
   - Tap "Custom" plan in onboarding -> paywall opens
   - Tap "90 Days" in chart -> alert with upgrade option
   - Tap "All" in chart -> alert with upgrade option
   - "7 Days" and "30 Days" work normally
3. With `isPremium: true` (set manually in store or via sandbox purchase):
   - All features accessible without gates
   - No lock icons visible

## Rollback Plan
```bash
git checkout -- expo/app/onboarding/choose-plan.tsx expo/components/WeightChart.tsx
rm expo/components/PremiumGate.tsx
```

## Notes
- The `PremiumGate` component is designed as a reusable wrapper but may not be needed in v1 if the inline gating approach (Alert + router.push) is sufficient.
- Don't gate too aggressively -- the free tier must still be useful enough that users want to keep the app.
- RevenueCat sandbox testing is required to verify the full purchase -> unlock flow.
- The `isPremium` flag in `fastStore` is set by `_layout.tsx` on app start via `checkSubscriptionStatus()`. It persists via `saveToStorage`.
