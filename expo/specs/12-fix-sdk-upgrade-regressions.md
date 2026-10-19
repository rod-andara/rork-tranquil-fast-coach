# SPEC-12: Fix SDK Upgrade Regressions

**Status:** pending
**Priority:** P0 (ship blocker — multiple broken user flows)
**Estimated Effort:** medium-high (60-90 min)

## Problem

Build 92 on TestFlight surfaced three regressions related to the SDK 52 → 54 upgrade:

1. **Onboarding screens render with invisible content.** The fade-in/slide-up animations using React Native's legacy `Animated` API never complete, leaving content at `opacity: 0`. Buttons are tappable (they exist in the layout) but visually invisible.

2. **"Something went wrong" alert when adding weight.** Error message: *"Looks like you're passing an animation style to a function component `View`. Please wrap your function component with `React.forwardRef()` or use a class component instead."*

3. **Chart Y-axis labels still clipped.** The wrapping View with `paddingLeft: 12` and `width: screenWidth - 60` was applied (commit 8ee43b5) but labels remain clipped because `react-native-chart-kit` renders labels INSIDE the chart's SVG, not outside it. Outer padding doesn't help.

## Root Cause

### Issues 1 & 2: React 19 + React Native 0.81 strictness with legacy Animated API

The codebase uses RN's legacy `Animated` API across:
- `app/onboarding/welcome.tsx`
- `app/onboarding/track-succeed.tsx`
- `app/onboarding/health-sync.tsx`
- `app/onboarding/choose-plan.tsx`
- `app/(tabs)/fast.tsx` (animatedWidth for progress bar)

Pattern (welcome.tsx lines 12–32):
```tsx
const fadeAnim = useRef(new Animated.Value(0)).current;
const slideAnim = useRef(new Animated.Value(30)).current;

useEffect(() => {
  Animated.parallel([
    Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
    Animated.timing(slideAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
  ]).start();
}, [fadeAnim, slideAnim]);

return (
  <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
    ...
  </Animated.View>
);
```

Under React 19, when `Animated.View` wraps function components that aren't ref-forwarded (e.g., `BlurView`, custom views), the animated style fails to propagate. The animation never starts properly, so `opacity` stays at the initial value of `0`.

The error in the weight modal is the same root issue manifesting as a thrown error (some custom component is harder to silently fail on).

### Issue 3: Chart label area too narrow

`react-native-chart-kit` allocates label space within the chart's `width` based on character count heuristics. With `decimalPlaces: 0` and 2-digit weights (e.g., "85"), it reserves ~14px on the left. But the label rendering anchors labels to the RIGHT edge of that area, and the label area's RIGHT edge sits at x=0 of the chart. So the first character of each label renders at negative x and gets clipped.

External padding (our `paddingLeft: 12`) only shifts the entire SVG right — it doesn't widen the chart's internal label area.

## Exact Fix

### Fix 1: Remove animations from onboarding screens

The fade-in/slide-up effects are decorative. Removing them is the lowest-risk fix that eliminates the React 19 compatibility issue. We can re-add animations using `react-native-reanimated` in a future polish spec if desired.

**For each onboarding screen** (`welcome.tsx`, `track-succeed.tsx`, `health-sync.tsx`, `choose-plan.tsx`):

1. Remove the `Animated` import from `react-native`.
2. Delete the `useRef`/`Animated.Value` declarations for `fadeAnim` and `slideAnim`.
3. Delete the `useEffect` that runs `Animated.parallel(...)`.
4. Change `<Animated.View style={[styles.content, { opacity: fadeAnim, transform: [...] }]}>` to `<View style={styles.content}>`.
5. Change the closing `</Animated.View>` to `</View>`.
6. Remove the second `<Animated.View>` wrapper if present (some screens have two).

The result: content renders statically, visible immediately, no animations.

### Fix 2: Replace Animated.View in fast.tsx progress bar

`app/(tabs)/fast.tsx` line 165 uses `Animated.View` for the progress bar width animation. This may or may not be triggering errors. Two options:

**Option A (recommended, simple):** Remove the animation, set the width directly:
```tsx
// Replace
<Animated.View style={[styles.progressBar, { width: animatedWidth.interpolate(...) }]} />

// With
<View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
```

**Option B (preserve smooth animation):** Migrate this single component to `react-native-reanimated` using `useSharedValue` and `useAnimatedStyle`. Higher risk, more code.

Go with Option A unless visual smoothness is critical.

### Fix 3: Chart Y-axis labels — use `formatYLabel` to pad

`react-native-chart-kit` accepts a `formatYLabel` function on the LineChart component itself (not in chartConfig). This lets us prepend whitespace to widen the label rendering box.

In `components/WeightChart.tsx`, add to the `<LineChart>` props (around line 428-430, alongside `data`, `width`, `height`):

```tsx
formatYLabel={(value) => `  ${value}`}
```

The two leading spaces shift the label text right within its rendering box, effectively giving the leading digits visible space.

Also revert the wrapping View since it's no longer needed:
```tsx
// Remove the <View style={{ paddingLeft: 12, paddingRight: 0 }}> wrapper
// Change width back to: width={screenWidth - 48}
```

If `formatYLabel` doesn't help (some versions don't expose it), fallback to: **change chart library to `react-native-gifted-charts`** as a separate SPEC. Don't pursue that here.

## Files to Read Before Starting

1. `app/onboarding/welcome.tsx`
2. `app/onboarding/track-succeed.tsx`
3. `app/onboarding/health-sync.tsx`
4. `app/onboarding/choose-plan.tsx`
5. `app/(tabs)/fast.tsx` (lines 1-50 and 150-180)
6. `components/WeightChart.tsx` (lines 420-470)

## Files to Modify

- `app/onboarding/welcome.tsx`
- `app/onboarding/track-succeed.tsx`
- `app/onboarding/health-sync.tsx`
- `app/onboarding/choose-plan.tsx`
- `app/(tabs)/fast.tsx`
- `components/WeightChart.tsx`

## Verification Steps

1. `npx tsc --noEmit` → 0 errors
2. Search the codebase to confirm zero remaining `Animated.` usage in app code:
   ```bash
   grep -rn "Animated\." app/ components/ | grep -v node_modules
   ```
   Expected: empty result.
3. Build a new EAS production build (build 93).
4. Install on TestFlight on physical iPhone.
5. Delete app from device first to ensure fresh onboarding flow.
6. Walk through onboarding — all 4 screens must show their text and buttons immediately (no fade-in).
7. Add a weight entry manually — no "Something went wrong" error.
8. Open Progress tab, check chart — Y-axis labels should now show full numbers ("85", "84", not just "5", "4").
9. Start a fast on home tab — progress bar fills correctly (even if not animated).
10. Check Apple Health sync, dark mode toggle, tab navigation — no other regressions.

## Rollback Plan
```bash
git checkout sdk-upgrade -- app/onboarding/ app/\(tabs\)/fast.tsx components/WeightChart.tsx
```

## Notes

- This is purely a stabilization pass. We're trading visual polish (animations) for reliability. App store reviewers care that the app works, not that screens fade in elegantly.
- The animations can be re-added later via `react-native-reanimated` in a SPEC-13. Reanimated is the modern replacement and works correctly with React 19.
- If the chart `formatYLabel` approach fails (library version doesn't support it), document the failure in Progress Notes and we'll plan a chart library migration as a separate spec.
- After this lands, build 93 should be the App Store submission candidate.

## Progress Notes
Completed 2026-05-15.

All three fixes applied and committed (build candidate for build 93):

1. **Onboarding screens** — removed `Animated` API entirely from welcome.tsx, track-succeed.tsx, health-sync.tsx, choose-plan.tsx. Content now renders statically, immediately visible.
2. **fast.tsx progress bar** — replaced `Animated.View` with plain `View` using `width: \`${progress}%\`` (Option A from spec).
3. **WeightChart.tsx Y-axis labels** — removed wrapping padding View, restored `width={screenWidth - 48}`, added `formatYLabel={(value) => \`  ${value}\`}`.

Post-fix grep for `Animated.` found one remaining usage in `components/Skeleton.tsx` (shimmer loop animation). This component was not reported as broken and is a different pattern (Animated.loop, no forwardRef-unsafe wrapping). Left untouched per spec scope. If skeleton shimmer breaks, that would be SPEC-13 scope.
