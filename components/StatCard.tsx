import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFastStore } from '@/store/fastStore';
import GlassCard from './GlassCard';

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  iconColor?: string;
  iconBgColor?: string;
}

const ICON_GRADIENTS: Record<string, string[]> = {
  calendar: ['#7C3AED', '#A78BFA'],   // Purple
  trending: ['#10B981', '#34D399'],   // Green - for TrendingUp
  trendingup: ['#10B981', '#34D399'],  // Green
  clock: ['#3B82F6', '#60A5FA'],      // Blue
  trophy: ['#F59E0B', '#FBBF24'],     // Orange/Gold
};

function getIconGradient(iconColor: string): string[] {
  // Try to match by the iconColor hex value to determine which gradient to use
  if (iconColor === '#10B981') return ICON_GRADIENTS.trending;
  if (iconColor === '#3B82F6') return ICON_GRADIENTS.clock;
  if (iconColor === '#F59E0B') return ICON_GRADIENTS.trophy;
  return ICON_GRADIENTS.calendar; // Default purple
}

function StatCardComponent({
  icon: Icon,
  value,
  label,
  iconColor = '#7C3AED',
  iconBgColor = '#F3F4F6',
}: StatCardProps) {
  const isDarkMode = useFastStore((state) => state.isDarkMode);
  const gradientColors = getIconGradient(iconColor);

  return (
    <GlassCard style={styles.card}>
      <LinearGradient
        colors={gradientColors}
        style={styles.iconGradient}
      >
        <Icon size={28} color="#FFFFFF" strokeWidth={2} />
      </LinearGradient>
      <Text style={[
        styles.value,
        { color: isDarkMode ? '#FFFFFF' : '#111827' }
      ]}>
        {value}
      </Text>
      <Text style={[
        styles.label,
        { color: isDarkMode ? '#9CA3AF' : '#6B7280' }
      ]}>
        {label}
      </Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    padding: 20,
    flex: 1,
    minWidth: 100,
  },
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  value: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});

export default memo(StatCardComponent);
