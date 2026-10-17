# SPEC-26: Apple Health export consent + startup/sync integrity

**Status:** Code complete (device verification pending). Pre-launch **high** (Manus findings A3, A4). Builds on SPEC-23/24 — read their invariants first.
**Run order:** after SPEC-25. One session, one commit. Trailer: `Spec: SPEC-26`.

## Files to Read
`CLAUDE.md` (Apple Health sync invariants), `specs/SPEC-23-*.md`, `store/weightStore.ts`, `components/WeightEntryModal.tsx`, `utils/appleHealth.ts`, `app/_layout.tsx`, `components/AppleHealthCard.tsx`.

## Problems (verified)
| # | Problem | Evidence |
|---|---|---|
| A3 | `healthSynced: false` conflates "user switched Sync to Apple Health OFF" with "write failed / not yet attempted". `syncWeightData` exports every manual entry with `!healthSynced` — including on every app launch — so an entry the user deliberately kept local can later be exported. (Design flaw introduced in SPEC-23.) | `WeightEntryModal.tsx` save path, `appleHealth.ts` export filter, `_layout.tsx` launch sync |
| A4a | `_layout.tsx` awaits `fastStore.loadFromStorage()` but not weight-store persist hydration, then reads `isHealthConnected`/calls `setUnitDefault`. A not-yet-hydrated store can look disconnected and skip HealthKit reinit, or have its unit overwritten. | `_layout.tsx` `loadData`; `weightStore.ts` has no hydration flag |
| A4b | Launch sync, card "Sync Now", and the modal's direct write are not serialized; two overlapping runs over the same snapshot can import or export the same sample twice. | `appleHealth.ts` |

## Changes
### 1. Consent separate from delivery state
- `WeightEntry`: replace `healthSynced?: boolean` with `healthExport?: 'opted_out' | 'pending' | 'synced'` (only meaningful for `source: 'manual'`).
  - Modal, switch ON: entry saved as `pending`; after a successful `saveWeightToHealth` it becomes `synced`. If the write fails or HealthKit isn't ready it stays `pending` (retried by sync).
  - Modal, switch OFF (or not connected): `opted_out`. Editing an entry never changes its state.
- `syncWeightData` export: only `healthExport === 'pending'`; flag `synced` after each successful write (existing per-entry update pattern).
- **Persist version 4 → 5 migration** (`weightStore.ts`): `healthSynced === true` → `'synced'`; every other `manual` entry → `'opted_out'` (conservative: legacy history is never silently exported). Delete the old `healthSynced` field. Document in CLAUDE.md that a v1.1 "export older entries" action may be offered.
- Update every reference (`grep -rn healthSynced`). CLAUDE.md invariant text must be rewritten accordingly.

### 2. Hydration gate
- Add a small helper (e.g. `waitForWeightStoreHydration()` in `store/weightStore.ts` or `_layout.tsx`) using the zustand persist API: if `useWeightStore.persist.hasHydrated()` resolve immediately, else `useWeightStore.persist.onFinishHydration(cb)`. Await it in `loadData` **before** `setUnitDefault` and before reading `isHealthConnected`. Keep the documented init order: store hydration → RevenueCat (gated) → HealthKit reinit.

### 3. Serialize Health work
- In `utils/appleHealth.ts` add a module-level promise queue:
```ts
let queue: Promise<unknown> = Promise.resolve();
const runExclusive = <T>(fn: () => Promise<T>): Promise<T> => {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
};
```
  Wrap the bodies of `syncWeightData` and `saveWeightToHealth` (exported signatures unchanged) so launch sync, card sync, and modal writes never interleave. Do not hold the queue across `initHealthKit` permission prompts.
- `weightStore.addEntry`: if `entry.healthId` already exists in `entries` (or in `deletedHealthIds`), ignore it — defense in depth against double imports. Keep the 1s timestamp fallback in `syncWeightData` only for echo of our own exports.

## Out of scope
Partial-sync reporting, history windowing/paging, mirroring edits/deletes (backlog B6/B7).

## Verification
- `npx tsc --noEmit` clean; `grep -rn healthSynced` → no hits outside migration code/comments.
- On device (physical iPhone, Health read+write allowed):
  - [ ] Add weight with switch OFF → appears in app only; tap Sync Now, relaunch twice → still absent from Health.
  - [ ] Add weight with switch ON → exactly one new sample in Health; no duplicate in the app after Sync Now.
  - [ ] Switch ON while HealthKit write fails (revoke Weight write) → saved locally as pending; re-enable write → next sync exports it once.
  - [ ] Upgrade install over build 104 data: existing history intact, **no** mass export to Health, no duplicates.
  - [ ] Cold launch with Health connected → stays Connected; unit not reset; immediate Sync Now + Add Weight right after launch → no duplicates.
  - [ ] lbs and kg.
- Update `CLAUDE.md` Apple Health invariants, SPEC-23 progress notes (supersede `healthSynced`), `specs/README.md`.

## Rollback
Revert commit; persisted v5 data would fail to downgrade cleanly — only revert before shipping a build that includes it.

## Progress Notes
Implemented. Deviation: the modal no longer calls saveWeightToHealth directly; it saves the entry as `pending` and calls `syncWeightData("export")` so the write goes through the single queue (a direct write could race a sync exporting the same pending entry). SPEC-23 `healthSynced` is superseded by `healthExport`.
