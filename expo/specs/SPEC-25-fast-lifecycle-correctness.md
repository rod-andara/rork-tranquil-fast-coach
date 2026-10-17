# SPEC-25: Fast lifecycle correctness (remove Pause, safe plan change, notification lifecycle)

**Status:** Pending. Pre-launch **critical** (from the Manus independent review, findings A1, A5, A6; plus B8/B12 quick wins).
**Run order:** first of SPEC-25 → 26 → 27 → 28. One session, one commit. Commit trailer: `Spec: SPEC-25`.

## Files to Read
`CLAUDE.md`, `store/fastStore.ts`, `app/onboarding/choose-plan.tsx`, `app/(tabs)/fast.tsx`, `app/(tabs)/home.tsx`, `components/CircularProgress.tsx`, `hooks/useFastTimer.ts`, `utils/notificationsUtils.ts`, `utils/fastingUtils.ts` (`getPlanDuration`).

## Decisions (already made by the owner)
1. **Pause is removed for v1.0.** A fast runs until the user ends it.
2. **Changing plan during an active fast adjusts the running fast:** keep `id` and `startTime`, switch target to the new plan's duration, reschedule the remaining reminders. If elapsed already exceeds the new target, the fast simply shows goal reached and the user ends it when ready. It is never discarded.

## Problems (verified in code)
| # | Problem | Evidence |
|---|---|---|
| A1 | Tapping a plan card (from Settings) calls `updatePlan()` immediately; for an active fast it sets `currentFast: null` with no history entry or confirmation. The screen also starts on `'16:8'` instead of the persisted plan. | `choose-plan.tsx` card `onPress`; `fastStore.ts` `updatePlan` |
| A5 | Pause toggles `isRunning` only. `useFastTimer` zeroes elapsed while not running; resume recomputes from original `startTime`, so paused time counts toward progress/history. `fast.tsx` keeps a separate local `isPaused` that can disagree with the persisted state after remount. | `useFastTimer.ts`, `fast.tsx`, `fastStore.ts` `pauseFast` |
| A6 | `scheduleMilestones` awaits permission/cancel/each schedule while cancellations are fire-and-forget, so a stale scheduler can add notifications after a cancel (or cancel a newer fast's). | `notificationsUtils.ts`, `fastStore.ts` |
| B8 | `endFast` awaits `NetInfo.fetch()` before the authoritative `saveToStorage()`; killing the app in that window can resurrect the ended fast. | `fastStore.ts` `endFast` |

## Changes
### 1. Remove Pause
- `fast.tsx`: delete the Pause/Resume button, `isPaused` state, `handlePauseResume`, unused `Pause`/`Play` imports. The status label is fixed to `FASTING`.
- `fastStore.ts`: remove `pauseFast` from the interface and implementation. Keep `isRunning?` on `FastSession` as optional/ignored for backward-compat with persisted data (do not break `loadFromStorage` spread).
- `loadFromStorage`: if `currentFast` exists with `isRunning === false`, set it to `true` (elapsed is wall-clock from `startTime`; a previously paused session just resumes counting; document this).
- `useFastTimer.ts`: drop the `isRunning` branch (always tick while `currentFast` exists); remove the redundant `storageKeys.elapsedMs` AsyncStorage cache and the unregistered `TaskManager.defineTask` (B12). Keep `formatTime` / `calculateProgress`. If `storageKeys.elapsedMs` becomes unused, leave the key export in `utils/index.ts` (no churn) or remove if nothing references it.
- `CircularProgress`/`home.tsx`: stop passing `isRunning` if now meaningless (keep the prop optional to avoid wide edits).

### 2. Reversible plan selection
- `choose-plan.tsx`: card taps and the Custom modal only set **local** selection state; initial `selectedPlan` = persisted `useFastStore().selectedPlan` (and honor persisted `customDuration`). No store mutation on card tap.
- The footer button is the only commit. For `fromSettings`: call `updatePlan(selectedPlan)` then `router.back()`. For onboarding: unchanged (`setSelectedPlan` → `completeOnboarding` → home).
- Footer copy when `fromSettings` and a fast is active: "Apply to current fast" (otherwise "Save plan"). Keep onboarding copy unchanged.

### 3. `updatePlan` adjusts the running fast
```ts
updatePlan: async (plan) => {
  const { currentFast, customDuration, notificationsEnabled } = get();
  set({ selectedPlan: plan });
  if (currentFast) {
    const plannedDuration = getPlanDuration(plan, customDuration); // ALWAYS pass customDuration (CLAUDE.md)
    set({ currentFast: { ...currentFast, plan, plannedDuration } });
    cancelFastingNotifications();
    if (notificationsEnabled) {
      const elapsedSec = Math.floor((Date.now() - currentFast.startTime) / 1000);
      scheduleMilestones(Math.floor(plannedDuration / 1000), true, elapsedSec);
    }
  }
  await get().saveToStorage();
}
```
- Never set `currentFast: null`. Confirm `fast.tsx`/`home.tsx` render sensibly when `elapsed > plannedDuration` (progress clamps at 100%; copy should read as goal reached, not an error). `getFastingMessage` already exists in `utils/fastingUtils.ts`; verify its behavior for >100%.
- Also fix the custom-duration path: `handleSaveCustomDuration` must set the duration, then (if `fromSettings`) defer applying until the footer button so the same single commit path is used.

### 4. Notification lifecycle (generation guard)
In `utils/notificationsUtils.ts`:
- Module-level `let generation = 0`.
- `cancelFastingNotifications()` does `generation++` **synchronously first**, then awaits `cancelAllScheduledNotificationsAsync()`.
- `scheduleMilestones(totalSeconds, enabled, elapsedSeconds = 0)`: capture `const myGen = ++generation` at entry (invalidates any older in-flight scheduler), then after every `await` (setup, cancel, each `scheduleNotificationAsync`) `if (myGen !== generation) return;`.
- Schedule only milestones with `elapsedSeconds < m.seconds && m.seconds <= totalSeconds`, with trigger `seconds: m.seconds - elapsedSeconds`.
- Callers: `startFast` (elapsed 0), `updatePlan` (above), `setNotificationsEnabled(true)` mid-fast (reschedule from elapsed; today it does nothing, acceptable to leave as-is but note it), `endFast`/`setNotificationsEnabled(false)` (cancel).
- `cancelAllScheduledNotificationsAsync` remains correct while milestones are the only scheduled notifications (documented in the file header).

### 5. `endFast` ordering
`set({currentFast:null, fastHistory:[...]})` → `cancelFastingNotifications()` → **`await get().saveToStorage()`** → then the NetInfo/stub work in a `try/catch` (stubs stay inert).

## Out of scope
Health sync (SPEC-26), Erase All Data and legal links (SPEC-27), accessibility (backlog).

## Verification
- `npx tsc --noEmit` clean before/after. `grep -rn "pauseFast\|isPaused\|handlePauseResume" app components store hooks` → no hits.
- Device/Expo Go:
  - [ ] Start 16:8 fast → Settings › Fasting Plan → tap several cards → tap back arrow → fast still active, unchanged target.
  - [ ] Same, tap 18:6 then footer → same start time, target now 18h, progress recalculated, History unaffected.
  - [ ] Switch to a shorter plan than elapsed → progress 100% / goal-reached messaging; End Fast records it normally.
  - [ ] Custom plan: pick custom hours, Save → target uses the custom duration (not 16h).
  - [ ] Reminders: with 13h elapsed switch to 20:4 → only the 16/18/20h milestones remain, firing at the right remaining times (use a short test duration or inspect scheduled notifications).
  - [ ] Kill and relaunch mid-fast → fast continues; build-104 persisted *paused* session resumes counting.
  - [ ] Start → End quickly, repeatedly → no stray notification later.
  - [ ] No Pause button anywhere (Fast tab, Home).
- Update `CLAUDE.md` (pause removed; `updatePlan` semantics; notification generation guard), `specs/README.md`, SPEC-20 note (pause cancellation moot).

## Rollback
Revert the commit. Persisted data stays compatible (`isRunning` still optional).

## Progress Notes
(none yet)
