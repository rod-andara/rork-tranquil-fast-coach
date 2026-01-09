export const colors = {
  primary: '#8B5CF6',
  primaryLight: '#A78BFA',
  primaryDark: '#7C3AED',
  secondary: '#EC4899',
  background: '#FFFFFF',
  backgroundDark: '#1F2937',
  surface: '#F9FAFB',
  surfaceDark: '#374151',
  text: '#111827',
  textDark: '#F9FAFB',
  textSecondary: '#6B7280',
  textSecondaryDark: '#9CA3AF',
  border: '#E5E7EB',
  borderDark: '#4B5563',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  inactive: '#6B7280',
  white: '#FFFFFF',
  black: '#000000',

  // iOS Dark Mode System Colors
  iosBackgroundDark: '#000000',           // Pure black (optional, for OLED)
  iosSystemBackgroundDark: '#1C1C1E',     // Standard iOS dark background
  iosElevatedBackgroundDark: '#2C2C2E',   // Elevated surfaces (cards, modals)
  iosTertiaryBackgroundDark: '#3A3A3C',   // Tertiary surfaces (grouped backgrounds)
  iosSeparatorDark: '#38383A',            // Borders and separators
  iosLabelPrimaryDark: '#FFFFFF',         // Primary text
  iosLabelSecondaryDark: '#EBEBF5',       // Secondary text (use with 60% opacity)

  // iOS Light Mode System Colors
  iosSystemBackgroundLight: '#FFFFFF',
  iosElevatedBackgroundLight: '#F2F2F7',
  iosTertiaryBackgroundLight: '#FFFFFF',
  iosSeparatorLight: '#C6C6C8',
  iosLabelPrimaryLight: '#000000',
  iosLabelSecondaryLight: '#3C3C43',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 28,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

// Hook for adaptive colors based on color scheme
import { useColorScheme } from 'react-native';

export const useAdaptiveColors = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    systemBackground: isDark ? colors.iosSystemBackgroundDark : colors.iosSystemBackgroundLight,
    elevatedBackground: isDark ? colors.iosElevatedBackgroundDark : colors.iosElevatedBackgroundLight,
    tertiaryBackground: isDark ? colors.iosTertiaryBackgroundDark : colors.iosTertiaryBackgroundLight,
    separator: isDark ? colors.iosSeparatorDark : colors.iosSeparatorLight,
    labelPrimary: isDark ? colors.iosLabelPrimaryDark : colors.iosLabelPrimaryLight,
    labelSecondary: isDark ? colors.iosLabelSecondaryDark : colors.iosLabelSecondaryLight,
  };
};
