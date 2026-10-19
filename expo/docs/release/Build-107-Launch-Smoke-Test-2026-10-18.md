# Build 107 — focused launch smoke test

18 October 2026, Europe/Zurich. Scope: essential checks toward the free v1 submission, not a complete SPEC-28 certification.

## Candidate and evidence

- Owner confirmed TestFlight **1.0.0 (107)** installed. App Store Connect screenshot shows107 processed/listed, one installation, TestFlight “Ready to Submit.” Distribution version1.0 remains **Prepare for Submission**; no submission occurred in this session.
- EAS read-only query: production STORE build `6c452807-87df-43c1-842d-1a18d8fd0d8a`, FINISHED, commit `81fe0552dfe13c069fb41d32c244c06f9da6d583` (SPEC-29 link fixes).
- Agent tested the currently installed app through iPhone Mirroring connected to **iPhone17Pro**. Device iOS version was not independently reconfirmed. Settings footer shows app version1.0.0, not a build number; installed107 identification relies on the owner's confirmation and TestFlight evidence.
- Owner-reported passes and agent-observed checks are explicitly separated. Mirroring URL failures are not proof of a physical-phone defect or proof that the handoffs work outside Mirroring.
- No health values, goals, names, or share-sheet contact details are copied into this record. Screenshots containing personal data were not saved as release artifacts.

## Results

| Check | Result | Evidence / limit |
|---|---|---|
| Running fast survives close/relaunch | PASS — owner reported | Owner followed guided note-time → close → wait → reopen check and reported correct behavior. Agent did not independently time the relaunch. |
| Latest Apple Health weight imports, repeat sync creates no duplicate | PASS — owner reported | Owner confirmed after guided comparison/repeat sync. No actual weight requested. Does not prove export or denied-permission cases. |
| Timer/Fast/Progress/Learn/Settings navigation | PASS — observed | All five tabs opened without observed crash. |
| Existing fast remains active through browsing | PASS — observed | Original start/target remained stable and elapsed advanced. No Start/Stop/End action was used by the agent. |
| No Pause UI in sampled running-fast screens | PASS — observed | Timer and Fast show Stop/End rather than Pause. Not a deep-link inventory. |
| Premium coming-soon card | PASS — observed | Tapping it left Settings unchanged; no purchase screen appeared. Does not prove every deep link is unreachable. |
| Dark/light appearance | PASS with minor defect | Sampled all five tabs in dark mode and restored light. Dark-mode status-bar text/icons remain dark against a dark background, making them hard to read. Core content/actions remain legible. |
| kg/lb display selection | PASS — observed | Changed to lbs, saw converted labels/display in Progress, restored kg. Does not verify Health export conversion. |
| Chart range | PASS — observed, sampled |7Days and All rendered; restored7Days.30/90 were not separately tested. |
| Add Weight modal opens/dismisses | PASS — observed | Blank input, optional note, Health sync switch and Save visible. Closed with X without entering/saving a weight. Save/export behavior not exercised. |
| Edit Goal modal opens/dismisses | PASS — observed | Existing goal preview rendered; closed with X without save/delete. |
| Learn safety disclaimer | PASS — observed | General-wellness/not-medical-advice wording visible. |
| Learn All/Recipes/Articles/Products | PASS — observed | All filters changed the displayed category; restored All. |
| Learn search | PASS — observed | Exact synthetic query `electrolytes` returned the updated MedlinePlus card; unmatched text showed No Results Found; cleared search. Initial dropped characters/clipboard transfer issue was corrected and not classified as an app search defect. |
| Updated Learn content | PASS — sampled rendering only | Quinoa card and revised Electrolytes and Fluid Balance/MedlinePlus article visible. Sampled product showed no stale price/rating. Not every card/destination was re-audited. |
| Learn recipe → external browser | UNRESOLVED — Mirroring handoff failed | Quinoa card displayed **“Link Unavailable”**, **“We couldn't open that page right now. Please try again in a moment.”**, OK. Destination did not open from the app under Mirroring. Must check directly on unlocked phone before declaring pass/fail for ordinary use. |
| Settings Support/Privacy Policy/Terms of Use → external browser | UNRESOLVED — Mirroring handoff failed | All three displayed the same Link Unavailable alert. No external page opened in these app attempts. Website had separately passed production browser/HTTP checks17October; that does not prove app handoff. |
| Help & Support email action | FALLBACK observed; actual handoff unresolved | **“Error Opening Email”**, **“Please contact us at support@tranquilfast.app”**, OK. No email sent. Could be Mirroring/default-mail handoff; phone check required before attributing a cause. This does not test mailbox delivery/access. |
| Share with Friends | PASS — open/dismiss only | iOS share sheet opened with existing generic app text. Dismissed by tapping outside; no recipient/action chosen and nothing sent. Text has no App Store URL in current source; add exact public URL after release as an enhancement. |
| Rate App | NOT TESTED | TestFlight review-prompt behavior is not a useful release gate; no rating submitted. |
| Erase All Data / deletion / permission changes | NOT TESTED | Destructive control left untouched; no data or Health permission changed. |

## State left for owner

- Light mode, kg units, Progress7Days, Learn All and empty search restored and visually checked.
- Original fast still running; notification/reminder preferences untouched. No goal/weight/Health/history data was created, edited, exported or deleted.
- No plan applied, no purchase, no message/share, no review, no erasure.
- App left on Settings with Support/Privacy/Terms visible so the owner can disconnect Mirroring and test a direct physical tap.

## Owner follow-up — actual phone and support

- Owner subsequently confirmed that links open when using the actual phone. Record external webpage handoff as **PASS — owner-reported outside Mirroring**, retaining the failed Mirroring attempts above as environment-specific evidence. This does not establish a technical root cause or independently verify every final page title/content.
- Owner confirmed access to `support@tranquilfast.app` and successful two-way receipt/reply testing. Forwarding to a private inbox is enabled for awareness. No private address/message content was requested or recorded, and the agent sent no email. Support mailbox operation is **PASS — owner-reported**; the iOS email-composer handoff was not separately reconfirmed.
- Next guided step is to inspect **App Store Connect → App Information → Age Ratings**, ensuring the owner-approved18+ minimum is reflected before submission. App Privacy and remaining store fields are not yet signed off.

## Remaining scope

This session did not certify Health export/opt-out, denied permissions, notification delivery/cancellation races, plan changes, destructive erase/upgrade persistence, offline, Dynamic Type/VoiceOver, native diagnostic payloads or all external destinations. Reuse reliable owner evidence where available and resolve the essential untested paths safely. Full SPEC-28 remains unsigned; do not mark it complete based on this report.

The status-bar contrast defect and missing real App Store share URL are polish items; neither warrants an automatic new build by itself. Preserve the owner's launch scope and avoid bundling unrelated redesigns.
