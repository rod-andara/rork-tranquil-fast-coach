# SPEC-03: Fix Goal Line Visibility on Weight Chart

**Status:** pending
**Priority:** P1 (should fix)
**Estimated Effort:** medium (30-90 min)

## Problem
When a weight goal is set, the goal line should appear as a distinct horizontal line on the weight chart. Currently it either doesn't render visibly or blends with the weight data line because dots appear on it.

## Root Cause
In `components/WeightChart.tsx:161-168`, the goal line dataset includes `withDots: false`. However, `react-native-chart-kit`'s `LineChart` does NOT support `withDots` as a per-dataset property -- it's a chart-level prop only. The `withDots: false` is silently ignored, and dots render on the goal line just like the weight line. This makes the goal line visually confusing and sometimes hidden behind the weight line.

## Exact Fix

### Approach: Use chart `decorator` prop for the goal line

Instead of adding the goal as a second dataset (which the library handles poorly), render the goal line as a custom SVG overlay using the `decorator` prop.

### File: `expo/components/WeightChart.tsx`

**Step 1: Add SVG import** (top of file)

Add after the existing imports:
```typescript
import { Line, Text as SvgText } from 'react-native-svg';
```

Note: `react-native-svg` is already a dependency of `react-native-chart-kit`, so no new install is needed.

**Step 2: Remove goal line from datasets** (lines 147-172)

In the `chartData` useMemo, remove the goal line dataset. Change:
```typescript
return {
  labels,
  datasets: [
    {
      data,
      color: (opacity = 1) => (isDarkMode ? `rgba(167, 139, 250, ${opacity})` : `rgba(124, 58, 237, ${opacity})`),
      strokeWidth: 3,
    },
    ...(goalLine
      ? [
          {
            data: goalLine,
            color: (opacity = 1) => (isDarkMode ? `rgba(16, 185, 129, ${opacity})` : `rgba(5, 150, 105, ${opacity})`),
            strokeWidth: 2,
            withDots: false,
          },
        ]
      : []),
  ],
  legend: goal ? ['Weight', 'Goal'] : ['Weight'],
};
```

To:
```typescript
return {
  labels,
  datasets: [
    {
      data,
      color: (opacity = 1) => (isDarkMode ? `rgba(167, 139, 250, ${opacity})` : `rgba(124, 58, 237, ${opacity})`),
      strokeWidth: 3,
    },
  ],
  legend: goal ? ['Weight', 'Goal'] : ['Weight'],
};
```

Also remove the `goalLine` variable (lines 148-151) since it's no longer used.

**Step 3: Add decorator prop to LineChart** (around line 450)

Add the `decorator` prop to the `LineChart` component. This renders after the chart data, allowing us to draw a horizontal line at the goal weight position.

```typescript
decorator={() => {
  if (!goal || !chartData) return null;
  
  const weights = displayData.map(e => e.weight);
  const allValues = [...weights, goal.targetWeight];
  const minY = Math.min(...allValues);
  const maxY = Math.max(...allValues);
  
  if (maxY === minY) return null; // Avoid division by zero
  
  // Chart dimensions (must match LineChart props)
  const chartHeight = 260;
  const chartPadding = { top: 16, bottom: 40 }; // approximate internal padding
  const usableHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  
  // Y position: inverted (higher value = lower on screen)
  const yRatio = (goal.targetWeight - minY) / (maxY - minY);
  const yPos = chartPadding.top + usableHeight * (1 - yRatio);
  
  const goalColor = isDarkMode ? '#10B981' : '#059669';
  
  return (
    <>
      <Line
        x1={64}
        y1={yPos}
        x2={screenWidth - 48}
        y2={yPos}
        stroke={goalColor}
        strokeWidth={1.5}
        strokeDasharray="6,4"
      />
      <SvgText
        x={screenWidth - 46}
        y={yPos - 6}
        fill={goalColor}
        fontSize={10}
        fontWeight="600"
        textAnchor="end"
      >
        Goal
      </SvgText>
    </>
  );
}}
```

**Important:** The `x1={64}` accounts for the Y-axis label area. The exact values may need adjustment based on testing. Start with these and fine-tune visually.

## Files to Read Before Starting
1. `expo/components/WeightChart.tsx` (full file)
2. Check if `react-native-svg` is importable: `grep -r "react-native-svg" node_modules/react-native-chart-kit/package.json`

## Files to Modify
- `expo/components/WeightChart.tsx`

## Verification Steps
1. `npx tsc --noEmit` passes
2. Set a weight goal (e.g., 150 lbs)
3. Add at least 3 weight entries above the goal (e.g., 160, 158, 155)
4. Verify a green dashed horizontal line appears at the 150 lbs level
5. Verify "Goal" text label appears next to the line
6. Verify the weight data line still has purple dots
7. Test with no goal set -- no goal line should appear
8. Test in both light and dark modes
9. Test all 4 time ranges

## Rollback Plan
```bash
git checkout -- expo/components/WeightChart.tsx
```

## Alternative Approach
If the `decorator` approach doesn't render at the correct Y position (because `react-native-chart-kit` internal padding is hard to predict), use Approach B:

Keep the goal as a second dataset but use `getDotColor` to make goal dots transparent:
```typescript
getDotColor={(dataPoint, dataPointIndex) => {
  // Second dataset (goal line) gets transparent dots
  // This is a workaround since withDots per-dataset is not supported
  return 'transparent'; // Only works if you can detect which dataset
}}
```

Note: `getDotColor` doesn't receive dataset index, so this approach has limitations. The decorator approach is preferred.

## Notes
- This spec CAN be combined with SPEC-02 in the same session since both modify `WeightChart.tsx`.
- The `fromZero={false}` prop on LineChart means the Y axis auto-scales to data range, which is why we need to calculate the goal line position relative to min/max values.
- The SVG coordinate system may need fine-tuning. The padding values (top: 16, bottom: 40) are approximations of `react-native-chart-kit` internals.
