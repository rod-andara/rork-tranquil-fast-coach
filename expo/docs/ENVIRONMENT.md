# Environment & Stack Documentation

**Date:** October 19, 2025
**Branch:** chore/ui-ux-audit
**Main Branch:** main

---

## Tech Stack

### Core Framework
- **Expo SDK:** 52.0.0
- **React Native:** 0.76.9
- **React:** 18.3.1
- **React DOM:** 18.3.1
- **Expo Router:** ~4.0.0

### Navigation
- **Expo Router:** File-based routing system
- **@react-navigation/native:** ^7.0.14
- **React Native Screens:** ~4.4.0
- **React Native Gesture Handler:** ~2.20.2
- **React Native Safe Area Context:** 4.12.0

### Styling & UI
- **NativeWind:** ^4.1.23 (Tailwind CSS for React Native)
- **Tailwind CSS:** 3.4.18
- **Expo Linear Gradient:** ~14.0.0
- **Expo Blur:** ~14.0.0
- **Lucide React Native:** ^0.475.0 (Icon library)

### State Management
- **Zustand:** ^5.0.2 (Lightweight state management)
- **@tanstack/react-query:** ^5.83.0 (Server state management)

### Storage & Data
- **@react-native-async-storage/async-storage:** 1.23.1
- **@react-native-community/netinfo:** 11.4.1

### Charts & Visualization
- **react-native-chart-kit:** ^6.12.0 (⚠️ Unmaintained - consider migrating to Victory Native XL)
- **react-native-svg:** 15.8.0

### Native Features
- **Expo Notifications:** ~0.29.0
- **Expo Task Manager:** ~12.0.0
- **Expo Haptics:** ~14.0.1
- **Expo Location:** ~18.0.0
- **Expo Image:** ~2.0.0
- **Expo Image Picker:** ~16.0.0
- **Expo Font:** ~13.0.0

### Web Support
- **React Native Web:** ~0.19.13
- **React Native WebView:** 13.12.5
- **Expo Web Browser:** ~14.0.0

### Build & Development
- **TypeScript:** ~5.8.3
- **Babel:** ^7.25.2
- **Metro:** ^0.81.0
- **ESLint:** ^9.37.0
- **eslint-config-expo:** ~8.0.1

---

## Project Structure

```
/app
├── (tabs)/               # Tab-based navigation (main app screens)
│   ├── _layout.tsx      # Tab bar layout
│   ├── home.tsx         # Timer home screen (main dashboard)
│   ├── fast.tsx         # Active fasting screen
│   ├── progress.tsx     # Progress/stats screen
│   ├── learn.tsx        # Educational content & recipes
│   └── settings.tsx     # Settings & preferences
├── onboarding/          # Onboarding flow
│   ├── welcome.tsx      # Welcome screen
│   ├── track-succeed.tsx # Feature explanation
│   └── choose-plan.tsx  # Plan selection (16:8, 18:6, etc.)
├── _layout.tsx          # Root layout
├── index.tsx            # Entry point (redirects to onboarding or home)
├── paywall.tsx          # Premium upgrade screen
└── +not-found.tsx       # 404 screen

/components              # Reusable UI components
├── CircularProgress.tsx # Circular timer progress indicator
└── StatCard.tsx         # Stats display cards

/constants               # Theme constants (legacy, migrating to /theme)
└── theme.ts             # Original theme file

/theme                   # New design token system
└── tokens.ts            # Design tokens from UI/UX audit

/store                   # Zustand state management
└── fastStore.ts         # Fasting state (current fast, history, plan)

/hooks                   # Custom React hooks
└── useFastTimer.ts      # Timer logic hook

/utils                   # Utility functions
└── fastingUtils.ts      # Fasting calculations (formatTime, getPlanDuration)

/assets                  # Images, fonts, icons
└── images/
    ├── icon.png
    ├── splash-icon.png
    ├── adaptive-icon.png
    └── favicon.png
```

---

## Configuration Files

### NativeWind Setup
- **tailwind.config.js:** Tailwind configuration with design tokens
- **babel.config.js:** Babel configuration for NativeWind

### Dark Mode
- **Enabled:** `userInterfaceStyle: "automatic"` in app.json
- **Implementation:** Uses system color scheme preferences

### iOS Configuration
- **Bundle Identifier:** com.tranquilfastcoach.app
- **Deployment Target:** iOS 15.1+
- **New Architecture:** Enabled
- **Background Modes:** Background processing for notifications

### Android Configuration
- **Package:** com.tranquilfastcoach.app
- **Permissions:** Vibrate, boot completed, exact alarms

---

## Known Issues & Warnings

### expo-doctor Warnings (Non-blocking)
1. **react-native-chart-kit:**
   - Status: Unmaintained
   - Impact: No New Architecture support
   - Recommendation: Migrate to Victory Native XL or Recharts
   - Priority: P2 (Medium - can be addressed in future iterations)

2. **ESLint Peer Dependency:**
   - Warning: eslint-plugin-react-hooks expects eslint ^8, but project uses ^9
   - Impact: No functional impact, linting works correctly
   - Status: Expected with Expo SDK 52

---

## Dependencies Resolution

### Fixed Version Mismatches
The following packages were updated to match Expo SDK 52 requirements:
- @expo/vector-icons: 14.1.0 → ~14.0.4
- @react-native-async-storage/async-storage: 2.1.2 → 1.23.1
- expo-haptics: 13.0.1 → ~14.0.1
- react-native: 0.76.6 → 0.76.9
- eslint-config-expo: 9.2.0 → ~8.0.1
- @react-navigation/native: ^7.1.6 → ^7.0.14

All packages are now compatible with Expo SDK 52.0.0.

---

## Design System Migration

### Current State
- **Legacy theme:** `/constants/theme.ts` (StyleSheet-based)
- **New design tokens:** `/theme/tokens.ts` (NativeWind-compatible)
- **Migration status:** In progress (Phase 1)

### Design Token System
Based on the comprehensive UI/UX audit (see `/docs/STYLE_DIRECTIONS.md`), the new design system includes:

#### Color Palette
- **Primary:** Purple scale (#7C3AED as main brand color)
- **Neutral:** Gray scale for text and backgrounds (WCAG AA compliant)
- **Semantic:** Success (green), Warning (amber), Error (red), Info (blue)

#### Typography Scale
- 12pt (caption) → 48pt (timer display)
- All sizes meet WCAG AA minimum (11pt+)
- Clear hierarchy with 6 semantic levels

#### Spacing Scale
- 4pt-based grid system (4, 8, 12, 16, 24, 32, 48)
- Consistent with iOS design conventions

#### Border Radius
- 8pt (subtle) → 24pt (buttons) → full circles

#### Shadows
- Three levels: sm, md, lg
- Optimized for both light and dark modes

---

## Accessibility Compliance

### WCAG 2.2 AA Requirements
- **Text Contrast:** ≥4.5:1 for normal text, ≥3:1 for large text
- **Touch Targets:** ≥44×44pt for all interactive elements
- **Text Size:** ≥11pt minimum (12pt recommended)
- **Color Independence:** Information not conveyed by color alone

### Verified Contrast Ratios
- White on primary-600: 8.2:1 ✅ (AAA)
- neutral-600 on white: 7.5:1 ✅ (AAA)
- neutral-500 on white: 4.6:1 ✅ (AA)

---

## Development Workflow

### Start Development Server
```bash
npm start                # Start Expo dev server with Rork integration
npm run start-web        # Start web version
npm run start-web-dev    # Start web with debug logs
```

### Linting
```bash
npm run lint             # Run ESLint
```

### Health Check
```bash
npx expo-doctor          # Validate project health
npx expo install --fix   # Fix dependency version mismatches
```

---

## Target Markets

### Primary
- **United States:** 12-hour time format, imperial units
- **United Kingdom:** 24-hour time format, metric/stone

### Secondary
- **Switzerland:** Multilingual (DE, FR, IT), metric
- **EU:** Various languages, metric, GDPR compliance
- **Brazil:** Portuguese, metric, 24-hour format

---

## Next Steps (Phase 1)

1. ✅ Environment setup complete
2. ✅ Design tokens created
3. ⏳ Refactor Timer home screen (app/(tabs)/home.tsx)
4. 🔜 Apply consistent spacing and typography
5. 🔜 Fix contrast and accessibility issues
6. 🔜 Verify touch targets meet 44×44pt minimum

---

**Last Updated:** October 19, 2025
**Maintained By:** Development Team
