# Claude Code Implementation Guide
## Rork Tranquil Fast Coach - UI/UX Enhancements

**Repository:** `https://github.com/rod-andara/rork-tranquil-fast-coach`  
**Branch:** `chore/ui-ux-audit`  
**Author:** Manus AI  
**Date:** October 20, 2025

---

## Overview

This guide provides a complete implementation plan for fixing critical UI issues and enhancing the Rork Tranquil Fast Coach application. Each task includes a ready-to-use prompt for Claude Code that can be copied directly into your chat.

The implementation is organized into **three priority tiers** to ensure the most impactful changes are made first. Each prompt is self-contained and includes specific file paths, line numbers where relevant, and verification steps.

---

## How to Use This Guide

1. **Open Claude Code** in your development environment
2. **Copy the prompt** for the task you want to implement
3. **Paste it into Claude Code** and let it make the changes
4. **Review the changes** using your version control diff
5. **Test the changes** locally before committing
6. **Move to the next task** once verified

You can also use the `/plan` feature in Claude Code by sharing this document and asking Claude to create a plan from it.

---

## 🚨 Priority 0: Critical Fixes

These issues are blocking a good user experience and must be fixed first.

---

### Task 1: Fix Timer Text Overflow in Circle

**Issue:** The timer text (e.g., "47:01:26") is too large for its circular container, causing it to wrap across multiple lines and break the layout.

**Impact:** High - Affects the primary feature (timer display) on both Home and Fast screens.

**Estimated Time:** 15 minutes

**Claude Code Prompt:**

```
You are implementing a fix for the Rork Tranquil Fast Coach app.

ISSUE: Timer text is too large and wraps inside the circular progress indicator.

FILES TO MODIFY:
1. app/(tabs)/home.tsx
2. app/(tabs)/fast.tsx

CHANGES REQUIRED:

In app/(tabs)/home.tsx:
- Find the timer Text component (around line 97-99)
- Change className from "text-4xl" to "text-3xl"
- Add these props to the Text component:
  - adjustsFontSizeToFit={true}
  - numberOfLines={1}
  - minimumFontScale={0.5}

In app/(tabs)/fast.tsx:
- Find the timer Text component (around line 115-117)
- Change className from "text-4xl" to "text-3xl"
- Add these props to the Text component:
  - adjustsFontSizeToFit={true}
  - numberOfLines={1}
  - minimumFontScale={0.5}

VERIFICATION:
- Timer text should fit on one line in both screens
- Font should scale down automatically if needed
- Text should remain readable (minimum 50% of original size)

Please implement these changes and show me the diff.
```

---

### Task 2: Implement Dark Mode Functionality

**Issue:** The dark mode toggle in Settings works (state changes) but doesn't actually apply a dark theme to the app.

**Impact:** High - Users expect dark mode to work when they toggle it.

**Estimated Time:** 20 minutes

**Claude Code Prompt:**

```
You are implementing dark mode functionality for the Rork Tranquil Fast Coach app.

ISSUE: Dark mode toggle exists but doesn't apply dark theme to the UI.

FILE TO MODIFY:
- app/_layout.tsx

CHANGES REQUIRED:

1. Add these imports at the top:
   import { useColorScheme } from 'nativewind';
   (useFastStore is already imported)

2. Inside the RootLayout component (around line 64):
   - Add: const { isDarkMode } = useFastStore();
   - Add: const { setColorScheme } = useColorScheme();

3. Add a useEffect to sync the color scheme:
   useEffect(() => {
     setColorScheme(isDarkMode ? 'dark' : 'light');
   }, [isDarkMode, setColorScheme]);

TECHNICAL NOTES:
- NativeWind's dark: classes require the colorScheme to be set
- The Zustand store already manages isDarkMode state
- This connects the store to NativeWind's theme system

VERIFICATION:
- Go to Settings and toggle Dark Mode
- All screens should switch between light and dark themes
- The dark: utility classes should now activate properly

Please implement these changes and show me the diff.
```

---

### Task 3: Fix Missing Images in Learn Tab

**Issue:** Recipe and product images are not loading in the Learn tab, showing only empty gray boxes.

**Impact:** Medium - Reduces visual appeal and usefulness of the Learn section.

**Estimated Time:** 20 minutes

**Claude Code Prompt:**

```
You are fixing image loading issues in the Rork Tranquil Fast Coach app.

ISSUE: Images in the Learn tab are not rendering from Unsplash URLs.

FILE TO MODIFY:
- app/(tabs)/learn.tsx

CHANGES REQUIRED:

1. In the RecipeCard component (around line 171-178):
   Update the Image component to include:
   - placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**-oJ-pWB' }}
   - onError={(e) => console.log('Recipe Image Error:', recipe.title, e)}
   - transition={200}
   - Change cachePolicy from "memory-disk" to "disk"

2. In the ProductCard component (around line 245-251):
   Update the Image component to include:
   - placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**-oJ-pWB' }}
   - onError={(e) => console.log('Product Image Error:', product.title, e)}
   - transition={200}
   - Change cachePolicy from "memory-disk" to "disk"

TECHNICAL NOTES:
- expo-image's disk cache is more reliable than memory-disk
- Blurhash provides a nice loading placeholder
- onError logging helps debug any remaining issues
- Transition adds smooth fade-in effect

VERIFICATION:
- Navigate to Learn tab
- Images should load and display correctly
- Check console for any error messages
- Verify smooth fade-in transition when images load

Please implement these changes and show me the diff.
```

---

## 🎨 Priority 1: High-Impact Enhancements

These improvements will significantly enhance visual consistency and usability.

---

### Task 4: Standardize Spacing System

**Issue:** Inconsistent spacing (margins, padding, gaps) across screens makes the UI feel unpolished.

**Impact:** Medium - Improves visual consistency and professional appearance.

**Estimated Time:** 30 minutes

**Claude Code Prompt:**

```
You are standardizing spacing across the Rork Tranquil Fast Coach app.

ISSUE: Inconsistent spacing between sections and components.

SPACING STANDARD (from style guide):
- Section bottom margin: mb-6 (24pt)
- Card gap: gap-3 (12pt) or gap-4 (16pt)
- Content padding: px-4 (16pt)
- Large breathing room: mb-8 (32pt)

FILES TO MODIFY:
1. app/(tabs)/home.tsx
2. app/(tabs)/fast.tsx
3. app/(tabs)/progress.tsx
4. app/(tabs)/learn.tsx

CHANGES REQUIRED:

In home.tsx:
- Ensure all major sections use mb-6 consistently
- Stats grid should use gap-3
- Verify contentContainerStyle padding is consistent

In fast.tsx:
- All cards should have mb-6
- Action buttons section should have mb-6
- Verify consistent padding in cards (p-4)

In progress.tsx:
- Stats grid should use gap-4
- Chart card should have consistent padding
- Section headers should have mb-4

In learn.tsx:
- Content cards should have mb-4
- Verify padding consistency in cards

VERIFICATION:
- Visually inspect all screens
- Spacing should feel rhythmic and consistent
- No awkward gaps or cramped sections

Please audit these files and implement spacing standardization.
```

---

### Task 5: Improve Stats Card Visual Hierarchy

**Issue:** All stat cards look identical, making it hard to distinguish their importance or meaning.

**Impact:** Medium - Better visual hierarchy improves scannability.

**Estimated Time:** 20 minutes

**Claude Code Prompt:**

```
You are improving the visual hierarchy of stat cards in the Rork Tranquil Fast Coach app.

ISSUE: All stat cards have the same appearance with no clear visual distinction.

FILE TO MODIFY:
- app/(tabs)/home.tsx

CHANGES REQUIRED:

Update the StatCard components (around lines 133-154):

1. Total Fasts card:
   - Keep iconColor="#7C3AED" (primary purple)
   - Keep iconBgColor="#F3F4F6"

2. Day Streak card:
   - Change iconColor to "#10B981" (success green)
   - Keep iconBgColor="#F3F4F6"
   - This semantic color indicates positive progress

3. Avg Hours card:
   - Keep iconColor="#7C3AED" (primary purple)
   - Keep iconBgColor="#F3F4F6"

DESIGN RATIONALE:
- Day Streak uses success green to highlight achievement
- Other metrics use primary purple for brand consistency
- Consistent background keeps cards unified

VERIFICATION:
- Day Streak card icon should be green
- Other cards should remain purple
- Visual hierarchy should be clear but not jarring

Please implement these changes and show me the diff.
```

---

### Task 6: Enhance Progress Bar Visual Feedback

**Issue:** Progress bar at 0% is nearly invisible, and the 4% minimum width is confusing.

**Impact:** Medium - Better visual feedback improves user understanding.

**Estimated Time:** 15 minutes

**Claude Code Prompt:**

```
You are improving the progress bar visual feedback in the Rork Tranquil Fast Coach app.

ISSUE: Progress bar is hard to see at 0% and has confusing minimum width.

FILE TO MODIFY:
- app/(tabs)/fast.tsx

CHANGES REQUIRED:

Find the Animated.View for the progress bar (around lines 153-161):

1. Remove the interpolate that sets minimum 4% width
2. Change the width style to:
   width: animatedWidth.interpolate({
     inputRange: [0, 100],
     outputRange: ['0%', '100%']
   })

3. Update the progress bar container (line 152):
   - Add a subtle border to make it more visible when empty
   - Change className to: "h-2 bg-neutral-200 dark:bg-neutral-300 rounded-full overflow-hidden w-full border border-neutral-300 dark:border-neutral-400"

DESIGN RATIONALE:
- True 0% width is more honest and less confusing
- Border makes empty state visible
- Maintains smooth animation

VERIFICATION:
- Progress bar should be visible even at 0%
- Width should accurately reflect progress percentage
- Animation should remain smooth

Please implement these changes and show me the diff.
```

---

## ✨ Priority 2: Polish and Refinement

These tasks add final polish and improve overall quality.

---

### Task 7: Systematize Color Palette

**Issue:** Some components use hardcoded hex colors instead of Tailwind classes.

**Impact:** Low - Improves maintainability and consistency.

**Estimated Time:** 25 minutes

**Claude Code Prompt:**

```
You are systematizing the color palette in the Rork Tranquil Fast Coach app.

ISSUE: Hardcoded hex colors instead of Tailwind utility classes.

FILES TO MODIFY:
1. app/(tabs)/home.tsx
2. app/(tabs)/fast.tsx
3. components/CircularProgress.tsx

CHANGES REQUIRED:

Search for and replace hardcoded colors:
- #7C3AED → use primary-600 class or pass as prop
- #FFFFFF → use white class or pass as prop
- #E5E7EB → use neutral-200 class or pass as prop
- #10B981 → use success-500 class or pass as prop
- #EF4444 → use error-500 class or pass as prop

In CircularProgress.tsx:
- The color and backgroundColor props should remain as props
- But document that they should receive Tailwind color values
- Add a comment: // Pass Tailwind colors like '#7C3AED' (primary-600)

In home.tsx and fast.tsx:
- Replace hardcoded colors in StatCard with Tailwind classes
- Replace hardcoded colors in icon props with Tailwind values
- Ensure all colors come from tailwind.config.js

VERIFICATION:
- Search codebase for remaining hex colors
- Verify app appearance is unchanged
- Colors should all be sourced from design system

Please implement these changes and show me the diff.
```

---

### Task 8: Improve Empty States

**Issue:** Empty states (no active fast, no history) are basic and could be more engaging.

**Impact:** Low - Better empty states improve first-time user experience.

**Estimated Time:** 30 minutes

**Claude Code Prompt:**

```
You are improving empty states in the Rork Tranquil Fast Coach app.

ISSUE: Empty states are basic and could be more engaging.

FILES TO MODIFY:
1. app/(tabs)/fast.tsx
2. app/(tabs)/progress.tsx

CHANGES REQUIRED:

In fast.tsx (No Active Fast state, around lines 46-58):
- Add an icon above the text (use Clock from lucide-react-native)
- Increase icon size to 64
- Add color: #D1D5DB (neutral-300)
- Add a "Start Fast" button that navigates to home
- Improve copy: "No Active Fast" → "Ready to Start Fasting?"
- Improve description: Add "Tap the button below to begin your fasting journey."

In progress.tsx:
- Check if there's an empty state for 0 fasts
- If not, add one similar to the fast.tsx empty state
- Use TrendingUp icon
- Message: "Start Your First Fast"
- Description: "Begin tracking your fasting journey to see your progress here."

DESIGN NOTES:
- Empty states should be encouraging, not negative
- Include clear call-to-action
- Use neutral colors to avoid alarm

VERIFICATION:
- View empty states by clearing app data
- States should be friendly and actionable
- Icons should be visible and appropriately sized

Please implement these changes and show me the diff.
```

---

### Task 9: Typography Consistency Audit

**Issue:** Typography sizing and weights are inconsistent across screens.

**Impact:** Low - Improves visual polish and readability.

**Estimated Time:** 30 minutes

**Claude Code Prompt:**

```
You are auditing and fixing typography consistency in the Rork Tranquil Fast Coach app.

ISSUE: Inconsistent typography sizing and weights across screens.

TYPOGRAPHY STANDARD (from style guide):
- Screen titles: text-2xl font-bold
- Section headings: text-xl font-semibold
- Card titles: text-lg font-semibold
- Body text: text-base (no weight or font-normal)
- Secondary text: text-sm text-neutral-500
- Labels: text-sm font-medium
- Captions: text-xs text-neutral-500

FILES TO AUDIT:
1. app/(tabs)/home.tsx
2. app/(tabs)/fast.tsx
3. app/(tabs)/progress.tsx
4. app/(tabs)/learn.tsx
5. app/(tabs)/settings.tsx

CHANGES REQUIRED:

For each file:
1. Verify screen titles use text-2xl font-bold
2. Verify section headings use text-xl font-semibold
3. Verify body text uses text-base
4. Verify secondary text uses text-sm text-neutral-500
5. Fix any deviations from the standard

SPECIFIC CHECKS:
- "Welcome Back!" should be text-2xl font-bold
- "Your Progress" should be text-xl font-semibold
- "Learn & Grow" should be text-2xl font-bold
- Card descriptions should be text-sm text-neutral-500

VERIFICATION:
- Typography should feel consistent across all screens
- Hierarchy should be immediately clear
- No random font sizes or weights

Please audit these files and implement typography standardization.
```

---

### Task 10: Accessibility Improvements

**Issue:** Some accessibility features are missing or incomplete.

**Impact:** Medium - Improves usability for all users, especially those with disabilities.

**Estimated Time:** 40 minutes

**Claude Code Prompt:**

```
You are improving accessibility in the Rork Tranquil Fast Coach app.

ISSUE: Missing or incomplete accessibility features.

FILES TO MODIFY:
1. app/(tabs)/home.tsx
2. app/(tabs)/fast.tsx
3. app/(tabs)/progress.tsx
4. app/(tabs)/learn.tsx
5. components/StatCard.tsx
6. components/CircularProgress.tsx

CHANGES REQUIRED:

1. Add accessibilityLabel to all TouchableOpacity components
2. Add accessibilityHint where the action isn't obvious
3. Add accessibilityRole to all interactive elements
4. Ensure all Text components have proper semantic meaning

Specific additions:

In home.tsx:
- Start/Stop Fast button: accessibilityLabel="Start fasting timer" accessibilityRole="button"
- StatCards: accessibilityLabel="Total fasts: {value}" accessibilityRole="text"

In fast.tsx:
- Pause button: accessibilityLabel="Pause fasting timer" accessibilityHint="Temporarily stop the timer"
- End button: accessibilityLabel="End fast" accessibilityHint="Complete your current fast"

In CircularProgress.tsx:
- Add accessibilityLabel="Fasting progress: {progress}%"
- Add accessibilityRole="progressbar"

In learn.tsx:
- Content cards: accessibilityLabel="{title}" accessibilityHint="Tap to view details"

VERIFICATION:
- Enable VoiceOver on iOS
- Navigate through the app
- All interactive elements should be announced clearly
- All actions should be understandable from audio alone

Please implement these accessibility improvements and show me the diff.
```

---

## 📋 Testing Checklist

After implementing all changes, verify the following:

### Visual Testing
- [ ] Timer text fits properly in circles on Home and Fast screens
- [ ] Dark mode toggle works and applies theme correctly
- [ ] Images load in Learn tab with smooth transitions
- [ ] Spacing feels consistent across all screens
- [ ] Day Streak card has green icon
- [ ] Progress bar is visible even at 0%
- [ ] Empty states are friendly and actionable
- [ ] Typography hierarchy is clear and consistent

### Functional Testing
- [ ] Timer starts and stops correctly
- [ ] Dark mode persists after app restart
- [ ] Images cache properly (check by going offline)
- [ ] All buttons have proper touch feedback
- [ ] Navigation works correctly
- [ ] State persists across app restarts

### Accessibility Testing
- [ ] VoiceOver announces all elements correctly
- [ ] All interactive elements are reachable
- [ ] Touch targets are at least 44×44pt
- [ ] Color contrast meets WCAG AA standards
- [ ] Text scales properly with system font size

### Performance Testing
- [ ] App launches quickly
- [ ] Scrolling is smooth
- [ ] Images load without blocking UI
- [ ] No memory leaks or crashes

---

## 🚀 Deployment Checklist

Before submitting to TestFlight:

1. [ ] All P0 issues resolved
2. [ ] All P1 enhancements implemented
3. [ ] Local testing complete
4. [ ] Code reviewed and cleaned up
5. [ ] Commit messages are clear
6. [ ] Branch is up to date with main
7. [ ] Build succeeds without warnings
8. [ ] TestFlight build uploaded
9. [ ] Internal testing on TestFlight
10. [ ] User feedback collected

---

## 📝 Notes for Claude Code

When using these prompts with Claude Code:

1. **One task at a time:** Don't try to implement multiple tasks in a single session
2. **Review diffs carefully:** Always review the changes before accepting
3. **Test immediately:** Test each change before moving to the next
4. **Commit frequently:** Commit after each successful task
5. **Use descriptive commit messages:** Follow conventional commits format

Example commit messages:
```
fix(timer): reduce font size to prevent text overflow
feat(theme): implement dark mode functionality
fix(learn): add image loading error handling and caching
refactor(spacing): standardize spacing system across all screens
enhance(stats): improve visual hierarchy with semantic colors
```

---

## 🎯 Success Metrics

After completing this implementation plan, you should see:

1. **User Experience:** Smooth, polished interface with no visual glitches
2. **Consistency:** Uniform spacing, typography, and color usage
3. **Functionality:** Dark mode works, images load, timer displays correctly
4. **Accessibility:** VoiceOver users can navigate the entire app
5. **Performance:** Fast load times, smooth animations, reliable caching

---

## 📚 Additional Resources

- **Style Guide:** `audit_docs/Style Directions - Rork Tranquil Fast Coach.md`
- **UI Audit Notes:** `audit_docs/ui_audit_notes.md`
- **Competitor Analysis:** `audit_docs/Competitor Discovery - Intermittent Fasting Apps.md`
- **Design Patterns:** `audit_docs/Fasting App Design Patterns from Dribbble.md`

---

**End of Implementation Guide**

For questions or issues, refer to the original audit documentation or create a new issue in the repository.

