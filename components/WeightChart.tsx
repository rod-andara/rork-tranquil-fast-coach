import React, { useMemo, useState } from 'react';
import { View, Text, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Scale } from 'lucide-react-native';
import { useFastStore } from '@/store/fastStore';
import { useWeightStore } from '@/store/weightStore';

const screenWidth = Dimensions.get('window').width;

type TimeRange = '7d' | '30d' | '90d' | 'all';

export default function WeightChart() {
  const { isDarkMode } = useFastStore();
  const { entries, goal, unit } = useWeightStore();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('30d');

  // Filter data based on selected time range
  const filteredEntries = useMemo(() => {
    if (entries.length === 0) return [];

    const sortedEntries = [...entries].sort((a, b) => a.date - b.date);
    const now = Date.now();

    switch (selectedRange) {
      case '7d':
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
        return sortedEntries.filter(e => e.date >= sevenDaysAgo);
      case '30d':
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
        return sortedEntries.filter(e => e.date >= thirtyDaysAgo);
      case '90d':
        const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
        return sortedEntries.filter(e => e.date >= ninetyDaysAgo);
      case 'all':
        return sortedEntries;
      default:
        return sortedEntries;
    }
  }, [entries, selectedRange]);

  // Calculate summary statistics
  const statistics = useMemo(() => {
    if (filteredEntries.length === 0) {
      return {
        current: 0,
        starting: 0,
        change: 0,
        average: 0,
        min: 0,
        max: 0,
      };
    }

    const weights = filteredEntries.map(e => e.weight);
    const current = weights[weights.length - 1];
    const starting = weights[0];
    const change = current - starting;
    const average = weights.reduce((sum, w) => sum + w, 0) / weights.length;
    const min = Math.min(...weights);
    const max = Math.max(...weights);

    return {
      current: Number(current.toFixed(1)),
      starting: Number(starting.toFixed(1)),
      change: Number(change.toFixed(1)),
      average: Number(average.toFixed(1)),
      min: Number(min.toFixed(1)),
      max: Number(max.toFixed(1)),
    };
  }, [filteredEntries]);

  // Format dates for X-axis labels based on time range
  const formatLabel = (date: Date, index: number, total: number): string => {
    switch (selectedRange) {
      case '7d':
        // Show day names (Mon, Tue, Wed)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[date.getDay()];

      case '30d':
        // Show dates, but only every ~5th point to avoid crowding
        if (total <= 6 || index % Math.ceil(total / 6) === 0) {
          return `${date.getDate()}`;
        }
        return '';

      case '90d':
        // Show dates with month (Jan 15, Feb 1)
        if (total <= 6 || index % Math.ceil(total / 6) === 0) {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return `${months[date.getMonth()]} ${date.getDate()}`;
        }
        return '';

      case 'all':
        // Show "MMM YY" format (Jan 24)
        if (total <= 6 || index % Math.ceil(total / 6) === 0) {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return `${months[date.getMonth()]} ${String(date.getFullYear()).slice(-2)}`;
        }
        return '';

      default:
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    if (filteredEntries.length === 0) {
      return null;
    }

    // Create labels with smart formatting
    const labels = filteredEntries.map((entry, index) => {
      const date = new Date(entry.date);
      return formatLabel(date, index, filteredEntries.length);
    });

    // Create data points
    const data = filteredEntries.map((entry) => entry.weight);

    // Calculate goal line if exists
    let goalLine: number[] | undefined;
    if (goal) {
      goalLine = new Array(data.length).fill(goal.targetWeight);
    }

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
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity * 0.6})`,
                strokeWidth: 2,
                withDots: false,
              },
            ]
          : []),
      ],
      legend: goal ? ['Weight', 'Goal'] : ['Weight'],
    };
  }, [filteredEntries, goal, isDarkMode, selectedRange]);

  // Empty state
  if (entries.length === 0) {
    return (
      <View
        className={`rounded-2xl p-6 items-center justify-center ${
          isDarkMode ? 'bg-neutral-800 border border-neutral-700' : 'bg-white border border-neutral-200'
        }`}
        style={{ minHeight: 250 }}
      >
        <View
          className="w-16 h-16 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: '#7C3AED20' }}
        >
          <Scale size={32} color="#7C3AED" />
        </View>
        <Text
          className={`text-base font-semibold mb-2 ${
            isDarkMode ? 'text-neutral-300' : 'text-neutral-700'
          }`}
        >
          No Weight Data Yet
        </Text>
        <Text
          className={`text-sm text-center ${
            isDarkMode ? 'text-neutral-400' : 'text-neutral-500'
          }`}
        >
          Add your first weight entry to see your progress chart
        </Text>
      </View>
    );
  }

  // No data in selected range
  if (!chartData || filteredEntries.length === 0) {
    return (
      <View
        className={`rounded-2xl ${
          isDarkMode ? 'bg-neutral-800 border border-neutral-700' : 'bg-white border border-neutral-200'
        }`}
      >
        {/* Time Range Selector */}
        <View className="p-4 pb-2">
          <Text
            className={`text-lg font-bold mb-3 ${
              isDarkMode ? 'text-neutral-100' : 'text-neutral-900'
            }`}
          >
            Weight Trend
          </Text>
          <View style={styles.rangeContainer}>
            {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((range) => (
              <TouchableOpacity
                key={range}
                onPress={() => setSelectedRange(range)}
                style={[
                  styles.rangeButton,
                  selectedRange === range && styles.rangeButtonActive,
                  {
                    backgroundColor: selectedRange === range
                      ? '#7C3AED'
                      : (isDarkMode ? '#374151' : '#F3F4F6'),
                  },
                ]}
              >
                <Text
                  style={[
                    styles.rangeButtonText,
                    {
                      color: selectedRange === range
                        ? '#FFFFFF'
                        : (isDarkMode ? '#9CA3AF' : '#6B7280'),
                    },
                  ]}
                >
                  {range === '7d' && '7 Days'}
                  {range === '30d' && '30 Days'}
                  {range === '90d' && '90 Days'}
                  {range === 'all' && 'All'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* No data message */}
        <View className="p-6 items-center justify-center" style={{ minHeight: 200 }}>
          <Text
            className={`text-base font-semibold mb-2 ${
              isDarkMode ? 'text-neutral-300' : 'text-neutral-700'
            }`}
          >
            No Data for This Period
          </Text>
          <Text
            className={`text-sm text-center ${
              isDarkMode ? 'text-neutral-400' : 'text-neutral-500'
            }`}
          >
            Try selecting a different time range
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      className={`rounded-2xl overflow-hidden ${
        isDarkMode ? 'bg-neutral-800 border border-neutral-700' : 'bg-white border border-neutral-200'
      }`}
    >
      {/* Chart Header with Time Range Selector */}
      <View className="p-4 pb-2">
        <Text
          className={`text-lg font-bold mb-3 ${
            isDarkMode ? 'text-neutral-100' : 'text-neutral-900'
          }`}
        >
          Weight Trend
        </Text>

        {/* Time Range Buttons */}
        <View style={styles.rangeContainer}>
          {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((range) => (
            <TouchableOpacity
              key={range}
              onPress={() => setSelectedRange(range)}
              style={[
                styles.rangeButton,
                selectedRange === range && styles.rangeButtonActive,
                {
                  backgroundColor: selectedRange === range
                    ? '#7C3AED'
                    : (isDarkMode ? '#374151' : '#F3F4F6'),
                },
              ]}
            >
              <Text
                style={[
                  styles.rangeButtonText,
                  {
                    color: selectedRange === range
                      ? '#FFFFFF'
                      : (isDarkMode ? '#9CA3AF' : '#6B7280'),
                  },
                ]}
              >
                {range === '7d' && '7 Days'}
                {range === '30d' && '30 Days'}
                {range === '90d' && '90 Days'}
                {range === 'all' && 'All'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Summary Statistics */}
      <View className="px-4 pb-3">
        <View style={styles.statsContainer}>
          {/* Current Weight */}
          <View style={styles.statItem}>
            <Text
              className={`text-xs mb-1 ${
                isDarkMode ? 'text-neutral-400' : 'text-neutral-500'
              }`}
            >
              Current
            </Text>
            <Text
              className={`text-base font-bold ${
                isDarkMode ? 'text-neutral-100' : 'text-neutral-900'
              }`}
            >
              {statistics.current} {unit}
            </Text>
          </View>

          {/* Starting Weight */}
          <View style={styles.statItem}>
            <Text
              className={`text-xs mb-1 ${
                isDarkMode ? 'text-neutral-400' : 'text-neutral-500'
              }`}
            >
              Starting
            </Text>
            <Text
              className={`text-base font-bold ${
                isDarkMode ? 'text-neutral-100' : 'text-neutral-900'
              }`}
            >
              {statistics.starting} {unit}
            </Text>
          </View>

          {/* Change */}
          <View style={styles.statItem}>
            <Text
              className={`text-xs mb-1 ${
                isDarkMode ? 'text-neutral-400' : 'text-neutral-500'
              }`}
            >
              Change
            </Text>
            <Text
              className="text-base font-bold"
              style={{
                color: statistics.change < 0 ? '#10B981' : statistics.change > 0 ? '#EF4444' : (isDarkMode ? '#F9FAFB' : '#111827'),
              }}
            >
              {statistics.change > 0 ? '+' : ''}{statistics.change} {unit}
            </Text>
          </View>

          {/* Average */}
          <View style={styles.statItem}>
            <Text
              className={`text-xs mb-1 ${
                isDarkMode ? 'text-neutral-400' : 'text-neutral-500'
              }`}
            >
              Average
            </Text>
            <Text
              className={`text-base font-bold ${
                isDarkMode ? 'text-neutral-100' : 'text-neutral-900'
              }`}
            >
              {statistics.average} {unit}
            </Text>
          </View>
        </View>

        {/* Min/Max Row */}
        <View style={[styles.statsContainer, { marginTop: 8 }]}>
          <View style={styles.statItem}>
            <Text
              className={`text-xs mb-1 ${
                isDarkMode ? 'text-neutral-400' : 'text-neutral-500'
              }`}
            >
              Minimum
            </Text>
            <Text
              className={`text-sm font-semibold ${
                isDarkMode ? 'text-neutral-200' : 'text-neutral-800'
              }`}
            >
              {statistics.min} {unit}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text
              className={`text-xs mb-1 ${
                isDarkMode ? 'text-neutral-400' : 'text-neutral-500'
              }`}
            >
              Maximum
            </Text>
            <Text
              className={`text-sm font-semibold ${
                isDarkMode ? 'text-neutral-200' : 'text-neutral-800'
              }`}
            >
              {statistics.max} {unit}
            </Text>
          </View>
        </View>
      </View>

      {/* Chart */}
      <LineChart
        data={chartData}
        width={screenWidth - 32} // Container padding
        height={220}
        chartConfig={{
          backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
          backgroundGradientFrom: isDarkMode ? '#1F2937' : '#FFFFFF',
          backgroundGradientTo: isDarkMode ? '#1F2937' : '#FFFFFF',
          decimalPlaces: 1,
          color: (opacity = 1) => (isDarkMode ? `rgba(167, 139, 250, ${opacity})` : `rgba(124, 58, 237, ${opacity})`),
          labelColor: (opacity = 1) => (isDarkMode ? `rgba(156, 163, 175, ${opacity})` : `rgba(107, 114, 128, ${opacity})`),
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '5',
            strokeWidth: '2',
            stroke: isDarkMode ? '#A78BFA' : '#7C3AED',
            fill: isDarkMode ? '#1F2937' : '#FFFFFF',
          },
          propsForBackgroundLines: {
            strokeDasharray: '', // solid lines
            stroke: isDarkMode ? '#374151' : '#E5E7EB',
            strokeWidth: 1,
          },
        }}
        bezier // Smooth curve interpolation
        style={{
          marginVertical: 8,
          borderRadius: 16,
          paddingRight: 0,
        }}
        withHorizontalLabels={true}
        withVerticalLabels={true}
        withInnerLines={true}
        withOuterLines={false}
        withVerticalLines={false}
        withHorizontalLines={true}
        fromZero={false}
        segments={4}
      />

      {/* Chart Footer */}
      <View className="px-4 pb-4">
        <Text
          className={`text-xs text-center ${
            isDarkMode ? 'text-neutral-500' : 'text-neutral-400'
          }`}
        >
          {filteredEntries.length} entries • Weight in {unit}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rangeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeButtonActive: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  rangeButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
});
