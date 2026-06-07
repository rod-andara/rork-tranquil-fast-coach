# SPEC-17: RevenueCat Runtime Disablement for Free v1 Launch

**Status:** completed
**Priority:** P0 (App Store submission cleanup — should ship in v1.0)
**Estimated Effort:** small (30-45 min — single feature flag + short-circuits + verification)

## 1. Problem Statement

Tranquil Fast v1.0 ships as a completely free app with no paywall, no premium gating, no in-app purchases, and no subscriptions. The RevenueCat SDK is currently fully integrated and **initialized on every app launch** (`app/_layout.tsx:135`), even though:

- The paywall route (`app/paywall.tsx`) is registered but **not reachable from any tab, settings, or button** in the production UI.
- The premium gate component (`components/PremiumGate.tsx`) is defined but **rendered zero times** in the app tree.
- The RevenueCat API key in `EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY` is **not provisioned** as an EAS env var. The code falls back to the placeholder string `'appl_YOUR_API_KEY_HERE'`.
- Every launch consequently hits RevenueCat's API with an invalid key, receives a **401 Unauthorized**, and reports the error to Sentry. Confirmed in a production Sentry breadcrumb dump:
  ```
  GET https://api.revenuecat.com/v1/subscribers/$RCAnonymousID:25dd581e2e49451b96ccf95a4b4d019b → 401
  [RevenueCat] Failed to check subscription status: { code: "11", domain: "RevenueCat.ErrorCode" }
  ```

We want to keep all RevenueCat code in the repo so v1.1 reactivation is a flag flip, but RevenueCat must be **completely dormant** in v1.0: zero network calls, zero anonymous ID generation, zero Sentry noise, and zero App Privacy label exposure for a feature users cannot reach.

## 2. Privacy / App Review Risks (current state, pre-SPEC-17)

| Risk | Severity | Detail |
|---|---|---|
| RevenueCat anonymous device UUID created on every launch | 🟠 | `$RCAnonymousID:<uuid>` persisted in keychain, sent to RevenueCat servers — adds Identifier surface to privacy labels for a feature users cannot use |
| IDFV sent to RevenueCat by SDK default | 🟠 | Forces declaration of "Identifiers → Device ID" |
| 401-failure Sentry noise on every launch | 🟡 | Pollutes error dashboard, obscures real bugs in triage |
| App Review may notice paywall-related code with no visible entry point | 🟡 | Rare but documented basis for "metadata rejected — incomplete information" callbacks |
| Marketing copy ("NO ADS. NO SUBSCRIPTIONS REQUIRED.") inconsistent with live subscription SDK | 🟢 | Cosmetic but worth aligning |
| Placeholder API key in source (`appl_YOUR_API_KEY_HERE`) | 🟢 | Not a credential leak, but unprofessional and confusing |

## 3. Current RevenueCat Runtime Behavior

| Trigger | What runs |
|---|---|
| App launch (`app/_layout.tsx:135`) | `initializeRevenueCat()` → `Purchases.setLogLevel(WARN)` → `Purchases.configure({ apiKey: 'appl_YOUR_API_KEY_HERE' })` |
| Immediately after (`app/_layout.tsx:139`) | `checkSubscriptionStatus()` → `Purchases.getCustomerInfo()` → 401 → `Sentry.captureException(...)` → returns `false` → `setPremium(false)` |
| Paywall mount (`app/paywall.tsx`) | `getCurrentOffering()`, `purchasePackage()`, `restorePurchases()` — **unreachable** in v1.0 |
| `identifyUser()` / `logoutUser()` | Defined, never invoked |

## 4. Required Implementation Changes

### 4.1 Feature flag

Centralize a single boolean exported from `services/revenuecat.ts`:

```ts
export const REVENUECAT_ENABLED = process.env.EXPO_PUBLIC_ENABLE_REVENUECAT === 'true';
```

Default behavior with unset / missing / "false" env var: **disabled**. The flag must be `=== 'true'` (strict-string) for safety — any typo, missing var, or accidental false-y value disables RevenueCat.

For v1.0 we do not set this env var in EAS at all. The app ships disabled.

### 4.2 `services/revenuecat.ts`

Every public function in the service short-circuits at the top when `REVENUECAT_ENABLED === false`. None of them touch `Purchases.*` while disabled. None of them call `Sentry.captureException` while disabled.

- `initializeRevenueCat()` — returns `false` immediately, no logging in production, no `Purchases.configure` call.
- `checkSubscriptionStatus()` — returns `false` immediately, no network call.
- `getCurrentOffering()` — returns `null` immediately.
- `purchasePackage()` — returns `{ success: false, error: 'RevenueCat disabled' }` immediately.
- `restorePurchases()` — returns `{ success: false, error: 'RevenueCat disabled' }` immediately.
- `getCustomerInfo()` — returns `null` immediately.
- `getActiveSubscription()` — returns `{ isActive: false }` immediately.
- `identifyUser()` — no-op immediately.
- `logoutUser()` — no-op immediately.

Additional changes:

- **Remove the placeholder API key fallback** `'appl_YOUR_API_KEY_HERE'` and `'goog_YOUR_API_KEY_HERE'`. `REVENUECAT_IOS_KEY` and `REVENUECAT_ANDROID_KEY` are sourced exclusively from the corresponding `EXPO_PUBLIC_*` env vars.
- **If enabled but key missing**, `initializeRevenueCat()` warns (dev-only console) and returns `false` without calling `Purchases.configure`.
- Keep `__DEV__` gating on every console statement — production builds emit nothing related to RevenueCat.

### 4.3 `app/_layout.tsx`

The `loadData` callback gates the entire RevenueCat block behind the flag. When disabled, none of the import-time symbols (`initializeRevenueCat`, `checkSubscriptionStatus`) are called. No `setPremium` call originates from RevenueCat — `isPremium` stays at its default `false` in `fastStore`.

```ts
// RevenueCat — gated by EXPO_PUBLIC_ENABLE_REVENUECAT.
// For v1.0 (free launch), this is disabled. Re-enable in v1.1.
if (REVENUECAT_ENABLED) {
  try {
    const ok = await initializeRevenueCat();
    if (ok) {
      const isPremium = await checkSubscriptionStatus();
      useFastStore.getState().setPremium(isPremium);
    }
  } catch (error) {
    if (__DEV__) console.error('[App] RevenueCat init error:', error);
  }
}
```

No `console.warn` log on the disabled path — it's an intentional state, not a failure.

### 4.4 UI surface

Confirm via grep:
- No `<PremiumGate>` rendered anywhere
- No `router.push('/paywall')` reachable from any visible UI element
- The Settings "Premium coming soon" card is a static informational `<View>` with no `onPress` handler — acceptable as-is

### 4.5 Paywall route deregistration (added during post-implementation App Review hardening)

After the initial SPEC-17 audit confirmed the paywall was not reachable from any production UI button, the user requested **extra App Review cleanliness** to also remove the route registration itself. The original §4.4 recommendation ("leave the route registered") was overridden in favor of full deregistration. This eliminates any theoretical risk that an App Review reviewer probes the route via deep link.

Three changes were applied:

1. **`app/paywall.tsx` → `app/_paywall.tsx`** — renamed via `git mv`. The leading underscore tells expo-router to treat the file as a private module rather than a file-based route. The file content is preserved verbatim; only the path changed.

2. **`app/_layout.tsx`** — removed the `<Stack.Screen name="paywall" options={...} />` line. Replaced with an in-file comment block documenting the deactivation and the v1.1 reactivation steps.

3. **`components/PremiumGate.tsx`** — the (still dead) `router.push('/paywall')` call was changed to `router.push('/paywall' as any)` to satisfy expo-router's typed-routes feature, which would otherwise reject the call at compile time now that `/paywall` is not a registered route. An in-file comment block was added explaining the SPEC-17 deactivation and v1.1 reactivation. PremiumGate remains unrendered anywhere in the app tree — this code path is unreachable.

After these changes, the paywall is unreachable by **four independent mechanisms**:
- No UI button links to it (PremiumGate is unrendered)
- No Stack.Screen registers it
- No file-based route exists (the file is now `_paywall.tsx`, ignored by expo-router)
- Typed routes do not include `/paywall` in the generated type union

### 4.5 EAS environment

No EAS env-var changes required for v1.0. `EXPO_PUBLIC_ENABLE_REVENUECAT` is **left unset** across all environments. The flag will resolve to `undefined !== 'true' === false`, disabling RevenueCat by default.

For v1.1 reactivation, set the env var on the production environment:

```bash
eas env:create --name EXPO_PUBLIC_ENABLE_REVENUECAT --value "true" \
  --environment production --visibility plaintext
```

## 5. Feature Flag Design

| Aspect | Decision |
|---|---|
| Name | `EXPO_PUBLIC_ENABLE_REVENUECAT` (Expo-public so it's embedded in the JS bundle at build time) |
| Type | String — accepts the literal `"true"` only |
| Default | Unset → resolves to `undefined` → `!== 'true'` → disabled |
| Scope | Per-EAS-environment. v1.0 unset everywhere. v1.1 set to `"true"` in production. |
| Visibility | plaintext (it's not a secret; it's just a build-time toggle) |
| Re-evaluation | Build-time only. Cannot be toggled at runtime — that's by design for App Review reproducibility. |

The constant `REVENUECAT_ENABLED` is exported from `services/revenuecat.ts` so any future consumer (e.g., a UI gate that only shows an Upgrade button when premium is configured) can import the same source of truth.

## 6. Files Affected

| File | Change |
|---|---|
| `services/revenuecat.ts` | Add `REVENUECAT_ENABLED` constant. Remove placeholder API key fallbacks. Add short-circuit guards to all 9 public functions. Gate all production console statements behind `__DEV__`. |
| `app/_layout.tsx` | Gate `initializeRevenueCat()` + `checkSubscriptionStatus()` calls behind `REVENUECAT_ENABLED`. Import the constant. Remove the now-misleading `console.warn('[App] RevenueCat initialization failed')`. |
| `expo/specs/SPEC-17-revenuecat-runtime-disablement-v1.md` | This spec. |

**Not modified (intentional):**
- `app/paywall.tsx` — kept for v1.1
- `components/PremiumGate.tsx` — kept for v1.1
- `components/ProfileCard.tsx` — kept for v1.1
- `store/fastStore.ts` — `isPremium` boolean stays (used by PremiumGate and future v1.1 code)
- `package.json` — `react-native-purchases` stays as a dependency

## 7. App Privacy Label Impact

### Before SPEC-17 (current v1.0 if shipped as-is)

| Apple Category | Sub-type | Linked to user? | Source |
|---|---|---|---|
| Identifiers | Device ID | Not Linked | RevenueCat anonymous UUID + IDFV |
| Purchases | Purchase History | Not Linked | RevenueCat (proactive — required if SDK initializes) |
| Usage Data | Product Interaction | Not Linked | RevenueCat fraud-detection events |
| Diagnostics | Other Diagnostic Data | Not Linked | RevenueCat SDK errors |
| Diagnostics | Crash Data | Not Linked | Sentry (post-SPEC-16) |
| Diagnostics | Other Diagnostic Data | Not Linked | Sentry (post-SPEC-16) |

Six entries required.

### After SPEC-17 (v1.0 with RevenueCat disabled)

| Apple Category | Sub-type | Linked to user? | Source |
|---|---|---|---|
| Diagnostics | Crash Data | Not Linked | Sentry (post-SPEC-16) |
| Diagnostics | Other Diagnostic Data | Not Linked | Sentry (post-SPEC-16) |

**Two entries.** RevenueCat collects zero data because `Purchases.configure()` is never called. The marketing claim "NO ADS. NO SUBSCRIPTIONS REQUIRED." is now structurally truthful, not just behaviorally.

## 8. Acceptance Criteria

1. RevenueCat is completely dormant in v1.0 unless `EXPO_PUBLIC_ENABLE_REVENUECAT === 'true'`.
2. No RevenueCat network traffic in v1.0.
3. No placeholder API key (`appl_YOUR_API_KEY_HERE` / `goog_YOUR_API_KEY_HERE`) remains in source.
4. No purchase, restore, offering, or customer-info call is made in v1.0.
5. No RevenueCat errors are sent to Sentry because of intentional disablement.
6. No active premium UI is reachable in production.
7. `npx tsc --noEmit` passes with 0 errors.
8. The app can be submitted as a genuinely free app with no active subscriptions.
9. RevenueCat code remains in the repo and is easy to reactivate.
10. v1.1 reactivation requires no code changes — only setting `EXPO_PUBLIC_ENABLE_REVENUECAT=true` in EAS env + a new build.

## 9. Verification Commands

```bash
# A. RevenueCat init call sites
grep -rn "initializeRevenueCat\|checkSubscriptionStatus" \
  app/ services/ --include="*.tsx" --include="*.ts"
# Expected: all call sites are gated by REVENUECAT_ENABLED or the function
# implementation itself short-circuits.

# B. Purchases.configure is behind enabled flag + key check
grep -nB5 "Purchases.configure" services/revenuecat.ts
# Expected: the call is inside a block guarded by REVENUECAT_ENABLED and
# a non-empty API key check.

# C. Placeholder API key removed
grep -rn "appl_YOUR_API_KEY_HERE\|goog_YOUR_API_KEY_HERE" .
# Expected: empty (excluding node_modules / .git)

# D. Paywall navigation reachability
grep -rn "router.push.*paywall\|router.replace.*paywall\|navigate.*paywall" \
  app/ components/ --include="*.tsx"
# Expected: only inside components/PremiumGate.tsx (which is unrendered)

# E. PremiumGate usages
grep -rn "<PremiumGate" app/ components/ --include="*.tsx"
# Expected: empty (component is defined but not rendered)

# F. TypeScript clean
npx tsc --noEmit
# Expected: 0 errors
```

Optional manual verification on a development build with `EXPO_PUBLIC_ENABLE_REVENUECAT` unset:

1. Launch the app, open Settings → confirm no Upgrade flow visible
2. Inspect Charles Proxy / Proxyman → confirm zero requests to `api.revenuecat.com`
3. Inspect Sentry breadcrumbs after a session → confirm zero `revenuecat` category events
4. Confirm `isPremium === false` in fastStore (default value, never mutated)

## 10. v1.1 Reactivation Checklist

When ready to ship the paywall in v1.1, perform every step in this list. None require rewriting code — only restoring deactivated paths.

### Code reversals (3 small edits, ~2 minutes)

A. **Restore the paywall route file:**
```bash
git mv app/_paywall.tsx app/paywall.tsx
```

B. **Re-register the paywall in the navigation Stack** — `app/_layout.tsx`. Replace the SPEC-17 comment block (immediately above `<Stack.Screen name="index" ... />`) with:
```tsx
<Stack.Screen name="paywall" options={{ headerShown: true, title: 'Premium' }} />
```

C. **Remove the typed-routes escape hatch in `components/PremiumGate.tsx`.** Change:
```tsx
onPress={() => router.push('/paywall' as any)}
```
back to:
```tsx
onPress={() => router.push('/paywall')}
```
And delete the SPEC-17 comment block above it (the one starting with `SPEC-17 (v1.0): RevenueCat is disabled and app/paywall.tsx is renamed`).

### Environment reversals (EAS dashboard)

D. **Provision the real RevenueCat API key in EAS:**
   ```bash
   eas env:create --name EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY \
     --value "appl_REAL_KEY_FROM_REVENUECAT_DASHBOARD" \
     --environment production --visibility sensitive
   ```
   (Use `sensitive` not `secret` — needs to be embedded in the bundle since it's `EXPO_PUBLIC_*`.)

E. **Enable the feature flag in EAS:**
   ```bash
   eas env:create --name EXPO_PUBLIC_ENABLE_REVENUECAT \
     --value "true" \
     --environment production --visibility plaintext
   ```

### Product work (the actual feature)

F. **Decide and implement which features are premium.** Wrap them in `<PremiumGate>`. Currently zero features are gated — this is a v1.1 product decision.

G. **Decide where the Upgrade entry point lives.** Options:
   - Settings tab: replace the static "Premium coming soon" card with a tappable "Upgrade to Premium" card
   - Profile card on Timer tab (`components/ProfileCard.tsx` is ready)
   - In-context CTAs on locked features
   - Recommend: pick one primary path for v1.1 to keep the IA simple.

H. **Test the purchase flow on a TestFlight build:**
   - Verify the paywall renders offerings from RevenueCat
   - Verify `purchasePackage` succeeds via a sandbox Apple ID
   - Verify `restorePurchases` works after reinstall
   - Verify Sentry captures purchase failures with sanitized contexts (SPEC-16 redactor handles this)

### App Store paperwork

I. **Update Apple App Privacy labels** to add the RevenueCat-related entries (see §7 "Before SPEC-17" table — six entries total, up from two).

J. **Update App Store description** to remove the "NO SUBSCRIPTIONS REQUIRED" claim (or rephrase to "Core features always free — optional premium upgrade").

K. **Submit v1.1 for review** with subscription notes in the App Review Information section (sandbox test credentials, screenshots of the paywall flow, in-app purchase products list).

### v1.1 acceptance checklist

After completing steps A–K, verify before submission:

- [ ] `git mv app/_paywall.tsx app/paywall.tsx` completed
- [ ] `<Stack.Screen name="paywall" ... />` re-registered in `_layout.tsx`
- [ ] `'/paywall' as any` cast removed from `PremiumGate.tsx`
- [ ] `EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY` set in EAS production (sensitive visibility)
- [ ] `EXPO_PUBLIC_ENABLE_REVENUECAT=true` set in EAS production
- [ ] At least one feature is wrapped in `<PremiumGate>` (otherwise users will never see the paywall)
- [ ] At least one user-facing path navigates to `/paywall`
- [ ] Sandbox purchase tested end-to-end on TestFlight
- [ ] App Privacy labels updated in App Store Connect
- [ ] App Store description copy updated

## Progress Notes

**Completed 2026-05-15.**

### What was done

1. **`services/revenuecat.ts`** —
   - Added exported `REVENUECAT_ENABLED` constant at module scope (lines 26-27). Defaults to `false` unless `EXPO_PUBLIC_ENABLE_REVENUECAT === 'true'`.
   - **Removed both placeholder API key fallbacks** (`'appl_YOUR_API_KEY_HERE'`, `'goog_YOUR_API_KEY_HERE'`). `REVENUECAT_IOS_KEY` and `REVENUECAT_ANDROID_KEY` are now `string | undefined`, sourced exclusively from `EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY` / `EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY`.
   - `initializeRevenueCat()` rewritten with a hard short-circuit at the top: `if (!REVENUECAT_ENABLED) return false`. When enabled but key missing, warns in dev only and returns false without calling `Purchases.configure`. Consolidated the platform-branch into a single `apiKey` variable to remove redundancy.
   - Added `if (!REVENUECAT_ENABLED) return …` short-circuits at the top of every other public function: `checkSubscriptionStatus` (returns `false`), `getCurrentOffering` (returns `null`), `purchasePackage` (returns `{success: false, error: 'RevenueCat disabled'}`), `restorePurchases` (same), `getCustomerInfo` (returns `null`), `getActiveSubscription` (returns `{isActive: false}`), `identifyUser` (no-op), `logoutUser` (no-op).
   - All 11 production console statements wrapped in `if (__DEV__)` guards. Production builds emit zero RevenueCat-related console output.
   - Sentry `captureException` retained for **genuine failures only** (e.g., invalid API key when enabled). When disabled, the short-circuits return before any Sentry surface is touched.

2. **`app/_layout.tsx`** —
   - Imported `REVENUECAT_ENABLED` from the service.
   - Replaced the unconditional RevenueCat init block with a gated `if (REVENUECAT_ENABLED) { ... }` block (lines 134-149). When the flag is false, the block is a complete no-op — no `initializeRevenueCat()` call, no `checkSubscriptionStatus()` call, no `setPremium()` call, no logging.
   - Removed the misleading `console.warn('[App] RevenueCat initialization failed')` — disablement is intentional, not a failure.
   - Outer-catch `console.error` gated behind `__DEV__`.

3. **`expo/specs/SPEC-17-revenuecat-runtime-disablement-v1.md`** — full spec drafted including problem statement, risk inventory, current behavior, implementation changes, feature flag design, file inventory, App Privacy label before/after impact, acceptance criteria, verification commands, and v1.1 reactivation checklist.

### Verification results

```text
F1. initializeRevenueCat / checkSubscriptionStatus call sites:
  - Definitions in services/revenuecat.ts (lines 46, 117)
  - Single call site in app/_layout.tsx (lines 141, 143), gated by
    `if (REVENUECAT_ENABLED) { ... }` at line 139
  - Reference in app/paywall.tsx:21 (unreachable in v1.0 — paywall not
    navigable from any production UI)

F2. Purchases.configure context:
  - Line 85 of services/revenuecat.ts. Reached only after passing two
    guards: REVENUECAT_ENABLED check (line 48) and apiKey non-empty
    check (line 58). When disabled OR key missing, Purchases.configure
    is never invoked.

F3. Placeholder API key in source:
  - grep "appl_YOUR_API_KEY_HERE|goog_YOUR_API_KEY_HERE" → empty.
    Both placeholder fallbacks removed.

F4. Paywall navigation reachability:
  - Only router.push('/paywall') is in components/PremiumGate.tsx:38.
    PremiumGate is unrendered (F5), so this code path is unreachable.

F5. PremiumGate usages:
  - grep "<PremiumGate" → empty. Component defined but rendered zero
    times in app/ or components/.

F6. Feature flag export:
  - REVENUECAT_ENABLED exported at services/revenuecat.ts:26.
  - Imported and used in app/_layout.tsx:19, 139.
  - Used as short-circuit guard in 9 functions inside revenuecat.ts.

F7. TypeScript: npx tsc --noEmit returned 0 errors.
```

### Runtime expectations with EXPO_PUBLIC_ENABLE_REVENUECAT unset

- No call to `Purchases.configure` → no RevenueCat SDK initialization
- No anonymous `$RCAnonymousID:<uuid>` generated
- No request to `api.revenuecat.com` (verifiable via Charles Proxy / Proxyman)
- No `revenuecat` category Sentry events
- No 401 errors in Sentry
- `useFastStore.isPremium` stays at default `false` for the entire session
- All app features work normally as a free app

### App Privacy label posture for v1.0

Per SPEC-17 §7 "After SPEC-17" table, the App Store Connect privacy declaration for v1.0 reduces to:

- Diagnostics → Crash Data (Not Linked to User) — Sentry per SPEC-16
- Diagnostics → Other Diagnostic Data (Not Linked to User) — Sentry per SPEC-16

**No Identifiers, no Purchases, no Product Interaction, no RevenueCat diagnostics.** The marketing claim "NO ADS. NO SUBSCRIPTIONS REQUIRED." is now structurally truthful at the binary level.

### Deviations from spec

None. Spec executed exactly as written.

One minor cleanup beyond the spec: the original `initializeRevenueCat` had a redundant platform-branch (`if (ios) configure(IOS_KEY) else if (android) configure(ANDROID_KEY)`). Consolidated to a single `apiKey` variable already resolved at the top of the function. Functionally identical, fewer branches to maintain.

### Pending (out of scope — for v1.1 reactivation)

See §10 of this spec. Summary: set `EXPO_PUBLIC_ENABLE_REVENUECAT="true"` and `EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY` in EAS production env, decide which features are premium, wire up the Upgrade entry point in the UI, test the purchase flow on TestFlight with sandbox credentials, update App Privacy labels.
