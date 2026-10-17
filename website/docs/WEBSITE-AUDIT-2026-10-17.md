# Tranquil Fast website launch readiness review

**Prepared for Rodrigo Andara | 17 October 2026 | https://tranquilfast.app**

## Launch decision

Keep the current design and complete a focused correction pass before App Store review. The essential pages are already public and readable, but the privacy notice needs substantive updates. Before public release, enforce HTTPS, repair the www address, and replace or remove the download placeholders. A redesign is unnecessary.

This review distinguishes an App Review requirement from a launch-quality recommendation. A missing disclosure is an observed content gap; whether the underlying processing is lawful depends on the actual service configuration and target markets. Recommendations requiring legal judgment should be approved by the operator and, where appropriate, counsel.

## Priority overview

| ID | Action | Gate | Effort |
| --- | --- | --- | --- |
| W01 | Complete privacy disclosures and retention rules | Before App Review | Medium |
| W02 | Verify Sentry facts and align App Privacy answers | Before App Review | Medium |
| W03 | Enforce HTTPS and repair www routing | Before public launch | Small |
| W04 | Correct deletion and Health support instructions | Before App Review | Small |
| W05 | Remove fake QR and activate genuine store links | At public release | Small |
| W06 | Confirm support mailbox and operator details | Before App Review | Small |
| W07 | Recover the deployed source before editing | Before next deployment | Small |
| W08 | Improve mobile navigation and first screen | Recommended before launch | Medium |

Small means a contained edit or configuration change. Medium includes fact gathering, implementation and verification; these are relative estimates, not delivery promises.

## What is already working

Privacy, Terms and Support are live; the app's .html URLs work through redirects. The policy names Sentry and explains optional weight-only Health access. SEO metadata and primary assets are present. Sampled mobile pages fit their width and the FAQ works. No ad or analytics script was found in the inspected HTML and homepage DOM.

<!-- pagebreak -->

# Privacy corrections before App Review

## W01 Complete the notice for the app and website

**Evidence:** /privacy, sections Crash diagnostics, Data retention and deletion, International users and Contact. The notice says it covers both the app and website, but does not describe Cloudflare hosting/security processing, remotely loaded Google Fonts, theme storage, or support email processing. All inspected HTML pages request fonts from fonts.googleapis.com and fonts.gstatic.com. The theme script stores tf-theme in localStorage.

Explain these distinct processing activities. Website requests expose connection/request information to hosting and font providers; support messages contain sender details and whatever the sender supplies. This does not mean the app sends weight data to those providers. Self-hosting the fonts would remove that particular external font request and simplify the notice.

**Retention and rights:** The current deletion paragraph addresses local app data only. It gives no retention period or criteria for Sentry events, support correspondence, or retained website/security logs. Publish the real configured periods or defensible criteria, the recipients, the operator's contact details, and how people can exercise applicable access, correction and deletion rights. Describe relevant processing countries and safeguards from actual contracts/configuration; do not invent a region, a deadline, or a claim that everything stays in Switzerland. [S1, S3, S4]

**Acceptance:** An approved data inventory supports every statement. The notice separately covers local app data, Apple Health, crash diagnostics, website delivery/security, fonts or local font hosting, theme storage, and email support. Third-party protection commitments reflect actual arrangements. Date the revised policy when it is published.

## W02 Verify diagnostic facts before promising them

The current policy says health values and the optional name are excluded from Sentry. Local app source has minimization settings and JavaScript scrubbing, but native crash content, installation identifiers, project-side IP retention, storage region and retention have not been checked for build 106. Do not interpret this review as proof of a health-data leak or proof that collection is anonymous.

Inspect representative raw JavaScript and native crash events and attachments. Record actual identifiers, retention, IP controls and access restrictions. Align the policy and App Store Connect with this evidence. Retained diagnostics generally require disclosure; on-device-only Health processing is not itself collection under Apple's definition. Website traffic and user-initiated support email need separate analysis rather than automatically adding every website field to the app's label. [S2]

**Acceptance:** A short signed-build privacy decision record states the collected categories, purpose, linkage determination and provider settings. No unsupported Data Not Collected claim remains. If consent or another legal basis is relied on, the mechanism and applicable-market analysis are documented.

<!-- pagebreak -->

# Data inventory and owner decisions

## Inventory to complete before publishing the revised policy

| Activity | Observed fact | Confirmation needed |
| --- | --- | --- |
| App records | Fasts, weights, goals and preferences are stored locally | Device backup behavior and exact final-build behavior |
| Apple Health | Optional read/write of weight | Read/write tests, revocation and deletion boundaries |
| Sentry | App code and policy enable limited diagnostics | Raw payloads, IDs, IP handling, region, retention |
| Cloudflare | Live responses identify Cloudflare; error reporting headers present | Project type, security/log settings, analytics and contracts |
| Google Fonts | All inspected pages reference Google font hosts | Self-host or document external requests |
| Support email | mailto link; public MX points to Microsoft protection service | Mailbox works; actual provider, retention and access |
| Theme preference | tf-theme is saved in browser localStorage | Explain purpose and clearing; check any other storage |

The presence of Cloudflare Network Error Logging response headers does not establish the contents or retention of account logs. Likewise, an MX record does not prove a particular mailbox exists or is monitored. No test email was sent.

## W06 Confirm identity and support ownership

The operator's personal name, country and brand are present. Confirm that these match the App Store seller and the entity responsible for data. Decide whether a business contact address or additional trader information is needed for the chosen distribution markets and Apple trader-status process; do not publish a private home address by default. A name and country alone should not be treated as a complete market-specific legal assessment.

Confirm support@tranquilfast.app can receive and send replies, is monitored, and can meet the advertised 1 to 2 business day response target. Its public MX points to tranquilfast-app.mail.protection.outlook.com, which is evidence of mail routing only.

## Terms and age language

The Terms already contain wellness disclaimers, risk-group cautions, Swiss governing law and a mandatory-consumer-rights reservation. Preserve these. Have counsel check liability exclusions, changes to terms and the relationship to Apple's standard EULA if a custom EULA is contemplated. Do not add purchase or renewal promises for features that do not exist yet.

Choose one intended-audience policy. The Privacy Policy describes an adult app, then permits guided use under 18 and refers to under 13. This is ambiguous. Align Privacy, Terms, store age-rating answers and marketing without assuming an adults-only policy requires an 18+ Apple rating. Add a short wellness suitability note on the homepage with a link to fuller guidance; the current warnings are mainly in Terms.

<!-- pagebreak -->

# Support and marketing accuracy

## W04 Correct deletion instructions

Both /privacy and /support currently tell people to delete the app to remove local records. The app now exposes Settings > Erase All Data. Document that action first, its irreversible local effect, and the fact that it does not delete records in Apple Health or retained diagnostics/support correspondence. Explain that reconnecting Health can import its records again. Distinguish deleting the app from iOS Offload App, which retains app data. State backup limits only after checking the actual behavior.

Suggested core wording after erase verification: "To remove the app's local fasting records, weights and settings, open Settings in Tranquil Fast and choose Erase All Data. This does not delete records stored in Apple Health. Manage those separately in the Health app."

## Improve Health troubleshooting

The support page gives permission-navigation paths but omits the actual failure seen in testing: write permission can be on while read permission is off, and an empty read is not evidence that Health has no records. Add separate read/write instructions, how to verify Weight exists in Health, and when to return to Progress and use Sync Now. Confirm screenshots and menu names on supported iOS versions; labels can move.

Explain that edits and deletes are not currently mirrored to Health, and that each new manual entry's export choice matters. Do not promise complete history: inspected source reads at most 1,000 samples from an approximately ten-year window. Avoid describing Health sync as a general cloud backup.

## W05 Make release status and downloads truthful

The homepage mixes Now on iPhone with Coming soon. Both App Store buttons are placeholders; the lower one points to # and has an accessible label implying a real download. The decorative QR says Scan to download and visibly retains Replace with App Store QR. Remove the fake QR immediately. A clear coming-soon state is acceptable while the listing is unavailable.

At release, point both buttons and a real, tested QR to the official App Store listing. Use Apple's official badge assets under its marketing guidance. Check the destination on an iPhone and from desktop; never invent an app ID. [S5]

## Resolve smaller copy mismatches

The FAQ still promises that essentials will always be free. Keep that only if it is an intentional durable commitment. It also says custom plans allow setting a start time, while the inspected app UI configures duration. Support says any duration even though the current modal limits it to 4 to 48 hours. Confirm the signed build before correcting these claims. Recommended public name: Tranquil Fast. It matches the domain and describes the calm timer/tracker without implying personalized coaching. Confirm it before renaming the binary, footer and listing. Verify the advertised iOS 16+ minimum against release metadata.

<!-- pagebreak -->

# Delivery and security checks

## W03 Enforce a single secure public address

Observed on 17 October 2026 using ordinary curl requests: HTTP at the apex returned 200 with the homepage body rather than redirecting to HTTPS. HTTPS www returned Cloudflare 522. The canonical HTTPS apex works. Treat these as fix-before-launch delivery defects, not evidence that the working HTTPS pages are unavailable.

Configure www so it reaches the deployment or redirects to the apex, preserving path and query. Also enable an explicit HTTPS redirect for clients that request HTTP. The .app top-level domain is already HSTS-preloaded in supporting browsers, so the curl HTTP response is not proof ordinary browser visitors use plaintext. Treat the redirect as consistency/hardening; the broken www address is the concrete availability defect. Verify certificates before any additional HSTS policy. [S6, S7, S12]

## Technical findings and acceptance

| Item | Evidence | Required outcome |
| --- | --- | --- |
| Legal routes | .html redirects with 307 to extensionless pages and returns 200 | Preserve existing app URLs; keep final pages public |
| Security headers | No HSTS, CSP, nosniff or Referrer-Policy on sampled successful pages | Add tested headers appropriate to static pages |
| Missing page | Test path returns an empty 404 | Add helpful branded 404 with Home and Support |
| Automated access | Python client received 403 and error 1010; browser and curl worked | Check legitimate access; inspect security events if needed |
| Crawl files | robots allows crawling; sitemap lists .html URLs and May dates | Align sitemap with canonical destinations and real revision dates |
| Public assets | CSS, screenshot, social image and icons returned 200 | Preserve assets and correct content types after deploy |

Do not disable security protections wholesale because one automated client was blocked. Test the Privacy and Support links in logged-out Safari and the final app, from another network if possible. The observed client block is not proof Apple reviewers or search crawlers are blocked. [S8]

For this confirmed static-assets Worker, use an _headers file in the deployed asset directory. Begin CSP in report-only mode and account for current inline scripts, inline support styles and remote fonts; a blanket script-src self policy would break current behavior. Prefer extracted scripts and self-hosted fonts. If Worker-generated responses are added later, attach their headers in code. [S9]

<!-- pagebreak -->

# Experience and maintainability improvements

## W08 Put the product and action first on mobile

At a 390 by 844 viewport, the screenshot appeared before the headline; the first primary button began around 1,111 CSS pixels down the document. This pushes the purpose and action beyond the initial screen. Keep the mobile headline, concise value statement and release/download action above a smaller screenshot. Replace the onboarding-only hero with a current timer or chart using synthetic data so visitors immediately understand the product.

Navigation is hidden at mobile widths with no replacement menu. Legal and support links remain in the footer, so they are present but inconvenient to reach on long pages. Add a compact accessible menu or persistent Privacy and Support links. Make keyboard focus visible, provide a skip link, and validate menu semantics, contrast and touch targets on real mobile Safari.

## Make content resilient when scripts fail

Live CSS starts feature cards, the download card and FAQ items at opacity zero. A JavaScript IntersectionObserver reveals them. The same script reads localStorage first without error handling, so a storage exception could prevent all reveal setup. Content should be visible by default; add animation only after successful initialization and wrap optional storage access in try/catch.

The stylesheet has smooth scrolling, repeated pulse animation and reveal transitions, but no prefers-reduced-motion override was found. Respect reduced-motion preferences and keep functional content visible. This is a specific accessibility improvement, not a claim that a full WCAG audit has been completed. [S10]

## Performance and discovery

The site is lightweight: homepage HTML was about 22 KB, CSS about 31 KB, hero JPEG about 192 KB and social PNG about 230 KB. These raw transfer observations are not a Lighthouse score or real-user performance measurement. Use sized WebP/AVIF variants and srcset if they improve measured loading; keep the hero eager and lazy-load lower screenshots. Self-host only the font weights used.

Keep existing SEO foundations. Remove redundant redirecting internal URLs where convenient, choose consistent canonical paths, and replace the schema screenshot value with an actual app screenshot rather than a social banner. Add the genuine store URL and verified OS requirement to structured data at launch. Use actual modification dates rather than refreshing sitemap dates without content changes.

After launch, add link checking, HTML validation and lightweight accessibility checks to CI. Introduce analytics only after deciding whether the benefit justifies added processing and policy updates; a cookie banner is not automatically required merely because tf-theme exists.

<!-- pagebreak -->

# Safe Cloudflare update plan

## W07 Recover the current source before editing

The workspace contains tranquilfast_static_site and tranquilfast_static_site_v2 folders and ZIPs outside the expo directory. They are untracked. Byte comparisons show the live homepage, legal pages, support page, CSS, hero image and social image differ from local v2. Some small assets and crawl files match. Re-uploading that old folder could undo newer work.

Dashboard verification confirms a Worker named tranquilfast serving only static assets. It is manually deployed through the dashboard, with no connected Git repository. The active version is 66777db0 at 100 percent traffic. Its custom domain is tranquilfast.app; www is not listed. Its public Worker URL is tranquilfast.rodrigo-andara.workers.dev. Worker logs and traces are shown disabled; preview URLs are off. This does not establish all zone-level security-log settings.

## Recover the authoritative source

1. Open Cloudflare > Workers and Pages > tranquilfast. Overview shows Manually deployed, Source Dashboard, and Automatic deployment on upload. This is not a Git-connected Pages site.
2. Recover the currently deployed HTML, CSS and all referenced assets, or the original upload package. Preserve a byte/hash manifest and the existing version identifier before editing.
3. Put the recovered baseline under version control and compare it with production. Do not replace it with the old local v2 ZIP. Keep credentials out of the repository.

## Prepare a reviewable update

Use a dedicated website directory or repository with a short README, canonical paths, source ownership, build/deploy instructions, required provider facts and rollback steps. Keep website code out of the Expo Router app tree. Work on a separate branch, with secrets excluded, and document which app build the product copy describes.

Complete privacy/support corrections, download-state cleanup and mobile navigation first. Test locally and in a separate staging Worker or a verified preview workflow; the current project's preview URLs are off. Uploading to the existing production project automatically deploys, so do not use it as an unreviewed preview. Configure HTTPS/www without unrelated DNS/mail changes. After approval, use the existing Worker's manual upload workflow; a later Git connection should be a deliberate improvement. [S11]

## What can be done next

I can help recover and organize the source, draft replacement text using verified provider facts, implement the static-site edits, and prepare a preview or upload package. Production publication should follow review of the concrete result. Final legal choices, retention settings, support-mail operation and App Store metadata require the operator's confirmation.

<!-- pagebreak -->

# Release checklist and supporting evidence

## Before App Review

- Approve W01 privacy content, actual retention rules and the applicable rights/contact process.
- Complete W02 Sentry evidence and match App Privacy answers to the final binary.
- Update deletion/Health troubleshooting and verify the advertised support mailbox.
- Check Privacy and Support from the final app and logged-out mobile Safari without a challenge.
- Confirm operator identity, intended audience, product name and release metadata.

## Before public launch

- HTTP redirects to HTTPS; www reaches the canonical site with path and query preserved.
- Remove the decorative QR and development text; publish genuine store links only when available.
- Verify both download actions, a real QR, legal links, mailto, mobile menu and FAQ.
- Verify reduced motion, keyboard focus, script-failure visibility and no mobile overflow.
- Retain source revision, approved copy, deployment ID, test results and rollback instructions.

## Evidence record

The live review covered homepage, Privacy, Terms, Support, CSS, robots, sitemap and referenced primary assets. Browser samples included desktop 1440 by 1000, mobile 390 by 844, and small-screen Support/Terms at 320 pixels. Header checks used GET/HEAD requests; a deliberately missing path checked 404 behavior. DNS checked MX only. No emails or forms were submitted and no production setting or website file was changed.

The app comparison used the existing local checkout at 5042b7c and the earlier build 106 smoke-test observations. This does not attest every change compiled into 106. The Cloudflare Worker overview, settings and domains were inspected read-only. No Lighthouse run, full accessibility audit, comprehensive provider-account audit, backup inspection or legal opinion is claimed. Do not confuse the existence of public legal pages with complete launch compliance.

## Sources

[S1] Apple App Review Guidelines, section 5.1.1. https://developer.apple.com/app-store/review/guidelines/

[S2] Apple App Privacy Details. https://developer.apple.com/app-store/app-privacy-details/

[S3] FDPIC Duty to provide information. https://www.edoeb.admin.ch/en/duty-to-provide-information

[S4] FDPIC Cross border transfer of personal data. https://www.edoeb.admin.ch/en/cross-border-transfer-of-personal-data

[S5] Apple Marketing Resources and Identity Guidelines. https://developer.apple.com/app-store/marketing/guidelines/

[S6] Cloudflare Always Use HTTPS. https://developers.cloudflare.com/ssl/edge-certificates/additional-options/always-use-https/

[S7] Cloudflare Single Redirects. https://developers.cloudflare.com/rules/url-forwarding/single-redirects/

[S8] Cloudflare Error 1010. https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1010/

[S9] Cloudflare Workers Static Assets Headers. https://developers.cloudflare.com/workers/static-assets/headers/

[S10] W3C Animation from Interactions. https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html

[S11] Cloudflare Workers Static Assets Direct Uploads. https://developers.cloudflare.com/workers/static-assets/direct-upload/

[S12] Google Registry on app domain HSTS preloading. https://developers.googleblog.com/en/app-bringing-more-people-online-securely/
