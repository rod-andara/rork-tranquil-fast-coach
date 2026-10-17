# SPEC-24: Pre-App-Store-submission hardening

**Status:** Code complete (commit on branch `sdk-upgrade`). Ships in **build 104** (not yet built at time of writing). Follows SPEC-23 (Apple Health sync fixes).

## Context
After build 103 reached TestFlight, on-device testing showed Health import returned nothing because Weight **read** permission was off (write was on). iOS never reveals a denied read; it returns an empty list. Before App Store submission, a hardening pass was done on five items.

## Changes

### 1. Health read-permission hint (`components/AppleHealthCard.tsx`)
- Previously a sync that found nothing showed "Successfully synced". Now:
  - 0 imported + 0 exported **and no `apple_health` entry has ever been imported** → warning box "No weight data found in Apple Health", with the exact Settings path (Settings › Health › Data Access & Devices › Tranquil Fast › Weight) and an **Open Health** button (`x-apple-health://`, falls back to `Linking.openSettings()`).
  - 0 imported + 0 exported but we have imported before → treated as success (already up to date).
  - Anything imported/exported → success banner.
- The hint is cleared at the start of every sync.
- Heuristic caveat: a user whose Health genuinely has no weight data also sees the hint; the copy is phrased conditionally ("If Health has weight entries…").

### 2. App Transport Security exception removed (`app.json`)
- Deleted `NSAppTransportSecurity` → `images.unsplash.com` with `NSExceptionRequiresForwardSecrecy: false`. No source file references Unsplash or any `http://` URL (grep-verified), so it was dead config that weakened ATS and could draw App Review questions.
- **Verify on device:** all Learn-tab images still load.

### 3. `console.*` cleanup
- Every remaining ungated `console.log/warn/error` in `app/`, `components/`, `hooks/`, `store/`, `utils/`, `services/` is now `if (__DEV__) console...` (about 60 call sites, including dormant `app/_paywall.tsx` and `services/revenuecat.ts`). Calls already inside braced `__DEV__` blocks were left alone.
- Check: `grep -rnE "console\.(log|warn|error|info|debug)" app components utils store services hooks constants | grep -v __DEV__` → only multi-line calls inside braced `__DEV__` blocks remain (AppleHealthCard, appleHealth.ts, weightStore.ts, revenuecat.ts).
- Rule going forward: **no new ungated console output** (also a CLAUDE.md anti-pattern).

### 4. Stub services verified inert (no code change beyond log gating)
- `services/supabase.ts` and `services/offline-sync.ts` are called from `store/fastStore.ts` (`endFast` path) with `user_id: 'stub'`. They only push to an in-memory array / log under `__DEV__`. No Supabase SDK, no network, no persistence. Consistent with App Privacy labels (no data collected). Do not add a real backend without updating the privacy policy and ASC labels.

### 5. `ios.buildNumber` removed from `app.json`
- `eas.json` uses `appVersionSource: "remote"`, so the field was ignored and EAS warned on every build. Build numbers are managed by EAS (`autoIncrement`; last was 103, next is 104).

## Verification
- `npx tsc --noEmit` → 0 errors (baseline clean).
- `app.json` parses as valid JSON.
- On device (build 104):
  - [ ] Revoke Weight read in Settings › Health › Data Access → tap Sync Now → hint box appears; **Open Health** opens the Health app.
  - [ ] Re-enable read → Sync Now → weights import (see SPEC-23 checklist).
  - [ ] Sync again with nothing new → success, no hint.
  - [ ] Learn tab images load (ATS exception removed).
  - [ ] Normal fast start/stop, onboarding, settings toggles still work (log gating touched many files).

## Rollback
Each item is independent: restore the ATS block in `app.json`; revert log gating with `git revert`; the hint is confined to `AppleHealthCard.tsx`.

## Progress Notes
(Add on-device results for build 104 here.)
