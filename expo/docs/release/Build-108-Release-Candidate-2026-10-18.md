# Build108 release candidate —18October2026

## Verified EAS artifact

- Version1.0.0, iOS build108; production profile, STORE distribution, physical device build.
- EAS build ID `543bc8eb-2766-4675-97bd-e55c9909be87`.
- [EAS build](https://expo.dev/accounts/rod_andara/projects/tranquil-fast-coach/builds/543bc8eb-2766-4675-97bd-e55c9909be87).
- Status FINISHED; created15:43:44UTC /17:43:44Europe/Zurich, completed15:51:17UTC /17:51:17Europe/Zurich.
- Source commit `acb0b862da6c374f4a3cf7ca523bb5908eb78d97`.
- Git ancestry checked: includes SPEC-30 icon commit24ddb1f and SPEC-31 media-credit commit eef988a. The EAS source reference does not alone certify the complete archive or the installed app's behavior.

## TestFlight upload

- Initial noninteractive upload stopped because the production submit profile did not specify `ascAppId`.
- Added verified ASC app ID `6753986331` to `eas.json` → submit.production.ios.ascAppId. No secret was added. This is upload configuration, not an application runtime change and does not require rebuilding108.
- Retried with the **exact build ID**, not an ambiguous latest-build selection.
- Existing EAS-managed App Store Connect API credential reused; no new access created.
- EAS upload scheduled: [delivery record](https://expo.dev/accounts/rod_andara/projects/tranquil-fast-coach/submissions/d30bcd98-9c78-426d-aca3-4fc091b560e7).
- **EAS delivery completed successfully**: CLI confirms the binary was uploaded to App Store Connect. Apple receipt independently verified in ASC TestFlight → Build Uploads: **Version1.0.0, Build108, Processing**. Processing/installability is not yet complete. EAS calls this operation a submission; it uploads to App Store Connect/TestFlight and does **not** submit the app for App Review.

## Before replacing107 and requesting App Review

1. Confirm108 appears and finishes processing in TestFlight; resolve actual export-compliance questions if shown using the reviewed binary/configuration, without inventing declarations.
2. Install108. Check the new purple home-screen icon and normal launch. Confirm existing fasting/weight data is preserved.
3. Check Grok credits in welcome, track-succeed and choose-plan screens, including legibility and accessible buttons with larger text. Do not erase the owner's app/data just to force onboarding; use a safe navigation/test-device approach.
4. Brief core/Health smoke test with no duplicates and correct optional export behavior; verify affected final-build diagnostic privacy before release. Prior107 results remain prior-build evidence.
5. Capture clean final-app screenshots without personal health values or private contact information, at accepted Apple dimensions; upload at least the required iPhone screenshot.
6. Replace attached107 with verified108 in the distribution version; retain manual release and saved Learn review notes. Final metadata, agreements and regional compliance check follows.

No App Review submission or public release authorized/performed. Owner explicitly requires preparing the app first and a separate decision before submission.
