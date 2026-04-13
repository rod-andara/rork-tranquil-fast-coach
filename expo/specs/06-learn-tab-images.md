# SPEC-06: Learn Tab Images

**Status:** pending (deferred -- discuss with product owner)
**Priority:** P2 (nice to have)
**Estimated Effort:** medium (30-90 min)

## Problem
Learn tab content cards use gradient backgrounds with icons instead of actual images. The current design looks generic compared to competitors.

## Context
The current gradient+icon approach was an **intentional design choice** (documented in `CRITICAL_FIXES_COMPLETED.md`) made after Unsplash URLs caused loading and reliability issues. The gradients are visually consistent and work offline.

**Decision needed:** Are actual images worth the trade-off of increased bundle size (~200-300KB for 8 images)?

## Option A: Keep Current Design (Recommended for v1)
- No changes needed
- Reliable, offline-friendly
- Consistent visual style
- Move this spec to `completed/` with note "deferred by design"

## Option B: Bundled Local Images
If images are desired:

### Exact Fix

1. Source 8 royalty-free images (400x300px, JPEG, ~30KB each):
   - 4 recipe images (healthy meals/smoothies)
   - 4 article images (wellness/meditation/exercise)
   
2. Save to `expo/assets/images/learn/`:
   ```
   recipe-1.jpg, recipe-2.jpg, recipe-3.jpg, recipe-4.jpg
   article-1.jpg, article-2.jpg, article-3.jpg, article-4.jpg
   ```

3. In `expo/utils/content.ts`, add an `image` field to each `ContentItem`:
   ```typescript
   image: require('@/assets/images/learn/recipe-1.jpg'),
   ```

4. In `expo/app/(tabs)/learn.tsx`, replace gradient backgrounds with:
   ```typescript
   <Image source={item.image} style={{ width: '100%', height: 160, borderTopLeftRadius: 12, borderTopRightRadius: 12 }} resizeMode="cover" />
   ```

### Files to Modify
- `expo/utils/content.ts` (add image field to items)
- `expo/app/(tabs)/learn.tsx` (replace gradient with Image)
- Add 8 images to `expo/assets/images/learn/`

## Verification Steps
1. Learn tab loads without delay
2. All card images display correctly
3. Images look good in both light and dark mode
4. App bundle size increase is <500KB

## Notes
- Do NOT use remote URLs (Unsplash, etc.) -- they cause loading issues and require network
- Use `Image` from `react-native`, not `expo-image`, to keep it simple
- Images must be committed to git (they're bundled in the binary)
- Product/supplement cards could keep the gradient style since they link to external purchases
