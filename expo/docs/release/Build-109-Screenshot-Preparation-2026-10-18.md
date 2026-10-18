# Build 109 screenshot preparation — 18 October 2026

Owner reports build 109 installed/running through TestFlight and working well. Captured real app UI through iPhone Mirroring; this session did not independently extract the installed build number or submit anything to App Review.

## Deliverables

Private local artifact folder:
`/Users/rodrigoandara/.codex/visualizations/2026/10/17/01a14a2e-5a70-7990-8826-2a09ca0b4f50/app-store-build-109/`

- `preview-contact-sheet.png`: six-design overview.
- `Tranquil-Fast-Build-109-Screenshot-Drafts.zip`: five recommended PNGs (Timer, Your Fast, Progress in pounds, Learn, dark mode) plus a metric Progress alternative and README. Prefer replacing the imperial Progress with metric where appropriate rather than publishing duplicate charts without purpose.
- Per-design editable SVGs, original window JPEGs, generated decorative background, `manifest.json`, `README.md` and portable `compose-layouts.cjs` remain in the same folder.

All six presentation exports were checked: opaque PNG, 1206 × 2622. Visual QA covered the contact sheet and a larger imperial Progress export. Decorative background generated with image generation; branding/captions/framing are code-native SVG; screen pixels come from actual app captures, not generated/recreated UI. Viewport cropping excludes Mac window chrome. No statistics or health values were retouched.

## Limitations and privacy

Mirroring source captures are JPEG, 484 × 1062, with approximately 468 × 1016 phone content. The screen portions are therefore enlarged in the App Store-sized layouts. These are usable design drafts, not native-resolution iPhone screenshots. For best launch sharpness, replace the source images with original on-phone screenshots and regenerate the layout, updating the viewport/dimensions. This requires no new app build.

Artifacts contain personal name/fasting/weight information. Keep the captures and SVGs with embedded captures out of GitHub and obtain the owner's approval of the exact visible content before uploading/publishing. Only this non-sensitive handoff document belongs in the repository. No screenshot was uploaded to App Store Connect in this session.

## Observations and restored state

- Updated goal-relative Change wording observed. Full 30-day chart captured; first date label visible.
- Owner explicitly requested imperial screenshots; switched via the actual Settings unit control and captured pounds as the US-facing default, retaining metric as an alternative.
- Dark mode capture shows light status-bar text/icons. Restored light mode and kilograms afterward; app left on the 30-day Progress chart. Mirroring viewing size returned approximately to its prior size after enlarging for capture.
- Running fast left intact. No weight/goal/history entry added or deleted; no Health permission/export preference, notification setting or plan changed. Unit display conversion uses the existing app behavior.
- Mirroring automation could switch tabs but could not scroll Progress. Owner positioned the chart; do not classify this alone as an ordinary-phone app scrolling failure.

Next: owner reviews the designs/content, native originals if desired for sharpness, then approved screenshot upload and final App Store Connect preparation with verified build 109. App Review submission still needs separate owner authorization.

References: [Apple product-page guidance](https://developer.apple.com/app-store/product-page/), [screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/).

## Subsequent upload authorization and result

Owner approved the displayed screenshots and explicitly requested uploading/setting them up in App Store Connect. Five recommended images (including pounds and dark mode) were uploaded in the documented order; the metric alternative was not uploaded. The gallery shows 5 of 10 App Screenshots in English (U.S.), iPhone with Dynamic Island (medium display), and persisted after reload. Private original/source assets remain out of GitHub. See the build 109 App Store preparation record for current saved build, notes and final-validation status. No App Review submission or release is implied.
