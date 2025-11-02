import React, { useMemo, useState } from 'react';
import { Text, View, ScrollView, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { TrendingUp, Clock, Trophy, Calendar, Plus, Target, Scale } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useFastStore } from '@/store/fastStore';
import { useWeightStore } from '@/store/weightStore';
import StatCard from '@/components/StatCard';
import GlassCard from '@/components/GlassCard';
import WeightChart from '@/components/WeightChart';
import AppleHealthCard from '@/components/AppleHealthCard';
import WeightEntryModal from '@/components/WeightEntryModal';

const screenWidth = Dimensions.get('window').width;

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export default function ProgressScreen() {
  const { fastHistory, isDarkMode } = useFastStore();
  const { getCurrentWeight, getWeightChange, getProgressPercentage, goal, unit } = useWeightStore();
  const [showWeightModal, setShowWeightModal] = useState(false);

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

    // Calculate actual fasting hours per day for this week
    const now = new Date();
    const currentDay = now.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const hoursPerDay = [0, 0, 0, 0, 0, 0, 0];

    fastHistory.forEach(fast => {
      if (!fast.endTime) return;

      const fastStart = new Date(fast.startTime);
      const fastEnd = new Date(fast.endTime);

      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const dayStart = new Date(monday);
        dayStart.setDate(monday.getDate() + dayIndex);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);

        if (fastEnd >= dayStart && fastStart <= dayEnd) {
          const overlapStart = fastStart > dayStart ? fastStart : dayStart;
          const overlapEnd = fastEnd < dayEnd ? fastEnd : dayEnd;
          const hoursOverlap = (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60);
          hoursPerDay[dayIndex] += hoursOverlap;
        }
      }
    });

    const weekData = hoursPerDay.map(hours => Math.round(hours * 10) / 10);

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
    <LinearGradient
      colors={isDarkMode ? ['#1a1625', '#1F2937'] : ['#FAFBFC', '#F3F4F6']}
      style={{ flex: 1 }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="mb-4">
          <Text className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">
            Your Progress
          </Text>
          <Text className="text-base text-neutral-500 dark:text-neutral-400">
            Track your fasting journey
          </Text>
        </View>

        {/* Weight Tracking Section */}
        <View className="mb-4">
          {/* Section Header with Add Button */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
              Weight
            </Text>
            <TouchableOpacity
              onPress={() => setShowWeightModal(true)}
              className="flex-row items-center gap-2 bg-primary-600 px-4 py-2 rounded-lg"
              activeOpacity={0.8}
            >
              <Plus size={18} color="#FFFFFF" />
              <Text className="text-white text-sm font-semibold">
                Add Weight
              </Text>
            </TouchableOpacity>
          </View>

          {/* Weight Stats Cards */}
          {getCurrentWeight() !== null && (
            <View className="flex-row gap-2 mb-3">
              <View className="flex-1">
                <GlassCard style={{ padding: 12 }}>
                  <View className="flex-row items-center gap-2 mb-2">
                    <Scale size={18} color="#7C3AED" />
                    <Text
                      className={`text-sm font-medium ${
                        isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
                      }`}
                    >
                      Current
                    </Text>
                  </View>
                  <Text
                    className={`text-2xl font-bold ${
                      isDarkMode ? 'text-neutral-50' : 'text-neutral-900'
                    }`}
                  >
                    {getCurrentWeight()?.toFixed(1)} {unit}
                  </Text>
                </GlassCard>
              </View>

              {getWeightChange() !== null && (
                <View className="flex-1">
                  <GlassCard style={{ padding: 12 }}>
                    <View className="flex-row items-center gap-2 mb-2">
                      <TrendingUp size={18} color="#10B981" />
                      <Text
                        className={`text-sm font-medium ${
                          isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
                        }`}
                      >
                        Change
                      </Text>
                    </View>
                    <Text
                      className={`text-2xl font-bold ${
                        getWeightChange()! < 0 ? 'text-success-500' : 'text-neutral-500'
                      }`}
                    >
                      {getWeightChange()! > 0 ? '+' : ''}
                      {getWeightChange()?.toFixed(1)} {unit}
                    </Text>
                  </GlassCard>
                </View>
              )}
            </View>
          )}

          {/* Goal Progress Card */}
          {goal && getProgressPercentage() !== null && (
            <GlassCard style={{ padding: 12, marginBottom: 12 }}>
              <View className="flex-row items-center gap-2 mb-2">
                <Target size={18} color="#7C3AED" />
                <Text
                  className={`text-base font-bold ${
                    isDarkMode ? 'text-neutral-100' : 'text-neutral-900'
                  }`}
                >
                  Goal: {goal.targetWeight} {goal.unit}
                </Text>
              </View>

              {/* Progress Bar */}
              <View
                className={`h-3 rounded-full overflow-hidden mb-2 ${
                  isDarkMode ? 'bg-neutral-700' : 'bg-neutral-200'
                }`}
              >
                <View
                  className="h-full bg-primary-600 rounded-full"
                  style={{ width: `${Math.min(100, getProgressPercentage() || 0)}%` }}
                />
              </View>

              <Text
                className={`text-sm ${
                  isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
                }`}
              >
                {getProgressPercentage()?.toFixed(0)}% complete
              </Text>
            </GlassCard>
          )}

          {/* Weight Chart */}
          <WeightChart />

          {/* Apple Health Card */}
          <View className="mt-4">
            <AppleHealthCard />
          </View>
        </View>

        {/* Fasting Section Header */}
        <Text className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-3">
          Fasting
        </Text>

        {/* Stats Grid - 2x2 layout with consistent gaps */}
        <View className="flex-row flex-wrap -mx-1.5 mb-4">
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

          {/* Chart Card */}
          <GlassCard style={{ padding: 12, marginBottom: 16 }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: isDarkMode ? '#FFFFFF' : '#111827',
              marginBottom: 12,
            }}>
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
                width={screenWidth - 16 * 2 - 12 * 2}
                height={175}
                yAxisLabel=""
                yAxisSuffix="h"
                chartConfig={{
                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                backgroundGradientFrom: isDarkMode ? '#1F2937' : '#FFFFFF',
                backgroundGradientTo: isDarkMode ? '#1F2937' : '#FFFFFF',
                decimalPlaces: 0,
                color: (opacity = 1) => isDarkMode
                  ? `rgba(167, 139, 250, ${opacity})`
                  : `rgba(124, 58, 237, ${opacity})`,
                labelColor: (opacity = 1) => isDarkMode
                  ? `rgba(209, 213, 219, ${opacity})`
                  : `rgba(107, 114, 128, ${opacity})`,
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
              <View className="flex-row items-end justify-between h-[160px] px-4">
                {stats.weekData.map((v, idx) => (
                  <View key={idx} className="items-center" style={{ width: (screenWidth - 16 * 2 - 12 * 2) / 7 - 4 }}>
                    <View
                      className="w-full rounded-md"
                      style={{
                        height: Math.max(10, (v / 24) * 140),
                        backgroundColor: isDarkMode ? '#A78BFA' : '#7C3AED'
                      }}
                    />
                    <Text className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                    </Text>
                  </View>
                ))}
              </View>
            )}
        </GlassCard>

        {/* Achievements Section */}
        <View className="mb-4">
            <Text className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-3">
              Achievements
            </Text>
            <View className="gap-3">
              {achievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
            </View>
        </View>
      </ScrollView>

      {/* Weight Entry Modal */}
      <WeightEntryModal
        visible={showWeightModal}
        onClose={() => setShowWeightModal(false)}
      />
    </LinearGradient>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <View
      className={`flex-row items-center bg-white dark:bg-neutral-800 p-3 rounded-lg border gap-3 shadow-sm ${
        achievement.unlocked
          ? 'border-primary-200 dark:border-primary-700 bg-primary-100 dark:bg-primary-900/20'
          : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900'
      }`}
    >
      <View
        className={`w-14 h-14 rounded-md justify-center items-center ${
          achievement.unlocked ? 'bg-primary-200 dark:bg-primary-700' : 'bg-neutral-200 dark:bg-neutral-800'
        }`}
      >
        <Trophy
          size={24}
          color={achievement.unlocked ? '#7C3AED' : '#94A3B8'}
          strokeWidth={2}
        />
      </View>
      <View className="flex-1">
        <Text
          className={`text-base font-semibold mb-1 ${
            achievement.unlocked ? 'text-neutral-800 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-300'
          }`}
        >
          {achievement.title}
        </Text>
        <Text
          className={`text-sm ${
            achievement.unlocked ? 'text-neutral-700 dark:text-neutral-200' : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          {achievement.description}
        </Text>
      </View>
    </View>
  );
}

