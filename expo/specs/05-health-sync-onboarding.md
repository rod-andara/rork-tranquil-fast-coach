# SPEC-05: Apple Health Sync Onboarding Screen

**Status:** pending
**Priority:** P1 (should fix)
**Estimated Effort:** medium (30-90 min)

## Problem
Users are not prompted to connect Apple Health during onboarding. This reduces early engagement with weight tracking, which is a key feature of the app.

## Root Cause
The onboarding flow is: welcome -> track-succeed -> choose-plan. There is no health integration step. The `AppleHealthCard` component handles HealthKit connection but is buried in the Progress tab, which many users may not visit early.

## Exact Fix

### File 1: Create `expo/app/onboarding/health-sync.tsx`

New file. Follow the same pattern as `welcome.tsx` and `track-succeed.tsx`:

```typescript
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Heart } from 'lucide-react-native';

import VideoBackground from '@/components/VideoBackground';
import { spacing, borderRadius } from '@/constants/theme';
import { initHealthKit } from '@/utils/appleHealth';
import { useWeightStore } from '@/store/weightStore';

export default function HealthSyncScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [isConnecting, setIsConnecting] = useState(false);
  const { setHealthConnected } = useWeightStore();

  // Auto-skip on Android (HealthKit is iOS only)
  useEffect(() => {
    if (Platform.OS !== 'ios') {
      router.replace('/onboarding/choose-plan');
    }
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const success = await initHealthKit();
      if (success) {
        setHealthConnected(true);
        router.push('/onboarding/choose-plan');
      } else {
        // Permission denied or failed -- still let user continue
        router.push('/onboarding/choose-plan');
      }
    } catch (error) {
      console.error('[HealthSync] Failed to init HealthKit:', error);
      router.push('/onboarding/choose-plan');
    } finally {
      setIsConnecting(false);
    }
  };

  if (Platform.OS !== 'ios') return null;

  return (
    <VideoBackground source={require('@/assets/videos/track-succeed.mp4')}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <Animated.View
          style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <BlurView intensity={20} tint="dark" style={styles.textContainer}>
            <View style={styles.iconContainer}>
              <Heart size={48} color="#EF4444" fill="#EF4444" />
            </View>
            <Text style={styles.title}>Apple Health</Text>
            <Text style={styles.subtitle}>
              Sync your weight data with Apple Health to track your progress automatically
            </Text>
          </BlurView>

          {/* Progress Dots (4 total now) */}
          <View style={styles.dotsContainer}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>
        </Animated.View>

        <Animated.View
          style={[styles.footer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={handleConnect}
            activeOpacity={0.8}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Connect Apple Health</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/onboarding/choose-plan')}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </VideoBackground>
  );
}

const styles = StyleSheet.create({
  // Copy styles from welcome.tsx, add:
  safeArea: { flex: 1, paddingHorizontal: spacing.lg },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: spacing.xxl },
  textContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: spacing.xl,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
    alignItems: 'center',
  },
  iconContainer: { marginBottom: spacing.lg },
  title: {
    fontSize: 40, fontWeight: '800', color: '#FFFFFF', textAlign: 'center',
    marginBottom: spacing.lg, lineHeight: 48,
    textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 18, fontWeight: '500', color: '#FFFFFF', textAlign: 'center',
    lineHeight: 26, opacity: 0.95,
    textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  dotsContainer: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xxl },
  dot: { width: 8, height: 8, borderRadius: borderRadius.full, backgroundColor: 'rgba(255, 255, 255, 0.4)' },
  dotActive: { backgroundColor: '#FFFFFF', width: 24 },
  footer: { paddingBottom: spacing.xl, gap: spacing.md },
  button: {
    backgroundColor: '#EF4444', paddingVertical: spacing.md + 4, paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  buttonText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  skipText: { fontSize: 16, fontWeight: '500', color: '#FFFFFF', textAlign: 'center', opacity: 0.8 },
});
```

### File 2: `expo/app/onboarding/track-succeed.tsx`

**Line 70**, change navigation target:
```typescript
onPress={() => router.push('/onboarding/health-sync')}
```

### File 3: Update progress dots on all onboarding screens

**welcome.tsx** (lines 52-56): Change to 4 dots:
```typescript
<View style={styles.dotsContainer}>
  <View style={[styles.dot, styles.dotActive]} />
  <View style={styles.dot} />
  <View style={styles.dot} />
  <View style={styles.dot} />
</View>
```

**track-succeed.tsx** (lines 52-56): Change to 4 dots:
```typescript
<View style={styles.dotsContainer}>
  <View style={styles.dot} />
  <View style={[styles.dot, styles.dotActive]} />
  <View style={styles.dot} />
  <View style={styles.dot} />
</View>
```

**choose-plan.tsx**: Find the dots section and update to 4 dots with the 4th active.

### File 4: `expo/app/_layout.tsx`

Add the new screen to the Stack (after the track-succeed screen, around line 112):
```typescript
<Stack.Screen
  name="onboarding/health-sync"
  options={{
    headerShown: false,
    presentation: "card",
  }}
/>
```

## Files to Read Before Starting
1. `expo/app/onboarding/welcome.tsx` (pattern reference)
2. `expo/app/onboarding/track-succeed.tsx` (navigation target to change)
3. `expo/app/_layout.tsx` (screen registration)
4. `expo/utils/appleHealth.ts` (first 50 lines -- `initHealthKit` signature)
5. `expo/store/weightStore.ts` (find `setHealthConnected`)

## Files to Modify
- Create: `expo/app/onboarding/health-sync.tsx`
- Modify: `expo/app/onboarding/track-succeed.tsx`
- Modify: `expo/app/onboarding/welcome.tsx` (dots only)
- Modify: `expo/app/onboarding/choose-plan.tsx` (dots only)
- Modify: `expo/app/_layout.tsx` (add screen)

## Verification Steps
1. `npx tsc --noEmit` passes
2. Clear AsyncStorage to trigger onboarding
3. Walk through: welcome -> track-succeed -> health-sync -> choose-plan
4. On health-sync: verify progress dots show 3/4 active
5. Tap "Connect Apple Health" -- HealthKit permission dialog should appear (iOS only)
6. Tap "Skip for now" -- should navigate to choose-plan
7. Verify onboarding completes normally after choose-plan

## Rollback Plan
```bash
git checkout -- expo/app/onboarding/track-succeed.tsx expo/app/onboarding/welcome.tsx expo/app/_layout.tsx
rm expo/app/onboarding/health-sync.tsx
```

## Notes
- Reuses the `track-succeed.mp4` video background since we don't have a dedicated health video asset.
- The Heart icon color (#EF4444 red) differentiates this screen visually from others.
- The button color is red (#EF4444) to match the Apple Health brand color.
- Android users auto-skip this screen since HealthKit is iOS-only.
- `initHealthKit()` returns a boolean indicating success. On failure, we still let the user proceed.
