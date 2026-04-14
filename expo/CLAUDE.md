# Tranquil Fast Coach - Claude Code Project Reference

## What This App Is
An iOS intermittent fasting timer app built with Expo/React Native, ~90% complete, live on TestFlight, targeting App Store submission. Users select a fasting plan (16:8, 18:6, etc.), start/stop fasts, track weight via Apple Health, and view progress charts.

## Tech Stack (exact versions)
- Expo SDK 52, React Native 0.76.9, TypeScript 5.8.3 (strict mode)
- Zustand 5.0.2 for state management (see persistence note below)
- NativeWind 4.1.23 / Tailwind 3.4.18 for styling
- Expo Router 4.0.0 (file-based navigation)
- RevenueCat (`react-native-purchases` 9.6.13) for subscriptions
- `react-native-health` 1.19.0 for Apple HealthKit
- `react-native-chart-kit` 6.12.0 for charts
- Sentry 6.10.0 for error tracking
- EAS for builds, TestFlight for distribution

## Architecture Map

```
app/index.tsx             Entry: hydration guard -> onboarding or home
app/_layout.tsx           Root: Sentry wrap, store hydration, RevenueCat init, HealthKit reinit
app/(tabs)/_layout.tsx    Tab navigator (5 tabs)
app/(tabs)/home.tsx       Timer display, start fast, stats summary
app/(tabs)/fast.tsx       Active fast: progress ring, pause/resume, end, tips
app/(tabs)/progress.tsx   Weight tracking, fasting stats, charts, achievements
app/(tabs)/learn.tsx      Content feed (recipes, articles, products)
app/(tabs)/settings.tsx   Preferences, premium card, help/support
app/onboarding/           3-step flow: welcome -> track-succeed -> choose-plan
app/paywall.tsx           RevenueCat subscription screen

store/fastStore.ts        Fasting state (MANUAL AsyncStorage persist via save/loadFromStorage)
store/weightStore.ts      Weight state (zustand persist middleware with AsyncStorage, version 2)

utils/fastingUtils.ts     formatTime, formatDate, calculateProgress, getPlanDuration, getFastingMessage
utils/appleHealth.ts      HealthKit init, read/write weight, sync
utils/content.ts          Static content data for Learn tab
utils/index.ts            Re-exports + errorHandler + storage keys

services/revenuecat.ts    RevenueCat wrapper (init, purchase, restore, status check)
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

## Anti-Patterns (MUST avoid)

- **NEVER** set RevenueCat log level to VERBOSE. It caused a memory leak / OOM crash (fixed in commit f2e7779). Log level must stay at WARN.
- **NEVER** modify the initialization order in `_layout.tsx`: store hydration -> RevenueCat init -> HealthKit reinit. Changing order causes race conditions.
- **NEVER** call `getPlanDuration(selectedPlan)` without the `customDuration` parameter when `selectedPlan` could be `'custom'`. This is a known bug source.
- **NEVER** add `console.log` to production paths without `__DEV__` guards. Many debug logs exist from prior sessions -- clean them up when touching those files.

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

**Completed:** SPEC-00, SPEC-01, SPEC-02, SPEC-03, SPEC-04.
**Next: SPEC-05**.

## Build Commands
```bash
npx expo start                              # Dev server
eas build --platform ios --profile preview  # TestFlight build
eas submit --platform ios                   # App Store submission
npx tsc --noEmit                            # Type check
npx expo-doctor                             # Health check
```
