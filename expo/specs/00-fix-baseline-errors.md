# SPEC-00: Fix Pre-Existing Baseline Errors

**Status:** completed
**Priority:** P0 (blocks all other specs — `npx tsc --noEmit` must be clean)
**Estimated Effort:** low (<30 min)

## Problem
Two issues pollute the development experience and undermine the spec workflow:

1. **TypeScript errors in paywall.tsx:** `typography.h4` doesn't exist in the theme. This means `npx tsc --noEmit` never returns 0 errors, breaking the "clean baseline" requirement of every spec.

2. **RevenueCat red error screen in Expo Go:** When running `npx expo start` and testing in Expo Go, RevenueCat throws "Invalid API key — native store not available in Expo Go" as a visible console error (red screen). This is expected (Expo Go has no StoreKit), but it's disruptive during development. The init function already catches the error and returns `false`, but the error still surfaces visually.

## Root Cause

### Issue 1: `typography.h4` missing
`constants/theme.ts` defines typography tokens: h1, h2, h3, body, bodyLarge, caption, small — but NOT `h4`.
`app/paywall.tsx` references `typography.h4` on lines 398 and 433.

### Issue 2: RevenueCat in Expo Go
`services/revenuecat.ts:36-37` calls `Purchases.configure()` unconditionally on iOS. Inside Expo Go, the native StoreKit module is unavailable, causing the configure call to throw. The error is caught at line 48, but `console.error` on line 49 triggers Expo Go's LogBox red screen.

## Exact Fix

### File 1: `expo/constants/theme.ts`

Add `h4` to the typography object, after `h3` (around line 65):

```typescript
h3: {
  fontSize: 20,
  fontWeight: '600' as const,
  lineHeight: 28,
},
h4: {
  fontSize: 17,
  fontWeight: '600' as const,
  lineHeight: 24,
},
body: {
```

This follows the existing scale: h1=32, h2=24, h3=20, h4=17 (standard iOS body-semibold size).

### File 2: `expo/services/revenuecat.ts`

Add an Expo Go guard at the top of `initializeRevenueCat()`. Skip RevenueCat entirely when running in Expo Go, since native store isn't available.

Add import at line 2 (or top of file):
```typescript
import Constants from 'expo-constants';
```

Then at the beginning of `initializeRevenueCat()` function (after the `isInitialized` check, around line 28), add:

```typescript
// Skip RevenueCat in Expo Go — native StoreKit is not available
const isExpoGo = Constants.appOwnership === 'expo';
if (isExpoGo) {
  console.log('[RevenueCat] Skipping initialization in Expo Go (native store unavailable)');
  return false;
}
```

## Files to Read Before Starting
1. `expo/constants/theme.ts` (typography object)
2. `expo/app/paywall.tsx` (lines 395-435 — where `h4` is referenced)
3. `expo/services/revenuecat.ts` (lines 22-60 — initialization function)

## Files to Modify
- `expo/constants/theme.ts`
- `expo/services/revenuecat.ts`

## Verification Steps
1. `npx tsc --noEmit` passes with **0 errors** (this is the main goal)
2. Run `npx expo start`, open in Expo Go — no red error screen from RevenueCat
3. The paywall screen still renders correctly (font sizes look appropriate)
4. Building a development build (`eas build --profile development`) still initializes RevenueCat normally (the guard only skips in Expo Go)

## Rollback Plan
```bash
git checkout -- constants/theme.ts services/revenuecat.ts
```

## Notes
- After this fix, `npx tsc --noEmit` should return 0 errors. This becomes the clean baseline for all future specs.
- The `Constants.appOwnership` approach is the official Expo way to detect Expo Go vs development/production builds.
- The `h4` token size (17px) matches iOS Dynamic Type "Body" at semibold weight — appropriate for package titles and button text in the paywall.
- Do NOT change the RevenueCat error handling in `_layout.tsx` — it already handles `false` gracefully.
