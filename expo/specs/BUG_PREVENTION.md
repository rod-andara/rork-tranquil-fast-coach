# Bug Prevention Strategy

## Pre-Flight Checks (before every code change)

1. **Type check baseline**: `npx tsc --noEmit` must pass with 0 errors
2. **Read the spec**: Only touch files listed in "Files to Modify"
3. **Understand the data flow**: trace store -> hook -> component before changing anything

## Post-Change Checks (after every code change)

1. **Type check**: `npx tsc --noEmit` still passes
2. **Visual check**: Test in iOS Simulator, both light and dark mode
3. **Persistence check** (if store was modified): start app -> make change -> kill app -> restart -> verify state preserved
4. **Regression check**: Run through CLAUDE.md testing checklist for the affected area

## Fragile Areas (handle with extra care)

### 1. fastStore.ts — Manual Persistence
- Uses custom `saveToStorage()`/`loadFromStorage()`, NOT zustand persist
- Any new field must be added to BOTH methods AND the interface AND the default values
- Has a migration at lines 191-205 that auto-converts broken custom plans
- The `saveToStorage` serializes a specific field list (lines 222-231) -- if you add a field and forget to add it here, it won't persist

### 2. WeightChart.tsx — react-native-chart-kit Quirks
- `withDots: false` on per-dataset is IGNORED (library limitation)
- Labels truncate when too wide -- always test all 4 time ranges
- Chart width is `screenWidth - 32` which leaves limited label space
- The `displayData` memo samples to ~6 points; statistics use full `filteredEntries`

### 3. _layout.tsx — Initialization Order
The order is: store hydration -> RevenueCat init -> HealthKit reinit.
- Store must hydrate first so `isHealthConnected` and `isPremium` are available
- RevenueCat must init before checking subscription status
- HealthKit reinit is conditional on `isHealthConnected` from weightStore
- **Never change this order.** It will cause race conditions where premium status or health connection appears false on first render.

### 4. Onboarding Flow — Navigation Chain
`welcome -> track-succeed -> choose-plan` is a push chain.
- Each screen's "Continue" button pushes the next screen
- `welcome.tsx` also has a "Skip" that does `router.replace('/(tabs)/home')`
- Adding a new screen (like health-sync) means updating navigation targets AND progress dot counts on ALL screens

### 5. Apple Health — Unit Conversions
- HealthKit uses grams for metric weight (not kg!)
- The `saveWeightToHealth` function converts: kg * 1000 -> grams
- Conversion factors: LBS_TO_KG = 0.453592, KG_TO_LBS = 2.20462
- Always test with both lbs and kg selected

## Preventing Fix-One-Break-Another Loops

### Root Cause of Loops
Most loops happen because:
1. A change to shared state (fastStore) has side effects in multiple screens
2. A style change in dark mode breaks light mode or vice versa
3. A chart library workaround has unexpected interactions with other chart props

### Prevention Rules
- **Make the smallest possible change.** If the spec says change 2 lines, change exactly 2 lines.
- **Don't refactor while fixing.** Resist the urge to "clean up" nearby code.
- **Test immediately after each file change**, not after changing all files.
- **If a fix requires more than 10 lines of new code**, re-read the spec -- you may be overcomplicating it.

### Decision: When to Try a Different Approach
Switch approaches when:
- The current approach introduces a new dependency
- The current approach requires modifying more than 3 files (for a bug fix)
- The current approach fails TypeScript checks and the fix isn't obvious
- You've spent 3 attempts on the same approach

### Decision: When to Escalate
Escalate to the user (add Progress Notes and stop) when:
- A library limitation fundamentally blocks the fix
- The fix requires native code changes (Xcode project, Info.plist beyond app.json)
- The fix requires backend changes (Supabase, RevenueCat dashboard)
- You're unsure whether the fix changes user-visible behavior intentionally
