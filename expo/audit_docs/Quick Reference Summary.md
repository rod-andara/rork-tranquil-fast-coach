# Quick Reference Summary
## Rork Tranquil Fast Coach UI/UX Fixes

---

## 🚨 Three Critical Issues

### 1. Timer Text Too Large
- **Problem:** Timer wraps inside circle (e.g., "47:01:26")
- **Fix:** Change `text-4xl` → `text-3xl`, add `adjustsFontSizeToFit`
- **Files:** `app/(tabs)/home.tsx`, `app/(tabs)/fast.tsx`

### 2. Dark Mode Not Working
- **Problem:** Toggle works but theme doesn't change
- **Fix:** Connect `isDarkMode` state to `useColorScheme` in root layout
- **Files:** `app/_layout.tsx`

### 3. Learn Tab Images Missing
- **Problem:** Images not loading from Unsplash URLs
- **Fix:** Add placeholder, error handling, change cache policy
- **Files:** `app/(tabs)/learn.tsx`

---

## 📋 Implementation Order

1. **Fix Timer** (15 min) - Quick win, high impact
2. **Implement Dark Mode** (20 min) - High visibility
3. **Fix Images** (20 min) - Improves Learn tab
4. **Standardize Spacing** (30 min) - Consistency
5. **Improve Stats Cards** (20 min) - Visual hierarchy
6. **Enhance Progress Bar** (15 min) - Better feedback
7. **Systematize Colors** (25 min) - Maintainability
8. **Improve Empty States** (30 min) - First-time UX
9. **Typography Audit** (30 min) - Polish
10. **Accessibility** (40 min) - Compliance

**Total Estimated Time:** ~4 hours

---

## 🎯 Quick Win Tasks (Do These First)

1. **Timer Fix** - 15 minutes, immediate visual improvement
2. **Dark Mode** - 20 minutes, users are asking for this
3. **Images** - 20 minutes, makes Learn tab usable

These three tasks will resolve all P0 issues in under 1 hour.

---

## 📁 Files You'll Modify Most

- `app/(tabs)/home.tsx` - Timer, spacing, stats
- `app/(tabs)/fast.tsx` - Timer, progress bar, spacing
- `app/(tabs)/learn.tsx` - Images
- `app/_layout.tsx` - Dark mode
- `app/(tabs)/progress.tsx` - Spacing, empty states
- `app/(tabs)/settings.tsx` - Spacing

---

## 🔧 Key Technical Notes

### NativeWind is Working ✅
- Already installed and configured correctly
- `global.css` imported
- Babel and Metro configs are correct
- Just needs dark mode connection

### Dark Mode Implementation
```typescript
// In app/_layout.tsx
import { useColorScheme } from 'nativewind';
const { isDarkMode } = useFastStore();
const { setColorScheme } = useColorScheme();

useEffect(() => {
  setColorScheme(isDarkMode ? 'dark' : 'light');
}, [isDarkMode, setColorScheme]);
```

### Timer Fix
```typescript
// Change this:
<Text className="text-4xl font-bold ...">

// To this:
<Text 
  className="text-3xl font-bold ..."
  adjustsFontSizeToFit={true}
  numberOfLines={1}
  minimumFontScale={0.5}
>
```

### Image Fix
```typescript
// Add these props to expo-image:
placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**-oJ-pWB' }}
onError={(e) => console.log('Image Error:', e)}
cachePolicy="disk"
transition={200}
```

---

## 📊 Priority Matrix

| Task | Impact | Effort | Priority |
|------|--------|--------|----------|
| Timer fix | High | Low | P0 |
| Dark mode | High | Medium | P0 |
| Images | Medium | Medium | P0 |
| Spacing | Medium | Low | P1 |
| Stats cards | Medium | Low | P1 |
| Progress bar | Medium | Low | P1 |
| Colors | Low | Medium | P2 |
| Empty states | Low | Medium | P2 |
| Typography | Low | Low | P2 |
| Accessibility | High | High | P2 |

---

## ✅ Testing Checklist

### Must Test
- [ ] Timer displays correctly on Home and Fast screens
- [ ] Dark mode toggle switches theme
- [ ] Images load in Learn tab
- [ ] App doesn't crash

### Should Test
- [ ] Spacing looks consistent
- [ ] Stats cards have correct colors
- [ ] Progress bar is visible at 0%
- [ ] Empty states are friendly

### Nice to Test
- [ ] VoiceOver navigation
- [ ] Dynamic type scaling
- [ ] Offline image caching
- [ ] Performance metrics

---

## 🚀 Using with Claude Code

### Option 1: Copy Individual Prompts
Open `claude_code_implementation_guide.md` and copy each task's prompt.

### Option 2: Use /plan Feature
```
@claude_code_implementation_guide.md

Create a plan to implement all P0 and P1 tasks from this guide.
```

### Option 3: One-by-One
```
Implement Task 1 from the implementation guide: Fix Timer Text Overflow
```

---

## 📝 Commit Message Templates

```bash
# P0 Fixes
git commit -m "fix(timer): reduce font size and add auto-scaling"
git commit -m "feat(theme): implement dark mode with color scheme sync"
git commit -m "fix(learn): add image placeholders and error handling"

# P1 Enhancements
git commit -m "refactor(spacing): standardize margins and padding"
git commit -m "enhance(stats): improve visual hierarchy with colors"
git commit -m "enhance(progress): improve bar visibility at 0%"

# P2 Polish
git commit -m "refactor(colors): replace hardcoded hex with Tailwind"
git commit -m "enhance(empty): improve empty state messaging"
git commit -m "refactor(typography): standardize font sizes and weights"
git commit -m "feat(a11y): add accessibility labels and roles"
```

---

## 🎨 Design System Quick Reference

### Colors
- Primary: `primary-600` (#7C3AED)
- Success: `success-500` (#10B981)
- Error: `error-500` (#EF4444)
- Neutral text: `neutral-600` (#4B5563)
- Secondary text: `neutral-500` (#6B7280)

### Typography
- Screen titles: `text-2xl font-bold`
- Section headings: `text-xl font-semibold`
- Body: `text-base`
- Secondary: `text-sm text-neutral-500`
- Captions: `text-xs text-neutral-500`

### Spacing
- Section margin: `mb-6` (24pt)
- Card gap: `gap-3` (12pt) or `gap-4` (16pt)
- Content padding: `px-4` (16pt)
- Large breathing room: `mb-8` (32pt)

---

## 🔗 Related Documents

1. **Full Implementation Guide:** `claude_code_implementation_guide.md`
2. **Issue Analysis:** `ui_issues_analysis.md`
3. **Style Guide:** `audit_docs/Style Directions - Rork Tranquil Fast Coach.md`
4. **Audit Notes:** `audit_docs/ui_audit_notes.md`

---

**Last Updated:** October 20, 2025  
**Status:** Ready for Implementation

