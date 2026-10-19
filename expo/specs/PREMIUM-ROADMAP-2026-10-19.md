# Premium enhancement roadmap — Tranquil Fast

Prepared 19 October 2026. **Planning backlog, not authorization to implement or activate subscriptions.** The owner confirms the initial launch remains free. Build 109 was owner-reported submitted; this document does not independently establish approval or public availability.

## Product decision and boundaries

Proposed Plus price to validate: USD 3.99/month or USD 29.99/year, with the same feature entitlement. Target proposition: **plan a flexible routine, understand your progress, and manage your fast conveniently from your iPhone or Apple Watch.** Willingness to pay and adoption are untested. Watch control is a strong candidate for Watch owners, not proof of subscription demand across all users.

Recommended free baseline: retain the launch timer, existing standard/custom plans, basic reminders, weight tracking/goals, all existing chart ranges/history, Apple Health connection, appearance settings and Learn resources. Keep record access, basic corrections, deletion and basic export free. Accessibility, reliability and privacy fixes are product obligations, not premium features. These are recommended future product boundaries; do not add gates now.

This roadmap supersedes the proposed product gates in `07-premium-feature-gating.md`: do not implement that older proposal to lock existing custom plans or 90-day/all-history charts. SPEC-17 remains authoritative for the dormant subscription runtime. `BACKLOG-v1.1.md` contains separate maintenance work and historical review findings; its statuses need rechecking before scheduling.

## Ranking method and effort assumptions

Benefit score: 5 = substantial recurring benefit, 4 = strong repeated use, 3 = useful to a subset, 2 = occasional value, 1 = cosmetic. Reach distinguishes all users from narrower audiences. Ranking balances benefit, reach, differentiation, delivery risk and recurring value; it is a product judgment, not a measured formula or customer survey.

Effort is **incremental engineering person-days**, assuming one experienced Expo/iOS developer, an eight-hour focused day, existing app context and access to test devices. Includes design refinement, implementation, persistence/migrations, targeted tests and device verification. Excludes Apple review waiting, marketing, translation and the shared subscription foundation. Ranges are preliminary estimates, not quotes; AI assistance does not remove native integration or device QA. Work packages overlap, so do not simply sum all rows. M = 3–7 days, L = 8–15, XL = 16+; ranges crossing bands are shown explicitly.

| Rank / ID | Enhancement and smallest useful scope | Benefit / reach | Effort | Subscription contribution / dependencies |
|---|---|---|---|---|
| 1 / P-01 | Flexible weekly planner: weekday-specific windows, saved routines, reschedule/skip a planned day, upcoming start/end reminders; starting remains explicit | 5 / broad | M–L, 5–9 days | Core recurring convenience. Reuse safe fast commands and notification ownership; do not replace the active fast when editing future plans. |
| 2 / P-02 | Weekly review and advanced insights: planned/completed comparison, consistency, duration distribution, smoothed weight trend and previous-period comparison | 5 / broad | M–L, 5–8 days | Core recurring feedback. Useful retrospective summary can ship before planner; plan adherence requires P-01. Existing history/charts remain free. |
| 3 / P-03 | Apple Watch companion: elapsed/remaining/target, explicit start using the selected plan, confirmed end, synchronized state, clear disconnected/pending display | 5 / Watch owners; unknown share | L–XL, 15–25 days including spike and device QA | Strong differentiated reason to subscribe for Watch users. Depends on F-01/F-02 and successful W-00; connected scope below. |
| 4 / P-04 | Home Screen widgets: active-fast status and next planned window, tap to open correct screen | 4 / broad iPhone reach | M–L, 5–8 days | Everyday convenience; shared native snapshot foundation with P-05. Start read-only; interactive actions are additional scope. |
| 5 / P-05 | Lock Screen Live Activity / Dynamic Island where supported: elapsed/remaining and target | 4 / compatible devices | M–L, 5–8 days | Frequent visibility; separate lifecycle/background limits from widgets. No promise of a continuously running JS timer. |
| 6 / P-06 | Optional journal: hunger, energy, mood and notes, with weekly reflection summaries | 4 / engaged subset | M, 3–6 days | Supports P-02 without requiring AI. New sensitive data needs privacy review; patterns are descriptive, not causal or medical advice. |
| 7 / P-07 | Reminder customization: per-routine timing, quiet hours and optional weight check-ins | 4 / reminder users | M, 3–5 days | Good bundle support; basic existing reminders remain free. Identifier-based cancellation must avoid cancelling unrelated notifications. |
| 8 / P-08 | Goal milestones and maintenance view: configurable goals, progress since goal creation, maintenance range and gentle review prompts | 3 / goal-focused subset | M, 3–5 days | Useful but insufficient alone. Support gain, loss and maintenance without encouraging longer fasts or faster loss. |
| 9 / P-09 | Advanced shareable reports: user-reviewed weekly/monthly PDF with selected metrics and notes | 3 / occasional sharing | M, 3–5 days | Premium formatting/analysis; basic machine-readable export remains free. No automatic sharing or doctor-facing medical interpretation. |
| 10 / P-10 | Optional backup/restore and later multi-device history sync | 4 / switching-device subset | XL, 15–30 days | Valuable but backend/privacy/support burden. Architecture discovery required; backup and live conflict-resolving sync are separate specs. No promise to store HealthKit-derived data in iCloud. |
| 11 / P-11 | Original guided habit programs with reviewed lessons and scheduled check-ins | 3 / beginners | M–L, 5–10 engineering days plus separately estimated content production/review | Recurring value only with genuinely useful original material. External Learn links are not a premium content library. |
| 12 / P-12 | Apple Watch complications / Smart Stack entry points and richer wrist summaries | 4 / Watch owners | M–L, 4–8 days after P-03 | Expansion of proven Watch demand; refresh budgets apply. Begin with status/tap-through rather than another command surface. |

Deferred discovery, not first paid release: unlimited AI coaching, food-photo calorie estimation, social challenges/community and broad nutrition tracking. They add operating cost, accuracy/moderation responsibilities or substantial scope. Themes, icons and badges can complement Plus but are weak standalone subscription reasons. Do not add fasting-stage claims, health predictions or longest-fast competitions as a monetization strategy.

## Shared foundations (not separately marketable paid features)

| ID | Required work | Preliminary effort | Ready-to-spec acceptance outline |
|---|---|---|---|
| F-01 | Versioned, durable fasting command/state model | 4–7 days | Stable session/operation IDs, state revisions, idempotent start/end, serialized persistence, migration of current records, command timestamps and timezone policy, notification ownership. Preserve the active fast and history. Needed before remote Watch or interactive widget commands; not all needed for a read-only insights MVP. |
| F-02 | Subscription lifecycle and disclosures | 5–9 days | Configure real App Store products/RevenueCat offering; validate active/grace/expired/refunded/unknown-offline state, restore/reinstall, billing changes and cached access. Use real localized prices, manage-subscription link, renewal/term/legal disclosures and privacy updates. Keep health/fasting content out of purchase analytics. Do not trust the persisted `isPremium` boolean as entitlement authority. |
| F-03 | Native extension snapshot/configuration foundation | 3–5 days | Native-readable minimal state snapshot, update ownership, signing and reproducible generated targets, shared access configured only where required. WatchConnectivity is the Watch transport; an iPhone App Group alone does not sync a Watch. Native extension code must work without a mounted React screen. |

F-01/F-03 effort overlaps P-03/P-04/P-05; refine a combined estimate when specifying the selected bundle. F-02 is shared paid-release work outside feature-row estimates. No feature flag should expose a partial premium product to launch users.

## Apple Watch: feasibility and scope

### Evidence from this repository

- Expo SDK 54 / React Native 0.81, `newArchEnabled: false`, generated native projects; app configuration is in `app.json`. No Watch target or WatchConnectivity bridge appears in the inspected package/configuration. A Watch companion needs native work; adding a JavaScript screen is insufficient.
- `store/fastStore.ts` holds the current fast/history in Zustand and manually saves AsyncStorage. `startFast` creates an ID from `Date.now()` and replaces `currentFast`; `endFast` ends whichever fast is current. These UI-oriented methods are not yet a safe remote command protocol.
- Start/end also schedule/cancel notifications. `services/supabase.ts` and `services/offline-sync.ts` are inert stubs, not a working cross-device sync service. Existing RevenueCat code is dormant (SPEC-17).
- Never generate/commit local `ios/` or `android/` folders in the launch checkout. A future Watch spike must specify an isolated, reproducible config-plugin/native-target workflow compatible with clean EAS generation and the current architecture. Do not force a React Native architecture upgrade merely to try a bridge library.

### W-00: first spec to write — feasibility spike

Timebox **2–3 engineering days**, included in the connected P-03 estimate. Deliver an isolated proof of concept, not a polished paid feature:

1. Package and sign a minimal SwiftUI watchOS companion via the selected generated-target/EAS workflow. Verify an actual TestFlight archive/install on paired iPhone and Apple Watch; do not stop at simulator success.
2. Transfer a versioned, minimal active-fast snapshot and display elapsed time computed from timestamps. The clock should continue displaying locally between snapshots; no constant phone polling.
3. Round-trip start/end commands and acknowledgments. Test foreground, background, suspended/terminated phone app and disconnected devices. Explicitly establish when native receipt can persist/apply a command without the JS runtime; do not assume WatchConnectivity wakes JavaScript reliably.
4. Verify selected integration's compatibility with SDK 54, RN 0.81 old architecture and current EAS signing. Compare a maintained bridge against a small owned Expo native module; library selection remains open.
5. Produce a short decision record: proven delivery states, packaging steps, unresolved risks, revised estimate, connected/offline product promise and minimum OS/device support.

Go/no-go: if the build pipeline or command persistence is not reproducible within the timebox, keep Watch on the roadmap and ship the iPhone premium bundle first. A failed spike is useful evidence, not a reason to endanger the free launch.

### First Watch release — connected companion

Include active timer, current selected routine, explicit start and confirmed end; iPhone remains required for setup and subscription management. No independent Watch purchase, Health weight management, complex plan editor, cellular independence or offline mutation in this first scope.

Display acknowledged state and sync freshness. An undelivered start/end is visibly pending or fails with an actionable message; never present it as synchronized. If immediate delivery is unavailable, keep the first version's controls unavailable with a clear explanation rather than silently queuing actions that might affect a later fast. Existing active timer display can continue from its last timestamp, marked stale when appropriate. Do not market this scope as "works without your phone."

Minimum command contract for the future spec:

- Operation UUID, device ID, target session ID, expected state revision, action and issued-at timestamp; explicit acknowledgment with accepted/rejected outcome and canonical resulting state.
- Retry and duplicate delivery create at most one session/history entry. A stale stop must never end a newer session; start cannot silently overwrite an existing fast. Include state refresh and conflict UI.
- Decide canonical start/end timestamp policy and acceptable clock skew. Account for timezone changes, midnight, restarts, edits on the phone and delayed acknowledgments.
- Phone-native persistence/receipt must reconcile with the JS store before hydration can overwrite it. End notification cancellation/rescheduling must have a tested owner even when JS is unavailable; if this is not supported, define the availability limit honestly.
- Minimal cached entitlement permits appropriate offline continuity. Expiry or uncertain entitlement must never prevent ending a fast, recovering a pending action or accessing records. After expiry, new paid actions can be gated without stranding an active fast.
- Test on paired physical devices: double tap, simultaneous phone/Watch action, stale snapshot, disconnect/reconnect, phone/Watch reboot, phone app killed, app upgrade, entitlement expiry, unpair/re-pair and erase/reset. Define reset generation/tombstones so stale Watch state cannot resurrect erased history.

Preliminary connected release allocation: **2–3 days spike + 8–14 days native UI/bridge/command integration + 5–8 days device QA/build hardening = 15–25 engineering days**. F-01/F-03 work is included where required for this Watch scope; F-02 is separate. This is roughly 3–5 focused working weeks for one experienced developer, subject to the spike; it is not a commitment to elapsed delivery dates.

### Later Watch expansion — genuine offline start/end

Durably accept local Watch operations, show local/pending versus confirmed state, reconcile conflicts and preserve the original event timestamps after reconnection. Requires a persistent operation journal, reset generations, ordering/conflict rules and robust duplicate suppression across both devices. Budget **another 8–15 days**, to be revised after W-00. Complications P-12 and richer Watch UI are additional scope. Phone-free standalone operation is a separate product decision, not implied by offline companion support.

## Recommended delivery order and decision gates

1. **Now: planning only.** Free v1 remains unchanged. Spec P-01, the retrospective portion of P-02 and W-00 first; collect feature requests and voluntary Watch ownership feedback without adding tracking SDKs solely for this decision.
2. **First implementation track after launch:** P-01 + P-02 + F-02. Target a complete iPhone Plus experience useful without owning a Watch. P-06 is a relatively small follow-up if check-ins appeal to users.
3. **Watch track:** perform W-00 early, then decide whether P-03 can join the first paid release or follow soon after. If Watch requests dominate among retained users, promote P-03 ahead of journal/widgets. Never advertise Watch support before physical-device/TestFlight verification.
4. **Next convenience expansion:** choose P-04 or P-05 based on device support and user requests, then the other if justified; share the native state work. Add P-07 and P-12 when their prerequisites are stable.
5. **Later:** reports, content programs and backup/sync only after demonstrated demand and a separate privacy/maintenance plan.

Indicative iPhone-only P-01 + P-02 + F-02 total: **15–26 person-days** before overlap/refinement, excluding Watch and external review waiting. Adding Watch is a separate investment, not a one-day toggle. Strong adoption can justify moving the Watch track forward; it does not remove the need for entitlement and state-integrity work.

Before charging: demonstrate a useful weekly planning/review loop with realistic sparse and missing data, verify purchase/restore/expiry/refund cases, and let a small group of actual users try the complete bundle. Ask about willingness to pay, not just feature preference. Retention, repeated feature usage, actual trial-to-paid conversion and support issues should guide iteration; no fabricated conversion target is assumed. Keep basic free functionality intact and do not publish a paid launch date before the feasibility gates pass.

## Brief template for the next implementation specs

For every selected ID, create a new numbered SPEC only when scheduled. Include:

- User problem, target users and free/Plus boundary; exact MVP and exclusions.
- States and flows (empty/sparse data, denied permission, offline, active fast, interrupted operation, expired subscription).
- Source files to inspect, persisted shape/version and migration; native/configuration/signing dependencies where applicable.
- Acceptance examples, timezone/units/accessibility behavior and rollback preserving user data.
- Meaningful unit/integration cases plus signed physical-device verification where native behavior matters.
- Privacy/data recipients, operating cost, entitlement behavior and documentation/store-copy changes.
- Revised estimate, dependencies and explicit unresolved decisions; do not convert estimated ideas into release promises.

Read first for P-01/P-02: `store/fastStore.ts`, `store/weightStore.ts`, `utils/notificationsUtils.ts`, `app/(tabs)/progress.tsx`, `components/WeightChart.tsx` and SPEC-25. For Watch: add `app.json`, `package.json`, `eas.json`, `_layout.tsx` hydration and native module/config-plugin design. For paid lifecycle: `services/revenuecat.ts`, `dormant/paywall.tsx`, SPEC-17 and backlog B4/B5. Audit actual current code rather than copying historical line numbers or assuming old specs are still accurate.

## Sources and confidence

Official documentation checked 19 October 2026:

- [Apple: WatchConnectivity data transfer](https://developer.apple.com/documentation/watchconnectivity/transferring-data-with-watch-connectivity) — immediate messaging, latest-state context and queued transfer are distinct mechanisms; queued transfer is not an immediate acknowledgment.
- [Apple: set up a watchOS project](https://developer.apple.com/documentation/watchos-apps/setting-up-a-watchos-project) — companion target/project setup. Does not establish Expo-specific integration or its effort.
- [Apple: physical-device testing for queued transfers](https://developer.apple.com/documentation/watchconnectivity/wcsession/transferuserinfo(_:)) — paired-device testing is necessary.
- [Expo: config plugins](https://docs.expo.dev/config-plugins/introduction/) — reproducible native configuration during generated builds. Does not guarantee an arbitrary Watch plugin works with this repository.

Feature ranks, product scopes and engineering-day estimates above are our recommendations based on inspected code and the documentation, not Apple/Expo estimates. No native prototype, benchmark, purchase setup or customer validation has been performed in this documentation task.
