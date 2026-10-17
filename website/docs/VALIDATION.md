# Website validation — 17 October 2026

## Checks completed locally

- `python3 website/scripts/check.py`: PASS. Five HTML pages checked for local links/anchors/assets, duplicate IDs, one main/h1 each, meaningful image alt text, canonical URLs, sitemap XML, JSON-LD parse and CSP hash, no inline styles/event handlers, and removed release placeholders.
- `node --check` for both public JavaScript files: PASS.
- `node website/scripts/check-enhancements.cjs`: PASS. Theme initialization/toggle, menu navigation, Escape/focus restoration, and available vs throwing localStorage. This uses a small DOM harness, not a real-browser no-storage test.
- Local HTTP smoke checks: PASS. Homepage/legal/support 200, `.html` aliases 308 to extensionless paths, unknown page404 with navigation, font200; CSP present. See [local-http-checks.json](local-http-checks.json). These are preview-server results, not proof of Cloudflare's production behavior.
- Packaging produces a ZIP with public assets only; no Expo source, documentation, credentials, or enclosing directory.
- `git diff --check`: PASS after trimming recovered CSS whitespace.

## Browser checks performed through the Codex browser

- Layouts sampled at320×740,390×844,768×1024 and1440×1000. No horizontal overflow in sampled pages. On390px homepage the release status ends around475px from the top, above the app image.
- Small-phone navigation, including320px, tested after reducing header spacing. Menu opens; Escape closes it and returns focus; following a menu link closes it.
- Light/dark toggle works; selected theme persists across page navigation and reload. Dark accent colors adjusted for readability. Initial theme script runs before page styles to reduce theme flash.
- Homepage feature/download/FAQ content is visible without a scroll-reveal dependency. FAQ expands and its Apple Health support link is present.
- Privacy and Terms body copy renders at16px; support copy and email address fit a narrow phone. Privacy/support/terms navigation, 404 recovery to Support and support mailto targets inspected.
- No JavaScript/CSP console errors or warnings observed in sampled final preview pages. No support email was sent, and no inbox-delivery claim is made.
- Screenshots saved locally: `/tmp/tranquilfast-website-desktop.png`, `/tmp/tranquilfast-website-mobile.png`. These show the local preview, not a production deployment.

## Limits and required post-deployment checks

- No real-device Safari or VoiceOver audit performed for this update; sampled desktop Chromium rendering is not a complete accessibility certification.
- Without-JavaScript behavior is supported structurally (native details/links, default-visible navigation/content); browser JavaScript was not disabled during these UI tests.
- Cloudflare certificate/DNS, HTTP/HTTPS/www redirects, injected security scripts, edge header handling, cache behavior and production404 status require live verification.
- Current Sentry account configuration was inspected read-only. No native crash test or complete raw-event audit was performed; no claim that all health data is proven absent from diagnostics.
- Privacy/Terms are drafts pending operator approval. Age-rating and final-app-policy coordination are recorded in LAUNCH-HANDOFF.md.
