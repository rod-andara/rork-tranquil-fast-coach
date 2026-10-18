# App Store Connect setup — 18 October 2026

App: Tranquil Fast Coach. Apple ID `6753986331`; bundle `com.tranquilfastcoach.app`. Settings were edited through the owner's signed-in Safari session. No submission or release was performed.

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
- Regulated medical device question: **No**, saved and verified after reloading App Information: “This app has been declared not a regulated medical device in any country or region.” This matches the general-wellness purpose and existing HealthKit `isMedicalDevice:false` config.

## Saved version page

Owner entered the App Review phone number. The page now shows Save disabled with no validation errors; reloading retains the metadata, attached107 and manual-release selection. The private number is intentionally omitted from this document.

- Build107, version1.0.0 attached. **Replace this after the SPEC-30 icon rebuild**; the saved listing still describes107 until a new build is processed and tested.
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

Build107, version1.0.0. This is a free app with no in-app purchases or subscriptions. No sign-in or demo account is required.

Core functions: choose a fasting plan, start and end a fast, review fasting history, log weight, set a weight goal, and browse curated learning resources.

Apple Health integration is optional and limited to body weight. In Settings, enable Apple Health and grant the requested Weight read/write permissions. Sync Now imports available weight measurements. A separate export preference controls writing newly entered manual weights to Apple Health. If Health access is declined or no weight measurements exist, manual weight logging remains available. Imported records are not repeatedly duplicated.

The app is intended for adults18+ and provides general wellness information, not medical diagnosis or treatment. Privacy Policy, Terms, and Support are accessible from Settings and the website.

## Actual remaining dependencies

1. **Developer agreement — ACCEPTED:** owner accepted the updated agreement. Independently verified in Apple Developer Account → Agreements: Apple Developer Program License Agreement issued14October2026, accepted18October2026. App Store Connect Business still displayed the previous agreement notice after refresh immediately afterward; do not ask the owner to accept it again based solely on that stale/conflicting notice. Recheck ASC before submission. No agreement accepted by agent. Paid-app setup/bank/tax changes are not needed merely for this free release.
2. **New icon build:** SPEC-30 changes the bundled icon assets. Build, upload, install and briefly verify a new production artifact, then replace107 in the listing and update reviewer notes. No cloud build started yet. The reviewer-phone dependency is resolved.
3. **Privacy publication — COMPLETE:** owner published the responses; ASC publication verified. Future subscriptions remain intended; see `docs/Monetization-Roadmap.md`. This is a current data-practices declaration, not a permanent business-model commitment.
4. **Content rights:** Apple asks whether third-party content is accessed and the necessary rights held. Learn has external publisher links; onboarding includes videos/artwork. Owner asked to confirm media licensing; no rights assertion submitted yet.
5. **Availability:** no launch territories configured initially. Owner asked whether all permitted storefronts or an initial Switzerland/EU/UK/US group; no answer assumed.
6. **Screenshots:** no screenshots uploaded. Available older `IMG_7454(1).png` sample has Rork overlays and is not a clean current-build asset. The version UI accepts1179×2556 or1206×2622 portrait screenshots for its medium Dynamic Island slot. Use clean current-app screenshots without the owner's real health information. Additional marketing header and preview video are not immediate essentials. Required size validation remains to be completed in Media Manager.

## Already verified; no new work needed

- Business → Compliance: **Digital Services Act Active**, updated22October2025. App already declares trader status. No trader/contact changes made; no personal address copied into this record.
- Support mailbox access and receiving/replying verified by owner; forwarding enabled.
- Build107 installed and owner reports core/Health repeat-sync checks pass. See the separate smoke-test record for scope and limitations.
- Website canonical privacy, terms and support pages are live; website remains coming soon until there is a public App Store listing.

## References

- [Apple privacy types, linkage and IP-derived data](https://developer.apple.com/app-store/app-privacy-details/)
- [Age rating override](https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating/)
- [Regulated medical device declaration](https://developer.apple.com/help/app-store-connect/manage-app-information/declare-regulated-medical-device-status)
- [Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/)
