# SPEC-02: Fix Chart X-Axis Label Truncation

**Status:** pending
**Priority:** P0 (ship blocker)
**Estimated Effort:** medium (30-90 min)

## Problem
X-axis labels on the weight chart show truncated or garbled text (e.g., "nu" instead of "Thu", "n 8" instead of "Jan 8"), especially on the 90d and "all" time ranges.

## Root Cause
`react-native-chart-kit` v6.12.0 renders labels as SVG text elements with fixed horizontal spacing. The chart width is `screenWidth - 32` (~360px on iPhone), and after reserving space for Y-axis labels, each of 6 X-axis labels gets ~50px. Labels like "Jan 26" or "Jan 8" are too wide for this space, and the library silently truncates them.

The `formatLabel` function at `components/WeightChart.tsx:106-130` generates correct strings, but the rendered output is clipped.

## Exact Fix

### File: `expo/components/WeightChart.tsx`

**Step 1: Shorten label formats** (lines 106-130)

Change the `formatLabel` function to use shorter formats:

```typescript
const formatLabel = (date: Date): string => {
  const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  switch (selectedRange) {
    case '7d':
      // Day names are short enough (Mon, Tue)
      return days[date.getDay()];

    case '30d':
      // Just the date number
      return `${date.getDate()}`;

    case '90d':
      // Compact: M/D format (1/5, 2/14)
      return `${date.getMonth() + 1}/${date.getDate()}`;

    case 'all':
      // Compact: M'YY format (J'25, F'26)
      return `${months[date.getMonth()]}'${String(date.getFullYear()).slice(-2)}`;

    default:
      return `${date.getMonth() + 1}/${date.getDate()}`;
  }
};
```

**Step 2: Reduce target sample points for longer ranges** (lines 42-71)

In the `displayData` memo, change `targetPoints` from 6 to 5:

```typescript
const targetPoints = 5;
```

**Step 3: Reduce label font size** (line 476)

Change:
```typescript
propsForLabels: {
  fontSize: 11,
  fontWeight: '400',
},
```
To:
```typescript
propsForLabels: {
  fontSize: 10,
  fontWeight: '400',
},
```

**Step 4: Add right padding to prevent rightmost label clipping** (lines 481-485)

Change:
```typescript
style={{
  marginVertical: 8,
  borderRadius: 16,
  paddingRight: 0,
}}
```
To:
```typescript
style={{
  marginVertical: 8,
  borderRadius: 16,
  paddingRight: 16,
}}
```

## Files to Read Before Starting
1. `expo/components/WeightChart.tsx` (full file)

## Files to Modify
- `expo/components/WeightChart.tsx`

## Verification Steps
1. `npx tsc --noEmit` passes
2. Add 10+ weight entries spanning 90+ days (or use existing data)
3. Test "7d" range: labels should show day names (Mon, Tue, etc.)
4. Test "30d" range: labels should show date numbers (3, 15, 27)
5. Test "90d" range: labels should show compact dates (1/5, 3/14)
6. Test "all" range: labels should show month-year (J'25, M'26)
7. No label should be truncated or garbled on any range
8. Test both light and dark modes

## Rollback Plan
```bash
git checkout -- expo/components/WeightChart.tsx
```

## Alternative Approach (if labels still truncate)
If the above changes don't fully resolve truncation, consider:
1. Reduce `targetPoints` further to 4
2. Use single-character day names for 7d ("M", "T", "W")
3. Replace `react-native-chart-kit` with `victory-native` or `react-native-gifted-charts` which support rotated labels and custom label rendering. This is a larger change and should be a separate spec.

## Notes
- The `displayData` memo samples points for the chart; `filteredEntries` is used for statistics. Don't confuse them.
- Test with exactly 1 entry (edge case -- should still render without crash).
- The `months` array in the new code uses single-letter abbreviations only for the "all" range.
