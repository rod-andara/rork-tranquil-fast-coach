# SPEC-18: HealthKit Usage Description Fix + App Review Cleanup

**Status:** completed
**Priority:** P0 (App Store submission hard blocker — usage description accuracy required by Apple Guideline 5.1.1)
**Estimated Effort:** small (~20 min — copy edits + console gating + one Learn-tab content tweak)

## 1. Problem Statement

The HealthKit audit performed prior to this spec found that Tranquil Fast's HealthKit integration is narrowly scoped, optional, and on-device-only — but the `NSHealthUpdateUsageDescription` string in `app.json` claims the app writes "weight and fasting data" to Apple Health. In reality, the app only writes weight (via `AppleHealthKit.saveWeight()`). No fasting data is ever written to HealthKit.

Apple Guideline 5.1.1(i) requires usage descriptions to accurately describe the data being accessed. Mismatches between declared and actual data access are one of the most common reasons for HealthKit-related App Review rejection in 2025–2026.

This spec corrects that inaccuracy, tightens the read-side description for clarity, and applies four additional small cleanup items identified during the audit.

## 2. App Review Risk

| Issue | Severity | Apple guideline / rule |
|---|---|---|
| Write usage description claims fasting data is written, but app only writes weight | 🔴 Hard blocker | Guideline 5.1.1(i) — usage strings must accurately describe data accessed |
| Read description uses vague "personalized insights" phrasing | 🟡 Soft risk | Guideline 5.1.1 prefers concrete, user-benefit-focused descriptions |
| Production console statements emit HealthKit error data | 🟡 Soft risk | Not a guideline violation but inconsistent with SPEC-16 privacy posture; defense-in-depth |
| Learn-tab content uses "medical professional" phrasing | 🟢 Cosmetic | Guideline 5.1.1(ii) warns against medical-claim framing for non-medical apps |

## 3. Current HealthKit Implementation Summary (post-SPEC-16/17, pre-SPEC-18)

| Dimension | Status |
|---|---|
| Data types read | Weight (`HKQuantityTypeIdentifierBodyMass`) only |
| Data types written | Weight only |
| Other data types accessed | None |
| Permission strings location | `app.json:27-28` (`NSHealthShareUsageDescription`, `NSHealthUpdateUsageDescription`) |
| Permission request timing | User-initiated only — "Connect Apple Health" button on onboarding or Settings tab |
| Optionality | Fully optional — "Skip for now" link present in onboarding; all features work without HealthKit |
| Data egress (Sentry/RC/network/logs) | None (verified post-SPEC-16 and SPEC-17 audits) |
| Medical claims in HealthKit copy | None |

## 4. Required Copy Changes

### 4.1 `app.json` — Write usage description (HARD BLOCKER)

**Current** (`app.json:28`):
```json
"NSHealthUpdateUsageDescription": "We need access to write your weight and fasting data to Apple Health for a complete health picture and seamless integration with your other health apps."
```

**Replace with:**
```json
"NSHealthUpdateUsageDescription": "We write your weight entries to Apple Health so you have a single, consistent record across all your health apps."
```

Rationale: accurate (writes only weight, not fasting), specific (mentions "weight entries"), grounded in user benefit ("single, consistent record").

### 4.2 `app.json` — Read usage description (clarity improvement)

**Current** (`app.json:27`):
```json
"NSHealthShareUsageDescription": "We need access to read your weight from Apple Health to automatically track your progress and provide personalized insights."
```

**Replace with:**
```json
"NSHealthShareUsageDescription": "We read your weight from Apple Health so your existing entries appear in Tranquil Fast automatically — no need to re-enter them."
```

Rationale: drops the vague "personalized insights" phrase (the app has no ML insights engine — just a chart with statistical aggregates). Replaces it with a concrete, verifiable user benefit (no re-entry).

## 5. Optional Cleanup Items

### 5.1 Console statement gating — `app/onboarding/health-sync.tsx`

**Current** (line 36):
```ts
console.error('[HealthSync] Failed to init HealthKit:', error);
```

**Replace with:**
```ts
if (__DEV__) console.error('[HealthSync] Failed to init HealthKit:', error);
```

The `error` argument is from `react-native-health`, which can echo back internal state in its error message. Per SPEC-16 defense-in-depth pattern, this should be production-suppressed.

### 5.2 Console statement gating — `components/AppleHealthCard.tsx`

Nine `console.log` / `console.error` statements at lines 28-30, 36, 38, 41, 46, 50-51, 72, 74. All HealthKit-related. All should be wrapped in `if (__DEV__)`. Pattern matches the SPEC-16 treatment applied to `utils/appleHealth.ts`.

### 5.3 Learn-tab content wording — `utils/content.ts:125`

**Current:**
```ts
whyRecommended: 'Evidence-based approach from medical professional',
```

Context: this is the `whyRecommended` field on a product card (id `'11'`, "The Complete Guide to Fasting by Dr. Jason Fung") in the Learn tab's static content data. The card is user-facing.

**Replace with:**
```ts
whyRecommended: 'Evidence-informed approach from a health professional',
```

Rationale: "Evidence-informed" is softer than "evidence-based" (which implies clinical certainty), "health professional" is broader than "medical professional" and aligns with wellness-app framing. Avoids any appearance of medical-authority claims attached to the app's own editorial.

**Observation (out of scope for this spec):** the same content item's `desc` field reads `'Comprehensive guide to therapeutic fasting by leading expert'`. The word "therapeutic" is a soft medical claim, but this string is describing a third-party book (not the app's functionality). Rewording a published book's description could misrepresent the product. Recommendation: leave as-is. If App Review flags it, the response is "this describes a third-party book sold on Amazon, not the app's functionality."

## 6. Files Affected

| File | Change |
|---|---|
| `app.json` | Rewrite `NSHealthShareUsageDescription` (line 27) and `NSHealthUpdateUsageDescription` (line 28) |
| `app/onboarding/health-sync.tsx` | Gate the single `console.error` at line 36 behind `__DEV__` |
| `components/AppleHealthCard.tsx` | Gate all 9 console statements behind `__DEV__` |
| `utils/content.ts` | Soften `whyRecommended` at line 125 |
| `expo/specs/SPEC-18-healthkit-usage-description-cleanup.md` | This spec |

**Not modified:**
- `utils/appleHealth.ts` — already fully `__DEV__`-gated per SPEC-16
- `components/WeightEntryModal.tsx` — already uses `__DEV__`-aware patterns
- All Sentry call sites — preserved per spec instruction; SPEC-16 sanitization is already in place

## 7. App Privacy Label Impact

v1.0 should declare exactly the following in App Store Connect → App Privacy:

### Data Used to Track You
**None.**

### Data Linked to You
**None.**

### Data Not Linked to You

| Apple Category | Sub-type | Purpose | Source |
|---|---|---|---|
| **Health & Fitness** | Health | App Functionality | HealthKit weight values read into app memory |
| **Diagnostics** | Crash Data | App Functionality | Sentry (post-SPEC-16, sanitized) |
| **Diagnostics** | Other Diagnostic Data | App Functionality | Sentry (post-SPEC-16, sanitized) |

**Clarification on the Health & Fitness entry:** Apple's framework treats reading data from Apple Health into the app's process as "collection" even when the app does not transmit the data off-device. The honest declaration is therefore "Health → Not Linked to User → App Functionality." This is the strongest privacy posture the app can claim while still using HealthKit at all.

The combined privacy label after SPEC-16, SPEC-17, and SPEC-18 has **three** Not-Linked-to-User entries total — no Identifiers, no Purchases, no Usage Data, no Contact Info, no Linked-to-User data.

## 8. Acceptance Criteria

1. `NSHealthUpdateUsageDescription` no longer mentions "fasting data." Mentions only weight.
2. `NSHealthShareUsageDescription` no longer uses the phrase "personalized insights." Uses concrete user-benefit language.
3. The app still requests only Weight / BodyMass permission (no scope expansion).
4. All HealthKit-related production console statements in `app/onboarding/health-sync.tsx` and `components/AppleHealthCard.tsx` are wrapped in `if (__DEV__)`.
5. `utils/content.ts:125` no longer uses "medical professional" language.
6. No new medical claims have been introduced anywhere.
7. `npx tsc --noEmit` passes with 0 errors.

## 9. Verification Commands

```bash
# A. Verify usage descriptions no longer mention fasting in write description
grep -n "fasting" app.json
# Expected: no hit inside NSHealthUpdateUsageDescription

# B. Verify both descriptions mention only weight as the HealthKit data type
grep -nE "NSHealthShareUsageDescription|NSHealthUpdateUsageDescription" app.json
# Inspect: both should mention "weight" (the only data type), neither should mention "fasting data" or "insights"

# C. Confirm no new HealthKit data type permission is requested
grep -n "Permissions\." utils/appleHealth.ts
# Expected: only Permissions.Weight or Permissions.BodyMass references

grep -rn -iE "saveHeight|getHeight|saveBloodGlucose|getStepCount|saveSleepAnalysis|saveHeartRate" utils/ components/ --include="*.ts" --include="*.tsx"
# Expected: empty

# D. Confirm all health-related console statements are __DEV__-gated
grep -nB1 "console\." app/onboarding/health-sync.tsx components/AppleHealthCard.tsx
# Expected: every console.* line is either inline-prefixed with `if (__DEV__)` or inside an `if (__DEV__) { ... }` block

# E. Confirm "medical professional" language is removed
grep -rn "medical professional" utils/ app/ components/ --include="*.ts" --include="*.tsx"
# Expected: empty

# F. Confirm no new medical claims introduced
grep -rn -iE "treat|cure|diagnos|insulin|diabetes|metabolic disease|guaranteed weight loss|prescription" \
  app/ components/ utils/ --include="*.ts" --include="*.tsx" | \
  grep -vE "components/PremiumGate|services/revenuecat|specs/"
# Expected: any remaining hits should be benign third-party content descriptions only

# G. TypeScript
npx tsc --noEmit
# Expected: 0 errors
```

## 10. Final App Store Reviewer Note Recommendation

Add this to the App Review Information section in App Store Connect when submitting v1.0:

> Tranquil Fast requests Apple Health permission for weight data only, read and write. Permission is requested via a user-initiated Connect Apple Health button, with a visible Skip for now option. Users can use the app fully without granting Apple Health access; manual weight entry works regardless. No HealthKit data is transmitted off-device.

This preempts reviewer questions about HealthKit scope, optionality, and privacy posture, and aligns with the App Privacy label declarations.

## Progress Notes

**Completed 2026-05-17.**

### What was done

1. **`app.json` — `NSHealthUpdateUsageDescription`** rewritten from `"We need access to write your weight and fasting data to Apple Health for a complete health picture and seamless integration with your other health apps."` to `"We write your weight entries to Apple Health so you have a single, consistent record across all your health apps."` Accurate (weight only), specific, user-benefit-focused.

2. **`app.json` — `NSHealthShareUsageDescription`** rewritten from `"We need access to read your weight from Apple Health to automatically track your progress and provide personalized insights."` to `"We read your weight from Apple Health so your existing entries appear in Tranquil Fast automatically — no need to re-enter them."` Drops the vague "personalized insights" phrase.

3. **`app/onboarding/health-sync.tsx`** — wrapped the single `console.error` at the catch block in `if (__DEV__) console.error(...)`. Added an inline comment referencing SPEC-18 and the rationale (preventing native error strings from leaking HealthKit state to the device console buffer in production).

4. **`components/AppleHealthCard.tsx`** — wrapped all 9 console statements (3 in setup logs, 6 in connect/sync flows) in `if (__DEV__)` guards. Two patterns used: block form `if (__DEV__) { console.log(...); console.log(...); }` for the multi-line clusters at lines 30-34 and 54-57, inline form `if (__DEV__) console.X(...)` for the single-line calls.

5. **`utils/content.ts:125`** — `whyRecommended` field for the "Complete Guide to Fasting by Dr. Jason Fung" product card softened from `'Evidence-based approach from medical professional'` to `'Evidence-informed approach from a health professional'`. "Evidence-informed" is softer than "evidence-based"; "health professional" is broader than "medical professional". Avoids attaching clinical-authority framing to the app's own editorial commentary.

### Verification results

| Check | Command | Result |
|---|---|---|
| A. Fasting removed from write usage description | `grep -n "fasting" app.json` | Only hit is in `NSUserNotificationsUsageDescription` (legitimate — fasting reminders are a real notification feature). HealthKit write description is clean. |
| B. Both usage descriptions mention weight only | `grep -nE "NSHealthShare\|NSHealthUpdate" app.json` | Both lines confirmed updated. Neither mentions "fasting data" or "personalized insights". Both mention "weight". |
| C. Only Weight/BodyMass permission referenced | `grep -n "Permissions" utils/appleHealth.ts` | Two references to `Permissions?.Weight` / `Permissions?.BodyMass`. Both resolve to `HKQuantityTypeIdentifierBodyMass`. Read array and write array each contain exactly `[weightPermission]`. |
| D. No non-weight HealthKit accessors | `grep -rn -iE "saveHeight\|getBloodGlucose\|getStepCount\|saveSleepAnalysis\|..." utils/ components/` | Empty. No scope expansion. |
| E. All HealthKit consumer console statements gated | `grep -nB1 "console\." app/onboarding/health-sync.tsx components/AppleHealthCard.tsx` | Every hit is either prefixed inline with `if (__DEV__)` or inside an `if (__DEV__) { ... }` block. Zero ungated production console statements remain in HealthKit consumer files. |
| F. "medical professional" language removed | `grep -rn "medical professional" utils/ app/ components/` | Empty. |
| G. No new medical claims | `grep -rn -iE "treat\|cure\|diagnos\|insulin\|diabetes\|prescription"` | Empty (after excluding benign third-party content descriptions and the spec files themselves). |
| H. TypeScript | `npx tsc --noEmit` | 0 errors. |

### Deviations from spec

None. All required changes applied. One observation noted in §5.3 of the spec but not acted upon: the same Dr. Fung product card at `utils/content.ts` has a `desc` field reading `'Comprehensive guide to therapeutic fasting by leading expert'`. The word "therapeutic" is a soft medical claim, but the field describes a third-party book (not the app's functionality), so rewording it could misrepresent the product. Left as-is per spec recommendation.

### Pending for App Store Connect (out of scope for this commit)

1. Update App Privacy labels per §7 of this spec — three Not-Linked-to-User entries: Health & Fitness → Health, Diagnostics → Crash Data, Diagnostics → Other Diagnostic Data. Zero Linked-to-User entries. Zero tracking.
2. Paste the recommended reviewer note from §10 into the App Review Information section in App Store Connect when submitting v1.0.

### Final yes/no for HealthKit App Store readiness

**Yes.** All four HealthKit blockers and soft risks identified in the prior audit are resolved by this spec. The integration is narrowly scoped (weight only), permission strings are accurate, no medical claims attached to app functionality, no data egress, full optionality preserved. Ready to ship.
