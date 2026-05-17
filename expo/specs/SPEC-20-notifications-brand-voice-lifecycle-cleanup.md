# SPEC-20: Notifications Brand-Voice + Lifecycle Cleanup

**Status:** completed
**Priority:** P0 (App Store submission — final engineering blocker for notification surface)
**Estimated Effort:** small (~30 min — one copy file rewrite, four store-side cancel calls, app.json cleanup)

## 1. Problem Statement

The notifications audit performed before App Store submission found that the notification system is technically privacy-safe (local-only, no APNs, no push tokens, no backend, no PII transmitted) but has four remaining issues that block a clean v1.0 launch:

1. **Notification copy violates the Tranquil Fast brand voice.** All four milestone notifications use high-pressure hype ("crushing it!", "Outstanding!", "Amazing work!") and unverifiable health claims ("Fat-burning mode activated!", "Peak autophagy zone!", "Maximum benefits unlocked!"). This is the exact same class of language SPEC-19 just removed from the Learn tab.
2. **Notifications are not cancelled when they become inaccurate.** Ending a fast, pausing it, changing plans, or disabling notifications mid-fast all leave already-scheduled milestone notifications live. They fire later with celebratory copy claiming the user hit milestones they did not.
3. **`app.json` declares `UIBackgroundModes: ["remote-notification"]`** but the app uses no remote notifications. The expo-notifications plugin config explicitly sets `enableBackgroundRemoteNotifications: false`. Self-contradiction worth removing before App Review questions it.
4. **Production console statements** in `services/notifications.ts`, `utils/notificationsUtils.ts`, and `store/fastStore.ts` are not `__DEV__`-gated — inconsistent with the SPEC-16/SPEC-18 defense-in-depth pattern.

This spec is scoped exclusively to notifications. It does not touch Sentry, RevenueCat, HealthKit, weight tracking, Learn tab, or any other surface.

## 2. App Review / Brand-Voice Risk

| Risk | Severity | Apple guideline / framing |
|---|---|---|
| "Fat-burning", "autophagy", "maximum benefits" — health/metabolic claims in notification bodies | 🔴 High | Guideline 5.1.1(ii) — health-claim language scrutiny. Also undermines SPEC-19 work. |
| High-pressure hype ("crushing it", "Outstanding", "Amazing work") in a calm/non-shaming-positioned app | 🔴 High | Guideline 2.3.1 — accurate representation. Inconsistent with App Store description copy. |
| Notifications continue to fire after fast ended/paused/cancelled | 🟡 Medium | Guideline 4.5.4 — notification accuracy and relevance |
| `UIBackgroundModes: ["remote-notification"]` declared without remote notification use | 🟡 Medium | Guideline 2.5.1 — declared capabilities must be actually used |
| Ungated production console output | 🟢 Low | Defense-in-depth consistency with SPEC-16/SPEC-18 |

## 3. Current Notification Implementation Summary

| Dimension | State |
|---|---|
| Notification type | Local scheduled only — no remote, no APNs, no Expo push tokens, no backend |
| Package | `expo-notifications@~0.32.16` |
| Permission request | `Notifications.requestPermissionsAsync()` in `services/notifications.ts:20`, triggered only when user taps Start Fast (with notifications enabled) |
| Scheduling trigger | `fastStore.startFast()` → `scheduleMilestones()` → 4 milestones at 12/16/18/20h |
| Cancellation triggers | **Only** at the start of `scheduleMilestones` when a new fast begins (clears prior schedule) |
| User disable | `notificationsEnabled` boolean in `fastStore`, toggle UI in Settings tab and Fast tab |
| User timing customization | None (12/16/18/20h are hardcoded) |
| PII in notification payloads | None (no userName, weight, goal, plan name) |
| Telemetry (Sentry/RC/network) | None — notifications fire on-device only |

## 4. Required Notification Copy Changes

**File:** `utils/notificationsUtils.ts`, lines 22-27.

Replace all four milestone titles and bodies with calm, factual, non-shaming copy. No emojis. No exclamation marks unless truly necessary. No health/metabolic/weight-loss claims.

| When | New title | New body |
|---|---|---|
| 12h | `12 hours of fasting` | `You've reached the 12-hour mark. Listen to your body and break your fast when you're ready.` |
| 16h | `16 hours of fasting` | `You've reached your typical 16:8 window. There's no pressure to keep going — eat when it's right for you.` |
| 18h | `18 hours of fasting` | `You're at 18 hours. Stay hydrated, and remember: ending your fast is a choice, not a failure.` |
| 20h | `20 hours of fasting` | `You've reached 20 hours. Whenever you choose to break your fast, that's your win for today.` |

**Forbidden terms in any current or future notification body:** `fat burning`, `fat-burning`, `autophagy`, `peak`, `maximum`, `crushing`, `outstanding`, `amazing work`, `unlocked`, `metabolic`, `guaranteed`, `burn fat`, `streak`. Verification grep is in §11.

## 5. Required Lifecycle Cancellation Changes

### 5.1 Add `cancelFastingNotifications()` utility

**File:** `utils/notificationsUtils.ts`.

```ts
export async function cancelFastingNotifications(): Promise<void> {
  try {
    if (Platform.OS === 'web') return;
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (__DEV__) console.log('[notificationsUtils] cancelled all scheduled notifications');
  } catch (e) {
    if (__DEV__) console.log('[notificationsUtils] cancel error', e);
  }
}
```

Rationale for using `cancelAllScheduledNotificationsAsync()` rather than identifier-based cancellation: the app schedules only fasting milestone notifications in v1.0. There is no risk of cancelling unrelated scheduled notifications because there are none. If v1.1 adds other notification types (e.g., weight-entry reminders), this function will need to migrate to identifier-based cancellation. Documented inline.

### 5.2 Call `cancelFastingNotifications()` from `store/fastStore.ts` at four lifecycle points

| Action | Why | Where |
|---|---|---|
| `endFast()` | The user explicitly ended the fast; remaining milestones are no longer accurate | After clearing `currentFast`, before `saveToStorage` |
| `pauseFast()` | Scheduled milestones fire at absolute times; pause/resume desynchronizes them from actual fast elapsed time | After toggling `isRunning` |
| `updatePlan()` | This action sets `currentFast: null` — equivalent to ending the fast | After clearing `currentFast` |
| `setNotificationsEnabled(false)` | User disabled notifications mid-fast; any already-scheduled ones must not fire | When `enabled === false` |

`startFast()` already cancels via the first line of `scheduleMilestones()`. No change needed there, but `scheduleMilestones` can now call `cancelFastingNotifications()` for consistency rather than duplicating the cancel-then-schedule logic.

### 5.3 Pause/resume note

Cancellation on `pauseFast()` is intentionally one-way: pausing cancels remaining milestones, and resuming does NOT re-schedule them. This is safer than firing inaccurate milestones for v1.0 simplicity. A future v1.1 polish could re-schedule based on adjusted elapsed time. Documented in code comments.

## 6. `app.json` Capability Cleanup

### 6.1 Remove `remote-notification` from `UIBackgroundModes`

**Current** (`app.json:22-25`):
```json
"UIBackgroundModes": [
  "remote-notification"
],
```

**Replace with** (remove the entry; if no other background modes remain, remove the array entirely):
```json
"UIBackgroundModes": []
```

Or, cleaner, drop the `UIBackgroundModes` key entirely from the `infoPlist` object since no background modes are actually needed.

This aligns with the existing expo-notifications plugin config that already sets `enableBackgroundRemoteNotifications: false` (`app.json:70`).

### 6.2 Update `NSUserNotificationsUsageDescription`

**Current** (`app.json:26`):
```json
"NSUserNotificationsUsageDescription": "We need permission to send you fasting reminders and milestone notifications."
```

**Replace with:**
```json
"NSUserNotificationsUsageDescription": "Tranquil Fast can send gentle reminders when you reach fasting milestones. You can change this anytime in Settings."
```

Calmer tone, accurate to local-only milestones, mentions in-app controllability, no health claims, no mention of remote push.

## 7. Console / Logging Cleanup

Gate all 8 notification-related production console statements behind `__DEV__`:

- `services/notifications.ts:17, 21, 23` — 3 statements
- `utils/notificationsUtils.ts:10, 20, 42, 46` — 4 statements
- `store/fastStore.ts:94` — 1 statement (`console.warn('[store] scheduleMilestones error', e)`)

None of these contain PII, but consistency with the SPEC-16/SPEC-18 defense-in-depth pattern matters: in production, no notification-related output reaches the device console buffer.

## 8. Files Affected

| File | Change |
|---|---|
| `utils/notificationsUtils.ts` | Rewrite 4 milestone titles/bodies. Add `cancelFastingNotifications()` utility. Gate 4 console statements behind `__DEV__`. |
| `services/notifications.ts` | Gate 3 console statements behind `__DEV__`. |
| `store/fastStore.ts` | Import `cancelFastingNotifications`. Call it in `endFast`, `pauseFast`, `updatePlan`, and `setNotificationsEnabled(false)`. Gate the existing `console.warn` behind `__DEV__`. |
| `app.json` | Remove `UIBackgroundModes: ["remote-notification"]` entry. Update `NSUserNotificationsUsageDescription`. |
| `expo/specs/SPEC-20-notifications-brand-voice-lifecycle-cleanup.md` | This spec. |

**Not modified:**
- Permission request location (`services/notifications.ts:20`) — still triggered after a user action via `startFast`
- `setupNotifications` overall flow
- `notificationsEnabled` default value (still `true`)
- Settings/Fast tab UI for the toggle
- expo-notifications plugin block (already correctly sets `enableBackgroundRemoteNotifications: false`)

## 9. App Privacy Impact

**Unchanged.** Notifications remain entirely local. Specifically:

- ❌ No remote push token is collected
- ❌ No Expo push token is requested
- ❌ No APNs registration occurs
- ❌ No notification data is transmitted off-device
- ❌ No notification events are sent to Sentry, RevenueCat, analytics, or any backend
- ❌ No new networking surface is added

The combined SPEC-16/17/18/19 App Privacy label posture is preserved:

| Apple Category | Sub-type | Linked to user? |
|---|---|---|
| Health & Fitness | Health | Not Linked (HealthKit weight, in-app only) |
| Diagnostics | Crash Data | Not Linked (Sentry, sanitized) |
| Diagnostics | Other Diagnostic Data | Not Linked (Sentry, sanitized) |

No new entries required for SPEC-20.

## 10. Acceptance Criteria

1. Notification copy contains no fat-burning, autophagy, maximum-benefit, medical, metabolic, guaranteed-weight-loss, or gamified achievement claims.
2. Notification copy is calm, factual, and non-shaming.
3. Milestone notifications are cancelled when a fast ends.
4. Milestone notifications are cancelled when notifications are disabled mid-fast.
5. Milestone notifications cannot continue firing after they are no longer accurate (also cancelled on pause and plan-change).
6. Starting a new fast still clears old scheduled notifications before scheduling new ones.
7. `app.json` no longer declares `remote-notification` background mode.
8. `NSUserNotificationsUsageDescription` is accurate and calm.
9. No remote push token, APNs token, Expo push token, backend push, or remote notification flow exists.
10. Notification-related production console logs are removed or `__DEV__`-gated.
11. No notification events are sent to Sentry, RevenueCat, analytics, or networking.
12. `npx tsc --noEmit` passes with 0 errors.
13. App Privacy labels remain unchanged.
14. Notifications are App Store submission-ready.

## 11. Verification Commands

```bash
# A. Risky-term scan in notification copy
grep -rn -iE "fat-burning|fat burning|autophagy|maximum benefits|crushing|outstanding|amazing work|unlocked|peak|metabolic|guaranteed|burn fat|streak" \
  services/ utils/ store/ app/ components/ \
  --include="*.ts" --include="*.tsx" --include="*.json"
# Expected: empty for notification files. Any matches outside notification
# code should be benign (e.g., "peak" inside a third-party article URL).

# B. Scheduling / cancellation API call sites
grep -rn -E "scheduleNotificationAsync|cancelAllScheduledNotificationsAsync|cancelScheduledNotificationAsync|requestPermissionsAsync|cancelFastingNotifications" \
  services/ utils/ store/ app/ components/ --include="*.ts" --include="*.tsx"
# Expected: cancelFastingNotifications called from at least 4 places in
# fastStore.ts (endFast, pauseFast, updatePlan, setNotificationsEnabled).
# scheduleMilestones called from startFast only.

# C. Remote-push surface check
grep -rn -iE "getExpoPushToken|ExpoPushToken|DevicePushToken|APNs|pushToken|remote-notification|enableBackgroundRemoteNotifications" \
  app.json app/ components/ services/ utils/ store/ --include="*.ts" --include="*.tsx" --include="*.json"
# Expected: only the expo-notifications plugin config line in app.json
# (enableBackgroundRemoteNotifications: false). No token-acquisition code.
# UIBackgroundModes should no longer list remote-notification.

# D. Console gating
grep -rnE "console\.(log|warn|error|info|debug)" \
  services/notifications.ts utils/notificationsUtils.ts store/fastStore.ts
# Expected: every hit either inline-prefixed with `if (__DEV__)` or
# inside an `if (__DEV__) { ... }` block.

# E. TypeScript
npx tsc --noEmit
# Expected: 0 errors.
```

## 12. Final App Store Reviewer Note Recommendation

Append to the existing App Review Information note:

> Notifications are local-only scheduled milestones (12, 16, 18, 20 hour
> fasting marks). The app does not register for remote push, does not
> collect APNs or Expo push tokens, and does not run a notification
> backend. Permission is requested only when the user starts their first
> fast with notifications enabled. Users can disable notifications at any
> time from Settings or the active-fast screen. Notification copy is
> calm and informational; no health, metabolic, or weight-loss claims.

## Progress Notes

**Completed 2026-05-17.**

### What was done

1. **`utils/notificationsUtils.ts`** — full rewrite:
   - Added module-scope SPEC-20 header comment documenting the brand-voice constraints and the v1.1-migration note for identifier-based cancellation.
   - New `cancelFastingNotifications()` exported utility — safe wrapper around `Notifications.cancelAllScheduledNotificationsAsync()` with web no-op and `__DEV__`-gated logging. Used at every lifecycle point where the scheduled milestones become inaccurate.
   - Rewrote all four milestone `title` and `body` strings with calm, factual, non-shaming copy per §4. No emojis. No exclamation marks. No "fat-burning", "autophagy", "maximum benefits", "crushing", "outstanding", "amazing", "unlocked", "metabolic", "guaranteed".
   - `scheduleMilestones()` now calls `cancelFastingNotifications()` (instead of inline `Notifications.cancelAllScheduledNotificationsAsync`) for consistency.
   - All 6 production console statements wrapped in `if (__DEV__)`.

2. **`services/notifications.ts`** — gated all 3 console statements behind `__DEV__`. No other changes to permission flow.

3. **`store/fastStore.ts`** — wired up `cancelFastingNotifications()` at four lifecycle points:
   - Line 115: inside `pauseFast()` after toggling `isRunning` — cancels remaining milestones because absolute-time scheduling desynchronizes from elapsed fast time on pause/resume. Comment explains the v1.1 re-schedule opportunity.
   - Line 132: inside `endFast()` after clearing `currentFast` — cancels remaining milestones for the ended fast.
   - Line 157: inside `updatePlan()` when an active fast exists — cancels because changing plans kills the current fast.
   - Line 173: inside `setNotificationsEnabled(false)` — cancels already-scheduled notifications when user disables mid-fast.
   - The existing `console.warn` at line 95 (`scheduleMilestones error`) gated behind `__DEV__`.
   - Import statement updated to pull `cancelFastingNotifications` alongside `scheduleMilestones`.

4. **`app.json`** — removed `"UIBackgroundModes": ["remote-notification"]` entirely (no other background modes were declared). Rewrote `NSUserNotificationsUsageDescription` from `"We need permission to send you fasting reminders and milestone notifications."` to `"Tranquil Fast can send gentle reminders when you reach fasting milestones. You can change this anytime in Settings."` — calmer tone, mentions in-app controllability, no health claims.

### Verification results

| Check | Command | Result |
|---|---|---|
| A. Risky-term scan in notification copy | `grep -rn -iE "fat-burning\|autophagy\|maximum benefits\|crushing\|outstanding\|..."` against notification files | Only hits in `utils/notificationsUtils.ts` are inside the SPEC-20 comment block explicitly listing forbidden terms. **Zero user-facing risky terms remain in notification copy.** |
| B. Scheduling / cancellation API call sites | `grep -rn -E "scheduleNotificationAsync\|cancelAllScheduledNotificationsAsync\|requestPermissionsAsync\|cancelFastingNotifications"` | `cancelFastingNotifications` called from 4 places in `fastStore.ts` (lines 115, 132, 157, 173) plus the new-fast clear inside `scheduleMilestones` (line 51 of utils). `scheduleNotificationAsync` called only from `scheduleMilestones`. `requestPermissionsAsync` called only from `setupNotifications`. |
| C. Remote-push surface | `grep -rn -iE "getExpoPushToken\|APNs\|pushToken\|remote-notification\|enableBackgroundRemoteNotifications"` | Single hit: `app.json:67` — `"enableBackgroundRemoteNotifications": false` (correct — disables remote). **No `UIBackgroundModes: ["remote-notification"]`. No push-token code anywhere.** |
| D. Console gating in notification files | `grep -rnE "console\\.(log\|warn\|error\|info\|debug)" services/notifications.ts utils/notificationsUtils.ts store/fastStore.ts` | All notification-related lines confirmed `__DEV__`-gated. The two ungated `console.error` calls remaining in `fastStore.ts` (lines 230, 253) are AsyncStorage error logs, not notification-related — out of SPEC-20 scope. |
| E. TypeScript | `npx tsc --noEmit` | 0 errors. |

### Deviations from spec

None. All required changes applied exactly as specified.

### Observations out of SPEC-20 scope (flagged for awareness, not actioned)

1. **"Streak" language exists elsewhere in the app** — `app/(tabs)/progress.tsx` and `app/(tabs)/home.tsx` use "Day Streak" stats; the Progress tab has "7 Day Streak" and "30 Day Streak" achievement cards with `unlocked` state; `app/onboarding/track-succeed.tsx` mentions "build streaks" in onboarding copy. These are part of the Achievements/Stats system, not notifications. Streak language is generally acceptable in stats displays (it's descriptive, not pressure-applying), but if the team wants a stricter brand-voice pass across all "streak" / "unlock" terms in the UI, that would be a separate SPEC-21 polish item. **Not blocking for App Store submission.**

2. **`store/fastStore.ts` lines 230 and 253** — `console.error('Failed to load from storage:', error)` and `console.error('Failed to save to storage:', error)` are not `__DEV__`-gated. The error arguments are AsyncStorage system errors, not user data. Per SPEC-16 defense-in-depth, the Sentry `beforeBreadcrumb` hook already drops console breadcrumbs in production, so these don't reach Sentry. Out of SPEC-20 scope but a small polish opportunity if the team wants consistent gating across the codebase.

### App Privacy posture

Unchanged. Notifications remain local-only. No new entries required. Combined SPEC-16/17/18/19/20 posture stays at 3 Not-Linked-to-User entries:

- Health & Fitness → Health (HealthKit weight, App Functionality)
- Diagnostics → Crash Data (Sentry, sanitized)
- Diagnostics → Other Diagnostic Data (Sentry, sanitized)

### Final yes/no for App Store submission — Notifications

**Yes.** All four blockers from the audit are resolved. Copy is brand-aligned, cancellation lifecycle is complete, app.json no longer declares an unused remote-notification capability, and console output is production-suppressed. The notification surface is App Store submission-ready.
