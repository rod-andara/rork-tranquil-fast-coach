import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { TrendingUp, Clock, Award, Flame } from 'lucide-react-native';

import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { useFastStore } from '@/store/fastStore';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
  const { fastHistory } = useFastStore();

  const stats = useMemo(() => {
    const totalFasts = fastHistory.length;
    const completedFasts = fastHistory.filter(f => f.completed).length;
    const totalHours = fastHistory.reduce((acc, fast) => {
      if (fast.endTime) {
        const duration = fast.endTime - fast.startTime;
        return acc + duration / (1000 * 60 * 60);
      }
      return acc;
    }, 0);
    const avgHours = totalFasts > 0 ? totalHours / totalFasts : 0;

    const last7Days = fastHistory.slice(0, 7).reverse();
    const chartData = last7Days.map(fast => {
      if (fast.endTime) {
        const duration = fast.endTime - fast.startTime;
        return Math.round(duration / (1000 * 60 * 60));
      }
      return 0;
    });

    const chartLabels = last7Days.map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });

    return {
      totalFasts,
      completedFasts,
      totalHours: Math.round(totalHours),
      avgHours: Math.round(avgHours * 10) / 10,
      chartData: chartData.length > 0 ? chartData : [0, 0, 0, 0, 0, 0, 0],
      chartLabels: chartLabels.length > 0 ? chartLabels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    };
  }, [fastHistory]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>
            Track your fasting journey and achievements
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            icon={Flame}
            value={stats.totalFasts.toString()}
            label="Total Fasts"
            color={colors.primary}
          />
          <StatCard
            icon={Award}
            value={stats.completedFasts.toString()}
            label="Completed"
            color={colors.success}
          />
          <StatCard
            icon={Clock}
            value={stats.totalHours.toString()}
            label="Total Hours"
            color={colors.secondary}
          />
          <StatCard
            icon={TrendingUp}
            value={stats.avgHours.toString()}
            label="Avg Hours"
            color={colors.warning}
          />
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Last 7 Days</Text>
          <LineChart
            data={{
              labels: stats.chartLabels,
              datasets: [
                {
                  data: stats.chartData,
                },
              ],
            }}
            width={screenWidth - spacing.lg * 2 - spacing.md * 2}
            height={220}
            chartConfig={{
              backgroundColor: colors.white,
              backgroundGradientFrom: colors.white,
              backgroundGradientTo: colors.white,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
              style: {
                borderRadius: borderRadius.md,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: colors.primary,
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>

        {fastHistory.length === 0 && (
          <View style={styles.emptyState}>
            <TrendingUp size={64} color={colors.textSecondary} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No Fasts Yet</Text>
            <Text style={styles.emptyText}>
              Start your first fast to see your progress here
            </Text>
          </View>
        )}

        {fastHistory.length > 0 && (
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>Recent Fasts</Text>
            <View style={styles.historyList}>
              {fastHistory.slice(0, 5).map((fast) => (
                <HistoryItem key={fast.id} fast={fast} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Icon size={24} color={colors.white} strokeWidth={2} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function HistoryItem({ fast }: { fast: { id: string; startTime: number; endTime: number | null; completed: boolean } }) {
  const duration = fast.endTime
    ? Math.round((fast.endTime - fast.startTime) / (1000 * 60 * 60))
    : 0;

  const date = new Date(fast.startTime).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={styles.historyItem}>
      <View style={styles.historyDot} />
      <View style={styles.historyContent}>
        <Text style={styles.historyDate}>{date}</Text>
        <Text style={styles.historyDuration}>{duration}h fast</Text>
      </View>
      {fast.completed && (
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>✓</Text>
        </View>
      )}
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
    marginBottom: spacing.xl,
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
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  chartCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  chartTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  historyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  historyList: {
    gap: spacing.md,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  historyDot: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  historyContent: {
    flex: 1,
  },
  historyDate: {
    ...typography.body,
    color: colors.text,
    marginBottom: 2,
  },
  historyDuration: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.white,
  },
});
