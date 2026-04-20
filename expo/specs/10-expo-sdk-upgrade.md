# SPEC-10: Expo SDK Upgrade for iOS 26 SDK Compliance

**Status:** pending
**Priority:** P0 (App Store deadline: April 28, 2026)
**Estimated Effort:** high (3-5 hours — dedicated session)

## Problem
App Store Connect warned that build 87 was built with iOS 18.2 SDK. Starting **April 28, 2026**, Apple requires all new App Store Connect uploads to be built with iOS 26 SDK (Xcode 26). Expo SDK 52 bundles iOS 18.2 SDK, so a major SDK upgrade is required before submission.

Existing TestFlight builds remain valid — this only affects *new* uploads. Build 87 is safe for continued testing.

## Research Summary (completed 2026-04-20)

**Target: Expo SDK 54.** Not SDK 55 — see reasoning below.

- SDK 54 (released Aug 2025) bundles RN 0.81 + React 19.1 + iOS 26 SDK via Xcode 26.0. Meets the April 28 deadline.
- SDK 55 (current latest) bundles RN 0.83 + React 19.2 + Xcode 26.2. Also meets the deadline, but newer = less time for native modules to stabilize.
- Rationale: SDK 54 has had ~8 months of bake time, the chance of a broken native module is lower. Once SDK 54 ships successfully, a future SPEC can bump to 55.

### Target Versions (verified 2026-04-20)

| Package | Current | Target | Notes |
|---------|---------|--------|-------|
| `expo` | `~52.0.0` | `~54.0.0` | RN 0.81, React 19.1, iOS 26 SDK |
| `react-native` | `0.76.9` | `0.81.0` | Precompiled iOS builds, faster compile |
| `react` | `18.3.1` | `19.1.0` | Breaking: `useRef<T>()` needs explicit initial value |
| `@types/react` | `~18.3.12` | `~19.1.0` | |
| EAS image | (default, sdk-52) | `"macos-sequoia-15.6-xcode-26.0"` | or shortcut `"sdk-54"` |

**`eas.json` change:**
```json
{
  "build": {
    "production": {
      "autoIncrement": true,
      "ios": {
        "distribution": "store",
        "image": "macos-sequoia-15.6-xcode-26.0"
      }
    }
  }
}
```

### Native Module Compatibility Check (researched 2026-04-20)

- ⚠️ **`react-native-health` (currently 1.19.0)** — **HIGHEST RISK.** Last release was Oct 2024 (18 months ago). 120 open issues. No newer version available. Issue #422 notes RN 0.77+ needs Swift AppDelegate setup (docs haven't been updated). Likely works but may require manual native config tweaks. **This is the most likely blocker.** See Fallback Plan.
- ✅ `react-native-purchases` (currently 9.6.13) — RevenueCat releases frequently and supports RN 0.81+. Run `npx expo install react-native-purchases` to get the aligned version.
- ✅ `@sentry/react-native` (currently 6.10.0) — Sentry aligns releases with RN versions. Let `npx expo install --fix` pull the compatible version (likely 7.x or 8.x).
- ✅ `nativewind` (4.1.23) — SDK-version agnostic. Should work as-is.
- ⚠️ `react-native-chart-kit` (6.12.0) — unmaintained for ~2 years. May still work since it relies on `react-native-svg` which Expo manages. If broken, fallback is `react-native-gifted-charts` or `victory-native`. **Flag as SPEC-11 if broken.**
- ✅ `react-native-reanimated`, `react-native-screens`, `react-native-gesture-handler`, `react-native-safe-area-context` — all Expo-bundled. `npx expo install --fix` aligns them.
- ⚠️ `expo-router` (4.0.0) — jumps to 5.x in SDK 54. Check the migration guide; route definitions should still work but typed routes may need re-generation.

## Execution Plan

### Phase 1: Prerequisites (10 min)

1. Ensure working tree is clean (`git status`).
2. Create a new branch: `git checkout -b sdk-upgrade`.
3. Verify current baseline passes: `npx tsc --noEmit` → 0 errors.
4. Back up current `package.json` and `app.json` (for diff reference later).

### Phase 2: Expo SDK Bump — 52 → 53 → 54 (30-45 min)

Expo recommends upgrading **one major version at a time** when jumping multiple. Target is SDK 54, so do it in two hops.

**Hop 1: SDK 52 → 53**
```bash
npx expo install expo@^53.0.0
npx expo install --fix
npx tsc --noEmit
```
Resolve any errors before the next hop. React 19 lands here — expect `useRef<T>()` type errors.

**Hop 2: SDK 53 → 54**
```bash
npx expo install expo@^54.0.0
npx expo install --fix
npx tsc --noEmit
npx expo-doctor
```

Official upgrade guides:
- SDK 52 → 53: https://expo.dev/changelog/sdk-53
- SDK 53 → 54: https://expo.dev/changelog/sdk-54

### Phase 3: Fix Breaking Changes (60-90 min)

Run `npx tsc --noEmit` after each SDK bump. Common breakages:

**React 19 (SDK 53+):**
- `useRef<T>()` without initial value is now a type error — pass `null` explicitly.
- `forwardRef` is deprecated in favor of ref-as-prop — low urgency, keep forwardRef for now.
- Some third-party libraries may not have React 19 types — check for `@types/react` conflicts.

**React Native new architecture:**
- `newArchEnabled` in `app.json` is currently `false`. **Keep it false** for this upgrade — enabling New Arch is a separate rabbit hole.
- Some SDKs may default to `true` — explicitly set it to `false` in `app.json`.

**Expo Router 4 → 5+:**
- Check Expo Router migration guide for any route definition changes.
- `typedRoutes` experiment flag may have moved — verify.

**Metro / Babel:**
- `metro` / `metro-config` / `metro-resolver` in devDependencies may need bumping to match new RN version. Usually `npx expo install --fix` handles this.

**Known risk: `react-native-health`:**
- This is a community package that lags behind RN releases. If it throws on install or crashes at HealthKit init after upgrade, options:
  - Pin to the latest version that works with the target RN
  - Switch to Expo's official `expo-health` (if/when available)
  - **Revert the upgrade** and wait for the package to catch up

### Phase 4: Update EAS Build Config (10 min)

Edit `eas.json` production profile to pin the Xcode 26 image:

```json
{
  "build": {
    "production": {
      "autoIncrement": true,
      "ios": {
        "distribution": "store",
        "image": "macos-sequoia-15.6-xcode-26.0"
      }
    }
  }
}
```

The `macos-sequoia-15.6-xcode-26.0` image is the verified default for `sdk-54` projects. Do NOT use `"latest"` — that currently points to Xcode 26.2 / sdk-55, which doesn't match our target SDK.

### Phase 5: Verification (30-45 min)

1. `npx tsc --noEmit` → 0 errors.
2. `npx expo-doctor` → no critical warnings.
3. `npx expo prebuild --platform ios --clean` (optional, to verify native config generates cleanly — but don't commit the ios/ folder).
4. Build a development build or preview build first:
   ```bash
   eas build --platform ios --profile preview
   ```
5. Install on physical device via ad-hoc link (needs UDID registered) OR skip preview and go straight to production TestFlight.

### Phase 6: Smoke Test on Device (20 min)

Full regression pass on the new build:
- [ ] App launches without crash
- [ ] Onboarding flow (all 4 steps)
- [ ] Start / pause / end a 16:8 fast
- [ ] Start a custom fast (verify duration calculated correctly)
- [ ] Log a weight entry manually
- [ ] HealthKit permission prompt appears and sync works
- [ ] Weight chart renders in all 4 time ranges
- [ ] Unit toggle (lbs ↔ kg) works
- [ ] Paywall opens (RevenueCat init doesn't error to Sentry)
- [ ] Dark mode toggle
- [ ] App restart preserves state (fastStore + weightStore)

### Phase 7: Production Build + Submit (20 min)

```bash
eas build --platform ios --profile production
eas submit --platform ios
```

Then in App Store Connect: TestFlight → confirm new build number appears without warnings.

## Files to Read Before Starting

1. `package.json` (all dependencies)
2. `app.json` (plugins, iOS config)
3. `eas.json` (build profiles)
4. `CLAUDE.md` (session protocol)
5. Expo SDK upgrade guides for each intermediate version

## Files to Modify

- `package.json`
- `app.json` (possibly — if `newArchEnabled` flag moves or plugin configs change)
- `eas.json` (EAS image pin)
- Any source files with React 19 type errors (likely `useRef` sites — grep `useRef<` without a null arg)

## Fallback Plan — If `react-native-health` Breaks

This is the highest-risk dependency. If it doesn't support the target RN version:

**Option A (preferred):** Pin Expo SDK to the newest version that `react-native-health` supports, even if that's SDK 53 or 54 rather than the latest. As long as it bundles iOS 26 SDK, you meet the deadline.

**Option B:** Temporarily remove the HealthKit feature (comment out `react-native-health` import, disable the Apple Health section in Progress tab, remove entitlements from app.json). Ship the upgrade to meet the deadline, then re-add HealthKit once the package updates. This is painful but keeps the app submittable.

**Option C:** Write a thin native module yourself using Expo Modules API. Out of scope for this spec.

## Rollback Plan

If the upgrade breaks the app and can't be fixed in the session:

```bash
git checkout main
git branch -D sdk-upgrade
```

Build 87 remains valid on TestFlight. You have until April 28 to successfully complete the upgrade. If you're within 48 hours of the deadline and blocked, the fallback is to ship build 87 for App Store review (existing TestFlight builds are still submittable — the SDK deadline applies to *future* uploads, not binaries already in the system).

## Verification Steps

1. `npx tsc --noEmit` — 0 errors
2. `npx expo-doctor` — no critical warnings
3. Production build completes on EAS without errors
4. Build submitted to App Store Connect without ITMS-90725 warning
5. Device smoke test passes all items in Phase 6

## Notes

- Expo SDK upgrades are **the single most likely source of mysterious runtime crashes** in the app's remaining lifetime. Budget 2x the expected time.
- If the session runs long and you hit a wall, commit partial progress to the `sdk-upgrade` branch and walk away. Don't merge to main until the full smoke test passes.
- The `newArchEnabled: false` decision is deliberate — turning on New Architecture is a much larger migration and should be a separate spec (SPEC-11 candidate, post-launch).
- After this ships, the app is fully App Store ready — the only remaining items in APP_STORE_CHECKLIST.md are human tasks (privacy policy, screenshots, App Review notes).

## Progress Notes
(To be filled in by Claude Code if session ends mid-upgrade)
