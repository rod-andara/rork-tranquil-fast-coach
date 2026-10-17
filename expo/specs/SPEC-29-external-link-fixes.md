# SPEC-29: External link fixes (post build 106)

Source: on-device audit of build 106 (`docs/release/link-verification-2026-10-17/Build-106-External-Link-Verification.md`) plus a Sentry "Unable to open URL" event.

## Changes
- `learn.tsx`: `handleOpenLink` wraps `Linking.openURL` in try/catch (alert on failure), drops `canOpenURL`, haptics are fire-and-forget (no longer awaited before navigation).
- `content.ts`: Mayo beginner URL (404) -> `expert-answers/intermittent-fasting/faq-20441303`; Healthline electrolytes (consent wall) -> MedlinePlus; titles/descriptions corrected to match destinations (quinoa, Buddha bowl, 10 benefits, Nutrition Basics, storage containers, Hydro Flask); stale price/rating removed from all product cards.
- `settings.tsx`: Help fallback/mailto address aligned to `support@tranquilfast.app` (matches website and `constants/links.ts`).

## Notes
- Settings web-link failures (alert "Link Unavailable") and silent Learn taps occurred under iPhone Mirroring only; links open on a physical tap. Mirroring is the suspected cause, not proven.
- Healthline "10 benefits" article may show a consent wall; swap for Harvard Health / Cleveland Clinic if confirmed on device.
- Unverified by us: People, Allrecipes, Mayo Nutrition Basics, iHerb (bot-blocked to curl; opened fine in Safari per audit).

## Verification
- `npx tsc --noEmit` clean.
- Tap each Learn card and Settings link on a physical device in build 107.
