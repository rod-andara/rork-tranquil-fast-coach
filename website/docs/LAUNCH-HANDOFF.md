# Website launch handoff — 17 October 2026

## Current release state

Prepared in branch `codex/website-launch-update`, isolated from Claude Code's Expo changes. **Not yet published.** GitHub and production deployment status must be updated after each operation. Production inspected before changes: Worker `tranquilfast`, version prefix `66777db0`, manually uploaded static assets; no Git integration and preview URLs off.

## Implemented audit recommendations

| Audit | Work prepared | Remaining before closure |
|---|---|---|
| W01 privacy | Added hosting/security, local theme preference, self-hosted fonts, support email, rights, deletion boundaries, retention criteria, international processing | Operator/trader contact obligations and actual provider contracts/transfer safeguards need owner/legal review; security-log retention has no verified fixed period |
| W02 Sentry | Disclosed identifiers, technical breadcrumbs, approximate location/network information; verified EU region and Developer plan | Project IP-blocking setting is OFF; verify/minimize final-binary JS and native events and match App Store privacy answers |
| W03 transport/security | Prepared self-hosted assets, CSP and other security headers | Verify headers after deployment; configure and test explicit HTTPS and www redirects in Cloudflare zone |
| W04 support | Added separate read/write permissions, empty-read troubleshooting, erase vs offload, independent Health records, reimport behavior | Recheck instructions against the final app build; no promise of complete Health history import |
| W05 launch copy | Clear coming-soon status; removed fake QR/dead download links, iOS16+ claim and permanent-free promise; added health guidance | Add real App Store URL only after public release |
| W06 contact/age | Consistent operator/name, no response-time promise; prepared 18+ terms | Owner has not yet approved contractual 18+ policy; App Store rating and app safety wording must match; mailbox delivery still untested |
| W07 source/handoff | Recovered production snapshot in Git, separate website source, checks, packaging and rollback instructions | Push/review changes and record actual deployed version |
| W08 access/mobile | Mobile menu, headline/CTA before image, 44px controls, skip link, visible focus, reduced motion, readable legal/support copy, no JS-dependent hidden content | Final browser QA and real iPhone public-page check |
| W09 SEO | Extensionless canonicals/internal links/sitemap, actual app screenshot in JSON-LD, custom 404 | Validate production redirect/status behavior |

## Verified provider facts and evidence

### Sentry — inspected in the owner's existing signed-in session

- Organization General Settings: **European Union (EU)** data-storage region.
- Subscription overview: **Developer** plan. Official Sentry documentation states error events are retained **30 days** on Developer. This does not mean issue summaries, audit logs, attachments, or alert emails all expire at 30 days.
- Project Security & Privacy: default/server-side scrubbers ON; **Prevent Storing of IP Addresses OFF**; no additional sensitive field entries or advanced rules visible. No Sentry settings were changed.
- One build106 JavaScript error showed pseudonymous installation/user and device identifiers, technical interaction/device breadcrumbs, and approximate city/country. This is evidence diagnostics are not anonymous; it is not evidence that weight values or full fasting history leaked.
- Session Replay panel showed no replay for that sampled issue. This alone is not a complete SDK audit.
- Source contains app-side scrubbers and `sendDefaultPii: false`. Native payloads and the final new binary still require inspection. Do not send a deliberate crash with real health details to test this.
- Recommendation: retain the current EU organization and 30-day Developer retention while sufficient; prevent IP storage for future events, minimize/remove installation IDs and unnecessary breadcrumbs at SDK/server boundaries, and keep session replay/performance collection disabled unless specifically justified. Enabling project IP blocking does not remove historical events or prove derived geography is absent. Do not promise anonymous diagnostics based on that switch alone.
- No upgrade, migration, purge, billing change, token creation, or access change is needed for the website update.

Sources checked 17 October 2026:

- [Sentry event counts and plan retention](https://www.sentry.help/en/articles/13964336-why-does-the-event-count-in-my-issue-not-match-up-with-the-count-in-the-all-events-tab-of-the-issue)
- [Sentry audit-log retention distinguishes event retention](https://www.sentry.help/en/articles/13964940-how-long-are-my-organization-s-audit-logs-stored)
- [Sentry EU region FAQ](https://www.sentry.help/en/articles/13964378-sentry-s-eu-region-faq)
- [Sentry API region documentation](https://docs.sentry.io/api/)

### Website and support

Cloudflare serves the existing static site. Workers logs/traces were off in the inspected Worker settings; zone/security processing still exists, and no blanket statement about zero IP processing is warranted. Public support-domain MX routes through Microsoft's mail protection infrastructure. The owner expects the mailbox to work and will monitor it frequently after publication. **No delivery/receipt test was performed, and no email was sent.** Do not claim delivery is verified or publish a guaranteed response deadline.

Support correspondence uses purpose-based retention criteria in the draft. Recommendation: review closed support cases periodically, remove unnecessary attachments/health details, and document a fixed operational policy if the owner wants a deadline. Do not claim automatic deletion without an implemented process. Keep the required provider DPAs/transfer safeguards and subprocessor lists in the operator's compliance records; do not publish private account material.

## Age recommendation and App Store alignment

Recommendation: **18+** for this fasting/weight app. Draft terms say users must be 18. This is an owner policy decision awaiting approval; it is not a claim that Apple's questionnaire automatically requires 18+.

Current US App Store pages checked on 17 October 2026:

| App | Displayed rating | Source |
|---|---|---|
| Zero: Fasting & Food Tracker | 16+ with in-app controls | <https://apps.apple.com/us/app/zero-fasting-food-tracker/id1168348542> |
| Fastic Weight Loss & Fasting | 13+ | <https://apps.apple.com/us/app/fastic-weight-loss-fasting/id1459260306> |
| BodyFast: Intermittent Fasting | 13+ | <https://apps.apple.com/us/app/bodyfast-intermittent-fasting/id1189568780> |

These ratings are content classifications, not medical endorsements or proof of their contractual minimum ages. Ratings vary by country and OS version. [Johns Hopkins](https://www.hopkinsmedicine.org/health/expert-qa/intermittent-fasting-what-is-it-and-how-does-it-work) advises against fasting for under18s, pregnancy/breastfeeding, and people with a history of eating disorders, among others.

Apple requires truthful questionnaire answers. Its [age-rating instructions](https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating/) say a EULA minimum above the calculated rating requires a higher override. If adopting this draft: align App Store Connect, app/onboarding safety wording and any eligibility control, privacy/support copy, and review notes. Do not mark age assurance present unless implemented. Coordinate these app changes with Claude; this website branch does not modify the Expo app.

## Owner/legal items still open

- Approve the actual revised privacy notice/terms and 18+ minimum before publication; do not treat this engineering update as completed legal review.
- Verify required operator contact/postal-address and App Store trader disclosures for intended countries. No private home address was inferred or published.
- Review actual DPAs, transfer safeguards and provider processing countries (EU Sentry storage does not guarantee every service operation stays in the EU).
- Verify support mailbox receives messages and a reply reaches the sender. Sending a test message needs the owner's explicit instruction.
- Review final-binary diagnostic payloads, IP controls and App Privacy answers before app release.
- Align App Store age rating and in-app safety policy with an approved 18+ minimum.
- Confirm legal-page publication date when actually deploying; currently prepared for17October2026.

## Verification record

See [VALIDATION.md](VALIDATION.md) for checks performed and limits. The preview server is not Cloudflare's edge. Never mark DNS, edge redirects, production headers, mail delivery or native diagnostics verified from local HTML tests.

## Deployment record

- Git branch: `codex/website-launch-update`.
- Recovered baseline commit: `9e6a61c`.
- Updated implementation commit: `52c1098` (checks passed).
- GitHub PR: [#9](https://github.com/rod-andara/rork-tranquil-fast-coach/pull/9), draft, based on `sdk-upgrade`; branch pushed.
- New production version: **none yet**.
- DNS/HTTPS redirect changes: **none yet**.
- Rollback target: pre-update version prefix `66777db0`, plus recovered Git baseline if necessary.
