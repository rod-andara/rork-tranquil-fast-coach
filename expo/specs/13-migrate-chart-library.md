# SPEC-13: Migrate WeightChart to `react-native-gifted-charts`

**Status:** pending
**Priority:** P0 (ship blocker — same bug surface as SPEC-12 regressions)
**Estimated Effort:** medium (60-90 min — one component, but careful prop mapping)

## Problem

After SPEC-12 shipped (build 93), two regressions persist on TestFlight:

1. **"Something went wrong" alert when tapping "Add Weight"** on the Progress tab.
   - Error message: *"Looks like you're passing an animation style to a function component `View`. Please wrap your function component with `React.forwardRef()` or use a class component instead."*
   - Caught by `components/ErrorBoundary.tsx` → rendered by RN Alert/error UI.
2. **Y-axis labels on the weight chart still clipped** — shows "5", "3" instead of "85", "83". The `formatYLabel={(value) => `  ${value}`}` shim added in SPEC-12 had no effect.

Both bugs share a single root cause: **`react-native-chart-kit@6.12.0` is incompatible with React 19 + React Native 0.81.**

## Root Cause

`node_modules/react-native-chart-kit/dist/line-chart/LineChart.js`:

```js
line 33:  import { Animated, ScrollView, StyleSheet, TextInput, View } from "react-native";
line 37:  var AnimatedCircle = Animated.createAnimatedComponent(Circle);  // Circle is from react-native-svg
line 44:  scrollableDotHorizontalOffset: new Animated.Value(0)            // unconditional in state
line 210: <Animated.View key={Math.random()} style={[...                 // rendered every chart pass
```

- `Circle` from `react-native-svg` is a function component that is **not** wrapped with `React.forwardRef`. Wrapping it with `Animated.createAnimatedComponent` was tolerated under React 18; React 19 throws.
- The `Animated.View` at line 210 is rendered on every chart update. When the user taps "Add Weight", `WeightEntryModal` mounts → state in `weightStore`/`fastStore` changes → Progress tab re-renders → chart re-renders → throw → ErrorBoundary catches → "Something went wrong" alert.
- The Y-axis clipping is a separate, long-standing chart-kit issue: labels are rendered inside the SVG at a fixed left offset based on character-count heuristics, with no real way to widen the label gutter from outside. We've tried 5 variations across SPEC-02, SPEC-11, and SPEC-12 — none stick.

`react-native-chart-kit` was last published in 2023, has 120+ open issues, and is effectively unmaintained. Continuing to patch around it is not viable.

## Decision

**Migrate `components/WeightChart.tsx` to `react-native-gifted-charts`.**

Rationale:
- Actively maintained (releases within the last 30 days as of 2026-05).
- Compatible with React 19 / RN 0.81 / Expo SDK 54.
- Renders Y-axis labels in a dedicated, configurable-width column (`yAxisLabelWidth`) — clipping isn't a class of bug that can happen.
- Built on `react-native-svg` (which we already depend on) and `react-native-linear-gradient` (already installed via `expo-linear-gradient` — gifted-charts also supports plain SVG-only mode).
- No `Animated.createAnimatedComponent(<svg function component>)` antipattern internally.

Reject alternatives:
- `victory-native` — heavyweight, requires `react-native-skia`, and has a separate migration to v40+.
- Stay on chart-kit and patch — already tried 5x, dead end.
- Write our own SVG line chart — overkill for 1 chart in 1 tab.

## Exact Fix

### Phase 1: Install gifted-charts (5 min)

```bash
npx expo install react-native-gifted-charts
```

Confirm version pinned in `package.json` is `^1.4.x` or newer. No native rebuild required (pure JS over react-native-svg).

### Phase 2: Rewrite `components/WeightChart.tsx` (45-60 min)

The component has 566 lines but only the `<LineChart>` render block (lines 426-517) and its `chartData` shape need substantive change. Keep:

- All filtering / sampling logic (`filteredEntries`, `displayData`, `statistics`)
- Time range selector UI
- Empty states (no entries, no data in range)
- Stats card row (Current / Starting / Change / Average / Min / Max)
- Footer text (`{count} entries • Weight in {unit}`)

#### Imports

Replace:
```tsx
import { LineChart } from 'react-native-chart-kit';
import { Line, Text as SvgText } from 'react-native-svg';
```

With:
```tsx
import { LineChart } from 'react-native-gifted-charts';
```

(We no longer need raw `Line` / `SvgText` — gifted-charts has built-in `referenceLine` support for the goal indicator.)

#### Data shape

Gifted-charts takes an array of `{ value, label, dataPointText? }` objects rather than chart-kit's parallel `labels` / `datasets[0].data` arrays.

Replace the `chartData` `useMemo` (lines 106-151) with:

```tsx
const chartData = useMemo(() => {
  if (displayData.length === 0) return null;

  const monthsShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return displayData.map((entry, idx) => {
    const date = new Date(entry.date);
    const prevDate = idx > 0 ? new Date(displayData[idx - 1].date) : null;
    const monthChanged = !prevDate || prevDate.getMonth() !== date.getMonth();

    let label: string;
    switch (selectedRange) {
      case '7d':
        label = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][date.getDay()];
        break;
      case '30d':
        label = monthChanged
          ? `${monthsShort[date.getMonth()]} ${date.getDate()}`
          : `${date.getDate()}`;
        break;
      case '90d':
        label = `${date.getMonth() + 1}/${date.getDate()}`;
        break;
      case 'all': {
        const monthsCompact = ['J','F','M','A','M','J','J','A','S','O','N','D'];
        label = `${monthsCompact[date.getMonth()]}'${String(date.getFullYear()).slice(-2)}`;
        break;
      }
      default:
        label = `${date.getMonth() + 1}/${date.getDate()}`;
    }

    return {
      value: entry.weight,
      label,
    };
  });
}, [displayData, selectedRange]);
```

Note: `chartData` is now `Array<{value,label}> | null`, not the chart-kit object.

#### Chart render

Replace lines 426-517 (the entire `<LineChart>` block) with:

```tsx
{/* Chart */}
<View style={{ paddingVertical: 8, paddingHorizontal: 4 }}>
  <LineChart
    data={chartData}
    width={screenWidth - 80}        // leave room for yAxisLabelWidth + container padding
    height={220}
    spacing={(screenWidth - 80 - 40) / Math.max(chartData.length - 1, 1)}
    initialSpacing={10}
    endSpacing={10}

    // Y-axis — the whole point of this migration
    yAxisLabelWidth={44}            // dedicated gutter, no clipping
    yAxisTextStyle={{
      fontSize: 10,
      color: isDarkMode ? '#9CA3AF' : '#6B7280',
    }}
    yAxisColor="transparent"
    noOfSections={4}
    formatYLabel={(v) => `${Math.round(Number(v))}`}

    // X-axis
    xAxisColor={isDarkMode ? '#374151' : '#E5E7EB'}
    xAxisLabelTextStyle={{
      fontSize: 10,
      color: isDarkMode ? '#9CA3AF' : '#6B7280',
    }}

    // Line + dots
    color={isDarkMode ? '#A78BFA' : '#7C3AED'}
    thickness={3}
    curved                            // equivalent to chart-kit's `bezier`
    dataPointsColor={isDarkMode ? '#A78BFA' : '#7C3AED'}
    dataPointsRadius={5}

    // Area fill under the line (matches old visual)
    areaChart
    startFillColor={isDarkMode ? '#A78BFA' : '#7C3AED'}
    endFillColor={isDarkMode ? '#A78BFA' : '#7C3AED'}
    startOpacity={0.25}
    endOpacity={0.05}

    // Grid
    rulesType="solid"
    rulesColor={isDarkMode ? '#374151' : '#E5E7EB'}
    showVerticalLines={false}

    // Goal line (replaces chart-kit's `decorator` prop)
    {...(goal ? {
      showReferenceLine1: true,
      referenceLine1Position: goal.targetWeight,
      referenceLine1Config: {
        color: isDarkMode ? '#10B981' : '#059669',
        dashWidth: 6,
        dashGap: 4,
        thickness: 1.5,
        labelText: 'Goal',
        labelTextStyle: {
          color: isDarkMode ? '#10B981' : '#059669',
          fontSize: 10,
          fontWeight: '600',
        },
      },
    } : {})}

    isAnimated={false}                // explicit — avoid any internal animation surface
  />
</View>
```

**Key points:**
- `yAxisLabelWidth={44}` is the dedicated label gutter. 44pt comfortably fits 3-digit weights ("285") plus padding. No more clipping. This is the fix for issue 2.
- `isAnimated={false}` is defensive — gifted-charts uses `react-native-reanimated` under the hood for animations. Reanimated 3.x is React 19 compatible, but disabling animations removes any risk of a repeat of the chart-kit failure mode. We can flip it on later if we want a polish pass.
- The `decorator` prop (raw SVG `<Line>` / `<SvgText>` for the goal line) is replaced by `referenceLine1Config`. Same visual result.
- Sampling/aggregation logic in `displayData` is unchanged, so the same number of points renders.

### Phase 3: Remove dead dependency (5 min)

After confirming the new chart renders correctly in simulator:

```bash
npm uninstall react-native-chart-kit
```

`react-native-svg` stays — it's a transitive dep of gifted-charts and we use it elsewhere (`app/onboarding/choose-plan.tsx` uses raw `Svg`, `Circle`, `Path`).

### Phase 4: Sentry breadcrumb instrumentation (15 min)

Belt-and-suspenders. If anything else breaks post-migration, we want a stack trace in Sentry rather than relying on screenshots.

#### 4a. ErrorBoundary → report to Sentry

Edit `components/ErrorBoundary.tsx` `componentDidCatch`:

```tsx
import * as Sentry from '@sentry/react-native';

componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  Sentry.captureException(error, {
    contexts: {
      react: { componentStack: errorInfo.componentStack },
    },
    tags: { source: 'ErrorBoundary' },
  });
  errorHandler(error, 'Something went wrong');
}
```

This is the single most valuable change in the spec — every "Something went wrong" alert from now on will land in Sentry with the full React component stack pointing at the offending render.

#### 4b. Breadcrumb on Add Weight tap

Edit `app/(tabs)/progress.tsx`. Find the "Add Weight" `TouchableOpacity onPress` handler (the one that calls `setShowWeightModal(true)`). Wrap:

```tsx
import * as Sentry from '@sentry/react-native';

onPress={() => {
  Sentry.addBreadcrumb({
    category: 'ui.action',
    message: 'Tapped Add Weight',
    level: 'info',
  });
  setShowWeightModal(true);
}}
```

Do the same for the "Set Goal" / "Edit Goal" button (`setShowGoalModal(true)`):

```tsx
onPress={() => {
  Sentry.addBreadcrumb({
    category: 'ui.action',
    message: goal ? 'Tapped Edit Goal' : 'Tapped Set Goal',
    level: 'info',
  });
  setShowGoalModal(true);
}}
```

#### 4c. Breadcrumb on chart render

Edit `components/WeightChart.tsx`. At the top of the main render path (after the empty-state guards, just before `return (<View>...`), add:

```tsx
useEffect(() => {
  Sentry.addBreadcrumb({
    category: 'chart',
    message: 'WeightChart rendered',
    level: 'info',
    data: {
      range: selectedRange,
      points: displayData.length,
      hasGoal: !!goal,
    },
  });
}, [selectedRange, displayData.length, goal]);
```

Add `import * as Sentry from '@sentry/react-native';` at the top.

This gives us, in any future error report, the breadcrumb trail: "tapped Add Weight" → "WeightChart rendered (30d, 4 points, hasGoal=true)" → exception. Bugs become 10x easier to triage without screenshots.

## Files to Read Before Starting

1. `components/WeightChart.tsx` (full file — 566 lines)
2. `components/ErrorBoundary.tsx`
3. `app/(tabs)/progress.tsx` (lines 1-50 for imports, find the two `onPress` handlers for the action buttons)
4. `package.json` (confirm `@sentry/react-native` and `expo-linear-gradient` are present)
5. Gifted-charts docs for LineChart: https://gifted-charts.web.app/linechart

## Files to Modify

- `components/WeightChart.tsx` (full rewrite of render block + chartData shape)
- `components/ErrorBoundary.tsx` (add Sentry.captureException)
- `app/(tabs)/progress.tsx` (add Sentry breadcrumbs to button handlers)
- `package.json` (add `react-native-gifted-charts`, remove `react-native-chart-kit`)
- `package-lock.json` (auto-updated)

## Verification Steps

1. `npx tsc --noEmit` → 0 errors.
2. `grep -rn "react-native-chart-kit" .` (excluding node_modules) → empty result. Confirms full removal.
3. Build a new EAS production build (build 94):
   ```bash
   eas build --platform ios --profile production
   ```
4. Install on TestFlight on physical iPhone. Delete the prior build first.
5. **Critical regression checks:**
   - [ ] Open Progress tab — chart renders.
   - [ ] Y-axis labels show **full numbers** ("85", "84", "83" — not "5", "4", "3").
   - [ ] Tap "Add Weight" — modal opens cleanly. **No "Something went wrong" alert.**
   - [ ] Add a weight entry — saves, modal closes, chart updates.
   - [ ] Tap "Set Goal" → "Edit Goal" — modal opens, no error.
   - [ ] Set a goal — green dashed reference line appears at the goal weight with "Goal" label.
   - [ ] Switch time ranges (7d / 30d / 90d / All) — chart re-renders correctly each time.
   - [ ] Dark mode toggle — chart colors update.
6. **Sentry verification:**
   - Force a render error (temporarily throw in WeightChart) to confirm ErrorBoundary now reports to Sentry. Revert.
   - Confirm breadcrumbs appear in the Sentry event under "Breadcrumbs" — should see "Tapped Add Weight", "WeightChart rendered".

## Rollback Plan

```bash
git checkout HEAD~1 -- components/WeightChart.tsx components/ErrorBoundary.tsx app/\(tabs\)/progress.tsx package.json package-lock.json
npm install
```

If the migration produces a worse visual, we can also keep gifted-charts installed but cherry-pick only the Sentry instrumentation changes — those are independently valuable.

## Notes

- This is the **third** library swap in this codebase's history (calendar → custom, video player → expo-av, now charts). Each one shipped because the prior dep stopped getting updates. Lesson logged in `memory/feedback_chart_library.md`: when picking RN libraries, weight maintenance recency over feature set.
- After build 94 ships clean, the app is App Store-ready. Remaining work is privacy policy + screenshots + actual submission.
- `react-native-chart-kit` removal also drops ~80KB from the bundle.
- If gifted-charts' `referenceLine1` rendering looks off for the goal line (e.g., wrong z-index, label position), the fallback is to render the goal line via the `pointerConfig` overlay or a sibling absolutely-positioned View. Try `referenceLine1` first.

## Progress Notes

**Completed 2026-05-15.**

### What was done
- Phase 1: Installed `react-native-gifted-charts@^1.4.76` via `npx expo install`.
- Phase 2: Rewrote `components/WeightChart.tsx`:
  - Replaced `import { LineChart } from 'react-native-chart-kit'` and the `react-native-svg` raw imports with `import { LineChart } from 'react-native-gifted-charts'`.
  - Converted `chartData` useMemo from chart-kit's `{ labels, datasets, legend }` shape to gifted-charts' `Array<{ value, label }>` shape. All filtering/sampling/statistics logic (filteredEntries, displayData, statistics) is unchanged.
  - Replaced the full `<LineChart>` render block with the gifted-charts version: `yAxisLabelWidth={44}` (Y-axis clipping fix), `isAnimated={false}` (defensive), `referenceLine1Config` for the goal line (replaces the raw SVG `<Line>`/`<SvgText>` decorator).
  - Added `useEffect` Sentry breadcrumb firing on `[selectedRange, displayData.length, goal]` changes.
- Phase 3 (deviation): The spec called for `npm uninstall react-native-chart-kit` after WeightChart was migrated. However, `app/(tabs)/progress.tsx` also imported `BarChart` from chart-kit for the "This Week" fasting-hours chart. Rather than migrate that chart to gifted-charts (extra scope) or skip the uninstall, the BarChart was replaced with the native-View bar pattern already present as the web fallback (lines 410–426 of the original file). The trivial 7-bar chart didn't justify a second chart-lib dependency. `react-native-chart-kit` was then fully uninstalled. Grep confirms zero remaining references.
- Phase 4: Added Sentry instrumentation to all three targets:
  - `ErrorBoundary.tsx`: `componentDidCatch` now calls `Sentry.captureException` with the full React component stack before `errorHandler`.
  - `progress.tsx`: "Add Weight" and "Set Goal"/"Edit Goal" `onPress` handlers each add a `Sentry.addBreadcrumb` call before the modal-open state setter.
  - `WeightChart.tsx`: `useEffect` breadcrumb on chart render (see Phase 2 above).
- `Platform` import removed from `progress.tsx` (no longer needed after BarChart removal).
- `npx tsc --noEmit` → 0 errors.

### Deviations from spec
- **BarChart replacement**: Spec assumed `progress.tsx` only needed Sentry breadcrumbs. It also had a chart-kit `BarChart` import that would have broken on uninstall. Resolved by promoting the existing web-fallback native View pattern to all platforms — confirmed with user before implementing. Post-review: the chart-kit BarChart had a Y-axis hour scale that the raw View bars lacked. Added per-bar `{v.toFixed(1)}h` labels above each bar (guarded by `v > 0` to suppress empty days) to restore data readability. Sub-hour precision ("16.5h") retained rather than rounding to integer.

### Pending verification (user must confirm on device)
- Y-axis labels show full numbers (not clipped)
- "Add Weight" tap opens modal with no "Something went wrong" error
- Goal reference line renders at correct position with "Goal" label
- Time range switching works for all 4 ranges
- Dark mode chart colors correct
- Sentry breadcrumbs appear in event trail
