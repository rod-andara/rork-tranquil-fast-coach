import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, Platform } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { TrendingUp, Clock, Trophy, Calendar } from 'lucide-react-native';

import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
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
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>Track your fasting journey</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCardWrapper}>
            <StatCard
              icon={Calendar}
              value={stats.totalFasts}
              label="Total Fasts"
              iconColor={colors.primary}
              iconBgColor={colors.surface}
            />
          </View>
          <View style={styles.statCardWrapper}>
            <StatCard
              icon={TrendingUp}
              value={stats.dayStreak}
              label="Day Streak"
              iconColor={colors.success}
              iconBgColor="#D1FAE5"
            />
          </View>
          <View style={styles.statCardWrapper}>
            <StatCard
              icon={Clock}
              value={stats.avgHours}
              label="Avg Hours"
              iconColor={colors.primary}
              iconBgColor={colors.surface}
            />
          </View>
          <View style={styles.statCardWrapper}>
            <StatCard
              icon={Trophy}
              value={stats.totalHours}
              label="Total Hours"
              iconColor={colors.primary}
              iconBgColor={colors.surface}
            />
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>This Week</Text>
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
            width={screenWidth - spacing.lg * 2 - spacing.md * 2}
            height={220}
            yAxisLabel=""
            yAxisSuffix="h"
            chartConfig={{
              backgroundColor: colors.white,
              backgroundGradientFrom: colors.white,
              backgroundGradientTo: colors.white,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
              barPercentage: 0.7,
              propsForBackgroundLines: {
                strokeWidth: 0,
              },
            }}
            style={styles.chart}
            showValuesOnTopOfBars={false}
            withInnerLines={false}
            fromZero
          />
          ) : (
            <View style={styles.webBars}>
              {stats.weekData.map((v, idx) => (
                <View key={idx} style={styles.webBarItem}>
                  <View style={[styles.webBar, { height: Math.max(10, (v / 24) * 180) }]} />
                  <Text style={styles.webBarLabel}>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][idx]}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsList}>
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
      style={[
        styles.achievementCard,
        achievement.unlocked && styles.achievementCardUnlocked,
      ]}
    >
      <View
        style={[
          styles.achievementIcon,
          achievement.unlocked && styles.achievementIconUnlocked,
        ]}
      >
        <Trophy
          size={24}
          color={achievement.unlocked ? colors.primary : colors.textSecondary}
          strokeWidth={2}
        />
      </View>
      <View style={styles.achievementContent}>
        <Text
          style={[
            styles.achievementTitle,
            !achievement.unlocked && styles.achievementTitleLocked,
          ]}
        >
          {achievement.title}
        </Text>
        <Text
          style={[
            styles.achievementDescription,
            !achievement.unlocked && styles.achievementDescriptionLocked,
          ]}
        >
          {achievement.description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.lg,
  },
  statCardWrapper: {
    width: '50%',
    padding: spacing.xs,
  },
  chartCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  chartTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.md,
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  webBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 200,
    paddingHorizontal: spacing.md,
  },
  webBarItem: {
    alignItems: 'center',
    width: (screenWidth - spacing.lg * 2 - spacing.md * 2) / 7 - 4,
  },
  webBar: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  webBarLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  achievementsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.md,
  },
  achievementsList: {
    gap: spacing.md,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    opacity: 0.6,
  },
  achievementCardUnlocked: {
    backgroundColor: '#F3E8FF',
    opacity: 1,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementIconUnlocked: {
    backgroundColor: '#E9D5FF',
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    ...typography.body,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  achievementTitleLocked: {
    color: colors.textSecondary,
  },
  achievementDescription: {
    ...typography.caption,
    color: colors.text,
  },
  achievementDescriptionLocked: {
    color: colors.textSecondary,
  },
});
