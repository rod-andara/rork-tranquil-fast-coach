# SPEC-28: Release-candidate verification matrix (docs / manual test)

**Status:** Pending. Run on the **exact signed build** produced after SPEC-25, 26, 27 (expected build 105). Source of truth for go/no-go. Derived from Manus finding A7.
**No code changes.** Record results in "Progress Notes" and commit the filled-in file (`docs(release): SPEC-28 results`).

## Release record (fill in)
- Build number / EAS build ID / commit SHA / `git status` clean?: ____
- Device model + iOS version: ____
- Tester / date: ____
- EAS production env: `EXPO_PUBLIC_ENABLE_REVENUECAT` absent or not `true`: ☐ confirmed
- No `ios/` or `android/` dir present at build time (canary in build log did not print "an ios directory was detected"): ☐

## Matrix (mark PASS / FAIL / N/A with notes)
### Fasting (SPEC-25)
- [ ] Start → kill app → relaunch: fast continues with correct elapsed
- [ ] Settings › Fasting Plan: tap cards, go back → fast unchanged
- [ ] Apply a different plan mid-fast → same start, new target, reminders match
- [ ] Apply shorter plan than elapsed → goal-reached state; End records normally
- [ ] Custom plan duration honored (not 16h)
- [ ] No Pause UI anywhere
- [ ] Start → End → Start rapidly around notification permission prompt → no stray/duplicate reminders
- [ ] Notifications disabled mid-fast → no more reminders
- [ ] Notification permission denied → app works, no crash

### Apple Health (SPEC-26) — physical iPhone only
- [ ] Fresh install, Allow read+write → Connected; weights import once
- [ ] Allow write only (read off) → hint box + Open Health works; enabling read then Sync Now imports
- [ ] Deny all → app usable, no crash, no false "success"
- [ ] Add weight, switch ON → exactly one Health sample, correct value/date (lbs and kg)
- [ ] Add weight, switch OFF → never appears in Health (Sync Now + relaunch ×2)
- [ ] Launch app, immediately Sync Now and Add Weight → no duplicates
- [ ] Upgrade over build 104 data → history intact, no mass export, no duplicates
- [ ] Delete an imported entry → does not return after Sync Now

### Release surface & privacy (SPEC-27)
- [ ] `tranquilfastcoach://paywall` and `://_paywall` → not found (cold + warm)
- [ ] No purchase/subscription UI reachable; no StoreKit sheet
- [ ] Settings: Privacy Policy / Terms / Support open the hosted pages (HTTPS, logged out, 200)
- [ ] Erase All Data: confirmation text correct; afterwards onboarding appears, all tabs empty, Health disconnected, no pending reminders; Apple Health data still present
- [ ] Learn tab images and links load (no ATS exception present)
- [ ] App name consistent on home screen, Settings footer, ASC listing

### UI & resilience
- [ ] Add Weight / Weight Goal / Custom Duration modals open, type, save, dismiss — light and dark mode
- [ ] Dark/light toggle consistent on all tabs
- [ ] Zero-data states (new install) on Home, Progress (0/1/7+ weights), Learn
- [ ] Airplane mode: everything core works
- [ ] Dynamic Type at largest size: no clipped primary actions (note issues for backlog)
- [ ] VoiceOver quick pass on Home/Fast/Add Weight (note issues for backlog B2/B3)

### Privacy evidence (owner)
- [ ] Sentry test crash on this build reviewed: no health/weight values; IP storing disabled; installation ID noted
- [ ] ASC App Privacy answers match SPEC-21 decision record

## Go / No-go
All critical sections PASS and owner tasks in SPEC-27 complete → submit for review. Any FAIL in Fasting, Health, or Release surface → fix, rebuild (new SPEC or addendum), re-run affected rows.

## Progress Notes
### Static pre-checks (2026-10-17, Claude Code, working tree at 0b4ab76 + uncommitted SPEC-25..27 changes)
Not a substitute for the matrix. The matrix must still be run by the owner on the signed build on a physical iPhone.
- `npx tsc --noEmit`: clean.
- No `expo/ios` or `expo/android` directory present.
- `console.*` grep: every hit is inside a braced `__DEV__` block.
- `app/` has no paywall route (only `_layout`, `(tabs)`, `+not-found`, `index`, `onboarding`); `dormant/paywall.tsx` exists; `_layout.tsx` registers no paywall screen.
- `app.json`: no `NSAppTransportSecurity`; `supportsTablet: false`; name "Tranquil Fast Coach"; scheme `tranquilfastcoach`.
- `EXPO_PUBLIC_ENABLE_REVENUECAT` not set in `eas.json` or `.env*`. EAS dashboard env vars were not checked.
- Working tree is NOT clean (SPEC-25..27 changes uncommitted), so the release record's "git status clean" box cannot be ticked yet. Commit before building 105.
- Matrix rows: all still open (device-only).
