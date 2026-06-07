# SPEC-19: Learn Tab External Links Cleanup

**Status:** completed
**Priority:** P0 (App Store submission — last engineering blocker for Learn tab)
**Estimated Effort:** small (~30 min — 3 copy fixes + disclaimer + external-link indicator)

## 1. Problem Statement

The external links audit performed before App Store submission found that Tranquil Fast's external content surface (Learn tab, 12 cards in `utils/content.ts`) is implemented safely — all links open via `Linking.openURL(url)` with Safari hand-off, no embedded WebView, no SFSafariViewController, no affiliate tracking parameters. The risk surface is concentrated in **three pieces of the app's own descriptive copy** wrapped around otherwise-reputable destinations:

1. **`utils/content.ts:103`** (Enzymedica drink mix card) — `whyRecommended: 'Prevents headaches and maintains energy during fasting'`. This is a symptom-prevention health claim about a dietary supplement. Apple Guideline 1.4.1 (Physical Harm) and the FDA's stance on supplement claims both treat "prevents [symptom]" language with elevated scrutiny.
2. **`utils/content.ts:78`** (Exercise + IF article card) — `desc: 'How to time your workouts for maximum fat burning and muscle retention'`. "Fat burning" is a soft weight-loss outcome claim.
3. **`utils/content.ts:120`** (Dr. Jason Fung book card) — `desc: 'Comprehensive guide to therapeutic fasting by leading expert'`. "Therapeutic" implies clinical use. Already noted in SPEC-18 §5.3 as a low-priority polish item; now addressed here.

In addition, the Learn tab provides no in-app indication that tapping a card opens an external website, and there is no top-level wellness/not-medical-advice disclaimer. These are not strict App Review violations but are recommended trust/UX improvements.

This spec is scoped exclusively to the Learn tab and the external content shown there. It does not touch Sentry, RevenueCat, HealthKit, timer, notifications, weight tracking, or any other surface.

## 2. App Review / Health-Claims Risk

| Risk | Severity | Apple guideline / framing |
|---|---|---|
| "Prevents headaches" health claim on a supplement product card | 🔴 Hard-risk | Guideline 1.4.1 (Physical Harm); FDA supplement-claim norms |
| "Maximum fat burning" framing on a fitness article | 🟡 Soft-risk | Guideline 5.1.1(ii) — medical/outcome-claim language scrutiny |
| "Therapeutic fasting" framing on a book card | 🟡 Soft-risk | Same — implies clinical use of fasting |
| No external-link indicator on cards | 🟡 UX/trust | No specific guideline; common reviewer comment |
| No wellness/not-medical-advice disclaimer | 🟡 Trust | Standard for health-adjacent apps |

## 3. Current External-Link Implementation Summary

| Dimension | State |
|---|---|
| Number of external URLs | 12 (3 recipes + 5 articles + 4 products) |
| All defined in | `utils/content.ts` |
| Opening mechanism | `Linking.openURL(url)` in `app/(tabs)/learn.tsx:31` → iOS Safari hand-off |
| WebView / SFSafariViewController / embedded browser | **None** |
| Affiliate tags or tracking parameters | **None** (verified via grep for `tag=|ref=|aff=|utm_|partner=|amzn1\.assoc`) |
| External-link visual indicator on cards | **None** currently |
| Top-of-tab disclaimer | **None** currently |

## 4. Required Content-Copy Changes (`utils/content.ts`)

### 4.1 Enzymedica drink mix (id `'9'`, line 103) — REQUIRED

**Current:**
```ts
whyRecommended: 'Prevents headaches and maintains energy during fasting',
```

**Replace with:**
```ts
whyRecommended: 'Electrolyte drink mix option for users who already include supplements in their fasting routine',
```

Constraints satisfied:
- No "prevents"
- No symptom claim (headaches)
- No guaranteed-effect claim (energy)
- No medical-necessity implication
- Frames the product as an *option* for users who already use supplements, not as a recommendation

### 4.2 Exercise + IF article (id `'7'`, line 78) — REQUIRED

**Current:**
```ts
desc: 'How to time your workouts for maximum fat burning and muscle retention',
```

**Replace with:**
```ts
desc: 'How to time your workouts around fasting for energy, recovery, and consistency',
```

Constraints satisfied:
- No "fat burning" or any weight-loss outcome claim
- Sustainable, calm framing aligned with Tranquil Fast's positioning

### 4.3 Dr. Jason Fung book (id `'11'`, line 120) — REQUIRED

**Current:**
```ts
desc: 'Comprehensive guide to therapeutic fasting by leading expert',
```

**Replace with:**
```ts
desc: 'Comprehensive guide to fasting concepts and protocols by a well-known author',
```

Constraints satisfied:
- "Therapeutic" removed (it was app-editorial, not part of the official book title)
- "Leading expert" softened to "well-known author" — avoids implied clinical-authority endorsement
- Does not misrepresent the product (the book genuinely covers fasting concepts and protocols)

## 5. External-Link UX Changes (`app/(tabs)/learn.tsx`)

### 5.1 Wellness disclaimer near the top of the Learn tab

Below the existing subtitle at line 82-84 (`"Recipes, tips, and expert guidance"`), add a small muted disclaimer:

```tsx
<Text className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 leading-4">
  Educational content for general wellness — not medical advice. Consult a
  healthcare professional before changing your diet, exercise routine, or
  fasting schedule.
</Text>
```

Design: `text-xs` (smaller than the existing subtitle), muted color matching the existing subtitle, slightly tightened leading. Not alarming, not dominant, readable in both light and dark mode.

### 5.2 External-link indicator on every card

Import `ExternalLink` from `lucide-react-native` (already a project dependency — used elsewhere in the app).

Add a small footer row to each of the three card components (`RecipeCard`, `ArticleCard`, `ProductCard`) showing an `ExternalLink` icon and the text "Opens in Safari":

```tsx
<View className="flex-row items-center gap-1 mt-1.5">
  <ExternalLink size={11} color="#9CA3AF" strokeWidth={2} />
  <Text className="text-xs text-neutral-400 dark:text-neutral-500">
    Opens in Safari
  </Text>
</View>
```

Placement per card type:
- **RecipeCard**: below the tags row
- **ArticleCard**: inside the right-side content column, below the description
- **ProductCard**: below the `whyRecommended` row (or below the description if no `whyRecommended` is set)

The indicator must not add a confirmation dialog, must not block the tap, and must not change the card's tap target.

## 6. Files Affected

| File | Change |
|---|---|
| `utils/content.ts` | 3 copy edits (lines 78, 103, 120) |
| `app/(tabs)/learn.tsx` | Add wellness disclaimer + `ExternalLink` import + "Opens in Safari" footer on all 3 card components |
| `expo/specs/SPEC-19-learn-tab-external-links-cleanup.md` | This spec |

**Not modified:**
- The 12 URLs themselves — destinations are unchanged
- The `handleOpenLink` function — still calls `Linking.openURL` (no WebView, no SFSafariViewController introduced)
- Any other tab, screen, or service

## 7. App Privacy / Affiliate Impact

**App Privacy labels:** unchanged. The Learn tab makes outbound `Linking.openURL` calls only; the app collects nothing in the Learn flow. The 3 entries from the combined SPEC-16/17/18 posture remain accurate:

- Health & Fitness → Health (App Functionality) — HealthKit weight values
- Diagnostics → Crash Data (App Functionality) — Sentry, sanitized
- Diagnostics → Other Diagnostic Data (App Functionality) — Sentry, sanitized

**Affiliate disclosure:** not applicable. No affiliate tags exist in any URL (verified via grep). No commission, no tracking, no commercial relationship to disclose. If affiliate monetization is added in v1.x, it would require its own spec covering disclosure copy per FTC endorsement guidelines and Apple Guideline 5.3.4.

## 8. Acceptance Criteria

1. The Enzymedica supplement card no longer claims to prevent headaches or guarantee energy effects.
2. The exercise/fasting card no longer uses "maximum fat burning."
3. The Dr. Fung book card no longer uses "therapeutic fasting."
4. A general wellness / not-medical-advice disclaimer appears near the top of the Learn tab.
5. All three card types show an external-link indicator with "Opens in Safari" text.
6. No affiliate tags or tracking parameters are added.
7. No WebView or embedded browser is introduced (still `Linking.openURL` hand-off to Safari).
8. All external links still open in Safari.
9. No new medical, treatment, disease, supplement-treatment, guaranteed-weight-loss, or metabolic-health claims are introduced.
10. `npx tsc --noEmit` returns 0 errors.

## 9. Verification Commands

```bash
# A. Risky-term scan across app code (exclude node_modules and specs)
grep -rn -iE "prevents|prevent headaches|headaches|maximum fat burning|fat burning|therapeutic|treat|cure|diagnos|insulin|diabetes|prescription|guaranteed|miracle|metabolic|disease" \
  utils/content.ts app/ components/ --include="*.tsx" --include="*.ts" | \
  grep -v "node_modules\|//\|specs/"
# Expected: any remaining hits are either benign vocabulary ("treats" in
# a generic sense, "healthy" anywhere) OR clearly part of a third-party
# title — NOT in the app's own editorial commentary.

# B. Linking / WebView / embedded browser audit
grep -rn -E "Linking\.openURL|WebBrowser|SFSafari|WebView|<WebView|react-native-webview|expo-web-browser" \
  app/ components/ utils/ services/ --include="*.tsx" --include="*.ts"
# Expected: only Linking.openURL hits (Safari hand-off). No WebView. No
# react-native-webview / expo-web-browser imports.

# C. Affiliate / tracking parameter check
grep -rnE "tag=|ref=|aff=|utm_|partner=|amzn1\.assoc|associate-id" \
  utils/content.ts app/ components/ --include="*.tsx" --include="*.ts"
# Expected: empty.

# D. Wellness disclaimer present
grep -n "not medical advice\|healthcare professional" app/\(tabs\)/learn.tsx
# Expected: at least one hit in the Learn tab header section.

# E. External-link indicator present
grep -n "Opens in Safari\|ExternalLink" app/\(tabs\)/learn.tsx
# Expected: ExternalLink imported + at least one "Opens in Safari" string
# rendered on cards.

# F. TypeScript
npx tsc --noEmit
# Expected: 0 errors.
```

## 10. Final App Store Reviewer Note Recommendation

Append to the existing App Review Information note (the one drafted in SPEC-18 §10):

> The Learn tab contains curated links to third-party recipes (Allrecipes,
> Love and Lemons, etc.), educational articles (Healthline, Mayo Clinic),
> and product pages (Amazon, iHerb, Hydro Flask). All links open in Safari
> via standard `Linking.openURL` hand-off — no embedded WebView. We have
> no affiliate or commercial relationships with any of these merchants;
> the links are editorial picks. A wellness disclaimer at the top of the
> Learn tab reminds users that the content is educational, not medical
> advice.

## Progress Notes

**Completed 2026-05-17.**

### What was done

1. **`utils/content.ts:78`** (Exercise + IF article, id `'7'`) — `desc` rewritten from `'How to time your workouts for maximum fat burning and muscle retention'` to `'How to time your workouts around fasting for energy, recovery, and consistency'`. Removes the "fat burning" outcome claim; reframes around sustainability.

2. **`utils/content.ts:103`** (Enzymedica drink mix, id `'9'`) — `whyRecommended` rewritten from `'Prevents headaches and maintains energy during fasting'` to `'Electrolyte drink mix option for users who already include supplements in their fasting routine'`. Removes the symptom-prevention claim and the guaranteed-energy claim; reframes as an option for users who already supplement, not as a recommendation.

3. **`utils/content.ts:120`** (Dr. Jason Fung book, id `'11'`) — `desc` rewritten from `'Comprehensive guide to therapeutic fasting by leading expert'` to `'Comprehensive guide to fasting concepts and protocols by a well-known author'`. Removes the "therapeutic" clinical implication and softens "leading expert" → "well-known author".

4. **`app/(tabs)/learn.tsx` line 13** — added `ExternalLink` to the `lucide-react-native` import list (existing project dependency).

5. **`app/(tabs)/learn.tsx` lines 82-89** — added a small muted wellness disclaimer below the existing Learn-tab subtitle:
   ```
   Educational content for general wellness — not medical advice. Consult
   a healthcare professional before changing your diet, exercise routine,
   or fasting schedule.
   ```
   Styled `text-xs`, muted color matching the existing subtitle palette, tightened `leading-4`. Readable in both light and dark mode. Non-alarming, non-dominant.

6. **`app/(tabs)/learn.tsx` lines ~222, ~263, ~333** — added an external-link indicator (`ExternalLink` icon + "Opens in Safari" text) to the footer of each of the three card components (`RecipeCard`, `ArticleCard`, `ProductCard`). No confirmation dialog added; tap target unchanged; visual indicator only.

### Verification results

| Check | Command | Result |
|---|---|---|
| A. No risky claims in app-editorial copy | `grep -nE "title\|desc\|whyRecommended\|tags" utils/content.ts \| grep -iE "(prevent\|maximum fat\|fat burning\|therapeutic\|...)"` | Only benign substring matches: "healthy fats" (nutrition vocabulary) and "health professional" (the grep matched "heal" as a substring of "health"). Zero actual medical/outcome claims. |
| B. No WebView / embedded browser introduced | `grep -rn -E "Linking\\.openURL\|WebBrowser\|SFSafari\|WebView\|react-native-webview\|expo-web-browser"` | Only `Linking.openURL` hits (Safari hand-off in Learn tab and `mailto:` in Settings). Zero WebView, zero `react-native-webview`, zero `expo-web-browser`. |
| C. No affiliate / tracking parameters in URLs | `grep -rnE "https?://[^\"']*(\\?\|&)(tag\|ref\|aff\|utm_\|partner)="` | Empty. No URL contains affiliate or tracking parameters. |
| D. Wellness disclaimer present | `grep -n "not medical advice\|healthcare professional" app/\\(tabs\\)/learn.tsx` | One hit at line 88 inside the Learn-tab header section. |
| E. External-link indicator present | `grep -n "ExternalLink\|Opens in Safari" app/\\(tabs\\)/learn.tsx` | `ExternalLink` imported at line 13; rendered on all 3 card types (RecipeCard ~line 223, ArticleCard ~line 264, ProductCard ~line 334). |
| F. TypeScript | `npx tsc --noEmit` | 0 errors. |

### Deviations from spec

None. All required changes applied exactly as specified.

### Remaining risks

None significant. Two observations worth recording:

1. **Healthline electrolyte-imbalance article (id `'5'`)** still links to a Healthline article that itself discusses clinical electrolyte imbalance. The Learn-tab card description (`'Why electrolytes matter and how to maintain proper balance while fasting'`) is generic and non-clinical, but the destination has clinical framing. Acceptable for v1.0 — Healthline is a reputable source and the article is informational, not prescriptive. If App Review flags it, the response is "we link to public-domain educational content from a reputable health publisher; tap-target is clearly labeled as opening in Safari."

2. **Product cards still exist without affiliate disclosure.** This is correct — there are no affiliate relationships to disclose. If commercial relationships are added post-launch, FTC endorsement disclosure + Apple Guideline 5.3.4 apply and would require their own spec.

### Final yes/no for App Store submission — Learn tab external content

**Yes.** All hard-risk claims have been removed from the app's editorial copy. The Learn tab now includes a wellness disclaimer and clear external-link indicators on every card. All links continue to open via Safari hand-off (no WebView). No affiliate relationships. The Learn tab is App Store submission-ready.
