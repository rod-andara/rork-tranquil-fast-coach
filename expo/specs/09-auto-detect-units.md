# SPEC-09: Auto-Detect Unit Preference + Unit Toggle on Progress Tab

**Status:** pending
**Priority:** P2 (nice to have)
**Estimated Effort:** medium (30-90 min)

## Problem
New users outside the US default to lbs despite using kg in daily life, causing friction when entering weight. There is also no quick way to switch units from the Progress tab.

## Root Cause
`weightStore.ts:48` hardcodes `unit: 'lbs' as const` for all users. No locale check is performed on first launch, and there is no unit toggle in the UI.

## Exact Fix

### Step 0: Install expo-localization

```bash
npx expo install expo-localization
```

`expo-localization` is not currently in `package.json`. This must be run before any code changes.

---

### File 1: `expo/store/weightStore.ts`

**Add `unitSetByUser` field to `WeightState` interface** (after `lastHealthSync: number | null;` on line 26):
```typescript
unitSetByUser: boolean;
```

**Add to `defaultState` object** (after `lastHealthSync: null as number | null,` on line 50):
```typescript
unitSetByUser: false as boolean,
```

**Add `setUnitDefault` action to the interface** (after `setUnit` on line 33):
```typescript
setUnitDefault: (unit: 'lbs' | 'kg') => void;
```

**Add `setUnitDefault` implementation** in the `create()` call, after `setUnit`:
```typescript
setUnitDefault: (newUnit) => {
  const { unitSetByUser } = get();
  if (!unitSetByUser) {
    get().setUnit(newUnit);
  }
},
```

**Mark unit as user-set inside existing `setUnit` action** — add `unitSetByUser: true` to the returned state object at the end of the `set((state) => { ... })` call in `setUnit`. This marks that the user has explicitly chosen a unit, preventing the locale default from overriding it later.

**Bump persist version from 2 to 3** (line ~298) and add migration:
```typescript
version: 3,
migrate: (persistedState: any, version) => {
  if (!persistedState) {
    return { ...defaultState };
  }

  const stateWithDefaults = {
    ...defaultState,
    ...persistedState,
  };

  if (version < 1) {
    stateWithDefaults.lastHealthSync = null;
  }

  if (version < 2) {
    stateWithDefaults.lastHealthSync = null;
  }

  if (version < 3) {
    // Existing users: treat current unit as not explicitly set by user.
    // Locale detection in _layout.tsx will run once and apply the region default.
    stateWithDefaults.unitSetByUser = false;
  }

  return stateWithDefaults;
},
```

---

### File 2: `expo/app/_layout.tsx`

**Add import** near the top (after existing expo imports):
```typescript
import * as Localization from 'expo-localization';
```

**Add `useWeightStore` import** if not already present (it may already be imported — check before adding).

**Add locale-based unit detection** inside the `loadData` async function (after `await fastStore.loadFromStorage()` and `await loadFromStorage()` calls, before the RevenueCat init block):

```typescript
// Auto-detect unit preference on first launch
const { setUnitDefault } = useWeightStore.getState();
const locales = Localization.getLocales();
const regionCode = locales[0]?.regionCode ?? '';
const imperialRegions = ['US', 'LR', 'MM'];
const detectedUnit = imperialRegions.includes(regionCode) ? 'lbs' : 'kg';
setUnitDefault(detectedUnit);
```

> **Important:** Call `useWeightStore.getState()` (not the hook) since this runs outside a React component render cycle. Do NOT change the initialization order — this block goes between the storage loads and RevenueCat init.

---

### File 3: `expo/app/(tabs)/progress.tsx`

**Add `setUnit` to the `useWeightStore` destructure** (line 27):
```typescript
const { getCurrentWeight, getWeightChange, getProgressPercentage, goal, unit, setUnit } = useWeightStore();
```

**Add a compact unit toggle** inside the weight section header row (lines 161-164), immediately after the `<Text>Weight</Text>` element and before the `<View className="flex-row gap-2">` buttons:

```tsx
{/* Unit Toggle */}
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
```

Place this between the `</Text>` closing tag for "Weight" and the `<View className="flex-row gap-2">` that holds the Set Goal / Add Weight buttons, so the header row reads: `Weight [lbs] [Set Goal] [Add Weight]`.

> The header row `<View className="flex-row justify-between items-center mb-3">` uses `justify-between`, so the left side should group the `Weight` text and the toggle together:

```tsx
<View className="flex-row items-center gap-2">
  <Text className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
    Weight
  </Text>
  {/* Unit Toggle */}
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
```

Replace the standalone `<Text className="text-xl font-bold ...">Weight</Text>` (line 162) with the above grouped `<View>`.

---

## Files to Read Before Starting
1. `expo/store/weightStore.ts` — full file (setUnit implementation, persist config, defaultState)
2. `expo/app/_layout.tsx` — lines 1-80 (imports, loadData function, init sequence)
3. `expo/app/(tabs)/progress.tsx` — lines 1-30 (imports/destructure) and lines 158-210 (weight section header)

## Files to Modify
- `expo/store/weightStore.ts` — add `unitSetByUser`, `setUnitDefault`, bump version to 3
- `expo/app/_layout.tsx` — add expo-localization import and locale detection in `loadData`
- `expo/app/(tabs)/progress.tsx` — add unit toggle to weight section header

## Verification Steps
1. Run `npx tsc --noEmit` — must pass with no new errors
2. **New user (first launch):**
   - Clear AsyncStorage (Settings → Developer or reinstall)
   - On a US-region device/simulator: unit should default to `lbs`
   - On a non-US region device (change in iOS Settings → General → Language & Region): unit should default to `kg`
3. **Existing user preference respected:**
   - Manually tap the toggle to switch units (e.g., from lbs to kg)
   - Kill and relaunch the app — unit stays on kg (locale default does NOT override)
4. **Unit toggle UI:**
   - Progress tab shows `lbs` or `kg` pill next to the "Weight" heading
   - Tapping it switches the display and existing entries convert correctly
   - Works in both light and dark mode
5. **No data corruption:**
   - Add a weight entry in lbs, toggle to kg — value converts (e.g. 150 lbs → 68.0 kg)
   - Toggle back to lbs — value converts back (e.g. 68.0 kg → 149.9 lbs)

## Rollback Plan
```bash
git checkout -- expo/store/weightStore.ts expo/app/_layout.tsx expo/app/(tabs)/progress.tsx
```
If `expo-localization` was installed, remove it manually from `package.json` and run `npm install`.

## Notes
- `Localization.getLocales()` returns an array; `[0]` is the user's primary locale. `regionCode` may be null on simulators without a region set — the `?? ''` fallback means non-US regions with no code default to `'kg'`, which is the safer default.
- `setUnitDefault` vs `setUnit`: `setUnitDefault` is a silent no-op when the user has previously tapped the toggle. `setUnit` (called by the toggle) always applies and marks `unitSetByUser = true`.
- The persist version bump to 3 triggers migration for all existing users. Since `unitSetByUser` defaults to `false` in migration, the locale detection will fire once for existing users on their next launch. This is intentional: existing users who never manually changed units get the locale-correct default applied.
- `setUnit` already handles converting all existing weight entries and the goal — no extra conversion logic needed.
