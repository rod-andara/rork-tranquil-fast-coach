# Final-build code recommendations — 18 October 2026

Owner will implement with Claude Code. This is a focused source review and handoff, not implementation or certification of the next signed build. Do not overwrite concurrent edits or change the owner's health records for screenshots.

## Recommended scope before building

1. **Finish weight baseline consistency.** The in-progress `getWeightChange()` edit in `store/weightStore.ts` correctly searches oldest-first, but falls back to the oldest-ever entry when no entry is at/after goal creation. `getProgressPercentage()` instead uses the most recent preceding entry. Share one baseline selector between these calculations. Preserve the intended recent-goal reset: immediately creating a goal after the latest sample should not produce an old all-time change alongside zero goal progress. Label the summary's scope (for example, "Since goal set"; no-goal scope can be "All-time change"). The chart's selected-period change remains separate.
   - Focused synthetic cases: no entries, one entry, no goal, goal before all entries, goal between entries, goal after every entry; weight-loss and weight-gain goals; kg/lbs. Do not use personal records as test fixtures.
2. **Theme-aware status bar.** `App.tsx` hard-codes `<StatusBar style="dark" />`; `app.json` also specifies `UIStatusBarStyleDarkContent`. Use the app's stored theme for ordinary screens, with a light foreground on dark video onboarding backgrounds. Check the native startup appearance as well. Verify both theme directions and a cold launch on the phone; using system appearance alone misses the in-app theme override.
3. **Cancel and transactional plan edits.** `app/onboarding/choose-plan.tsx` has no visible Cancel when opened from Settings. Add one that returns without persisting selection or changing an active fast. `handleSaveCustomDuration` currently calls the persisted store setter immediately: keep custom duration local until the main Save/Apply action, too. Await `updatePlan` and handle rejection before navigating back. Verify selecting/canceling ordinary and custom plans leaves the persisted configuration and active fast unchanged, while applying preserves start time and updates the intended duration/reminders.
4. **Persist the welcome Skip decision.** The Skip handler in `app/onboarding/welcome.tsx` navigates home without setting `onboardingComplete`, while `app/index.tsx` uses that flag to select welcome after launch. Mark onboarding complete through the existing store action before leaving via Skip. Verify skip/relaunch and normal completion/relaunch on a test installation without erasing the owner's data.
5. **Consistent onboarding media credit.** Earlier credit work covered three screens, but `app/onboarding/health-sync.tsx` also uses `track-succeed.mp4` and has no `MediaAttribution`. Reuse the existing component on that screen. Verify all four screens with the keyboard and larger text where applicable; Connect, Skip and Continue must remain visible/reachable. This is a consistency finding, not a fresh legal opinion about provider terms.

## Small polish if it stays contained

- Fix the clipped first date label in `components/WeightChart.tsx`; check both chart edges across 7/30/90/All ranges. The screenshot proves clipping, not incorrect underlying weight values. Preserve point values and statistics; do not redesign chart sampling or unit storage just for screenshot aesthetics.
- Share currently sends generic text without a URL. Adding the known public website (`https://tranquilfast.app`) provides a useful destination before the App Store page is live; alternatively use the final App Store link once verified. This is optional and not a release blocker.

## Verification before the build and before submission

- Review only intended diffs, run TypeScript and focused behavioral checks for the changed baseline and plan/Skip paths. Record the source commit and clean/dirty archive state; commit intended changes before building.
- On the exact new TestFlight build, check existing data survives upgrade, timer survives relaunch, changed UI/flows work, and Apple Health imports without duplicates. Also verify a manual weight with export OFF stays out of Health after sync/relaunch, and export ON writes once, using safe test data/device with owner authorization.
- Inspect final diagnostic evidence for unintended health values; the present review establishes no new health-data leak. Published App Privacy answers must continue to reflect actual diagnostics. Do not broadly reconfigure diagnostics or re-enable dormant subscriptions without their own verification.
- Update build/release records with actual results; screenshots should represent the final build. Do not mark the full historical SPEC-28 matrix passed from these focused checks alone. Do not submit for App Review without the owner's separate authorization.

This scope reduces avoidable rebuild risk; it cannot guarantee that device testing or App Review will find no further issue. No new features, SDK upgrades, subscription activation, or health-data migrations are recommended for this final correction build.
