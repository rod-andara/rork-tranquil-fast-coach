/**
 * Design Tokens - Rork Tranquil Fast Coach
 * Based on STYLE_DIRECTIONS.md from UI/UX Audit
 * Inspired by Untitled UI React, adapted for React Native + NativeWind
 */

export const colors = {
  primary: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#7C3AED',  // PRIMARY - main brand color
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },
  neutral: {
    // Light mode
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',  // Secondary text (4.6:1 contrast ✓)
    600: '#4B5563',  // Primary text (7.5:1 contrast ✓)
    700: '#374151',  // Headings
    800: '#1F2937',
    900: '#111827',  // High contrast text
  },
  success: {
    50: '#ECFDF5',
    500: '#10B981',  // Green - streaks, achievements
    600: '#059669',
  },
  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',  // Amber - warnings
    600: '#D97706',
  },
  error: {
    50: '#FEF2F2',
    500: '#EF4444',  // Red - errors, destructive actions
    600: '#DC2626',
  },
  info: {
    50: '#EFF6FF',
    500: '#3B82F6',  // Blue - informational
    600: '#2563EB',
  },
} as const;

export const spacing = {
  0: 0,      // 0pt - No spacing
  1: 4,      // 4pt - Tight spacing (icon to text)
  2: 8,      // 8pt - Compact spacing (between related items)
  3: 12,     // 12pt - Default gap (between form fields)
  4: 16,     // 16pt - Comfortable padding (card internal padding)
  5: 20,     // 20pt - Medium spacing
  6: 24,     // 24pt - Section spacing (between sections)
  8: 32,     // 32pt - Large spacing (major sections)
  10: 40,    // 40pt - Extra large spacing
  12: 48,    // 48pt - Screen-level spacing (top/bottom margins)
  16: 64,    // 64pt - Maximum spacing
} as const;

export const fontSize = {
  xs: 12,     // 12pt - Captions, labels (minimum size)
  sm: 14,     // 14pt - Small body, secondary text
  base: 16,   // 16pt - Body text (default)
  lg: 18,     // 18pt - Subheadings, large body
  xl: 24,     // 24pt - Section headings
  '2xl': 28,  // 28pt - Screen titles
  '3xl': 32,  // 32pt - Large display text
  '4xl': 48,  // 48pt - Timer display (special case)
} as const;

export const fontWeight = {
  normal: '400',    // Regular - body text
  medium: '500',    // Medium - emphasis
  semibold: '600',  // Semibold - subheadings
  bold: '700',      // Bold - headings
} as const;

export const lineHeight = {
  tight: 1.2,    // Headings, display text
  normal: 1.5,   // Body text
  relaxed: 1.75, // Long-form content
} as const;

export const borderRadius = {
  none: 0,      // 0pt - No rounding (sharp corners)
  sm: 8,        // 8pt - Subtle rounding (small elements)
  md: 12,       // 12pt - Default rounding (cards)
  lg: 16,       // 16pt - Prominent rounding (large cards)
  xl: 24,       // 24pt - Extra rounding (buttons)
  '2xl': 32,    // 32pt - Very rounded
  full: 9999,   // Full circle (circular elements)
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
} as const;

/**
 * Typography Usage Guide (with NativeWind classes)
 *
 * Screen Title:     text-2xl font-bold text-neutral-800 dark:text-neutral-800
 * Section Heading:  text-xl font-semibold text-neutral-700 dark:text-neutral-700
 * Card Title:       text-lg font-semibold text-neutral-700 dark:text-neutral-700
 * Body Text:        text-base text-neutral-600 dark:text-neutral-600
 * Secondary Text:   text-sm text-neutral-500 dark:text-neutral-500
 * Label:            text-sm font-medium text-neutral-600 dark:text-neutral-600
 * Caption:          text-xs text-neutral-500 dark:text-neutral-500
 * Button Text:      text-base font-semibold text-white
 * Timer Display:    text-4xl font-bold text-neutral-900 dark:text-neutral-900
 */

/**
 * Spacing Usage Guide (with NativeWind classes)
 *
 * Icon to text:            gap-1
 * Between related items:   gap-2
 * Between form fields:     gap-3
 * Card internal padding:   p-4
 * Between cards:           gap-3 or gap-4
 * Section spacing:         mb-6 or mt-6
 * Screen padding:          px-4
 * Screen top/bottom:       pt-6 pb-12
 */
