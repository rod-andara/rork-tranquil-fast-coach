import React, { useMemo } from 'react';
import { Text, View, ScrollView, Dimensions, Platform } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { TrendingUp, Clock, Trophy, Calendar } from 'lucide-react-native';

import { useFastStore } from '@/store/fastStore';
import StatCard from '@/components/StatCard';

const screenWidth = Dimensions.get('window').width;

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export default function ProgressScreen() {
  const { fastHistory } = useFastStore();

  const stats = useMemo(() => {
    const totalFasts = fastHistory.length;
    const totalHours = fastHistory.reduce((acc, fast) => {
      if (fast.endTime) {
        const duration = fast.endTime - fast.startTime;
        return acc + duration / (1000 * 60 * 60);
      }
      return acc;
    }, 0);
    const avgHours = totalFasts > 0 ? totalHours / totalFasts : 0;

    const sortedHistory = [...fastHistory].sort((a, b) => a.startTime - b.startTime);
    let currentStreak = 0;
    let maxStreak = 0;
    let lastDate: Date | null = null;

    sortedHistory.forEach(fast => {
      if (fast.completed && fast.endTime) {
        const fastDate = new Date(fast.startTime);
        fastDate.setHours(0, 0, 0, 0);

        if (!lastDate) {
          currentStreak = 1;
        } else {
          const dayDiff = Math.floor((fastDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          if (dayDiff === 1) {
            currentStreak++;
          } else if (dayDiff > 1) {
            currentStreak = 1;
          }
        }
        maxStreak = Math.max(maxStreak, currentStreak);
        lastDate = fastDate;
      }
    });

    const dayStreak = currentStreak;

    const weekData = [14, 16, 15, 18, 16, 20, 16];

    return {
      totalFasts,
      dayStreak,
      totalHours: Math.round(totalHours),
      avgHours: Math.round(avgHours * 10) / 10,
      weekData,
    };
  }, [fastHistory]);

  const achievements: Achievement[] = useMemo(() => [
    {
      id: '1',
      title: 'First Fast',
      description: 'Completed your first fast',
      unlocked: stats.totalFasts >= 1,
    },
    {
      id: '2',
      title: '7 Day Streak',
      description: 'Fasted for 7 days in a row',
      unlocked: stats.dayStreak >= 7,
    },
    {
      id: '3',
      title: '100 Hours',
      description: 'Total 100 hours of fasting',
      unlocked: stats.totalHours >= 100,
    },
    {
      id: '4',
      title: '30 Day Streak',
      description: 'Fasted for 30 days in a row',
      unlocked: stats.dayStreak >= 30,
    },
  ], [stats]);

  return (
    <View className="flex-1 bg-white dark:bg-neutral-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section - 24pt bottom margin */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-neutral-800 dark:text-neutral-800 mb-2">
            Your Progress
          </Text>
          <Text className="text-base text-neutral-500 dark:text-neutral-500">
            Track your fasting journey
          </Text>
        </View>

        {/* Stats Grid - 2x2 layout with consistent 12pt gaps */}
        <View className="flex-row flex-wrap -mx-1.5 mb-6">
          <View className="w-1/2 p-1.5">
            <StatCard
              icon={Calendar}
              value={stats.totalFasts}
              label="Total Fasts"
              iconColor="#7C3AED"
              iconBgColor="#F3F4F6"
            />
          </View>
          <View className="w-1/2 p-1.5">
            <StatCard
              icon={TrendingUp}
              value={stats.dayStreak}
              label="Day Streak"
              iconColor="#10B981"
              iconBgColor="#F3F4F6"
            />
          </View>
          <View className="w-1/2 p-1.5">
            <StatCard
              icon={Clock}
              value={stats.avgHours}
              label="Avg Hours"
              iconColor="#7C3AED"
              iconBgColor="#F3F4F6"
            />
          </View>
          <View className="w-1/2 p-1.5">
            <StatCard
              icon={Trophy}
              value={stats.totalHours}
              label="Total Hours"
              iconColor="#7C3AED"
              iconBgColor="#F3F4F6"
            />
          </View>
        </View>

        {/* Chart Card - 24pt bottom margin */}
        <View className="bg-white dark:bg-neutral-100 p-4 rounded-lg border border-neutral-200 dark:border-neutral-300 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-neutral-800 dark:text-neutral-800 mb-4">
            This Week
          </Text>
          {Platform.OS !== 'web' ? (
            <BarChart
              data={{
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                  {
                    data: stats.weekData,
                  },
                ],
              }}
              width={screenWidth - 16 * 2 - 16 * 2}
              height={220}
              yAxisLabel=""
              yAxisSuffix="h"
              chartConfig={{
                backgroundColor: '#FFFFFF',
                backgroundGradientFrom: '#FFFFFF',
                backgroundGradientTo: '#FFFFFF',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                barPercentage: 0.7,
                propsForBackgroundLines: {
                  strokeWidth: 0,
                },
              }}
              style={{ marginVertical: 8, borderRadius: 12 }}
              showValuesOnTopOfBars={false}
              withInnerLines={false}
              fromZero
            />
          ) : (
            <View className="flex-row items-end justify-between h-[200px] px-4">
              {stats.weekData.map((v, idx) => (
                <View key={idx} className="items-center" style={{ width: (screenWidth - 16 * 2 - 16 * 2) / 7 - 4 }}>
                  <View className="w-full bg-primary-600 rounded-md" style={{ height: Math.max(10, (v / 24) * 180) }} />
                  <Text className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Achievements Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-neutral-800 dark:text-neutral-800 mb-4">
            Achievements
          </Text>
          <View className="gap-4">
            {achievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <View
      className={`flex-row items-center bg-white dark:bg-neutral-100 p-4 rounded-lg border gap-4 ${
        achievement.unlocked
          ? 'border-primary-200 bg-primary-50 dark:bg-primary-100'
          : 'border-neutral-200 opacity-60'
      }`}
    >
      <View
        className={`w-14 h-14 rounded-md justify-center items-center ${
          achievement.unlocked ? 'bg-primary-200 dark:bg-primary-300' : 'bg-neutral-100 dark:bg-neutral-200'
        }`}
      >
        <Trophy
          size={24}
          color={achievement.unlocked ? '#7C3AED' : '#6B7280'}
          strokeWidth={2}
        />
      </View>
      <View className="flex-1">
        <Text
          className={`text-base font-semibold mb-1 ${
            achievement.unlocked ? 'text-neutral-800 dark:text-neutral-800' : 'text-neutral-500 dark:text-neutral-500'
          }`}
        >
          {achievement.title}
        </Text>
        <Text
          className={`text-sm ${
            achievement.unlocked ? 'text-neutral-700 dark:text-neutral-700' : 'text-neutral-500 dark:text-neutral-500'
          }`}
        >
          {achievement.description}
        </Text>
      </View>
    </View>
  );
}

