# SPEC-08: App Store Submission

**Status:** pending
**Priority:** P0 (ship blocker)
**Estimated Effort:** high (multi-session -- not a code change)

## Problem
The app is on TestFlight but has not been submitted to the App Store. Several non-code steps are required.

## Prerequisites
- [ ] SPEC-01 through SPEC-05 completed
- [ ] SPEC-07 completed (premium gating)
- [ ] SPEC-06 completed or consciously deferred

## This Is a Checklist Spec

This spec is primarily a human task list, not a Claude Code task. See `APP_STORE_CHECKLIST.md` for the full checklist.

## Code Tasks for Claude Code

### Task 1: Remove unused permissions from app.json

Read `app.json` and remove:
- `NSLocationWhenInUseUsageDescription` (no location features exist)
- `NSCameraUsageDescription` (no camera features exist)
- `NSPhotoLibraryUsageDescription` (no photo features exist)

Also remove `expo-location` from `package.json` dependencies if it exists.

### Task 2: Clean up console.log statements

Find and remove or gate behind `__DEV__` all `console.log` statements in production code:
- `store/fastStore.ts` -- extensive debug logging in startFast, pauseFast, etc.
- `utils/appleHealth.ts` -- debug logging throughout
- `app/_layout.tsx` -- initialization logging
- `app/(tabs)/home.tsx` -- navigation logging (line 188)

Pattern to use:
```typescript
// Remove entirely, or:
if (__DEV__) console.log('[FastStore] startFast called with:', planOrDuration);
```

### Task 3: Verify production build

```bash
npx tsc --noEmit          # Type check
npx expo-doctor           # Health check
eas build --platform ios --profile production  # Production build
```

### Task 4: Update version in app.json

Set `version` to `"1.0.0"` (or whatever release version is appropriate).

## Files to Read Before Starting
1. `app.json` (permissions, version, plugins)
2. `package.json` (check for expo-location dependency)

## Files to Modify
- `app.json`
- `package.json` (if removing expo-location)
- `store/fastStore.ts` (console.log cleanup)
- `utils/appleHealth.ts` (console.log cleanup)
- `app/_layout.tsx` (console.log cleanup)
- `app/(tabs)/home.tsx` (console.log cleanup)

## Human Tasks (not for Claude Code)
See `APP_STORE_CHECKLIST.md` for:
- RevenueCat production key setup
- Privacy policy and Terms of Service creation
- App Store Connect metadata
- Screenshots
- App Review notes

## Verification Steps
1. `npx tsc --noEmit` passes
2. `npx expo-doctor` passes with no critical warnings
3. No `console.log` in production (only `__DEV__` gated or `console.warn`/`console.error`)
4. Production build completes successfully
5. App launches without crash on TestFlight

## Notes
- This spec should be the LAST one executed.
- Some tasks (RevenueCat production keys, privacy policy) require human action outside of Claude Code.
- The version number should be discussed with the product owner before setting.
