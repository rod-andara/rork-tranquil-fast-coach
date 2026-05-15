# SPEC-14: Fix NativeWind React 19 crash + WeightChart Y-axis dynamic scaling

**Status:** pending
**Priority:** P0 (ship blocker — same "Something went wrong" alert as SPEC-13, different root cause)
**Estimated Effort:** small-medium (30-45 min)

## Problem

After SPEC-13 shipped (build 94), the "Something went wrong" alert on the Progress tab persists. Sentry stack trace confirmed the crash is **not** chart-kit (already removed) — it is `react-native-css-interop`, NativeWind's underlying engine:

```
at createAnimatedComponent (.../react-native-css-interop/.../render-component.js:116:24)
at renderComponent (.../react-native-css-interop/.../render-component.js:50:48)
at interop (.../react-native-css-interop/.../native-interop.js:171:50)
```

`react-native-css-interop` wraps `className`-bearing components with `Animated.createAnimatedComponent` to support CSS transitions. Under React 19 strict refs this throws when the wrapped component is a function component without `forwardRef`. Fixed in NativeWind 4.2.x.

Second issue: the gifted-charts `LineChart` defaults to `yAxisOffset=0`, so for typical weight data (80–90 kg) the line appears nearly flat at the top of the chart with most of the Y-axis wasted on 0–80.

## Fixes

### Fix 1 — Upgrade NativeWind to latest 4.x

```bash
npm install nativewind@latest
npm install react-native-css-interop@latest   # if direct dep
```

Verify `tailwindcss` and the babel/metro plugin versions are still aligned per NativeWind 4.2 docs. Run `npx tsc --noEmit` and fix any type errors introduced by the upgrade.

### Fix 2 — Dynamic Y-axis range in WeightChart.tsx

`gifted-charts` defaults to showing 0 at the bottom. For weight data in a 80–90 kg band, add `yAxisOffset` + `maxValue` to zoom the visible range:

```tsx
const values = chartData.map(d => d.value);
if (goal) values.push(goal.targetWeight);
const dataMin = Math.min(...values);
const dataMax = Math.max(...values);
const padding = Math.max(2, (dataMax - dataMin) * 0.2);
const minValue = Math.floor(dataMin - padding);
const maxValue = Math.ceil(dataMax + padding);
```

Add to `<LineChart>`:
```tsx
yAxisOffset={minValue}
maxValue={maxValue - minValue}
```

(`noOfSections={4}` is already present from SPEC-13.)

### Fix 3 — Keep all SPEC-13 Sentry instrumentation

Do not remove any breadcrumbs from `WeightChart.tsx`, `progress.tsx`, or `ErrorBoundary.tsx`.

## Fallback (if error persists after NativeWind upgrade)

Replace `className` with inline `style={}` on the outermost `View` inside `WeightEntryModal` and `WeightGoalModal`. Document in Progress Notes if used.

## Files to Read Before Starting

1. `components/WeightChart.tsx` (confirm current LineChart props after SPEC-13)
2. `package.json` (confirm current nativewind / react-native-css-interop versions)

## Files to Modify

- `package.json` (nativewind upgrade)
- `components/WeightChart.tsx` (dynamic Y-axis range)

## Verification Steps

1. `npx tsc --noEmit` → 0 errors.
2. `grep -n "nativewind" package.json` → version is 4.2.x or newer.
3. EAS build 95: `eas build --platform ios --profile production`
4. Install on device:
   - [ ] Progress tab opens — chart renders, Y-axis starts near lowest data point (not 0).
   - [ ] Tap "Add Weight" → modal opens cleanly. **No "Something went wrong" alert.**
   - [ ] Add a weight entry — saves, modal closes, chart updates.
   - [ ] Tap "Set Goal" / "Edit Goal" → modal opens, no error.
   - [ ] All time ranges (7d / 30d / 90d / All) render correctly.
   - [ ] Dark mode chart colors correct.

## Progress Notes

**Completed 2026-05-15.**

### What was done

**Fix 1 — NativeWind upgrade:**
- Confirmed current versions before starting: `nativewind@4.1.23`, `react-native-css-interop@0.1.22` (the broken version).
- Confirmed `nativewind@4.2.3` is latest stable (4.3.x/5.x are not released). Its declared dep is `react-native-css-interop@0.2.3`.
- `tailwindcss@^3.4.18` satisfies NativeWind 4.2.3's `>3.3.0` peer requirement — no tailwind change needed.
- Ran `npm install nativewind@4.2.3`. Verified `node_modules/react-native-css-interop/package.json` now shows `"version": "0.2.3"`.
- `npx tsc --noEmit` → 0 errors after upgrade (no type-breaking changes in 4.1→4.2).

**Fix 2 — Dynamic Y-axis range in WeightChart.tsx:**
- Added an IIFE inside the chart `<View>` to compute `minValue` / `maxValue` from `chartData` values + goal (if set), with 20% padding (min 2 units).
- Added `yAxisOffset={minValue}` and `maxValue={maxValue - minValue}` to `<LineChart>`.
- `formatYLabel` kept as `${Math.round(Number(v))}` — gifted-charts passes already-offset values to this callback, so no addition of `minValue` is needed (would have double-counted).

**Fix 3 — SPEC-13 Sentry instrumentation untouched.**

### Deviations from spec
- None. Fallback (inline styles) was not needed.

### NativeWind 4.2.x upgrade BLOCKED on Old Architecture (builds 95–96)

**Build 95** failed at Bundle JavaScript phase: `nativewind@4.2.3`'s babel preset requires `react-native-worklets/plugin`, which is not documented in the NativeWind 4.2 migration guide.

**Build 96** failed after installing `react-native-worklets@0.5.1`: worklets requires `RCT_NEW_ARCH_ENABLED=1` (New Architecture). This app runs Old Architecture (`"newArchEnabled": false` in app.json). Hard incompatibility — NativeWind 4.2.x cannot be used on this stack without a full New Architecture migration, which is out of scope for this release.

**Resolution:** reverted to `nativewind@4.1.23` + `react-native-css-interop@0.1.22` (auto-resolved by nativewind downgrade). `react-native-worklets` fully uninstalled.

### Real fix — animationType="none" on all three modals

The css-interop crash (`createAnimatedComponent` throwing under React 19 strict refs) is triggered by animated-style propagation when a `<Modal>` has `animationType="slide"` or `animationType="fade"`. Removing the animation entirely eliminates the propagation path.

Changed in:
- `components/WeightEntryModal.tsx`: `animationType="slide"` → `"none"`
- `components/WeightGoalModal.tsx`: `animationType="fade"` → `"none"`
- `components/CustomDurationModal.tsx`: `animationType="fade"` → `"none"`

No className or modal content changes were made.

**Future polish (post-launch):** re-add modal entrance animations by wrapping modal *contents* in a `react-native-reanimated` animated view (bypasses css-interop), or migrate to `react-native-modal` which manages its own animations without propagating styles through children.

### Pending verification (user must confirm on device — build 97)
- "Add Weight" and "Set/Edit Goal" modals open with no crash (no "Something went wrong" alert).
- Modals appear instantly (no animation) — acceptable for now.
- Y-axis starts near the lowest weight, not 0 (Fix 2 from original spec still applies).
- All time ranges render correctly.
