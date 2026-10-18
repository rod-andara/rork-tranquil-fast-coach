# App Store Connect setup — 18 October 2026

App: Tranquil Fast Coach. Apple ID `6753986331`; bundle `com.tranquilfastcoach.app`. Settings were edited through the owner's signed-in Safari session. No submission or release was performed.

Latest candidate: **109**, independently visible as Ready to Submit in TestFlight; owner reports installed and working. Version 1.0 now attaches **109**, replacing 107. Five owner-approved screenshots are uploaded in English (U.S.) and their order persisted after reloading. Store draft validation completed: version is **Ready for Review**, build 109 is an **Item Ready to Submit**, and the final **Submit for Review** button remains untouched. See [109 preparation record](Build-109-App-Store-Preparation-2026-10-18.md). Neither TestFlight delivery nor draft creation sends the app to App Review.

## Saved settings

- English (US) subtitle: `Fasting & Weight Tracker`.
- Primary category: Health & Fitness. Existing app name retained.
- Age questionnaire: no parental controls, age assurance, unrestricted in-app web browsing, UGC, social media, chat or paid advertising; no mature/sexual/violent/gambling content. Frequent health/wellness guidance and wellness topics declared. Calculated rating 16+, overridden to **18+**, as required by the owner's adult-use policy. Apple displays regional equivalents, including 19+ in Korea and legacy 17+ on operating systems earlier than26. This does not implement an in-app age check.
- Age suitability URL: `https://tranquilfast.app/terms#health`.
- Privacy Policy URL: `https://tranquilfast.app/privacy`.
- Privacy questionnaire saved with six types: **Coarse Location, User ID, Device ID, Product Interaction, Crash Data, Other Diagnostic Data**. Each: App Functionality, linked to the user/device, **not used for tracking**. These describe observed Sentry installation identifiers, approximate geography, technical breadcrumbs and errors; they do not imply an account, GPS access or advertising. Health/weight/fasting records remain on device under the reviewed implementation; no health-value leak was established. Performance tracing is disabled, so Performance Data was not selected solely because Sentry is present.
- Privacy responses are **published by the owner**, independently verified in ASC: “Published a few seconds ago by Rodrigo Andara.” Owner confirmed their accuracy. The declaration describes the current free release; it does not prohibit future subscriptions. Update it and the privacy policy when actual data practices change.
- Free pricing configured: US base USD0.00 and Apple's equivalent zero prices across175 storefronts. This is price configuration, not territory availability.
- Initial platform scope: Apple Silicon Mac and Vision Pro availability disabled; iPhone is the tested release platform. Public distribution retained. School volume-price discount disabled (free adult app).
- Content Rights: owner selected Yes; saved and observed in ASC as “Yes, this app has the necessary rights to its third-party content.” This does not assert individual negotiated publisher licenses.
- Availability: owner selected option2, **all countries Apple permits**. Configured All Countries or Regions; ASC reports **175 Available**, with “Available on App Release” in its territory table. Includes automatic availability in future Apple storefronts under that setting. This does not release the app or override regional compliance rules.
- Regulated medical device question: **No**, saved and verified after reloading App Information: “This app has been declared not a regulated medical device in any country or region.” This matches the general-wellness purpose and existing HealthKit `isMedicalDevice:false` config.

## Saved version page

Owner entered the App Review phone number. After saving and reloading, the metadata, attached 109, updated reviewer notes and manual-release selection persisted; Save is disabled. The private number is intentionally omitted from this document. A saved form is not proof that every final submission validation has passed.

- Build 109, version 1.0.0 attached. Owner-approved screenshot order: Timer, Your Fast, Progress in pounds, Learn, dark mode. The metric alternative remains local.
- No sign-in required; no credentials supplied.
- Manual release selected.
- Reviewer: Rodrigo Andara, `support@tranquilfast.app`; private phone entered by owner.
- Support URL `https://tranquilfast.app/support`; Marketing URL `https://tranquilfast.app`.
- Copyright `2026 Rodrigo Andara`.
- Keywords: `intermittent,timer,weight,tracker,health,wellness,16:8,routine,progress,fast`.
- Promotional text: Build a calmer fasting routine. Track your fasts and weight, explore helpful resources, and optionally connect Apple Health for weight syncing.

### Description

Make space for a calmer fasting routine with Tranquil Fast Coach.

Choose a fasting plan, follow your fasting timer, and keep track of your progress in one simple app.

YOUR FASTING ROUTINE
Choose from fasting plans and track your current fast. Review your fasting history as you build a routine that fits your life.

WEIGHT AND PROGRESS
Log your weight, set a goal, and view your progress over time. Choose kilograms or pounds.

OPTIONAL APPLE HEALTH CONNECTION
With your permission, import weight measurements from Apple Health. You can also choose to export new manually logged weights to Apple Health. The app works without connecting Apple Health.

LEARN AND EXPLORE
Browse a curated collection of fasting and nutrition articles, recipes, and useful products. External resources open on their publishers’ websites.

SIMPLE EVERYDAY USE
Use light or dark mode, manage reminders, and access your fasting and weight records on your device. No account or subscription is required.

FOR ADULTS 18+
Tranquil Fast Coach is a general wellness tool. It does not provide medical advice, diagnosis, or treatment. Fasting is not suitable for everyone. Do not use fasting routines if you are pregnant or breastfeeding or have an eating disorder. If you have a medical condition or take medication, speak with a qualified healthcare professional before fasting.

Privacy: https://tranquilfast.app/privacy
Terms: https://tranquilfast.app/terms
Support: https://tranquilfast.app/support

### Reviewer notes

Version 1.0.0 (build 109). This is a free app with no in-app purchases or subscriptions. No sign-in or demo account is required.

Core functions: choose a fasting plan, start and end a fast, review fasting history, log weight, set a weight goal, and browse curated learning resources.

Apple Health integration is optional and limited to body weight. Open Progress and scroll to Apple Health to connect and grant the requested Weight read/write permissions. Sync Now imports available weight measurements. When adding a new weight, the Sync to Apple Health switch controls exporting that entry; turn it off to keep the entry local. If Health access is declined or no weight measurements exist, manual weight logging remains available. Imported records are not repeatedly duplicated.

The app is intended for adults18+ and provides general wellness information, not medical diagnosis or treatment. Privacy Policy, Terms, and Support are accessible from Settings and the website.

LEARN EXTERNAL RESOURCES
The Learn section is a curated directory of external resources. Cards contain titles and short descriptions. Selecting a card opens the publisher’s original website outside the app through the system URL handler. We do not host, scrape or reproduce full articles, recipes or publisher media, bypass access restrictions, or claim publisher affiliation. This release contains no affiliate links or commissions.

These reviewer notes were saved in ASC on 18 October and verified after reloading. The Health navigation instructions were corrected against the current source; build 109 is attached.

## Actual remaining dependencies

1. **Developer agreement — ACCEPTED:** owner accepted the updated agreement. Independently verified in Apple Developer Account → Agreements: Apple Developer Program License Agreement issued14October2026, accepted18October2026. App Store Connect Business still displayed the previous agreement notice after refresh immediately afterward; do not ask the owner to accept it again based solely on that stale/conflicting notice. Recheck ASC before submission. No agreement accepted by agent. Paid-app setup/bank/tax changes are not needed merely for this free release.
2. **Build selection — COMPLETE:** 109 is processed in TestFlight, owner-reported installed/working, and attached to version 1.0. The reviewer-phone dependency is resolved. This does not certify every device/privacy test.
3. **Privacy publication — COMPLETE:** owner published the responses; ASC publication verified. Future subscriptions remain intended; see `docs/Monetization-Roadmap.md`. This is a current data-practices declaration, not a permanent business-model commitment.
4. **Content rights — COMPLETE IN ASC:** owner answered Yes after the external-link clarification; saved and observed in App Information. Owner names ChatGPT, Claude, Manus and Grok; onboarding media was personally generated with Grok. Current provider-output findings and their limits are recorded in SPEC-31; this is not evidence of individual publisher agreements. New build must include SPEC-30 branding and SPEC-31 credits. Learn reviewer explanation is now saved.
5. **Availability — COMPLETE:** owner selected all permitted countries; worldwide setting saved and ASC reports175Available. No pre-order configured. Manual release retained.
6. **Screenshots — UPLOADED:** owner approved the displayed designs and explicitly requested upload. Five opaque 1206 × 2622 PNGs are saved in English (U.S.), iPhone with Dynamic Island (medium display); ASC shows 5 of 10 App Screenshots, with order verified after reload. They contain owner-approved visible name/health information and enlarged Mirroring captures; native-resolution alternatives remain a quality option, not a new-build requirement. Private image/SVG files remain outside GitHub. Header and preview video remain optional and empty. No iPad/watch assets were uploaded for this iPhone-only build.

7. **Accessibility listing:** inspected, currently “Get Started.” No feature support was certified: comprehensive VoiceOver,200% text, contrast and motion testing is not complete, and a sampled dark-status-bar defect is recorded. Do not infer full support from the presence of dark mode or accessibility labels. This section was left unclaimed.

8. **Final submission check:** the saved version attaches 109 with manual release retained. See the 109 preparation record for the latest draft-validation status; do not infer a submission from a screenshot upload or enabled Add for Review button. ASC Business still shows the old agreement warning; a fresh visit to Apple Developer independently reconfirmed the October 14 agreement accepted October 18. No agreement was accepted by the agent. Final diagnostic/Health checks retain their actual evidence limits in Launch Essentials; do not mark the historical full matrix passed.

## Already verified; no new work needed

### Learn content-rights clarification

Owner states no publisher was contacted: Learn currently provides recommendations linking to original websites; affiliate links are a possible future feature, not implemented. Source inspection confirms `Linking.openURL` handoff, static titles/short descriptions, local gradient/icon cards, and no embedded publisher article/recipe bodies, publisher image fetching, scraping or in-app webview in this screen. Do not describe publishers as partners or claim written licenses.

The broad ASC question includes accessing third-party content; the recommended category is Yes, based on permission for the limited linking use rather than ownership of destination articles. Apple's reference permits use where rights are held **or use is otherwise permitted by law**. This is an interpretation for the observed implementation, not an Apple ruling that every external link needs a negotiated license or that every destination is automatically authorized. Individual publisher terms and intended territories have not all been audited. If challenged, explain the external-link-only implementation factually; do not invent permission documents. See [Apple Content Rights reference](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information) and [guideline5.2.2](https://developer.apple.com/app-store/review/guidelines/#intellectual-property). The EU court's [Svensson explanation](https://curia.europa.eu/site/upload/docs/application/pdf/2014-02/cp140020en.pdf) distinguishes hyperlinks to freely accessible authorized publications from reproducing or bypassing restricted content; this is not a global legal clearance.

Suggested reviewer explanation: “The Learn section is a curated directory of external resources. Cards contain titles and short descriptions. Tapping a card opens the publisher's original page outside the app through the system URL handler. The app does not host, scrape or reproduce full articles, recipes or publisher media, or bypass access restrictions. There are no affiliate links or commissions in this release.”

Future affiliate use requires approval under each affiliate program's terms and clear commission disclosures before release, alongside review of data practices and applicable Apple rules. No affiliate activation or ASC content-rights answer was submitted during this guidance check.

- Business → Compliance: **Digital Services Act Active**, updated22October2025. App already declares trader status. No trader/contact changes made; no personal address copied into this record.
- Support mailbox access and receiving/replying verified by owner; forwarding enabled.
- Build107 installed and owner reports core/Health repeat-sync checks pass. See the separate smoke-test record for scope and limitations.
- Website canonical privacy, terms and support pages are live; website remains coming soon until there is a public App Store listing.

## References

- [Apple privacy types, linkage and IP-derived data](https://developer.apple.com/app-store/app-privacy-details/)
- [Age rating override](https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating/)
- [Regulated medical device declaration](https://developer.apple.com/help/app-store-connect/manage-app-information/declare-regulated-medical-device-status)
- [Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/)
