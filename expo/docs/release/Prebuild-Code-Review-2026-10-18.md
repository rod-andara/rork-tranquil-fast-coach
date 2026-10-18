# Prebuild code review — 18 October 2026

## Result

No release-blocking defect identified in the nine app/config files changed relative to `b05c6ba` at review time. Suitable to proceed to a build after Claude finishes and commits the intended changes. This is not clearance to submit to App Review: the exact new TestFlight build still needs affected-path checks and final screenshots. No build, upload, review submission, personal-data edit, or app-source edit was performed during this review.

## Scope

Reviewed `App.tsx`, `app.json`, `app/(tabs)/progress.tsx`, `app/(tabs)/settings.tsx`, `app/onboarding/choose-plan.tsx`, `app/onboarding/health-sync.tsx`, `app/onboarding/welcome.tsx`, `components/WeightChart.tsx`, and `store/weightStore.ts`, including relevant unchanged persistence/routing/plan code. App changes remained uncommitted at review time; later edits require review of their additional diff. Unrelated local settings and website/review artifacts were excluded.

- Shared weight baseline now correctly uses oldest-first selection and the latest preceding sample when all samples predate the goal; change and percentage use the same helper. Summary labels distinguish goal-relative and all-time change.
- Status bar follows the app theme and selects a light foreground for onboarding; native startup style is light on the purple splash. Actual native rendering remains a device check.
- Settings plan edits keep both selected plan and custom duration local before Apply; Cancel navigates without saving drafts. Apply awaits the existing update action before navigating. Storage and notification behavior still depends on the unchanged store/native implementations.
- Welcome Skip marks completion before navigation.
- Health onboarding now includes the shared media credit; Share includes the website URL; chart edge spacing increased. These are present in source, not visually certified on a phone by this review.

## Checks and evidence

- `./node_modules/.bin/tsc --noEmit`: PASS.
- Focused Node harness transpiled and executed actual source with TypeScript and the real Zustand store, mocked AsyncStorage: 15 cases PASS for empty/single samples, no goal, goal before/between/after samples, exact boundary, loss/gain, achieved goals, regression, kg/lbs. Cases tested both change and progress outputs. Synthetic values only; no real Health records accessed.
- Same harness executed actual plan-screen handlers with mocked React hooks/native components/router/store: ordinary/custom drafts remain unsaved on Cancel; custom Apply commits the intended duration, disables Apply while pending, and waits before navigating: PASS. This does not test native gestures, storage durability, notifications or visual layout.
- Actual welcome Skip handler, mocked store/router: completion precedes navigation: PASS. Native relaunch persistence not exercised by this harness.
- Harness for this review session: `/tmp/tranquil-prebuild-review.cjs` (temporary, not a permanent test suite).
- Normal ESLint invocation failed before analysis: installed ESLint 8.57.1 cannot load `eslint/config` used by the existing flat config. This is an existing tooling mismatch, not introduced by the reviewed diff.
- Legacy-config lint (`ESLINT_USE_FLAT_CONFIG=false ./node_modules/.bin/eslint` on the eight changed TS/TSX files): PASS with zero errors and one unchanged unused catch-variable warning at `app/(tabs)/settings.tsx:88`.
- `git diff --check`: PASS. No local `ios/` or `android/` directory present. No native generation or dependency upgrade performed.

## Before submission

1. Commit and record the intended app changes before building; avoid including unrelated local settings/artifacts. Record exact source and build IDs.
2. On the resulting signed TestFlight build: upgrade data retained; running timer/relaunch; ordinary/custom plan Cancel and Apply; welcome Skip/relaunch on a safe test installation; light/dark/onboarding status bar; all four onboarding credits and accessible buttons; Progress labels and 7/30/90/All chart edges, including 0/1/many entries.
3. Recheck Health import/deduplication and export ON/OFF on the physical phone using authorized safe test data. JS mocks do not certify HealthKit or diagnostics privacy. Reuse established checks only for the paths they actually cover.
4. Capture final screenshots, attach the verified build in App Store Connect, and complete the remaining store/privacy/agreements checks. Owner authorization for App Review submission remains separate.

The existing lint-tool configuration can be repaired separately; it need not trigger a dependency migration or another native build. This review does not guarantee the absence of issues outside the changed scope.
