# SPEC-30 — Match app icons to the website brand

## Request and scope

18 October 2026: owner asked to replace the app's black placeholder icon with the purple symbol used on tranquilfast.app, supplying a screenshot of the website header.

Reuse the existing website vector geometry and gradient (`#B79CFF` → `#7C3AED`), not a generated interpretation. The website mark has a white semicircular arc and central white dot. The iOS version uses a full-bleed square background; iOS supplies rounded corners. No label or baked-in corner transparency.

## Files

- `assets/branding/app-icon.svg`: editable vector master adapted from the website header SVG.
- `scripts/generate-brand-icons.cjs`: deterministic Sharp rasterization; accepts `SHARP_MODULE_PATH` for a shared tooling installation.
- `assets/images/icon.png`:1024×1024 opaque RGB iOS/app icon.
- `assets/images/adaptive-icon.png`:1024×1024 opaque Android foreground; symbol within the central safe area.
- `assets/images/splash-icon.png`: white symbol on transparent canvas; existing purple splash background retained.
- `assets/images/favicon.png`:64×64 circular website mark, transparent outside the circle.
- `app.json`: existing paths already point to these assets; no config or bundle/version changes needed.

Generated PNGs are committed. EAS does not need Sharp or the generator. To regenerate, run `node scripts/generate-brand-icons.cjs` with Sharp available, or set `SHARP_MODULE_PATH` to its installed module directory. No app dependency was added.

## Verification

- Generator completed successfully and reported expected sizes/alpha: iOS and Android opaque, splash/favicon transparent as intended.
- Visually inspected1024px icon against the website header source and owner's reference.
- `expo config --type public --json` resolves the intended icon, splash, adaptive icon and favicon paths.
- `npx --no-install tsc --noEmit`: PASS. `git diff --check`: PASS.
- Native device icon/splash verification remains pending a new production build. Existing build107 contains the previous assets and cannot be changed by editing App Store Connect. Do not submit107 if the new icon is required for launch.

## Build handoff

1. Build: `eas build --platform ios --profile production`.
2. Note the exact returned build ID/number and commit. Remote versioning auto-increments;108 is expected only if no intervening build consumed it.
3. Submit that exact build: `eas submit --platform ios --profile production --id <build-id>`.
4. Install the processed TestFlight build and check the home-screen icon, splash, launch, and a brief core-flow smoke test.
5. In App Store Connect replace attached107 with the newly tested build and update reviewer notes to its actual build number before review submission.

No new cloud build, TestFlight upload, App Review submission or public release was triggered by this asset change.
