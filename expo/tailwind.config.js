/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand colors (purple #7C63E6)
        brand: {
          50: '#f5f3ff',   // Lightest - chip backgrounds (light mode)
          100: '#ede9fe',
          200: '#ddd6fe',  // Light text on dark chips
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#7C63E6',  // PRIMARY BRAND
          600: '#6d5bd0',
          700: '#5b4ab5',  // Dark text on light chips
          800: '#4c3d95',
          900: '#3d2f75',  // Darkest - dark mode chip backgrounds
        },
        // Primary colors (same as brand for consistency)
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#7C63E6',
          600: '#7C3AED',
          700: '#5b4ab5',
          800: '#4c3d95',
          900: '#3d2f75',
        },
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        success: {
          50: '#ECFDF5',
          500: '#10B981',
          600: '#059669',
        },
        warning: {
          50: '#FFFBEB',
          500: '#F59E0B',
          600: '#D97706',
        },
        error: {
          50: '#FEF2F2',
          500: '#EF4444',
          600: '#DC2626',
        },
        info: {
          50: '#EFF6FF',
          500: '#3B82F6',
          600: '#2563EB',
        },
      },
      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '24px',
        '2xl': '28px',
        '3xl': '32px',
        '4xl': '48px',
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        full: '9999px',
      },
    },
  },
  plugins: [],
}
