import React, { useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Scale } from 'lucide-react-native';
import { useFastStore } from '@/store/fastStore';
import { useWeightStore } from '@/store/weightStore';

const screenWidth = Dimensions.get('window').width;

export default function WeightChart() {
  const { isDarkMode } = useFastStore();
  const { entries, goal, unit } = useWeightStore();

  // Prepare chart data (last 30 days, or all data if less than 30 days)
  const chartData = useMemo(() => {
    if (entries.length === 0) {
      return null;
    }

    // Get last 30 days of data
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    let recentEntries = entries
      .filter((e) => e.date >= thirtyDaysAgo)
      .sort((a, b) => a.date - b.date); // Sort ascending for chart

    // If no entries in last 30 days, show all available entries
    if (recentEntries.length === 0) {
      recentEntries = entries
        .slice()
        .sort((a, b) => a.date - b.date);
    }

    // Create labels (dates)
    const labels = recentEntries.map((entry) => {
      const date = new Date(entry.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    // Create data points
    const data = recentEntries.map((entry) => entry.weight);

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
  }, [entries, goal, isDarkMode, unit]);

  // Check if we're showing recent data (last 30 days) or all data
  const isRecentData = useMemo(() => {
    if (entries.length === 0) return true;
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return entries.some((e) => e.date >= thirtyDaysAgo);
  }, [entries]);

  // Empty state
  if (!chartData) {
    return (
      <View
        className={`rounded-2xl p-6 items-center justify-center ${
          isDarkMode ? 'bg-neutral-800 border border-neutral-700' : 'bg-white border border-neutral-200'
        }`}
        style={{ height: 250 }}
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

  return (
    <View
      className={`rounded-2xl overflow-hidden ${
        isDarkMode ? 'bg-neutral-800 border border-neutral-700' : 'bg-white border border-neutral-200'
      }`}
    >
      {/* Chart Header */}
      <View className="p-4 pb-2">
        <Text
          className={`text-lg font-bold ${
            isDarkMode ? 'text-neutral-100' : 'text-neutral-900'
          }`}
        >
          {isRecentData ? '30-Day Trend' : 'Weight History'}
        </Text>
        <Text
          className={`text-sm ${
            isDarkMode ? 'text-neutral-400' : 'text-neutral-500'
          }`}
        >
          Weight in {unit}
        </Text>
      </View>

      {/* Chart */}
      <LineChart
        data={chartData}
        width={screenWidth - 64} // Padding
        height={175}
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
            r: '4',
            strokeWidth: '2',
            stroke: isDarkMode ? '#A78BFA' : '#7C3AED',
          },
          propsForBackgroundLines: {
            strokeDasharray: '', // solid lines
            stroke: isDarkMode ? '#374151' : '#E5E7EB',
            strokeWidth: 1,
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
        withHorizontalLabels={true}
        withVerticalLabels={true}
        withInnerLines={true}
        withOuterLines={false}
        withVerticalLines={false}
        withHorizontalLines={true}
        fromZero={false}
      />
    </View>
  );
}
