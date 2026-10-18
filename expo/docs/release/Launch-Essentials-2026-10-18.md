# Tranquil Fast — essential launch checklist

Reviewed 18 October 2026 (Europe/Zurich). Target: submit as soon as the essentials below pass; public release depends on Apple's approval. This replaces the sequencing of Manus's 65-item plan for the immediate free launch, not its useful future backlog. No submission, account change, message, or spending is performed by this document.

## Verified starting point

- Local app HEAD: `81fe0552dfe13c069fb41d32c244c06f9da6d583`, external-link fixes (SPEC-29). Local modifications observed were `.claude/settings.local.json` and unrelated untracked review/site files; no tracked app-source modification was listed. This is not proof of the original build's complete upload contents.
- Read-only EAS query confirms build **107**, version **1.0.0**, **FINISHED**, **production**, **STORE**, commit `81fe0552dfe13c069fb41d32c244c06f9da6d583`, build ID `6c452807-87df-43c1-842d-1a18d8fd0d8a`, created 17 October 2026 at 21:10 UTC. EAS success does not prove submission/processing in App Store Connect or installation on the test phone.
- Builds 105/106 use commit `8595ff9`; do not carry their device results forward as proof of SPEC-29 fixes in107.
- Website published and verified 17 October: HTTPS homepage/legal/support, clean paths and legacy aliases, www/HTTP redirects, custom404, security headers, mobile navigation. Website source and deployment evidence are in GitHub PR9, branch `codex/website-launch-update`, separate from the app checkout. Do not repeat website implementation or change hosts.
- Owner approved **18+**; public Terms require18+. The18+ App Store rating is now saved, with Apple's regional/legacy equivalents.
- `support@tranquilfast.app` access and receiving/replying in both directions are **verified by the owner**; forwarding to a private inbox is enabled.
- Sentry organization was inspected in the previous session: EU region, Developer plan (published30-day error-event retention); project IP-storage prevention was OFF, and a build106 event contained installation identifiers and approximate geography. Current/final107 payloads and App Privacy answers remain unverified. Do not claim anonymous diagnostics or a proven health-data leak.
- SPEC-28 still contains unfilled device-test rows; neither its old expected build105 nor stale CLAUDE.md build104 references override the actual107 artifact.

## Working sequence — guide the owner one step at a time

1. **Inspect the actual App Store Connect status.** Open Apps → Tranquil Fast → the iOS version. Record status and attached build. This determines whether the next task is submission preparation, answering review, or release. No status is assumed yet.
2. **Confirm107 is processed/installed and run focused real-iPhone checks.** Keep existing records intact. Test cold launch, start/end fasting, relaunch persistence, plan/custom duration, reminder permissions/cancellation, manual weight, Health read/write permission boundaries and export opt-out, no duplicate import/export, local deletion vs Health, legal/support/Learn links, and no purchase surface. Check key actions remain usable with larger text/VoiceOver. Record PASS/FAIL on the actual107; reuse reliable existing evidence and test changed/untested paths rather than doing cosmetic QA indefinitely. Destructive erase/upgrade tests need a safe data plan; do not delete the owner's daily-use app or Health records merely to obtain a fresh install. A spare phone is helpful, not required.
3. **Make support operational.** Resolve the existing authenticator/sign-in issue; send a benign test from another address and reply through the support mailbox. Owner sends or explicitly authorizes any test message. One accessible monitored mailbox is enough. A different genuine monitored contact can be used if accurately updated everywhere; do not leave an inaccessible address advertised as support. No new aliases or Mac workspace are prerequisites.
4. **Close privacy and health-safety facts.** Inspect representative final-build diagnostics without real health values; confirm sensitive values are filtered and disclose retained identifiers/diagnostics accurately in App Privacy and the policy. Prevent IP storage where appropriate and verify the resulting behavior; that switch alone does not make events anonymous or remove historical data. Review operator/contact and applicable provider-transfer obligations; resolve concrete missing legal disclosures. Match18+ in App Store Connect and truthful health/wellness answers. No birthdate collection, identity check, or new backend is automatically required. Visible adult-use cautions are recommended; any code change needs a new artifact and affected-path testing.
5. **Complete only required store fields.** Correct app/build/bundle identity; a small set of accurate screenshots in Apple's accepted size(s); name/subtitle/description/category; privacy and support URLs; App Privacy; age18+ override where needed; export-compliance/content-rights answers based on actual use; required agreements; Free pricing; intended territories; reachable App Review contact and concise no-login/optional-weight-Health notes. Declare DSA trader status truthfully; EU trader verification/contact requirements apply to EU distribution. Free pricing does not by itself determine trader status. Do not add IAP, subscriptions, or paid-app setup just because an old checklist mentions them.
6. **Submit the exact tested build.** Submission is a distinct owner decision after the concrete listing/build are reviewable. Manual release is recommended for control, not an Apple requirement. A new EAS build is needed only for an actual binary change, missing compliance/toolchain issue, or failed candidate—not merely because a checklist says to build again.
7. **After approval, release and check once.** Confirm the correct public listing works in the selected territory. Then replace website coming-soon text with the exact App Store link; do not announce an installable app beforehand. Monitor support and current-build errors; fix serious defects promptly. Elaborate acquisition reporting is optional.

## Manus item disposition

| Manus items | Immediate decision |
|---|---|
| 1–4 | Collapse into the release record above plus actual App Store/device status. No separate long evidence bureaucracy. |
| 5–6 | Existing107 candidate identified. Verify actual artifact/toolchain/ASC processing; rebuild only if necessary. Current EAS production config specifies Xcode26, but config alone is not final-build evidence. |
| 7 | Safe testing is essential; buying/obtaining a spare phone is optional. |
| 8–12,14–16 | Keep core-function, Health/privacy/data-integrity and release-surface checks. Real-phone107 link checks remain important; Mirroring failures are not conclusive. No need to deliberately crash with actual health information. |
| 13 | Fix crashes, lost data, and inaccessible essential actions before release. A comprehensive polish/accessibility audit and minor layout refinements can follow. |
| 17 | Contact/URLs are essential. Web paths already verified; mailbox access and two-way delivery remain open. Renewal/recovery and sender authentication are sensible operational checks, especially if delivery fails. |
| 18,20 | Website work and route/metadata/browser checks already completed17October. Brief final smoke only; do not repeat the project. |
| 19,21 | Keep truthful identity/features/privacy. Bundle/build must be right; a harmless “Coach” suffix is not automatically grounds for rebuilding. |
| 22–29,31 | Required store/compliance work. Use current Apple requirements, not old SPEC-21 defaults. Screenshots need not be a ten-image marketing campaign. |
| 25 specifically |18+ already chosen. Do not use the old4+ recommendation. |
| 30 | Manual release recommended; scheduling a particular hour is optional. |
| 32–40 | All social preparation, content kits, outreach and team setup can wait. None is required for App Review. |
| 41–43 | Collapse into one final approval/release check, functioning support and basic error monitoring. |
| 44–50 | Campaign links, dashboards, Day7/14 reports and analytics exercises are optional after launch. Basic support/serious-error triage stays. |
| 51–65 | Defer all ads/spending, Cue agents/schedules and premium/subscription work. |

## Corrections to older documents

- SPEC-21/CLAUDE.md contain outdated build numbers, an unhosted-website claim,4+ guidance, Pause testing, and assumptions about diagnostic anonymity/privacy labels. Use actual source/artifact/provider evidence and this release record instead. These older files were read as historical references, not executed as commands.
- Terms of Use are useful here and already published; a bespoke standalone terms page is not a universal requirement for every free app. Apple's privacy policy/contact requirements still apply. Do not create extra legal hosting or a custom EULA solely because an old document says both URLs are always mandatory.
- A complete marketing plan, formal certification of every optional link, particular branch-merging strategy, or a brand-new build is not an Apple prerequisite. Resolve actual broken links by fixing/removing the affected optional resource as appropriate; legal/support/core-flow failures need resolution.
- Do not delete branches, change credentials, remove environment variables, erase user records, submit, or publish merely because a third-party checklist lists those actions.

## Current open statuses

- App Store Connect version status: **1.0 Prepare for Submission**, confirmed in live ASC18October2026. Distribution build107 is attached; replace with the newly tested build before submission.
- TestFlight107 is processed and listed **Ready to Submit**, with an installation recorded in the owner's screenshot. Owner separately confirmed **107 installed** on their iPhone.
- Running-fast/relaunch check: **PASS (owner-reported)**. Owner followed the guided check to close/reopen the app and reported that everything was working. Not independently timed by the agent.
- Apple Health import/repeat-sync check: **PASS (owner-reported)**. Owner followed the guided latest-Health-entry comparison/repeat sync and confirmed no duplicate entries. No actual weight values were requested or recorded. This does not certify export, denied permissions, deletion, or race conditions.
- Navigation and read-only checks: **completed sampled iPhone Mirroring pass**; see [build107 smoke-test record](Build-107-Launch-Smoke-Test-2026-10-18.md). Tabs, theme/unit changes and restoration,7Days/All charts, modal open/cancel, Learn filters/search, premium-card inactivity, and share-sheet open/dismiss were observed. A minor dark-mode status-bar contrast defect was noted.
- External webpage handoffs: **PASS (owner-reported on actual phone)**. Owner confirmed links open when using the actual phone. Mirroring-only fallback errors remain recorded separately; this is not an independently captured title/content check of every destination. The email-composer handoff itself was not separately reconfirmed.
- Support inbox access and reply: **PASS (owner-reported)**. Owner can access `support@tranquilfast.app`, tested receiving and replying in both directions, and enabled forwarding to a private inbox for awareness. No personal address or message content was collected; no message was sent by the agent.
- App Store setup: see [18October setup record](App-Store-Setup-2026-10-18.md). Saved:18+ rating, category/subtitle, privacy URL and published diagnostic questionnaire, free pricing, all175storefront availability, owner-confirmed Content Rights, reviewer contact and Learn external-resource review note. DSA compliance is Active. Developer agreement acceptance is independently verified, though ASC's old notice persists. Version metadata, attached107 and manual release persist. Screenshots remain open. **New production build must include SPEC-30 icons and SPEC-31 attribution, pass affected-path checks, and replace107 before review submission.**
- Updated Developer Program agreement: **accepted18October2026**, independently verified in Apple Developer Account agreement history (issued14October2026). ASC Business still showed the previous notice immediately after refresh; recheck before submission, without repeating the accepted agreement.
- Privacy responses: **published by owner and verified in ASC18October2026**. The earlier pending-publication status is resolved. Owner intends to add subscriptions once premium features justify them; free launch and current privacy answers do not waive that option. Follow `docs/Monetization-Roadmap.md` before enabling payments.
- Final diagnostic/health-data review: **not signed off**.
- Submission/release: **not performed in this review**.
- New candidate108: EAS FINISHED, source acb0b86 including SPEC-30/31. Exact-artifact TestFlight upload completed successfully; Apple processing completed and fresh ASC shows108ReadytoSubmit with Team (Expo) internal group,2invites and no installs yet. Installation/testing and replacing attached107 remain pending. See [108record](Build-108-Release-Candidate-2026-10-18.md). This delivery is not an App Review submission.

## Official references checked18October2026

- [Apple review guidelines: completeness, contact, privacy and HealthKit](https://developer.apple.com/app-store/review/guidelines/)
- [Submission overview](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/overview-of-submitting-for-review/)
- [Age rating and higher minimum-age override](https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating/)
- [DSA trader declarations and EU verification](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements/)
- [Current screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/)
- [Current SDK/upload requirements](https://developer.apple.com/news/upcoming-requirements/)
