# SPEC-27: Release surface, in-app legal links, Erase All Data, and submission record

**Status:** Pending. Pre-launch **critical/high** (Manus findings A2, A8, A9). Contains code changes AND owner tasks.
**Run order:** after SPEC-26. One session, one commit (docs edits in same commit). Trailer: `Spec: SPEC-27`.

## Files to Read
`CLAUDE.md`, `app/_paywall.tsx`, `components/PremiumGate.tsx`, `app/_layout.tsx`, `app/(tabs)/settings.tsx`, `app.json`, `specs/SPEC-17-*.md`, `specs/SPEC-21-app-store-submission-punch-list.md` (§6, §7E keywords, §8 App Privacy), `store/fastStore.ts`, `store/weightStore.ts`.

## Decisions (owner)
- Log Out → **"Erase All Data"**.
- Privacy site `https://tranquilfast.app` is **not yet hosted**; owner hosts it (files in `../tranquilfast_static_site_v2/`: `privacy.html`, `terms.html`, `support.html`). Hard blocker for submission.
- iPad: recommend `supportsTablet: false` for v1.0 (default in this spec). Owner may override.
- Canonical store/display name: **owner to confirm** ("Tranquil Fast" vs "Tranquil Fast Coach"); default = keep whichever name is on the ASC listing and align everything to it.

## Problems (verified)
| # | Problem | Evidence |
|---|---|---|
| A2 | Expo Router 6.0.23 only ignores `+html`, `+native-intent`, `+api`, `+middleware`. `app/_paywall.tsx` is therefore a real route `/_paywall`, reachable by deep link `tranquilfastcoach://_paywall` (SPEC-17's "underscore = ignored" assumption is wrong). Low real-world risk while RevenueCat is off, but it is an unintended purchase-UI surface. | `node_modules/expo-router/build/getRoutesCore.js` ignore list |
| A9a | No Privacy Policy link anywhere in the app (Guideline 5.1.1(i) requires one in-app and in ASC). | `settings.tsx` Help & Support section |
| A9b | "Log Out" calls only `AsyncStorage.clear()`; Zustand state stays in memory (and re-persists on next write); scheduled notifications remain. The app has no accounts, so "Log Out" is also misleading wording. | `settings.tsx` `handleLogOut` |
| A8 | SPEC-21 App Privacy guidance contradicts itself: it lists Health as collected while stating no data is collected. HealthKit values stay on device (not "collected"); Sentry diagnostics are. | `SPEC-21` ~L399-451, L621 |
| A9c | Draft keywords include competitor app names; name inconsistent across `app.json`/UI footer/specs; `supportsTablet: true` requires 13" iPad screenshots. | `SPEC-21` §7E, `app.json`, `settings.tsx` footer |

## Changes
### 1. Take the paywall out of the route tree
- Move `app/_paywall.tsx` → `dormant/paywall.tsx` (new top-level folder `dormant/` in `expo/`). Fix its imports (alias `@/` still resolves). Check `tsconfig.json` `include` still type-checks it.
- `components/PremiumGate.tsx`: keep dead code; update the comments (`router.push('/paywall' as any)` stays inert).
- Acceptance: deep links `tranquilfastcoach://paywall` and `tranquilfastcoach://_paywall` both land on `+not-found`. Update `_layout.tsx` comment, SPEC-17 §10 reactivation steps (v1.1: move file back to `app/paywall.tsx`, register `<Stack.Screen>`), and CLAUDE.md (remove the underscore claim).

### 2. Erase All Data (replaces Log Out)
- `settings.tsx`: rename row and dialog. Dialog text: "Erases all fasts, weights and settings on this device. Data already saved in Apple Health is not deleted." Buttons: Cancel / Erase (destructive).
- Handler (single function, e.g. `eraseAllData` exported from `utils/` or implemented in settings): `await cancelFastingNotifications()` → `await AsyncStorage.clear()` → reset in-memory stores to defaults **without re-persisting stale state**: `useFastStore.setState({ ...defaults, hasHydrated: true })`, `useWeightStore.setState({ ...defaultState })` (export `defaultState` or add a `reset()` action in each store; must include `deletedHealthIds: []`, `isHealthConnected: false`, `lastHealthSync: null`) → `router.replace('/onboarding/welcome')`. Do not call `saveToStorage` afterward (onboarding will persist naturally).
- Verify the zustand `persist` middleware does not write defaults back in a way that resurrects old data (it should only write the reset state).

### 3. In-app legal & support links
- Settings: add rows **Privacy Policy**, **Terms of Use**, **Support** using the existing `ListItem` pattern and `Linking.openURL` to `https://tranquilfast.app/privacy.html`, `/terms.html`, `/support.html`. Keep the existing email Help & Support row. Put the URLs in one constants object (e.g. `constants/links.ts`).
- Handle `openURL` failure with a calm alert; no console output outside `__DEV__`.

### 4. Tablet and naming
- `app.json`: `ios.supportsTablet: false` (unless owner overrides). Align `expo.name`, the Settings footer text, and spec/ASC copy with the canonical name. Grep `Tranquil Fast Coach` / `Tranquil Fast` and fix user-visible strings only (leave the bundle id, slug, scheme, package names alone).

### 5. SPEC-21 documentation fixes (docs only)
- §7E Keywords: remove competitor/brand names; keep generic terms.
- §8 App Privacy: rewrite as a **decision record**: Health & Fitness → not collected (read/written only on device, never transmitted by the app or Sentry; per SPEC-16); Diagnostics → Crash Data and Other Diagnostic Data collected via Sentry for App Functionality; Identifiers/"Linked" answers must be confirmed against real events (see owner tasks). Remove statements implying Health is collected; remove pre-baked "None"/"4+" answers in favor of "answer from the final screens".
- Add a short "Screenshots" note: required sizes depend on `supportsTablet`.

## Owner tasks (not code; required before submission)
1. Host `tranquilfast.app` with privacy, terms, support pages; verify HTTPS 200 logged-out.
2. `eas env:list production` (or dashboard): confirm `EXPO_PUBLIC_ENABLE_REVENUECAT` is **absent** or not exactly `true`.
3. On a release (TestFlight) build, trigger a test crash and inspect the raw Sentry event (and any attachments) for weight/health values, IP address, and the installation ID; enable "Prevent storing of IP addresses" in the Sentry project; finalize ASC App Privacy answers from what you see.
4. Complete the ASC Medical/Wellness and age-rating questionnaires from the final binary; submit screenshots for the correct device families.
5. Confirm canonical app name.

## Verification
- `npx tsc --noEmit` clean; `grep -rn "app/_paywall\|_paywall" app` → none under `app/`.
- Device: both paywall deep links → not found (cold and warm start); Settings legal links open (after the site is live); Erase All Data → onboarding shown, Fast/Progress tabs empty after finishing onboarding, no scheduled notifications (check by starting a fast, erasing, waiting for/inspecting), Health card shows disconnected; Apple Health data untouched.
- Update `CLAUDE.md` (RevenueCat/paywall invariant, remove "Log Out", add links/erase invariants), SPEC-17, SPEC-21, `specs/README.md`.

## Rollback
Revert commit; move the paywall file back if needed.

## Progress Notes
(none yet)
