# SPEC-23: Apple Health sync reliability fixes + TestFlight build 103

**Status:** Code complete and committed (`dd28cff`, branch `sdk-upgrade`). Build 103 built on EAS. **Pending:** TestFlight submit + on-device verification (HealthKit cannot be tested in the simulator).

## Problem
After a long break the owner reported Apple Health sync "not working well". Code review of `utils/appleHealth.ts`, `components/WeightEntryModal.tsx`, `components/AppleHealthCard.tsx`, `app/_layout.tsx` and `store/weightStore.ts` found four root causes. No device logs were available; these are code-level findings, so on-device confirmation is still required.

| # | Cause | Effect |
|---|---|---|
| 1 | `WeightEntryModal` wrote to Health at `Date.now()`, then `syncWeightData('both')` exported the same manual entry again (it only filtered on `date > lastHealthSync`) | Duplicate samples in Health; they re-imported as extra local entries (timestamps differed by ms) |
| 2 | Import only fetched samples newer than `lastHealthSync`, limit 100 | Late-syncing / backdated samples (smart scales, other apps) never imported |
| 3 | `lastHealthSync` only updated when `imported > 0 \|\| exported > 0` | UI showed "Last sync: Never" after a successful no-op sync |
| 4 | `initHealthKit()` failure on launch called `setHealthConnected(false)` | A transient failure (e.g. device locked) permanently disconnected the user |

## Changes
- `store/weightStore.ts`: `WeightEntry` gains optional `healthId` (HealthKit sample id, imported entries) and `healthSynced` (manual entry already written to Health). Persist version **3 → 4**; migration marks all legacy manual entries `healthSynced: true` so they are not exported twice.
- `utils/appleHealth.ts`:
  - Export filter is now `source === 'manual' && !healthSynced`; each entry is flagged after a successful save.
  - Import re-scans `lastHealthSync - 30 days` (`IMPORT_LOOKBACK_MS`), limit 100 → 1000. Dedupe by `healthId` or timestamp within 1s (`SAME_SAMPLE_TOLERANCE_MS`).
  - `lastHealthSync` set on every successful sync.
  - `initHealthKit({ keepConnectedOnFailure })` option; failures no longer clear `isHealthConnected` when set.
- `components/WeightEntryModal.tsx`: single `entryDate` used for both Health write and local entry; entry saved with `healthSynced` result. Removed non-`__DEV__` console output.
- `app/_layout.tsx`: launch reinit uses `keepConnectedOnFailure: true` and fires a background `syncWeightData('both')` on success. Initialization order (hydration → RevenueCat gate → HealthKit) unchanged.

## Invariants to preserve
- Privacy (SPEC-16): no weight/date values in Sentry; `console.*` only under `__DEV__`. Nothing added here violates that.
- A manual entry must be exported to Health **at most once** (`healthSynced`). Any new code path that writes to Health must set it.
- Imported entries must carry `healthId`.

## Known gaps (deliberately not fixed)
- Editing or deleting an entry in the app is not mirrored to Health.
- (Superseded by follow-up below: import is now full-history with `deletedHealthIds` tombstones; the 30-day lookback was removed.)
- Entries from Health are assumed to arrive in pounds (library default) and converted to the user's unit.

## Verification (on physical iPhone, TestFlight build 103)
- [ ] Add weight in app with "sync to Health" on → exactly one sample in Health.
- [ ] Add weight in Health app, reopen Tranquil Fast → appears once.
- [ ] Tap Sync in the Apple Health card with nothing new → "Last sync" updates (not "Never").
- [ ] Lock phone, cold-launch from a notification/background → still shows Connected.
- [ ] Upgrade path: install over a build-102 install with existing weights → no duplicates exported.
- [ ] Test both lbs and kg.

## Build / release log
- 2026-10-17: `npx tsc --noEmit` clean. `expo-doctor`: 3 non-blocking warnings (patch-level SDK 54 drift, duplicate `@expo/fingerprint`, RN Directory metadata); dependencies intentionally not bumped.
- 2026-10-17: Provisioning profile had expired → regenerated interactively (new Apple Distribution cert, serial ending `...21A7B`, valid to 2027-10-17; profile `M848KB5MRM`, valid to 2027-10-17).
- 2026-10-17: `eas build --platform ios --profile production` → **buildNumber 103** (102 → 103), build id `9fd1da62-41bf-4273-bebc-c7b747fbb403`, status finished.
- **Submit not yet done.** Run: `eas submit --platform ios --profile production --id 9fd1da62-41bf-4273-bebc-c7b747fbb403`

## Environment notes
- `preview` profile = internal/ad hoc distribution (NOT TestFlight). Use `production` for TestFlight.
- Non-interactive EAS builds fail when credentials are expired; run the build interactively once to renew.
- Xcode license on the dev Mac was not accepted (`sudo xcodebuild -license`), which breaks the `/usr/bin/python3` shim. EAS cloud builds are unaffected.

## Progress Notes

### 2026-10-17 — Follow-up: build 103 on TestFlight imported NO weight data, yet reported "success"
Debug findings (code review incl. `node_modules/react-native-health/RCTAppleHealthKit/*.m`; no device logs):
- Native `getWeightSamples` is correct (all `BodyMass` samples in range, no source filter) and JS does no filtering, so the loss is either iOS returning empty or our import window.
- `AppleHealthCard` showed "Successfully synced" unconditionally when nothing threw → 0 results looked like success.
- iOS never reveals READ denial; denied read = empty result with no error. This is the only cause that explains zero data of any age. **Not provable from code — confirm on device:** Settings › Health › Data Access & Devices › Tranquil Fast › Weight must be ON, and the Health app must actually contain weight samples.
- Regression introduced by the first SPEC-23 commit: `lastHealthSync` now always updated + import limited to `lastSync − 30d`, so one empty/early sync hid all older weights. Fixed: import always reads full history.
- Bug: native `saveWeight` reads `startDate`, we passed `date` → exported samples were dated "now". Fixed.
- Added `deletedHealthIds` (weightStore, no version bump needed; defaults merge) so full-history import doesn't resurrect deleted entries (removes the earlier "known gap").
- Card now shows a Settings hint when a sync imports/exports nothing.

**Confirmed by the owner on device:** Weight read was OFF (write ON) — the permission-denied explanation was correct. The code requests read+write together (`utils/appleHealth.ts`, `permissions.read/write: [Weight]`); the sheet has separate toggles and iOS never re-prompts after a decision. The in-app hint for this case was implemented in SPEC-24.

**Needs a new build (104)** — fixes are source-only until rebuilt. Then re-run the verification checklist above. If still empty after confirming Weight read is ON and Health has data, next step is a dev-client build with `__DEV__` logging of `getWeightSamples` result count.

## SPEC-26 note
`healthSynced` (above) was superseded by `healthExport` (opted_out|pending|synced) in SPEC-26.
