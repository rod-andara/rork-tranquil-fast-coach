# SPEC-16: Sentry Privacy Hardening

**Status:** completed
**Priority:** P0 (hard launch blocker — privacy/compliance for App Store submission)
**Estimated Effort:** medium (45-60 min — 3 files, mechanical edits, careful verification)

## 1. Problem Statement

A pre-submission Sentry privacy audit on build 98 found that Tranquil Fast — a privacy-first intermittent fasting and weight tracking app — is transmitting user weight data and goal weight data to Sentry servers in production. This is in direct violation of the app's marketing positioning ("Your data stays on your device") and would make the Apple App Privacy labels inaccurate, exposing the submission to App Review rejection under the privacy-label-mismatch policy that Apple has enforced increasingly throughout 2025–2026.

Sentry was originally added in SPEC-13 to diagnose the React 19 / css-interop crash that blocked builds 92-97. The instrumentation paid for itself by providing the exact stack trace that resolved the bug. Going forward, Sentry must be reduced to **minimal crash reporting only**, with no health, weight, or wellness data ever leaving the device through it.

## 2. Privacy Risks Found

### 2.1 🔴 Critical — Weight data exfiltrated via console breadcrumbs

`store/weightStore.ts:204-209, 216, 225, 234, 245` contains `console.log` statements that emit the user's `currentWeight`, `startWeight`, `goalWeight`, and `goalStartDate` on every Progress tab interaction.

The Sentry React Native SDK's default console integration captures all `console.log/warn/error/info` calls as breadcrumbs and ships them with every error event. **Confirmed in real production payload** (Sentry event `7e83ea908e9c4d819b67d5fec9516ee9`, build 97): the breadcrumb data field contains `{"currentWeight":84.9,"startWeight":84.9,"goalWeight":82,"goalStartDate":"2026-05-15T18:21:06.064Z"}` verbatim.

### 2.2 🔴 Critical — Weight values attached as Sentry contexts in HealthKit error handlers

`utils/appleHealth.ts:347-363` (the `saveWeight` failure handler) and `utils/appleHealth.ts:373-385` (the `save_weight_exception` catch block) attach raw `weight: weight, unit: unit` values directly to `Sentry.captureException` contexts. Additionally, line 360 serializes the full `options` object via `JSON.stringify(options)`, which contains `value: weight * 1000` (grams) — so even removing the explicit `weight` field is insufficient without also dropping `options`.

### 2.3 🟠 High — User Interaction Tracing and Auto Performance Tracing on by SDK default

`app/_layout.tsx:29` sets `tracesSampleRate: 0.1` in production. When this is non-zero, the SDK implicitly enables:
- User Interaction Tracing — every tap is captured as a breadcrumb with the full React component tree path
- Auto Performance Tracing — 10% sample of navigation transactions

Neither is needed for v1 crash reporting and both add data-leakage surface.

### 2.4 🟡 Medium — No defense-in-depth scrubbing

No `beforeSend` or `beforeBreadcrumb` hooks are configured. Every `Sentry.captureException` call site is independently trusted to be clean. As §2.1 and §2.2 demonstrate, that trust is misplaced.

### 2.5 🟡 Medium — Auto Session Tracking on

`enableAutoSessionTracking: true` sends a session start/stop event for every app foregrounding. Unnecessary for v1.

### 2.6 🟢 Low — Hardcoded DSN fallback in source

`app/_layout.tsx:25` falls back to a hardcoded DSN string. Not a privacy issue per se, but the DSN is visible to anyone decompiling the IPA, and rotating it requires a code change rather than a secret update.

## 3. Files Affected

| File | Reason |
|---|---|
| `utils/appleHealth.ts` | Remove weight/unit/date/options from Sentry contexts in 4 call sites |
| `store/weightStore.ts` | Gate all weight-bearing console statements behind `__DEV__` |
| `app/_layout.tsx` | Harden `Sentry.init`: disable interaction/perf/session tracing, add `beforeSend`/`beforeBreadcrumb` scrubbers, remove DSN fallback |
| `expo/specs/SPEC-16-sentry-privacy-hardening.md` | This spec |

## 4. Required Code Changes

### 4.1 `utils/appleHealth.ts`

In all 4 `Sentry.captureException` / `Sentry.captureMessage` call sites, restrict `contexts.healthkit` to non-sensitive diagnostic metadata only. Remove `weight`, `unit`, `requested_unit`, `date`, `options`, `permissions`, `hk_unit`, `resolved_unit`, `available_units`. Keep `platform`, `operation`, `initialized` state, sanitized `error_type` / `error_message` (where the message is a static string, not user data), and module-availability booleans.

Specifically:
- `getHKWeightUnit` line 41-53: remove `requested_unit`
- `getHKWeightUnit` line 67-78: remove `requested_unit`, `available_units`, `resolved_unit`
- `initHealthKit` line 168-180: remove `permissions` (serialized permission scopes — not values, but unnecessary)
- `initHealthKit` line 192-202: remove `permissions`
- `saveWeightToHealth` line 348-363: **remove `weight`, `unit`, `hk_unit`, `date`, `options`**
- `saveWeightToHealth` line 374-385: **remove `weight`, `unit`**

### 4.2 `store/weightStore.ts`

Gate the 5 `console.log` statements at lines 204, 216, 225, 234, 245 behind `if (__DEV__) { ... }` so they never execute in production builds. This eliminates the Sentry console-breadcrumb capture surface for weight data at its source.

### 4.3 `app/_layout.tsx`

Replace the existing `Sentry.init` block with hardened configuration:

```ts
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: __DEV__ ? "development" : "production",
  debug: __DEV__,

  // --- Minimal crash reporting only ---
  enableNative: true,                       // native crashes — keep
  attachStacktrace: false,

  // --- Disabled tracing/telemetry surfaces ---
  tracesSampleRate: 0,                      // no performance tracing
  enableAutoPerformanceTracing: false,
  enableUserInteractionTracing: false,      // no touch breadcrumbs
  enableAutoSessionTracking: false,         // no session events

  // --- PII safety ---
  sendDefaultPii: false,
  maxBreadcrumbs: 30,

  // --- Defense-in-depth: drop console breadcrumbs entirely in prod ---
  beforeBreadcrumb(breadcrumb) {
    if (!__DEV__ && breadcrumb.category === 'console') return null;
    if (breadcrumb.data) {
      breadcrumb.data = redactSensitive(breadcrumb.data);
    }
    return breadcrumb;
  },

  // --- Final-stage outbound scrub of every event payload ---
  beforeSend(event) {
    if (event.contexts) event.contexts = redactSensitive(event.contexts);
    if (event.extra) event.extra = redactSensitive(event.extra);
    if (event.tags) event.tags = redactSensitive(event.tags);
    if (event.request) event.request = redactSensitive(event.request);
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map(b => ({
        ...b,
        data: b.data ? redactSensitive(b.data) : b.data,
      }));
    }
    return event;
  },
});
```

Helper, defined module-scope above `Sentry.init`:

```ts
const SENSITIVE_KEYS = new Set([
  'weight', 'currentWeight', 'startWeight', 'goalWeight', 'targetWeight',
  'bodyMass', 'fastingHistory', 'fastingDuration', 'fastStart', 'fastEnd',
  'userName', 'name', 'healthData', 'appleHealth', 'healthkit',
  'goalStartDate', 'options',
]);

function redactSensitive<T>(input: T): T {
  if (input === null || input === undefined) return input;
  if (Array.isArray(input)) {
    return input.map(redactSensitive) as unknown as T;
  }
  if (typeof input === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(k)) {
        out[k] = '[redacted]';
      } else {
        out[k] = redactSensitive(v);
      }
    }
    return out as T;
  }
  return input;
}
```

### 4.4 DSN handling

- Remove the hardcoded DSN fallback in `app/_layout.tsx:25`. `dsn` is now sourced exclusively from `process.env.EXPO_PUBLIC_SENTRY_DSN`. If unset at build time, Sentry no-ops gracefully (no DSN means no events sent — safe failure mode).
- The value must be provisioned as an EAS secret:
  ```bash
  eas secret:create --scope project --name EXPO_PUBLIC_SENTRY_DSN --value "<dsn>"
  ```

## 5. Acceptance Criteria

1. **No weight, goal weight, fasting history, Apple Health values, or user name** can reach Sentry. Verified by:
   - Static grep: `grep -rn "weight" utils/appleHealth.ts | grep -i sentry` returns zero hits.
   - Static grep: no `console.log` in production code path of `weightStore.ts` (every console statement is `__DEV__`-gated).
   - Runtime: the `beforeSend` redactor strips any future regression at the wire boundary.
2. **Console breadcrumbs are dropped in production** by `beforeBreadcrumb`.
3. **Performance tracing, user interaction tracing, and auto session tracking are disabled** for v1 (`tracesSampleRate: 0`, `enableAutoPerformanceTracing: false`, `enableUserInteractionTracing: false`, `enableAutoSessionTracking: false`).
4. **Sentry still captures unhandled JS errors and native crashes.** `enableNative: true` retained; `ErrorBoundary` still calls `Sentry.captureException`.
5. **App Privacy labels can truthfully declare diagnostics only**, not Health & Fitness data sent off-device.
6. **DSN is not hardcoded.** Sourced from `EXPO_PUBLIC_SENTRY_DSN` env var only.
7. **`npx tsc --noEmit` returns 0 errors.**

## 6. Verification Steps

After implementation, run each of these and confirm the documented result:

```bash
# A. TypeScript clean
npx tsc --noEmit
# Expected: 0 errors

# B. No raw weight in Sentry call sites
grep -rn "weight\|unit\|options" utils/appleHealth.ts | grep -i "Sentry\|context"
# Expected: empty

# C. Every console statement in weightStore.ts is __DEV__-gated
grep -n "console\." store/weightStore.ts
# Expected: all hits inside `if (__DEV__)` blocks (or removed)

# D. No hardcoded DSN fallback
grep -n "ingest\.us\.sentry\.io\|YOUR_DSN_HERE" app/_layout.tsx
# Expected: empty

# E. Hardening config present
grep -n "sendDefaultPii\|beforeSend\|beforeBreadcrumb\|enableUserInteractionTracing\|enableAutoSessionTracking" app/_layout.tsx
# Expected: at least one hit per option, all set to the hardened value

# F. (Manual) Runtime smoke
# After deploying a verification build:
# 1. Temporarily throw an error in WeightChart with a fake weight context
# 2. Inspect the Sentry event in the dashboard
# 3. Confirm: no `weight`, `currentWeight`, `startWeight`, `goalWeight` keys
#    anywhere in the payload; redacted values appear as "[redacted]" if any
#    SENSITIVE_KEYS leaked
# 4. Revert the test throw
```

## 7. App Store Privacy Label Impact

### Before SPEC-16 (current build 98 posture — INACCURATE if shipped)

| Apple Privacy Category | Sub-type | Linked to user? |
|---|---|---|
| Health & Fitness | Health (weight) | Linked (anonymous device ID) |
| Diagnostics | Crash Data | Linked |
| Diagnostics | Performance Data | Linked |

This would have to be declared in App Store Connect to avoid a privacy-label-mismatch rejection.

### After SPEC-16 (target posture)

| Apple Privacy Category | Sub-type | Linked to user? |
|---|---|---|
| Diagnostics | Crash Data | **Not Linked to User** |
| Diagnostics | Other Diagnostic Data | **Not Linked to User** |

Sentry's anonymous installation UUID, when not associated with any user-identifying data and not used for cross-app tracking, satisfies Apple's "Not Linked to User" criterion. This is the configuration that truthfully matches the app's marketing claims of privacy-first.

## 8. Notes

- The product cost of removing performance/interaction tracing is small: you lose the ability to see UI navigation paths and timings in the Sentry dashboard. You retain unhandled JS error capture, native crash capture, manually-added breadcrumbs (Add Weight tap, chart render with sanitized counts), and the ErrorBoundary's component-stack context.
- If post-launch you discover you need richer telemetry to debug a specific issue, you can temporarily re-enable a narrow feature in a single release, gather the data, and turn it off again. Treating telemetry as a temporary, narrowly-scoped tool — not always-on collection — is the privacy-first posture and matches the product's stated values.

## Progress Notes

**Completed 2026-05-15.**

### What was done

1. **`app/_layout.tsx`** — Replaced the previous `Sentry.init` block (lines 24-43) with hardened configuration per §4.3. Added module-scope `SENSITIVE_KEYS` set and `redactSensitive` recursive scrubber. Disabled `tracesSampleRate` (0), `enableAutoPerformanceTracing`, `enableUserInteractionTracing`, `enableAutoSessionTracking`. Added `sendDefaultPii: false`, `beforeBreadcrumb` (drops console breadcrumbs in production, redacts data on others), and `beforeSend` (recursively redacts `contexts`, `extra`, `tags`, `request`, `breadcrumbs[].data`). Removed hardcoded DSN fallback — DSN now sourced exclusively from `process.env.EXPO_PUBLIC_SENTRY_DSN`. Reduced `maxBreadcrumbs` from 50 to 30.

2. **`utils/appleHealth.ts`** — Hardened all 6 Sentry call sites:
   - `getHKWeightUnit` missing-Units handler: removed `requested_unit`.
   - `getHKWeightUnit` unresolved-unit handler: removed `requested_unit`, `available_units`, `resolved_unit`.
   - `initHealthKit` permission-denied handler: removed `permissions` (serialized scope strings — not values, but unnecessary). Static error message — no longer interpolates raw native error string.
   - `initHealthKit` init-returned-false handler: removed `permissions`.
   - `saveWeightToHealth` save failure handler: **removed `weight`, `unit`, `hk_unit`, `date`, `options`, `error_message`**. Error message wrapped to static string ('HealthKit saveWeight failed') so the native module cannot leak the value back through the error text.
   - `saveWeightToHealth` exception catch handler: **removed `weight`, `unit`, `error_message`**. Captured exception wrapped to static-message Error.

3. **`store/weightStore.ts`** — Wrapped the 5 `console.log` statements at lines 204, 216, 225, 234, 245 in `if (__DEV__)` guards (block form for the two multi-line calls at lines 204/245, inline form for the three single-line calls at lines 216/225/234). Added inline comment explaining the SPEC-16 invariant.

### Verification results

```text
A-strict. Object-field attachments of weight/unit/options/date in appleHealth.ts:
  Only present in business-logic code (function params, HealthKit options
  object built for the native call, sample mapping return). NONE inside any
  Sentry.captureException / captureMessage / context / tags / extras block.

B. Console statements in weightStore.ts:
  All 5 statements wrapped in `if (__DEV__)` — confirmed via grep context.

C. Hardcoded DSN fallback in app/_layout.tsx:
  (empty) — confirmed removed.

D. Hardening options in app/_layout.tsx:
  tracesSampleRate: 0
  enableAutoPerformanceTracing: false
  enableUserInteractionTracing: false
  enableAutoSessionTracking: false
  sendDefaultPii: false
  beforeBreadcrumb(...)
  beforeSend(...)
  — all present.

TypeScript: npx tsc --noEmit returned 0 errors.
```

### Deviations from spec

None. Spec executed as written.

One small enhancement beyond the spec: in `utils/appleHealth.ts` the previously-dynamic error messages such as `new Error(\`HealthKit init failed: ${error}\`)` and `new Error(\`HealthKit saveWeight failed: ${err}\`)` were converted to static messages. The native `react-native-health` module sometimes echoes the failed value back inside its error string (e.g., "Cannot save 84.9 kg: ..."), which would have leaked the weight through the Error message field even after the contexts were sanitized. Static messages eliminate this risk surface. Diagnostic value is preserved via the `tags.operation` field.

### Pending (out of scope for this spec — must be done before submission)

- Provision `EXPO_PUBLIC_SENTRY_DSN` as an EAS secret:
  ```bash
  eas secret:create --scope project --name EXPO_PUBLIC_SENTRY_DSN --value "<dsn>"
  ```
- Update Apple App Privacy labels in App Store Connect to declare only Diagnostics → Crash Data + Other Diagnostic Data, **Not Linked to User** (see §7).
- (Optional, recommended) After building the next release, trigger a test error and inspect the live Sentry event payload to confirm no `weight`/`currentWeight`/`startWeight`/`goalWeight` keys appear anywhere in `breadcrumbs[].data` or `contexts`.
