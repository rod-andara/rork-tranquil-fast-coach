# SPEC-01: Fix Custom Fast Duration Display

**Status:** pending
**Priority:** P0 (ship blocker)
**Estimated Effort:** low (<30 min)

## Problem
When a user selects a custom fasting duration (e.g., 9h 15m or 22h), the Fast screen and Home screen show progress and target end time based on a 16-hour default instead of the actual custom duration. Example: 9h 15m fast started at 11:59 AM shows "3:59 AM" (11:59 + 16h) instead of "9:14 PM" (11:59 + 9.25h).

## Root Cause
In `app/(tabs)/fast.tsx:19-20` and `app/(tabs)/home.tsx:19`, `getPlanDuration(selectedPlan)` is called without the `customDuration` parameter. When `selectedPlan === 'custom'`, `getPlanDuration` in `utils/fastingUtils.ts:61-63` logs a warning and defaults to 16 hours.

Meanwhile, `store/fastStore.ts:71-72` correctly calculates `plannedDuration` at fast start:
```typescript
const plannedDuration = isPlanString
  ? getPlanDuration(planOrDuration, state.customDuration)
  : planOrDuration;
```

So `currentFast.plannedDuration` already contains the correct value in milliseconds. The fix is to use it directly.

## Exact Fix

### File 1: `expo/app/(tabs)/fast.tsx`

**Line 19-20**, change:
```typescript
const progress = currentFast ? calc(elapsedMs, getPlanDuration(selectedPlan)) : 0;
const targetEndTime = currentFast ? currentFast.startTime + getPlanDuration(selectedPlan) : 0;
```
To:
```typescript
const progress = currentFast ? calc(elapsedMs, currentFast.plannedDuration) : 0;
const targetEndTime = currentFast ? currentFast.startTime + currentFast.plannedDuration : 0;
```

**Line 10**, remove `getPlanDuration` from the import (it's no longer used in this file):
```typescript
import { formatTime, formatDate, getFastingMessage } from '@/utils';
```

### File 2: `expo/app/(tabs)/home.tsx`

**Line 19**, change:
```typescript
const progress = currentFast ? calc(elapsedMs, getPlanDuration(selectedPlan)) : 0;
```
To:
```typescript
const progress = currentFast ? calc(elapsedMs, currentFast.plannedDuration) : 0;
```

**Line 11**, remove `getPlanDuration` from the import:
```typescript
import { formatTime } from '@/utils/fastingUtils';
```

## Files to Read Before Starting
1. `expo/store/fastStore.ts` (lines 62-84 -- confirm `plannedDuration` is set correctly)
2. `expo/utils/fastingUtils.ts` (lines 58-76 -- understand `getPlanDuration` behavior)
3. `expo/app/(tabs)/fast.tsx` (full file -- small, ~230 lines)
4. `expo/app/(tabs)/home.tsx` (full file -- small, ~200 lines)

## Files to Modify
- `expo/app/(tabs)/fast.tsx`
- `expo/app/(tabs)/home.tsx`

## Verification Steps
1. `npx tsc --noEmit` passes
2. Select "Custom" plan, set to 22 hours
3. Start a fast. Navigate to Fast screen.
4. Verify "Target End" shows start time + 22h (not start time + 16h)
5. Verify progress percentage is based on 22h duration
6. Switch to Home screen, verify progress ring matches
7. Test with a standard plan (16:8) to confirm no regression

## Rollback Plan
```bash
git checkout -- expo/app/(tabs)/fast.tsx expo/app/(tabs)/home.tsx
```

## Notes
- This is a 4-line change across 2 files. Do not overcomplicate it.
- Do not modify `fastingUtils.ts` or `fastStore.ts` -- they are correct.
- The `selectedPlan` variable is still used elsewhere in both files (display text, startFast call), so don't remove it from the destructured store.
