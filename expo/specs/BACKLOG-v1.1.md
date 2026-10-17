# Backlog: post-launch enhancements (v1.1+)

Source: independent Manus pre-launch review of commit `6115283` (full text in `specs/reference/MANUS-prelaunch-review-2026-10.md`). Items B1–B12 are **not** launch blockers. Each should become its own SPEC when scheduled. Evidence references were verified or noted below.

| ID | Pri | Effort | Item | Notes / where |
|---|---|---|---|---|
| B2a | High → **consider promoting pre-launch** | S | Accessibility labels for core controls: End Fast button, modal Close buttons, Health switch row, selected state on plan cards, unit selector, chart range buttons | `fast.tsx`, `WeightEntryModal.tsx`, `FastPlanCard.tsx`, `UnitSelectorRow.tsx`. Cheap, user-visible, reviewer-visible. |
| B1 | High | S | Ask notification permission in context (when enabling reminders / first fast), not at root mount; model "preference" separately from OS authorization and show a Settings route when denied | `App.tsx`, `services/notifications.ts`, `notificationsUtils.ts` |
| B3 | High | M | VoiceOver value/summary for the progress ring (elapsed/remaining/percent) and weight chart (range, count, start/current/change/min/max/goal) | `CircularProgress.tsx`, `WeightChart.tsx` |
| B4 | High | M | **Decision before enabling RevenueCat:** `Purchases.configure` creates an anonymous app user ID and sends purchase data to RevenueCat; conflicts with the "no user-identifying egress" invariant unless an explicit exception is documented (recipient, fields, purpose, retention, privacy labels). Keep Health/weight/fasting data out; restrict Sentry to static messages. | `services/revenuecat.ts`, SPEC-17 §10 |
| B5 | High | M | Entitlement state model (active / grace / expired / refunded / unknown-offline) instead of persisted `isPremium` boolean; gate actions/data not just blur; price/term/legal disclosure from configured products; no unsupported savings claims | `PremiumGate.tsx`, `dormant/paywall.tsx` |
| B6 | Medium | S | Health import contract: "full history" is really newest 1000 samples in a 10-year window; report partial sync outcomes (import succeeded, export failed) instead of all-or-nothing error | `appleHealth.ts`, `AppleHealthCard.tsx` |
| B7 | Medium | M | Legacy-entry export option (after SPEC-26 marks legacy manual entries `opted_out`); decide whether locally deleted app-created Health samples stay suppressed | `weightStore.ts`, `appleHealth.ts` |
| B8b | Medium | M | Versioned shape validation for `fastStore` persisted data (parseable-but-malformed JSON is spread into state) | `fastStore.ts loadFromStorage` |
| B9 | Medium | S | Dismiss splash only when UI is visible; single appearance source for navigation chrome vs `isDarkMode`; validate finite positive goal weights (UI + store) | `_layout.tsx`, `(tabs)/_layout.tsx`, `WeightGoalModal.tsx` |
| B10 | Medium | S | Learn content: recipe title/claim vs destination mismatch; remove static retailer prices/ratings; neutral non-outcome onboarding copy | `utils/content.ts`, `choose-plan.tsx` |
| B11 | Low | M | Allowlist-first Sentry outbound policy (normalize keys, cover `event.user`, free-form exception/message/breadcrumb strings, adversarial fixtures); decide on native app-hang reporting | `_layout.tsx`, `ErrorBoundary.tsx` |
| B12 | Low | S | Document wall-clock timer policy (device clock changes); partly addressed by SPEC-25 removing the redundant cache/task | `useFastTimer.ts` |
| B13 | Medium | S | Manus N3 (iPhone Mirroring test, build 104): Progress shows "100% complete" while Edit Goal says "Weight to gain". Likely an overshoot (start above target, current now below it): `getProgressPercentage` returns 100, the modal compares target vs current. Not reproduced; verify with synthetic gain/loss/at-goal/overshoot fixtures, then show "Goal reached" instead of gain/lose wording when overshot | `weightStore.ts getProgressPercentage`, `WeightGoalModal.tsx`, `(tabs)/progress.tsx` |

## Manus findings already handled or reclassified
- A1/A5/A6 → SPEC-25; A3/A4 → SPEC-26; A2/A8/A9 → SPEC-27; A7 → SPEC-28.
- Re-raise policy (per Manus): one-way notification handling and non-mirroring of app edits/deletes to Health are intentional v1 limits.

## Ideas (not from the review, for later consideration)
Weight-entry reminders (switch cancellation to identifier-based per `notificationsUtils.ts` header), Apple Watch/Live Activity for the active fast, home-screen widget, richer history/edit past fasts, export (CSV) of local data.
