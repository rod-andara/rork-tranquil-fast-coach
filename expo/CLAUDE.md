# Tranquil Fast Coach - Claude Code Project Reference

## What This App Is
An iOS intermittent fasting timer app built with Expo/React Native, ~90% complete, live on TestFlight, targeting App Store submission. Users select a fasting plan (16:8, 18:6, etc.), start/stop fasts, track weight via Apple Health, and view progress charts.

## Tech Stack (exact versions)
- Expo SDK 54.0.33, React Native 0.81.5, React 19.1.0, TypeScript 5.8.3 (strict mode)
- Zustand 5.0.2 for state management (see persistence note below)
- NativeWind 4.1.23 / Tailwind 3.4.18 for styling (pinned — see Known Constraints)
- Expo Router 6.0.23 (file-based navigation)
- RevenueCat (`react-native-purchases` 9.6.13) — **dormant in v1.0**, gated by `EXPO_PUBLIC_ENABLE_REVENUECAT` (see SPEC-17)
- `react-native-health` 1.19.0 for Apple HealthKit
- `react-native-gifted-charts` 1.4.76 for weight line chart; native View bars for fasting histogram
- Sentry 7.2.0 for error tracking (privacy-hardened — see Privacy Invariant below)
- EAS for builds, TestFlight for distribution

## Architecture Map

```
app/index.tsx             Entry: hydration guard -> onboarding or home
app/_layout.tsx           Root: Sentry wrap, store hydration, RevenueCat init (gated, off in v1.0), HealthKit reinit
app/(tabs)/_layout.tsx    Tab navigator (5 tabs)
app/(tabs)/home.tsx       Timer display, start fast, stats summary
app/(tabs)/fast.tsx       Active fast: progress ring, pause/resume, end, tips
app/(tabs)/progress.tsx   Weight tracking, fasting stats, charts, achievements
app/(tabs)/learn.tsx      Content feed (recipes, articles, products)
app/(tabs)/settings.tsx   Preferences, premium card, help/support
app/onboarding/           3-step flow: welcome -> track-succeed -> choose-plan
app/_paywall.tsx          RevenueCat subscription screen — deactivated route in v1.0 (leading underscore = expo-router ignores); rename back to `paywall.tsx` for v1.1 (SPEC-17)

store/fastStore.ts        Fasting state (MANUAL AsyncStorage persist via save/loadFromStorage)
store/weightStore.ts      Weight state (zustand persist middleware with AsyncStorage, version 2)

utils/fastingUtils.ts     formatTime, formatDate, calculateProgress, getPlanDuration, getFastingMessage
utils/appleHealth.ts      HealthKit init, read/write weight, sync
utils/content.ts          Static content data for Learn tab
utils/index.ts            Re-exports + errorHandler + storage keys

services/revenuecat.ts    RevenueCat wrapper — every public fn short-circuits when `REVENUECAT_ENABLED` is false (SPEC-17)
services/notifications.ts  Expo notifications setup
services/offline-sync.ts  Offline queue (stub - not flushed)
services/supabase.ts      Backend sync (stub - user_id: 'stub')

hooks/useFastTimer.ts     Timer hook: 1s interval, elapsed tracking, background task

components/               15+ reusable components (CircularProgress, WeightChart, modals, cards)
constants/theme.ts        Colors, spacing, typography, borderRadius, shadows
```

## Critical Patterns (MUST follow)

### Use `currentFast.plannedDuration` for active fast calculations
The `startFast()` method in `fastStore.ts:71-72` correctly calculates `plannedDuration` including custom durations. When displaying progress or target end time on `home.tsx` or `fast.tsx`, use `currentFast.plannedDuration` directly. Do NOT re-call `getPlanDuration(selectedPlan)` without `customDuration` -- it defaults to 16h for custom plans.

### fastStore uses MANUAL persistence
`fastStore` does NOT use zustand persist middleware. It has custom `saveToStorage()` and `loadFromStorage()` methods. Any new field added to the store must be:
1. Added to the `FastState` interface
2. Given a default value in the `create()` call
3. Added to the `toSave` object in `saveToStorage()` (line 222-231)
4. Read in `loadFromStorage()` (happens automatically via spread: `set({ ...data, hasHydrated: true })`)

### weightStore uses zustand persist middleware
`weightStore` uses `persist()` with `createJSONStorage(() => AsyncStorage)`. New fields are automatically persisted. Has a version 2 migration system.

### Dark mode: dual system
- NativeWind `dark:` classes driven by `setColorScheme()` in `_layout.tsx:135`
- Many components also read `isDarkMode` from `useFastStore` for inline styles
- Both must be consistent. The `_layout.tsx` syncs them via `useEffect`.

### Screen styling pattern
All tab screens use `LinearGradient` as root container:
```tsx
<LinearGradient
  colors={isDarkMode ? ['#1a1625', '#1F2937'] : ['#FAFBFC', '#F3F4F6']}
  style={{ flex: 1 }}
>
```

### Card styling pattern
```
bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm
```

### Icons: lucide-react-native
All icons use `lucide-react-native`, NOT `@expo/vector-icons`.

### Privacy Invariant (SPEC-16 — App Store requirement)
No health, weight, fasting, or user-identifying data may ever reach Sentry servers. App Store privacy labels declare diagnostics-only, not linked to user.

**How it is enforced in `app/_layout.tsx`:**
- `beforeSend`: `redactSensitive()` recursively strips any event key matching `weight`, `goal`, `unit`, `name`, `kg`, `lbs`, `value`. Add new sensitive key names to the `SENSITIVE_KEYS` set there.
- `beforeBreadcrumb`: drops all `console.*` breadcrumbs entirely — console output is the primary accidental-leak vector.
- `tracesSampleRate: 0` — performance tracing disabled; it attached request payloads that could carry values.
- `autoSessionTracking: false`, `enableUserInteractionTracing: false` — reduced attack surface.

**How it is enforced in `utils/appleHealth.ts`:**
- All `Sentry.captureException()` calls use **static** `new Error("literal string")`. Never `new Error(someValue)` or template literals containing HealthKit data.
- All `console.log` / `console.warn` wrapped in `if (__DEV__)` — defense-in-depth.

**How it is enforced in `store/weightStore.ts`:**
- All weight-bearing `console.log` calls wrapped in `if (__DEV__)`.

**Rule for future Sentry instrumentation:** pass only static strings as Error messages; pass only non-sensitive keys in `extra`/`tags` (e.g. `{ screen: 'progress' }`, never `{ weight: entry.value }`).

### RevenueCat Invariant (SPEC-17 — App Store v1.0 free launch)

v1.0 ships as a genuinely free app: zero in-app purchases, zero paywall, zero SDK initialization. RevenueCat code is retained in the repo for v1.1 reactivation, but the SDK must remain dormant in v1.0.

**How it is enforced in `services/revenuecat.ts`:**
- Module exports `REVENUECAT_ENABLED = process.env.EXPO_PUBLIC_ENABLE_REVENUECAT === 'true'` (strict-string equality — `undefined`, `"false"`, `"1"`, boolean `true` all resolve to `false`).
- Every exported function (`initializeRevenueCat`, `checkSubscriptionStatus`, `getCurrentOffering`, `purchasePackage`, `restorePurchases`, `getCustomerInfo`, `getActiveSubscription`, `identifyUser`, `logoutUser`) opens with `if (!REVENUECAT_ENABLED) return …`. No `Purchases.*` call can execute when disabled.
- No fallback API key in source. `REVENUECAT_IOS_KEY` / `REVENUECAT_ANDROID_KEY` are `string | undefined`, sourced only from `EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY` / `_GOOGLE_API_KEY`.
- If the flag is true but the API key is missing, `initializeRevenueCat` warns (dev-only) and returns `false` without calling `Purchases.configure`.

**How it is enforced in `app/_layout.tsx`:**
- The entire RevenueCat startup block is wrapped in `if (REVENUECAT_ENABLED) { ... }`. When disabled, `initializeRevenueCat`, `checkSubscriptionStatus`, and `setPremium` are never reached at app launch.

**How the paywall route is hidden in v1.0:**
- `app/paywall.tsx` has been renamed to `app/_paywall.tsx`. The leading underscore tells expo-router to treat the file as a private module, not a route. Deep links to `/paywall` return 404.
- `<Stack.Screen name="paywall" .../>` is no longer registered in `_layout.tsx`.
- `components/PremiumGate.tsx` is defined but rendered zero times anywhere in the app tree. Its `router.push('/paywall' as any)` is dead code; the `as any` cast satisfies typed-routes since `/paywall` is no longer a valid route.

**v1.1 reactivation is documented in SPEC-17 §10** as three code reversals (~2 min) plus EAS env-var changes (~2 min) plus product decisions about which features to gate.

**Rule for v1.0 contributors:** Do not render `<PremiumGate>` anywhere. Do not import from `services/revenuecat`. Do not navigate to `/paywall`. Do not set `EXPO_PUBLIC_ENABLE_REVENUECAT=true` in production EAS env. All four constraints lift in v1.1.

## Anti-Patterns (MUST avoid)

- **NEVER** set RevenueCat log level to VERBOSE. It caused a memory leak / OOM crash (fixed in commit f2e7779). Log level must stay at WARN.
- **NEVER** modify the initialization order in `_layout.tsx`: store hydration -> RevenueCat init (gated, may no-op in v1.0) -> HealthKit reinit. Changing order causes race conditions. In v1.0 the RevenueCat block is wrapped in `if (REVENUECAT_ENABLED) { ... }` and skipped entirely — that gate stays.
- **NEVER** render `<PremiumGate>` or navigate to `/paywall` in v1.0. RevenueCat is disabled; the paywall route is unregistered and the file is renamed to `app/_paywall.tsx`. See SPEC-17 §10 for v1.1 reactivation.
- **NEVER** restore the placeholder API key fallback `'appl_YOUR_API_KEY_HERE'` in `services/revenuecat.ts`. The constants must remain `string | undefined`, sourced exclusively from env vars (SPEC-17).
- **NEVER** call `getPlanDuration(selectedPlan)` without the `customDuration` parameter when `selectedPlan` could be `'custom'`. This is a known bug source.
- **NEVER** add `console.log` to production paths without `__DEV__` guards. Many debug logs exist from prior sessions -- clean them up when touching those files.
- **NEVER** run `npx expo run:ios`, `npx expo run:android`, or `npx expo prebuild`. These generate a local `ios/`/`android/` directory whose `Info.plist` then silently overrides `app.json` on the next EAS Build (this caused the canceled build 101 — stale HealthKit/notification strings). The simulator is run via `npx expo start` + Expo Go / dev client only. If you ever need to inspect native config, read `app.json` — never generate the native project.

### Known Constraints
- **Managed workflow — native dirs are GENERATED, never committed (SPEC-22 lesson).** This project has no committed `ios/` or `android/` directory. EAS Build runs `expo prebuild` on the server from `app.json`, so `app.json` is the single source of truth for `Info.plist` (permission strings, `UIBackgroundModes`, entitlements). Both `.gitignore` and `expo/.gitignore` ignore `/ios` and `/android`. **If a local `ios/`/`android/` dir exists, EAS uploads it and its stale `Info.plist` silently overrides `app.json`** — this shipped the wrong HealthKit/notification strings into build 101 (canceled). Canary: if a build log prints *"an ios directory was detected in the project / EAS Build will use the value found in the native code"*, STOP — delete `expo/ios` and `expo/android` and rebuild. All compliance permission edits (SPEC-18 HealthKit, SPEC-20 notifications) live in `app.json` and only reach the binary via a clean server prebuild.
- **Old Architecture only** (`newArchEnabled: false` in `app.json`). Do NOT enable New Architecture without a dedicated migration spec. Enabling it would unblock NativeWind 4.2 but requires auditing all native modules — out of scope.
- **NativeWind pinned at 4.1.23.** Do not bump to 4.2+ without first enabling New Architecture (see SPEC-14 progress notes). NativeWind 4.2 requires `react-native-worklets` which requires New Arch.
- **Tailwind `transition-*` and `animate-*` utility classes are FORBIDDEN** in any `className` prop. They trigger `css-interop`'s `Animated.createAnimatedComponent` path, which crashes under React 19. Use `react-native-reanimated` directly for any animation.

## Session Protocol

### At session start:
1. Read this file (`expo/CLAUDE.md`)
2. Read the task spec from `expo/specs/` for the current task
3. Read ONLY the files listed in the spec's "Files to Read" section
4. Run `npx tsc --noEmit` to verify clean baseline (if making code changes)

### At session end:
1. Run `npx tsc --noEmit` to verify no new type errors
2. Walk through the spec's "Verification Steps"
3. If incomplete, add "Progress Notes" to the bottom of the spec file
4. Commit with format: `fix(scope): description` or `feat(scope): description`
5. Append `Spec: SPEC-NN` to commit body

### Token budget:
- For bug fixes: read only spec + affected files (2-4 files)
- For features: read spec + affected files + one pattern example
- Skip: `audit_docs/`, `docs/`, `*.md` marketing docs, Android files, asset files
- The architecture map above tells you where things live -- don't explore

## Testing Checklist (per area)

### After changing fastStore.ts:
- [ ] Timer start/stop/pause works
- [ ] Persistence survives app restart (kill and relaunch)
- [ ] Custom plan duration is preserved correctly

### After changing WeightChart.tsx:
- [ ] Test with 0, 1, and 7+ weight entries
- [ ] All 4 time ranges (7d, 30d, 90d, all) render correctly
- [ ] Both light and dark mode

### After changing appleHealth.ts:
- [ ] Test on PHYSICAL DEVICE (HealthKit write unavailable in simulator)
- [ ] Test both lbs and kg units

### After changing onboarding:
- [ ] Clear AsyncStorage, test full flow from scratch
- [ ] Verify onboardingComplete flag is set

### After any UI change:
- [ ] Light mode
- [ ] Dark mode
- [ ] No TypeScript errors (`npx tsc --noEmit`)

## Remaining Work
See `expo/specs/` for numbered task specifications. Execute in order: 00 -> 08.
Each spec is self-contained with exact file paths, code changes, and verification steps.

**Completed:** SPEC-00–04 (bug fixes + early features), SPEC-09 (auto-detect units, folded into SPEC-11), SPEC-10–14 (SDK 54 upgrade track), SPEC-16 (Sentry privacy hardening), SPEC-17 (RevenueCat dormant for free v1), SPEC-18 (HealthKit usage descriptions), SPEC-19 (Learn-tab external links cleanup), SPEC-20 (notifications brand-voice + lifecycle), SPEC-22 (external link health check).
**In progress:** SPEC-21 (App Store submission punch list — paperwork checklist; build + ASC listing).
**Pending:** SPEC-05 (Apple Health onboarding), SPEC-06 (Learn tab images), SPEC-08 (App Store submission — superseded by SPEC-21).
**Deferred to v1.1:** SPEC-07 (premium gating) — depends on SPEC-17 reactivation; see SPEC-17 §10 checklist.

### App Store submission status (v1.0)
All engineering compliance work is complete (SPEC-16 through SPEC-22). Remaining
work is paperwork in SPEC-21: production build, privacy-policy URL hosting,
screenshots, App Privacy labels, and the ASC listing. The compliance-clean
build candidate is built via `eas build --platform ios --profile production`
from `app.json` (NOT from any local native dir — see Known Constraints).

## Build Commands
```bash
npx expo start                              # Dev server
eas build --platform ios --profile preview  # TestFlight build
eas submit --platform ios                   # App Store submission
npx tsc --noEmit                            # Type check
npx expo-doctor                             # Health check
```
