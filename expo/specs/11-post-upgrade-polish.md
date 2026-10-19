# SPEC-11: Post-Upgrade Polish Fixes

**Status:** pending
**Priority:** P1 (visible UX bugs in v1.0.0 build)
**Estimated Effort:** medium (45-60 min, all UI work)

## Problem

After SPEC-09 (unit toggle) and the SDK 54 upgrade, three visible issues remain in the Progress tab and app launch behavior:

1. **"Add Weight" button overflows the right edge** of the Progress tab header. The kg/lbs toggle pill added in SPEC-09 broke the row layout.
2. **Y-axis labels on the weight chart are truncated** — only the rightmost digit is visible (e.g., "1", "9", "3" instead of full numbers).
3. **App always launches in dark mode** regardless of system preference. On a fresh install with the device in light mode, the user still sees dark mode.

## Root Cause

### Issue 1: Header row overflow
`app/(tabs)/progress.tsx` lines 161–220 has a single `flex-row justify-between` row with 4 child elements:
- Left side: `Weight` title + `kg` toggle pill (in `flex-row gap-2`)
- Right side: `Set Goal` button + `Add Weight` button (in `flex-row gap-2`)

On standard iPhone widths (390pt), the combined intrinsic widths exceed the screen, so the right cluster overflows. There's no `flex-shrink` or `flex-wrap`.

### Issue 2: Chart Y-axis label clipping
`components/WeightChart.tsx` line 437: `width={screenWidth - 32}` — this assumes 16pt container padding on each side. But `react-native-chart-kit` renders Y-axis labels OUTSIDE the chart's data area, in the SVG's left margin. The chart's parent container has `bg-white dark:bg-neutral-800 rounded-lg` with its own internal padding, and the chart's SVG bleeds beyond the container's left edge — so the label area is clipped by `overflow: hidden` on the rounded card.

### Issue 3: Dark mode always on
`store/fastStore.ts` initializes `isDarkMode: true` (or whatever the saved value is from prior sessions). On first launch with no saved value, the default is `true` instead of reading the system preference via React Native's `Appearance` API.

## Exact Fix

### File 1: `app/(tabs)/progress.tsx`

Restructure the Weight section header into **two rows**: title + unit toggle on top, action buttons below.

Replace lines 159–220 (the entire `<View className="mb-4">` opening through the closing `</View>` of the header row) with:

```tsx
{/* Weight Tracking Section */}
<View className="mb-4">
  {/* Row 1: Title + Unit Toggle */}
  <View className="flex-row items-center gap-2 mb-3">
    <Text className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
      Weight
    </Text>
    <TouchableOpacity
      onPress={() => setUnit(unit === 'lbs' ? 'kg' : 'lbs')}
      className={`flex-row items-center px-3 py-1 rounded-full border ${
        isDarkMode
          ? 'border-neutral-600 bg-neutral-700'
          : 'border-neutral-300 bg-neutral-100'
      }`}
      accessibilityLabel={`Switch to ${unit === 'lbs' ? 'kg' : 'lbs'}`}
      accessibilityRole="button"
    >
      <Text className={`text-sm font-semibold ${isDarkMode ? 'text-neutral-200' : 'text-neutral-700'}`}>
        {unit}
      </Text>
    </TouchableOpacity>
  </View>

  {/* Row 2: Action Buttons */}
  <View className="flex-row gap-2 mb-3">
    {/* Set/Edit Goal Button */}
    <TouchableOpacity
      onPress={() => setShowGoalModal(true)}
      className={`flex-1 flex-row items-center justify-center gap-2 px-4 py-2 rounded-lg ${
        goal
          ? 'bg-brand-50 dark:bg-brand-900/30'
          : 'bg-primary-600'
      }`}
      style={{ minHeight: 44 }}
      activeOpacity={0.8}
      accessibilityLabel={goal ? 'Edit goal' : 'Set goal'}
      accessibilityRole="button"
    >
      <Target size={18} color={goal ? '#5b4ab5' : '#FFFFFF'} />
      <Text className={`text-sm font-semibold ${
        goal
          ? 'text-brand-700 dark:text-brand-200'
          : 'text-white'
      }`}>
        {goal ? 'Edit Goal' : 'Set Goal'}
      </Text>
    </TouchableOpacity>

    {/* Add Weight Button */}
    <TouchableOpacity
      onPress={() => setShowWeightModal(true)}
      className="flex-1 flex-row items-center justify-center gap-2 bg-primary-600 px-4 py-2 rounded-lg"
      style={{ minHeight: 44 }}
      activeOpacity={0.8}
      accessibilityLabel="Add weight"
      accessibilityRole="button"
    >
      <Plus size={18} color="#FFFFFF" />
      <Text className="text-white text-sm font-semibold">
        Add Weight
      </Text>
    </TouchableOpacity>
  </View>

  {/* Weight Stats Cards (existing code follows) */}
  {/* ... rest of section unchanged */}
```

**Key changes:**
- Title row separated from button row.
- Both action buttons get `flex-1` so they share the full width equally.
- Removed `minWidth: 44` since `flex-1` handles sizing.
- Removed `justify-between` since rows now have a single horizontal cluster each.

### File 2: `components/WeightChart.tsx`

Two changes to fix label clipping:

**Change 2a (line 437):** Reduce chart width to leave room for Y-axis labels:
```tsx
// Before
width={screenWidth - 32} // Container padding

// After
width={screenWidth - 48} // 16pt outer + 16pt card padding (each side)
```

**Change 2b (lines 466–470):** Remove `paddingRight: 16` and add equal horizontal padding to the chart's parent container in `progress.tsx` instead. Actually keep it simple — keep the style change minimal. Just adjust the chart's own style:

```tsx
style={{
  marginVertical: 8,
  borderRadius: 16,
  paddingRight: 8, // reduced from 16
  paddingLeft: 0,  // explicit, ensures Y-axis labels render
}}
```

If labels are still clipped after these changes, the secondary fix is to wrap the chart in `<View style={{ overflow: 'visible' }}>` and remove the parent card's `overflow: 'hidden'` (if any). Test 2a + 2b first.

### File 3: `store/fastStore.ts` + `app/_layout.tsx`

Mirror the SPEC-09 pattern for dark mode: add a `darkModeSetByUser` flag, default `isDarkMode` to false, and have `_layout.tsx` read system preference on first launch.

**In `store/fastStore.ts`:**

1. Add to the `FastState` interface:
```typescript
darkModeSetByUser: boolean;
setDarkModeDefault: (defaultDark: boolean) => void;
```

2. Add to the initial state:
```typescript
darkModeSetByUser: false,
isDarkMode: false, // change from true to false; system detection sets the real value
```

3. Add the action (alongside `toggleDarkMode`):
```typescript
setDarkModeDefault: (defaultDark: boolean) => {
  const state = get();
  if (state.darkModeSetByUser) return; // user already chose, don't override
  set({ isDarkMode: defaultDark });
  state.saveToStorage();
},
```

4. Modify the existing `toggleDarkMode` action to mark `darkModeSetByUser: true`:
```typescript
toggleDarkMode: () => {
  const state = get();
  const newValue = !state.isDarkMode;
  set({ isDarkMode: newValue, darkModeSetByUser: true });
  state.saveToStorage();
},
```

5. Add `darkModeSetByUser` and `isDarkMode` to the `toSave` object in `saveToStorage()`.

**In `app/_layout.tsx`:**

1. Import `Appearance` from `react-native`:
```typescript
import { Appearance } from 'react-native';
```

2. After `loadFromStorage()` resolves in `loadData` (before `setUnitDefault` from SPEC-09), call:
```typescript
const systemColorScheme = Appearance.getColorScheme();
useFastStore.getState().setDarkModeDefault(systemColorScheme === 'dark');
```

This runs once per launch. If the user has explicitly toggled dark mode in settings, `setDarkModeDefault` is a no-op. Otherwise, the app matches the system preference.

## Files to Read Before Starting

1. `app/(tabs)/progress.tsx` (lines 1–230)
2. `components/WeightChart.tsx` (lines 430–475)
3. `store/fastStore.ts` (full file — toggleDarkMode location, saveToStorage, FastState interface)
4. `app/_layout.tsx` (loadData function — where SPEC-09's setUnitDefault is called)

## Files to Modify

- `app/(tabs)/progress.tsx`
- `components/WeightChart.tsx`
- `store/fastStore.ts`
- `app/_layout.tsx`

## Verification Steps

1. `npx tsc --noEmit` → 0 errors
2. Run `npx expo run:ios` and verify in simulator:
   - Progress tab header: "Add Weight" button fully visible, doesn't overflow
   - Weight chart: Y-axis numbers show full digits (e.g., "85.0", "83.5"), no left-edge clipping
3. Dark mode test:
   - Set device to **Light** mode (Settings > Display & Brightness > Light) BEFORE launching
   - Delete the app from simulator (Cmd+Shift+H, long-press, delete)
   - Reinstall and launch — app should open in **light** mode
   - Toggle dark mode in app Settings → app goes dark
   - Switch device to dark mode → app stays dark (user override is sticky)
   - Switch device back to light mode → app stays dark (user override still sticky)
4. Bonus: With existing data, add a new weight entry and confirm the chart still renders.

## Rollback Plan
```bash
git checkout -- app/\(tabs\)/progress.tsx components/WeightChart.tsx store/fastStore.ts app/_layout.tsx
```

## Notes

- The two-row layout for Progress header trades vertical space for clarity. If you want to preserve the single-row look, an alternative is to remove the `kg` text from the toggle and just show the active unit name elsewhere — but two rows is the simpler fix.
- The dark mode pattern matches SPEC-09's unit detection exactly: a `setByUser` flag prevents system detection from overriding explicit user choice.
- After this spec ships, build #91 (or next number) becomes the App Store submission candidate.
