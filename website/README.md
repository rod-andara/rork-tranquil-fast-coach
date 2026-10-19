# Tranquil Fast website

Source for <https://tranquilfast.app>, independent of the Expo application in `../expo`.

## Start here in a new session

1. Read this file, [launch handoff](docs/LAUNCH-HANDOFF.md), and the [original audit](docs/WEBSITE-AUDIT-2026-10-17.md).
2. Check Git status before editing. The iOS app may be under active development in another checkout.
3. Check Cloudflare's current production version before deploying. This repository does **not** automatically deploy the website.
4. Confirm that privacy/support descriptions still match the final app binary and provider settings. Do not infer the final binary's behavior from a working tree alone.

## Source and hosting

- GitHub: <https://github.com/rod-andara/rork-tranquil-fast-coach>.
- Public files: `website/public/`. HTML/CSS/JavaScript only; no Node package installation or build is needed.
- Cloudflare Workers, worker **tranquilfast**, production custom domain **tranquilfast.app**. This is a static-assets Worker, not a Cloudflare Pages/Git-connected project.
- Existing deployment method: manual dashboard file/ZIP upload. New upload deployments go directly to production. Preview URLs were off when inspected.
- Recovered production baseline: commit `9e6a61c`, version prefix `66777db0`. File hashes and original retrieval URLs are in [recovered-production.json](docs/recovered-production.json).
- Existing images are recovered production assets. DM Sans and DM Serif Display are now served locally; their OFL licenses are in `public/fonts/`.

## Local preview and checks

From the repository root:

```sh
python3 website/scripts/check.py
node --check website/public/site.js
node --check website/public/theme-init.js
node website/scripts/check-enhancements.cjs
python3 website/scripts/serve.py
```

Open <http://127.0.0.1:8765>. The preview emulates extensionless HTML paths, `.html` redirects, the custom 404, and static security headers. It does not emulate Cloudflare security challenges, DNS, certificates, or edge redirects. It binds to localhost only.

All content and links work without JavaScript. Theme storage is optional and guarded against browser restrictions. The mobile menu is a progressive enhancement; without JS the navigation remains visible. No analytics or external scripts are embedded.

## Upload and verify

1. Resolve the open owner/legal items in [LAUNCH-HANDOFF.md](docs/LAUNCH-HANDOFF.md). Publishing revised legal commitments requires review of the actual text.
2. Run the checks above and inspect mobile/desktop, light/dark, navigation, FAQ, privacy, support, terms and 404.
3. Run `python3 website/scripts/package.py`. The resulting `website/dist/tranquilfast-website.zip` contains **only** the contents of `public/`, at ZIP root. Do not upload the repository, Expo app, docs, or an enclosing `public` folder.
4. In Cloudflare → Workers & Pages → **tranquilfast** → New deployment, upload that ZIP and inspect the listed files. Confirm the worker name, then deploy.
5. Verify the public homepage, `/privacy`, `/terms`, `/support`, legacy `.html` links, a nonexistent path (must return HTTP 404), font/image requests, and `_headers` behavior. Check browser console for CSP failures. Do not weaken Cloudflare protection to accommodate a command-line client.
6. Record the production version, UTC time, commit, upload SHA-256, verification and remaining items in [LAUNCH-HANDOFF.md](docs/LAUNCH-HANDOFF.md). Git commits and Cloudflare deployments are separate operations.

### Security and domain configuration

`public/_headers` enforces CSP with self-hosted assets, a hash for the homepage JSON-LD, frame protection, nosniff, a referrer policy, and feature restrictions. If editing JSON-LD, regenerate its CSP SHA-256; `check.py` catches mismatches. Avoid inline scripts/styles and avoid adding third-party services without reviewing CSP and privacy.

Apex HTTPS already works. Before the update, HTTP returned 200 and HTTPS `www` returned 522. `.app` is HSTS-preloaded in modern browsers, but explicit HTTPS redirects are still desirable. These fixes require **Cloudflare zone configuration**, not a host-based `_redirects` file: Workers static-assets redirects do not support domain-level source matching.

Inspect the existing `www` DNS record before changing it. Use a proxied record and a Cloudflare redirect rule for `www.tranquilfast.app` → `https://tranquilfast.app`, preserving path and query. Set HTTPS redirect behavior for the apex. Verify both hosts on HTTP/HTTPS and deep paths; do not change mail records. If using a Worker custom domain instead, check certificate/DNS provisioning and avoid a redirect loop. Account-level changes are not rolled back by a Worker deployment rollback.

## Rollback

Use Cloudflare → tranquilfast → Deployments → select the previously recorded working version → Rollback. Before the first update the recorded prefix was `66777db0`; verify it remains available. If unavailable, recover the `website/public` directory from commit `9e6a61c` in a **separate temporary checkout**, ZIP its contents, and upload it. Keep the newer source and documentation in Git. Roll back any zone redirect or DNS changes separately using the recorded original values.

## Going live on the App Store

Keep the current “coming soon” state until the public App Store page is accessible. Then replace release-status text with a real App Store link, using the official badge appropriately. Add a QR only if generated from and tested against the exact public URL. Update title/description, structured data and FAQ consistently; do not invent an App Store ID, supported iOS version, review scores, or a permanent pricing promise.

## Scope and legal limits

This update improves disclosure and support accuracy; it is not certification of legal compliance or a final App Privacy assessment. The launch handoff explicitly tracks operator contact/trader obligations, contracts and transfer safeguards, age policy, mailbox verification, and final-binary Sentry checks. Keep these unresolved until evidence exists.
