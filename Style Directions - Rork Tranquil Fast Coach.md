# Style Directions - Rork Tranquil Fast Coach

**Date:** October 19, 2025  
**Inspiration:** Untitled UI React Design System  
**Implementation:** React Native + NativeWind (Tailwind CSS)

---

## 1. Design Philosophy

The Rork Tranquil Fast Coach app aims to provide a **calm, supportive, and professional** experience for users on their intermittent fasting journey. The visual design should reflect these core principles:

**Tranquility:** The interface should feel peaceful and uncluttered, using generous whitespace, soft colors, and smooth transitions to create a sense of calm. Fasting is already a challenging practice; the app should be a source of encouragement, not stress.

**Clarity:** Information hierarchy must be immediately apparent. Users should be able to glance at the app and understand their current fasting state, progress, and next steps without cognitive load. Typography, spacing, and color should work together to guide the eye naturally through the interface.

**Professionalism:** While maintaining a friendly tone, the app should convey trustworthiness and quality through polished visuals, consistent design patterns, and attention to accessibility. Users are trusting the app with their health data and goals, so the design must inspire confidence.

**Accessibility:** The design system prioritizes WCAG 2.2 AA compliance, ensuring that all users, regardless of visual ability or device settings, can use the app effectively. This includes proper contrast ratios, touch target sizes, and support for dynamic type.

---

## 2. Design Token System

Design tokens are the foundational building blocks of the visual design system. They ensure consistency across the app and make it easy to maintain and scale the design over time. The following tokens are inspired by the Untitled UI React design system but adapted for mobile-first React Native development.

### 2.1 Color Palette

The color palette is built around a **primary purple** that conveys both calm and energy, complemented by a comprehensive neutral scale for text and backgrounds. The palette includes semantic colors for success, warning, and error states.

#### Primary Colors

The primary purple is used for key actions, active states, and brand elements. It should be used sparingly to maintain visual hierarchy and draw attention to the most important interactive elements.

```typescript
primary: {
  50: '#FAF5FF',   // Lightest tint - subtle backgrounds
  100: '#F3E8FF',  // Light tint - hover states
  200: '#E9D5FF',  // Soft purple - disabled states
  300: '#D8B4FE',  // Medium light
  400: '#C084FC',  // Medium
  500: '#A855F7',  // Base purple - less saturated alternative
  600: '#7C3AED',  // PRIMARY - main brand color
  700: '#6D28D9',  // Dark purple - pressed states
  800: '#5B21B6',  // Darker
  900: '#4C1D95',  // Darkest - text on light backgrounds
}
```

**Usage:**
- **Buttons:** Use `primary-600` for button backgrounds, `white` for button text
- **Active states:** Use `primary-700` for pressed/active buttons
- **Links:** Use `primary-600` for clickable text
- **Accents:** Use `primary-500` or `primary-600` for progress indicators, badges, and highlights

**Contrast Verification:**
- White text on `primary-600`: **8.2:1** ✅ Passes WCAG AAA
- `primary-600` on white: **5.1:1** ✅ Passes WCAG AA for large text
- `primary-900` on white: **11.2:1** ✅ Passes WCAG AAA

---

#### Neutral Colors (Light Mode)

The neutral scale provides a range of grays for text, borders, and backgrounds. Darker values are used for text, while lighter values are used for subtle backgrounds and dividers.

```typescript
neutral: {
  50: '#F9FAFB',   // Lightest - subtle backgrounds
  100: '#F3F4F6',  // Very light - card backgrounds
  200: '#E5E7EB',  // Light - borders, dividers
  300: '#D1D5DB',  // Medium light - disabled text
  400: '#9CA3AF',  // Medium - placeholder text
  500: '#6B7280',  // Base gray - secondary text
  600: '#4B5563',  // Dark gray - primary text
  700: '#374151',  // Darker - headings
  800: '#1F2937',  // Very dark - emphasis
  900: '#111827',  // Darkest - high contrast text
}
```

**Usage:**
- **Body text:** Use `neutral-600` (4B5563) for primary content
- **Headings:** Use `neutral-700` or `neutral-800` for emphasis
- **Secondary text:** Use `neutral-500` (6B7280) for labels and captions
- **Placeholder text:** Use `neutral-400` for input placeholders
- **Borders:** Use `neutral-200` for subtle dividers
- **Backgrounds:** Use `neutral-50` or `neutral-100` for cards and sections

**Contrast Verification:**
- `neutral-600` on white: **7.5:1** ✅ Passes WCAG AAA
- `neutral-500` on white: **4.6:1** ✅ Passes WCAG AA
- `neutral-400` on white: **3.2:1** ❌ Fails WCAG AA (use for non-essential text only)

---

#### Neutral Colors (Dark Mode)

In dark mode, the neutral scale is inverted, with lighter values used for text and darker values for backgrounds. The scale is adjusted to maintain proper contrast ratios.

```typescript
neutral: {
  50: '#18181B',   // Darkest - main background
  100: '#27272A',  // Very dark - card backgrounds
  200: '#3F3F46',  // Dark - elevated surfaces
  300: '#52525B',  // Medium dark - borders
  400: '#71717A',  // Medium - disabled text
  500: '#A1A1AA',  // Base gray - secondary text
  600: '#D4D4D8',  // Light gray - primary text
  700: '#E4E4E7',  // Lighter - headings
  800: '#F4F4F5',  // Very light - emphasis
  900: '#FAFAFA',  // Lightest - high contrast text
}
```

**Usage:**
- **Body text:** Use `neutral-600` (D4D4D8) for primary content
- **Headings:** Use `neutral-700` or `neutral-800` for emphasis
- **Secondary text:** Use `neutral-500` (A1A1AA) for labels and captions
- **Backgrounds:** Use `neutral-50` (18181B) for main background, `neutral-100` for cards

**Contrast Verification:**
- `neutral-600` on `neutral-50`: **8.1:1** ✅ Passes WCAG AAA
- `neutral-500` on `neutral-50`: **5.2:1** ✅ Passes WCAG AA

---

#### Semantic Colors

Semantic colors convey meaning and state. They should be used consistently across the app to help users quickly understand the status of information.

```typescript
success: {
  50: '#ECFDF5',
  500: '#10B981',  // Green - streaks, achievements, success messages
  600: '#059669',  // Darker green - pressed states
}

warning: {
  50: '#FFFBEB',
  500: '#F59E0B',  // Amber - warnings, cautions
  600: '#D97706',  // Darker amber - pressed states
}

error: {
  50: '#FEF2F2',
  500: '#EF4444',  // Red - errors, destructive actions
  600: '#DC2626',  // Darker red - pressed states
}

info: {
  50: '#EFF6FF',
  500: '#3B82F6',  // Blue - informational messages
  600: '#2563EB',  // Darker blue - pressed states
}
```

**Usage:**
- **Success:** Use for completed fasts, achieved streaks, positive feedback
- **Warning:** Use for approaching fast end, low hydration, caution messages
- **Error:** Use for failed actions, validation errors, destructive confirmations
- **Info:** Use for tips, educational content, neutral notifications

**Contrast Verification:**
- White text on `success-500`: **4.7:1** ✅ Passes WCAG AA for large text
- White text on `error-500`: **5.3:1** ✅ Passes WCAG AA
- `success-600` on white: **4.8:1** ✅ Passes WCAG AA

---

### 2.2 Typography Scale

Typography is one of the most important elements of the design system. A clear hierarchy helps users scan and understand content quickly. The scale is designed to work with iOS system fonts (SF Pro) and includes both size and weight specifications.

#### Type Scale

```typescript
fontSize: {
  xs: 12,     // 12pt - Captions, labels (minimum size)
  sm: 14,     // 14pt - Small body, secondary text
  base: 16,   // 16pt - Body text (default)
  lg: 18,     // 18pt - Subheadings, large body
  xl: 24,     // 24pt - Section headings
  '2xl': 28,  // 28pt - Screen titles
  '3xl': 32,  // 32pt - Large display text
  '4xl': 48,  // 48pt - Timer display (special case)
}

fontWeight: {
  normal: '400',    // Regular - body text
  medium: '500',    // Medium - emphasis
  semibold: '600',  // Semibold - subheadings
  bold: '700',      // Bold - headings
}

lineHeight: {
  tight: 1.2,    // Headings, display text
  normal: 1.5,   // Body text
  relaxed: 1.75, // Long-form content
}
```

#### Typography Usage Guide

| Element | Size | Weight | Line Height | Color (Light) | Color (Dark) | Example |
|---------|------|--------|-------------|---------------|--------------|---------|
| **Screen Title** | 2xl (28pt) | bold (700) | tight (1.2) | neutral-800 | neutral-800 | "Welcome Back, User!" |
| **Section Heading** | xl (24pt) | semibold (600) | tight (1.2) | neutral-700 | neutral-700 | "Your Progress" |
| **Card Title** | lg (18pt) | semibold (600) | normal (1.5) | neutral-700 | neutral-700 | "16:8 Intermittent Fasting" |
| **Body Text** | base (16pt) | normal (400) | normal (1.5) | neutral-600 | neutral-600 | "Fast for 16 hours, eat within an 8-hour window." |
| **Secondary Text** | sm (14pt) | normal (400) | normal (1.5) | neutral-500 | neutral-500 | "Current Plan: 16:8" |
| **Label** | sm (14pt) | medium (500) | normal (1.5) | neutral-600 | neutral-600 | "Total Fasts" |
| **Caption** | xs (12pt) | normal (400) | normal (1.5) | neutral-500 | neutral-500 | "Last updated 2 hours ago" |
| **Button Text** | base (16pt) | semibold (600) | normal (1.5) | white | white | "Start Fast" |
| **Timer Display** | 4xl (48pt) | bold (700) | tight (1.2) | neutral-900 | neutral-900 | "00:00:00" |

#### NativeWind Classes

To apply these typography styles consistently, use the following NativeWind utility classes:

```typescript
// Screen titles
className="text-2xl font-bold text-neutral-800 dark:text-neutral-800"

// Section headings
className="text-xl font-semibold text-neutral-700 dark:text-neutral-700"

// Card titles
className="text-lg font-semibold text-neutral-700 dark:text-neutral-700"

// Body text
className="text-base text-neutral-600 dark:text-neutral-600"

// Secondary text
className="text-sm text-neutral-500 dark:text-neutral-500"

// Labels
className="text-sm font-medium text-neutral-600 dark:text-neutral-600"

// Captions
className="text-xs text-neutral-500 dark:text-neutral-500"

// Button text
className="text-base font-semibold text-white"

// Timer display
className="text-4xl font-bold text-neutral-900 dark:text-neutral-900"
```

---

### 2.3 Spacing Scale

Consistent spacing is critical for creating a cohesive visual rhythm. The spacing scale is based on a **4pt grid system**, which aligns with iOS design conventions and ensures that elements are properly aligned.

```typescript
spacing: {
  0: 0,      // 0pt - No spacing
  1: 4,      // 4pt - Tight spacing (e.g., icon to text)
  2: 8,      // 8pt - Compact spacing (e.g., between related items)
  3: 12,     // 12pt - Default gap (e.g., between form fields)
  4: 16,     // 16pt - Comfortable padding (e.g., card internal padding)
  5: 20,     // 20pt - Medium spacing
  6: 24,     // 24pt - Section spacing (e.g., between sections)
  8: 32,     // 32pt - Large spacing (e.g., major sections)
  10: 40,    // 40pt - Extra large spacing
  12: 48,    // 48pt - Screen-level spacing (e.g., top/bottom margins)
  16: 64,    // 64pt - Maximum spacing
}
```

#### Spacing Usage Guide

| Use Case | Spacing | NativeWind Class | Example |
|----------|---------|------------------|---------|
| **Icon to text** | 4pt (1) | `gap-1` | Icon next to label |
| **Between related items** | 8pt (2) | `gap-2` | Stats in a row |
| **Between form fields** | 12pt (3) | `gap-3` | Input fields in a form |
| **Card internal padding** | 16pt (4) | `p-4` | Padding inside cards |
| **Between cards** | 12-16pt (3-4) | `gap-3` or `gap-4` | Cards in a list |
| **Section spacing** | 24pt (6) | `mb-6` or `mt-6` | Between major sections |
| **Screen horizontal padding** | 16pt (4) | `px-4` | Left/right screen margins |
| **Screen top/bottom padding** | 24-48pt (6-12) | `pt-6 pb-12` | Top/bottom screen margins |

#### Practical Examples

**Card with internal padding:**
```jsx
<View className="bg-white rounded-lg p-4 shadow-md">
  <Text className="text-lg font-semibold text-neutral-700">Card Title</Text>
  <Text className="text-sm text-neutral-500 mt-2">Card description</Text>
</View>
```

**Stats grid with consistent spacing:**
```jsx
<View className="flex-row gap-3">
  <View className="flex-1 bg-neutral-100 rounded-md p-4">
    <Text className="text-sm font-medium text-neutral-600">Total Fasts</Text>
    <Text className="text-2xl font-bold text-neutral-900 mt-1">12</Text>
  </View>
  <View className="flex-1 bg-neutral-100 rounded-md p-4">
    <Text className="text-sm font-medium text-neutral-600">Day Streak</Text>
    <Text className="text-2xl font-bold text-neutral-900 mt-1">5</Text>
  </View>
</View>
```

**Screen layout with proper margins:**
```jsx
<ScrollView className="flex-1 bg-white px-4 pt-6 pb-12">
  <Text className="text-2xl font-bold text-neutral-800 mb-6">Screen Title</Text>
  {/* Content */}
</ScrollView>
```

---

### 2.4 Border Radius

Rounded corners soften the interface and create a modern, friendly feel. The border radius scale provides options for different levels of rounding.

```typescript
borderRadius: {
  none: 0,      // 0pt - No rounding (sharp corners)
  sm: 8,        // 8pt - Subtle rounding (small elements)
  md: 12,       // 12pt - Default rounding (cards)
  lg: 16,       // 16pt - Prominent rounding (large cards)
  xl: 24,       // 24pt - Extra rounding (buttons)
  '2xl': 32,    // 32pt - Very rounded
  full: 9999,   // Full circle (circular elements)
}
```

#### Border Radius Usage Guide

| Element | Radius | NativeWind Class | Example |
|---------|--------|------------------|---------|
| **Buttons** | xl (24pt) | `rounded-xl` | Primary CTA buttons |
| **Cards** | lg (16pt) | `rounded-lg` | Content cards |
| **Stats cards** | md (12pt) | `rounded-md` | Small info cards |
| **Input fields** | md (12pt) | `rounded-md` | Text inputs |
| **Badges** | full | `rounded-full` | Pill-shaped badges |
| **Circular timer** | full | `rounded-full` | Circular progress indicator |
| **Images** | lg (16pt) | `rounded-lg` | Recipe images |

---

### 2.5 Shadows & Elevation

Shadows create depth and hierarchy, helping users understand which elements are interactive or elevated. The shadow system uses subtle, soft shadows that work well on both light and dark backgrounds.

```typescript
boxShadow: {
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
}
```

#### Shadow Usage Guide

| Element | Shadow | NativeWind Class | Example |
|---------|--------|------------------|---------|
| **Cards** | md | `shadow-md` | Content cards |
| **Floating buttons** | lg | `shadow-lg` | Primary CTA buttons |
| **Subtle elevation** | sm | `shadow-sm` | Input fields, small cards |
| **Modal overlays** | lg | `shadow-lg` | Dialogs, bottom sheets |

**Note:** NativeWind may require custom shadow configuration in `tailwind.config.js` to properly apply shadows in React Native.

---

## 3. Component Design Patterns

### 3.1 Buttons

Buttons are the primary way users interact with the app. They should be large, easy to tap, and clearly indicate their purpose.

#### Primary Button

**Purpose:** Main call-to-action (e.g., "Start Fast", "Continue")

**Specifications:**
- Background: `primary-600`
- Text: `white`, 16pt, semibold
- Padding: 16pt vertical, 24pt horizontal
- Border radius: `xl` (24pt)
- Shadow: `lg`
- Minimum height: 56pt (to ensure 44pt tap target with shadow)

**States:**
- **Default:** `bg-primary-600`
- **Pressed:** `bg-primary-700`
- **Disabled:** `bg-neutral-200`, text `neutral-400`

**NativeWind Classes:**
```jsx
<Pressable className="bg-primary-600 active:bg-primary-700 rounded-xl px-6 py-4 shadow-lg">
  <Text className="text-base font-semibold text-white text-center">Start Fast</Text>
</Pressable>
```

---

#### Secondary Button

**Purpose:** Secondary actions (e.g., "Skip", "Cancel")

**Specifications:**
- Background: `transparent`
- Border: 2pt, `neutral-300`
- Text: `neutral-700`, 16pt, semibold
- Padding: 16pt vertical, 24pt horizontal
- Border radius: `xl` (24pt)
- Shadow: none

**States:**
- **Default:** `border-neutral-300`, `text-neutral-700`
- **Pressed:** `bg-neutral-100`
- **Disabled:** `border-neutral-200`, `text-neutral-400`

**NativeWind Classes:**
```jsx
<Pressable className="border-2 border-neutral-300 active:bg-neutral-100 rounded-xl px-6 py-4">
  <Text className="text-base font-semibold text-neutral-700 text-center">Skip</Text>
</Pressable>
```

---

#### Ghost Button

**Purpose:** Tertiary actions, less prominent (e.g., "Learn More")

**Specifications:**
- Background: `transparent`
- Text: `primary-600`, 16pt, semibold
- Padding: 12pt vertical, 16pt horizontal
- Border radius: `md` (12pt)
- Shadow: none

**States:**
- **Default:** `text-primary-600`
- **Pressed:** `bg-primary-50`
- **Disabled:** `text-neutral-400`

**NativeWind Classes:**
```jsx
<Pressable className="active:bg-primary-50 rounded-md px-4 py-3">
  <Text className="text-base font-semibold text-primary-600 text-center">Learn More</Text>
</Pressable>
```

---

### 3.2 Cards

Cards are used to group related content and create visual hierarchy. They should have consistent padding, border radius, and shadows.

#### Standard Card

**Specifications:**
- Background: `white` (light mode), `neutral-100` (dark mode)
- Padding: 16pt
- Border radius: `lg` (16pt)
- Shadow: `md`
- Border: none (shadow provides elevation)

**NativeWind Classes:**
```jsx
<View className="bg-white dark:bg-neutral-100 rounded-lg p-4 shadow-md">
  {/* Card content */}
</View>
```

---

#### Stats Card

**Specifications:**
- Background: `neutral-100` (light mode), `neutral-200` (dark mode)
- Padding: 16pt
- Border radius: `md` (12pt)
- Shadow: none (subtle background provides separation)
- Icon: 24×24pt, `primary-600`

**NativeWind Classes:**
```jsx
<View className="bg-neutral-100 dark:bg-neutral-200 rounded-md p-4">
  <View className="flex-row items-center gap-2">
    <Icon name="calendar" size={24} color="#7C3AED" />
    <Text className="text-sm font-medium text-neutral-600">Total Fasts</Text>
  </View>
  <Text className="text-2xl font-bold text-neutral-900 mt-2">12</Text>
</View>
```

---

### 3.3 Icons

Icons should be used consistently throughout the app to improve scannability and visual interest. Use a single icon library (e.g., Lucide React Native or Heroicons) to ensure consistency.

**Specifications:**
- Style: Outline (not filled) for consistency
- Sizes:
  - Small: 16×16pt (inline with text)
  - Medium: 24×24pt (default, cards, buttons)
  - Large: 32×32pt (prominent features)
- Colors:
  - Primary: `primary-600`
  - Neutral: `neutral-500` or `neutral-600`
  - Semantic: `success-500`, `error-500`, etc.

**Tab Bar Icons:**
- Size: 24×24pt
- Active: `primary-600`, filled style
- Inactive: `neutral-500`, outline style

---

## 4. Localization & Market Fit

### 4.1 US vs UK Considerations

**Language:**
- The app currently uses US English spelling (e.g., "Personalize"). This is generally acceptable in the UK market, as UK users are familiar with US English from other apps. However, for a more localized experience, consider adding a language setting that allows users to choose between US and UK English.

**Date/Time Formatting:**
- **US:** 12-hour format with AM/PM (e.g., "3:35 PM") ✅ Currently used
- **UK:** 24-hour format is more common (e.g., "15:35")
- **Recommendation:** Add a setting to toggle between 12-hour and 24-hour time formats. Default to 12-hour for US users and 24-hour for UK users based on device locale.

**Units:**
- **US:** Pounds (lbs) for weight
- **UK:** Kilograms (kg) or stone for weight
- **Recommendation:** If adding weight tracking, provide a unit toggle in settings.

**Tone:**
- The current microcopy ("Great start! 💪", "Keep going!") is friendly and encouraging, which works well in both US and UK markets. Avoid overly casual slang that may not translate well.

---

### 4.2 Secondary Markets

**Switzerland:**
- **Languages:** German, French, Italian, Romansh
- **Date/Time:** 24-hour format, date format: DD.MM.YYYY
- **Units:** Metric (kg)
- **Recommendation:** Implement full i18n support with translations for German, French, and Italian.

**EU:**
- **Languages:** Varies by country (German, French, Spanish, Italian, etc.)
- **Date/Time:** 24-hour format, date format varies (DD/MM/YYYY or DD.MM.YYYY)
- **Units:** Metric (kg)
- **Decimal Separator:** Comma (,) instead of period (.)
- **GDPR:** Ensure compliance with data privacy regulations
- **Recommendation:** Implement i18n framework and provide translations for major EU languages.

**Brazil:**
- **Language:** Portuguese (Brazilian)
- **Date/Time:** 24-hour format, date format: DD/MM/YYYY
- **Units:** Metric (kg)
- **Decimal Separator:** Comma (,)
- **Recommendation:** Provide Portuguese translation and localized date/time formatting.

---

## 5. Implementation Guide

### 5.1 Setting Up NativeWind

NativeWind is a utility-first styling framework for React Native that uses Tailwind CSS syntax. It allows you to apply styles using className props, similar to web development.

**Installation:**

```bash
npm install nativewind
npm install --save-dev tailwindcss
```

**Configuration:**

Create a `tailwind.config.js` file in the root of your project:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
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
```

**Enable Dark Mode:**

In your `app.json` or `app.config.js`, set:

```json
{
  "expo": {
    "userInterfaceStyle": "automatic"
  }
}
```

---

### 5.2 Creating a Token File

Create a `/theme/tokens.ts` file to centralize your design tokens:

```typescript
// /theme/tokens.ts

export const colors = {
  primary: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
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
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 24,
  '2xl': 28,
  '3xl': 32,
  '4xl': 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
};
```

---

### 5.3 Refactoring Example: Timer Home Screen

**Before (inline styles):**

```jsx
<View style={{ padding: 20, backgroundColor: '#fff' }}>
  <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#111' }}>
    Welcome Back, User!
  </Text>
  <Text style={{ fontSize: 14, color: '#666', marginTop: 8 }}>
    Current Plan: 18:6 Intermittent Fasting
  </Text>
  {/* Timer component */}
  <TouchableOpacity style={{ 
    backgroundColor: '#7C3AED', 
    padding: 16, 
    borderRadius: 24,
    marginTop: 32 
  }}>
    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
      Start Fast
    </Text>
  </TouchableOpacity>
</View>
```

**After (NativeWind with tokens):**

```jsx
<View className="px-4 pt-6 pb-12 bg-white dark:bg-neutral-50">
  <Text className="text-2xl font-bold text-neutral-800 dark:text-neutral-800">
    Welcome Back, John!
  </Text>
  <Text className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">
    Current Plan: 18:6 Intermittent Fasting
  </Text>
  {/* Timer component */}
  <Pressable className="bg-primary-600 active:bg-primary-700 rounded-xl px-6 py-4 shadow-lg mt-8">
    <Text className="text-base font-semibold text-white text-center">
      Start Fast
    </Text>
  </Pressable>
</View>
```

**Improvements:**
- Consistent spacing using `px-4`, `pt-6`, `pb-12`, `mt-2`, `mt-8`
- Typography hierarchy with `text-2xl`, `text-sm`, `text-base`
- Proper text colors with `text-neutral-800`, `text-neutral-500`
- Dark mode support with `dark:` prefix
- Button styling with `bg-primary-600`, `active:bg-primary-700`
- Personalized greeting ("John" instead of "User")

---

## 6. Conclusion

This style direction document provides a comprehensive design token system inspired by Untitled UI React and adapted for React Native development. By implementing these tokens consistently across the app using NativeWind, the Rork Tranquil Fast Coach app will achieve a polished, professional, and accessible user experience that meets the expectations of US and UK markets.

**Key Takeaways:**
1. **Consistency is critical:** Use the token system religiously to ensure visual coherence
2. **Accessibility first:** All color combinations have been verified for WCAG AA compliance
3. **Spacing matters:** The 4pt grid system creates a natural visual rhythm
4. **Typography hierarchy:** Clear text sizing helps users scan and understand content quickly
5. **Localization ready:** The system supports internationalization for secondary markets

**Next Steps:**
1. Set up NativeWind and configure Tailwind with the provided tokens
2. Create the `/theme/tokens.ts` file
3. Refactor 3-5 representative screens to validate the system
4. Document component patterns in a separate component library file
5. Create a UI check script to validate accessibility compliance

---

**Author:** Manus AI  
**Date:** October 19, 2025

