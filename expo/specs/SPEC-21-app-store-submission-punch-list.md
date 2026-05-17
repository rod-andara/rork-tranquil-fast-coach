# SPEC-21: App Store Submission Punch List — Tranquil Fast v1.0

**Status:** pending (execution checklist)
**Type:** Paperwork / submission — no code changes
**Estimated Effort:** medium-high (2-4 hours wall-clock — most of which is hosting privacy policy, generating screenshots, and waiting on EAS build / Apple review)

> This spec is an execution checklist, not a code refactor. Work through the sections in order. Each section is independently completable; check items off as you go. Do not start a section until all sections above it are green.

---

## 1. Purpose

Convert the now-complete engineering work into a submitted App Store listing. The codebase is App Review-ready (SPEC-10 through SPEC-20). This spec is the bridge between "code is done" and "v1.0 is live in the App Store."

This spec does NOT introduce code changes. If a true blocker is discovered during execution, a new spec must be drafted to handle it; do not patch silently.

---

## 2. Current v1.0 Readiness Status

| Dimension | Status | Evidence |
|---|---|---|
| iOS 26 SDK / Xcode 26 build | ✅ ready | SPEC-10, commit `bc42910` |
| React 19 / RN 0.81 stability | ✅ ready | SPEC-13–14 in commit `bc42910` |
| Chart Y-axis label clipping | ✅ fixed | SPEC-13 in commit `bc42910` |
| Sentry privacy posture | ✅ hardened | SPEC-16 in commit `bc42910` |
| RevenueCat dormancy | ✅ disabled at runtime | SPEC-17 commit `3549c83` |
| Paywall unreachable | ✅ route deregistered + file private | SPEC-17 commit `3549c83` |
| HealthKit usage descriptions accurate | ✅ rewritten | SPEC-18 commit `ee79db1` |
| Learn-tab medical-claim hygiene | ✅ cleaned | SPEC-19 commit `e43da7e` |
| Notifications brand-voice + lifecycle | ✅ rewritten + cancellation wired | SPEC-20 commit `155dd7f` |
| `UIBackgroundModes` accurate | ✅ remote-notification removed | SPEC-20 commit `155dd7f` |
| App Privacy label set | ✅ reducible to 3 entries | Combined SPEC-16/17/20 |
| TypeScript clean | ✅ `npx tsc --noEmit` → 0 errors | Verified at every spec |
| Pre-flight monetization-safe wording scan | ✅ no user-facing risky copy | SPEC-21 §12 |

**Engineering blockers: zero.** All remaining work is paperwork.

---

## 3. Branch / Git Status Checklist

Execute in order:

- [ ] On the local machine, confirm we are on the right branch:
  ```bash
  git -C /Users/rodrigoandara/Projects/rork-tranquil-fast-coach/expo status
  ```
  Expected: clean working tree, on `sdk-upgrade`, up to date with origin.

- [ ] Verify the 5 launch commits are present:
  ```bash
  git -C /Users/rodrigoandara/Projects/rork-tranquil-fast-coach/expo log --oneline -5
  ```
  Expected last 5 commits (most recent first): `SPEC-20`, `SPEC-19`, `SPEC-18`, `SPEC-17`, `SDK 54 upgrade ...`.

- [ ] Decide merge timing. Two options:
  - **Option A (recommended):** Merge `sdk-upgrade` → `main` *before* building. Cleaner git history; the production build artifact corresponds to a `main` commit.
    ```bash
    git -C /Users/rodrigoandara/Projects/rork-tranquil-fast-coach/expo checkout main
    git -C /Users/rodrigoandara/Projects/rork-tranquil-fast-coach/expo pull
    git -C /Users/rodrigoandara/Projects/rork-tranquil-fast-coach/expo merge --no-ff sdk-upgrade -m "Merge sdk-upgrade: v1.0 launch readiness (SPEC-10 through SPEC-20)"
    git -C /Users/rodrigoandara/Projects/rork-tranquil-fast-coach/expo push origin main
    ```
  - **Option B:** Build from `sdk-upgrade`, ship to TestFlight, then merge to `main` only after App Review approves. Lower risk if you want to keep `main` as "last-known-shipped" pointer.

  Recommendation: **Option A.** Less branch juggling once approval lands.

- [ ] After merge, optionally delete the `sdk-upgrade` branch (local + remote):
  ```bash
  git -C /Users/rodrigoandara/Projects/rork-tranquil-fast-coach/expo branch -d sdk-upgrade
  git -C /Users/rodrigoandara/Projects/rork-tranquil-fast-coach/expo push origin --delete sdk-upgrade
  ```

---

## 4. Final Production Build Checklist

Execute after §3 is green.

- [ ] Pre-build environment-variable audit:
  ```bash
  eas env:list --environment production
  ```
  Required state:
  - `EXPO_PUBLIC_SENTRY_DSN` = **present, sensitive visibility** (verified in earlier sessions: `https://bc5afbcbd82da3d8bf775072a30df855@o4510257587093504.ingest.de.sentry.io/4510257591418960`)
  - `SENTRY_AUTH_TOKEN` = **present, secret visibility** (for source-map upload)
  - `EXPO_PUBLIC_ENABLE_REVENUECAT` = **absent** (or, if present, must not be `"true"`)
  - `EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY` = **absent** (RevenueCat is dormant — see SPEC-17)

  If `EXPO_PUBLIC_ENABLE_REVENUECAT` is present in production with any value, **stop and remove it**:
  ```bash
  eas env:delete --variable-name EXPO_PUBLIC_ENABLE_REVENUECAT
  ```

- [ ] Final TypeScript clean:
  ```bash
  cd /Users/rodrigoandara/Projects/rork-tranquil-fast-coach/expo && npx tsc --noEmit
  ```
  Expected: empty stdout, exit 0.

- [ ] Trigger the production build:
  ```bash
  cd /Users/rodrigoandara/Projects/rork-tranquil-fast-coach/expo && eas build --platform ios --profile production
  ```
  The build auto-increments the build number (see `eas.json` `autoIncrement: true` on `production` profile). Note the resulting build number — this is your v1.0 build artifact.

- [ ] When the build completes, confirm the EAS dashboard shows:
  - Status: **finished** (green)
  - Bundle JavaScript phase: no errors
  - Sentry source-map upload: succeeded
  - Artifact: `.ipa` ready to download

- [ ] Submit the build to App Store Connect:
  ```bash
  cd /Users/rodrigoandara/Projects/rork-tranquil-fast-coach/expo && eas submit --platform ios --latest
  ```
  Takes 5-15 minutes for Apple to process. The build will appear in TestFlight first, then become available to attach to a new App Store version.

---

## 5. TestFlight Smoke-Test Checklist

Install the v1.0 build on a **physical iPhone** via TestFlight. Run every check before attaching the build to an App Store version. Do not skip the "fresh install" prerequisite — uninstall any prior build first to flush AsyncStorage state.

Pre-test setup:
- [ ] Delete any prior Tranquil Fast install from the test device
- [ ] Open TestFlight → Install the new v1.0 build

Walk-through checks (in order):

- [ ] **Cold launch** — app opens without crash; splash screen transitions cleanly
- [ ] **Onboarding flow** — all 4 screens render with text visible; Continue / Skip buttons work; "Get Started" reaches the timer tab
- [ ] **Timer tab** — Welcome greeting renders; Start Fast works on every plan (16:8, 18:6, 20:4, 23:1, custom)
- [ ] **Active fast** — Pause / Resume works; End Fast closes the session and lands on Timer tab clean
- [ ] **Notifications enabled path** — start a fast, accept the notification permission prompt (only shows once), confirm haptic feedback fires
- [ ] **Notifications disabled path** — toggle off in Settings or Fast tab; start a fast; confirm no permission prompt and no scheduled notifications
- [ ] **End fast cancels notifications** (SPEC-20 verification) — start a 16:8 fast with notifications enabled; end it after 30 seconds; confirm that 12 hours later no "12 hours of fasting" notification fires
- [ ] **Apple Health skip path** — during onboarding, tap Skip on the Apple Health screen; confirm app continues to plan selection; no HealthKit permission prompt
- [ ] **Apple Health connect path** — from Settings or onboarding, tap Connect; accept the iOS HealthKit prompt (weight only); confirm sync runs without error
- [ ] **Manual weight entry** — Progress tab → Add Weight → enter a value → Save; entry appears in the chart immediately
- [ ] **Progress chart** — switch between 7d / 30d / 90d / All ranges; Y-axis labels show full numbers (e.g., 82 / 86 / 90, not 0 / 23 / 46); no "Something went wrong" alert
- [ ] **Goal flow** — Set Goal → enter target weight → Save; green dashed reference line appears on chart
- [ ] **Learn tab** — open the tab; wellness disclaimer is visible; tap each card type (recipe / article / product); confirm "Opens in Safari" indicator and that the link launches Safari (not an embedded browser)
- [ ] **Settings** — toggle dark mode; toggle notifications; confirm the "Premium features coming soon" card is non-interactive
- [ ] **Paywall unreachable** — try `tranquilfastcoach://paywall` deep link (Safari → tap link). Expected: 404 or app opens but does NOT show paywall (per SPEC-17)
- [ ] **No RevenueCat network errors** — Sentry dashboard filtered to `dist:<v1.0 build number>`: zero events tagged `revenuecat`
- [ ] **No health/weight data in Sentry** — Sentry dashboard inspection of any event: zero `weight`, `currentWeight`, `startWeight`, `goalWeight`, `userName` keys in breadcrumbs / contexts
- [ ] **App restart preserves state** — kill the app; relaunch; current fast (if active), weight history, goal, settings all persist
- [ ] **Background → foreground** — minimize the app for 30 seconds; reopen; active fast timer is correct

If any check fails, **do not attach this build to an App Store version**. Diagnose, fix in a new commit, rebuild, restart this checklist.

---

## 6. Privacy Policy + Terms URL Checklist

Both URLs are **required by App Store Connect** before submission. Cheapest path is GitHub Pages or Notion (free).

- [ ] Decide hosting platform:
  - **Option A (recommended):** GitHub Pages — public repo `rod-andara/tranquilfast-legal`, drop `privacy.md` and `terms.md`, enable Pages. URLs become `https://rod-andara.github.io/tranquilfast-legal/privacy` and `/terms`.
  - **Option B:** Notion — make a public page; URL becomes `https://yourname.notion.site/Privacy-Policy-xxx`.
  - **Option C:** Own domain (e.g., `tranquilfast.app/privacy`) — best for long-term but requires domain registration.

- [ ] Draft the Privacy Policy. Use this content (already aligned with SPEC-16/17/20):

  ```markdown
  # Tranquil Fast — Privacy Policy

  Last updated: [TODAY'S DATE]

  ## Summary
  Tranquil Fast is built privacy-first. Your fasting data and weight
  entries stay on your device. We do not sell your data, we do not
  share it with advertisers, and we do not track you across other apps
  or websites.

  ## Data we store on your device
  - Your name (if you provided one during onboarding)
  - Your weight entries and goal weight
  - Your fasting history and selected plan
  - Your app preferences (units, dark mode, notification toggle)

  ## Data we receive on our servers
  - **Crash diagnostics (Sentry).** When the app crashes or hits an
    unhandled error, an anonymous report is sent to Sentry (EU region)
    to help us fix bugs. The report contains the device model, iOS
    version, app version, and stack trace. It does NOT contain your
    name, weight, goal weight, fasting history, or any Apple Health
    data — these fields are stripped by a scrubber before transmission.

  ## Data we share with Apple
  - **Apple Health (optional).** If you enable Apple Health sync,
    weight values flow between Tranquil Fast and the Apple Health app
    on your device. This data stays on your device under Apple's
    HealthKit framework. Apple's privacy policy applies once the data
    is in Apple Health.

  ## What we do NOT do
  - We do not sell your data.
  - We do not share your data with advertisers.
  - We do not use third-party analytics.
  - We do not track you across other apps or websites.
  - We do not require an account or login.

  ## Your rights
  You can delete all your data by deleting the app from your device.
  Apple Health data is managed separately in the Apple Health app's
  privacy settings.

  ## Contact
  Questions or concerns? Email [INSERT YOUR SUPPORT EMAIL]
  ```

- [ ] Draft Terms of Service. Minimal template for a free app with no
  accounts:

  ```markdown
  # Tranquil Fast — Terms of Use

  Last updated: [TODAY'S DATE]

  ## Acceptance
  By using Tranquil Fast, you agree to these terms.

  ## What Tranquil Fast is
  Tranquil Fast is an intermittent fasting timer and weight tracking
  app. It is provided for general wellness purposes only. It is NOT
  medical advice and should not replace consultation with a qualified
  healthcare professional.

  ## Medical disclaimer
  Always consult a qualified healthcare professional before starting,
  changing, or stopping any fasting routine, diet, or exercise program.
  Tranquil Fast does not diagnose, treat, cure, or prevent any disease
  or medical condition.

  ## Apple Health
  Apple Health integration is optional. If you enable it, weight data
  flows between Tranquil Fast and Apple Health under Apple's HealthKit
  framework. We do not transmit Apple Health data off your device.

  ## No warranty
  Tranquil Fast is provided "as is" without warranty of any kind. We
  do not guarantee any specific health, weight, or fitness outcome.

  ## Changes
  We may update these terms from time to time. Continued use after
  changes means you accept the updated terms.

  ## Contact
  Email [INSERT YOUR SUPPORT EMAIL]
  ```

- [ ] Host both files publicly. Verify the URLs return 200 OK in an incognito browser window.

- [ ] Record the two URLs for App Store Connect (used in §7 fields below):
  - Privacy Policy URL: `[INSERT PRIVACY POLICY URL]`
  - Support URL: `[INSERT SUPPORT URL]` (can point at the same hosting; or use a Notion contact page; or a `mailto:` link is acceptable for App Store Connect's Support URL field)

---

## 7. App Store Connect Field-by-Field Values

Open https://appstoreconnect.apple.com → **My Apps** → **+ → New App** (if not already created) → walk through the wizard with these exact values.

### A. App name
```
Tranquil Fast
```
- Must be unique on the App Store. Check now.
- If "Tranquil Fast" is taken, fallback: `Tranquil Fast Coach` (matches bundle ID).

### B. Subtitle
```
Mindful intermittent fasting
```
- 29 / 30 chars. Within limit.
- Alternative options (all within 30 chars): `Your gentle fasting coach` (25), `Fast, track, feel better` (24), `Calm, private fasting tracker` (29).

### C. Promotional text (170 char max — editable without re-review)
```
Start fasting the gentle way. Track fasts, weight, and progress in one calm, private app. Core tools are free, no ads, syncs with Apple Health.
```
Char count: 154. Safe.

Monetization-safe language used: "Core tools are free" (NOT "free forever"). No claim that subscriptions will never appear.

### D. Description (4000 char max — only editable at version submission)

Paste exactly:

```
THE GENTLEST WAY TO START INTERMITTENT FASTING

Tranquil Fast is built for people who want the benefits of intermittent fasting without the pressure. No shame, no streaks-or-die mentality, no overwhelming dashboards. Just a calm, clear companion in your pocket.

WHAT YOU CAN DO

• Choose a fasting plan that fits your life — 16:8, 18:6, 20:4, OMAD, or a custom schedule
• Track each fast with a beautiful, easy-to-read timer
• Log your weight and watch your trend over weeks and months
• Sync weight with Apple Health, both ways, on your terms
• Set a goal weight and see your progress at a glance
• Get gentle reminders when you reach fasting milestones — never pressure
• Browse a Learn tab of recipes, articles, and tips curated from trusted sources

DESIGNED FOR REAL LIFE

We believe intermittent fasting works best when it feels sustainable. Tranquil Fast won't shame you for missing a day. It treats every choice — to keep going or to break your fast — as your own.

PRIVACY-FIRST BY DESIGN

• Your fasting and weight data stay on your device.
• No required account. No login. No tracking across apps.
• We do not sell your data.
• We do not share your data with advertisers.
• Apple Health sync is fully optional and managed by you.
• We use privacy-safe crash diagnostics to fix bugs — no health, weight, or personal data ever leaves your phone through them.

PRICING

Core features are free to use. No ads. Optional premium features may be introduced in a future update.

A NOTE ON WELLNESS

Tranquil Fast is an educational and tracking tool, not medical advice. Please consult a qualified healthcare professional before starting, changing, or stopping any fasting, diet, or exercise routine.
```

Char count: ~1,840. Well within the 4,000 limit.

**Monetization-safe wording confirmed:** "Core features are free to use" + "Optional premium features may be introduced in a future update." Preserves v1.1 paywall path.

**Forbidden terms confirmed absent:** no "fat-burning", "autophagy", "metabolic health", "treat", "cure", "diagnose", "therapeutic", "guaranteed", "free forever", "no subscriptions ever".

### E. Keywords (100 char max, comma-separated, NO spaces after commas)

```
fasting,intermittent,fast,16:8,timer,weight,tracker,health,wellness,IF,OMAD,fastic,zero,calm
```
Char count: 96. Within limit.

- Includes competitor names (`fastic`, `zero`) — standard practice; legal because they are app names, not trademarks-as-product-claims. Removes if Apple flags but unlikely.
- No "diet" word — too generic and could attract weight-loss-product association.
- No "lose", "burn", "fat" — avoids medical/outcome claim discoverability framing.

### F. Category

- **Primary:** Health & Fitness
- **Secondary:** Lifestyle

### G. Age rating

Expected outcome: **4+**.

Answer Apple's questionnaire conservatively. For every question on the App Store Connect age rating wizard, the honest answers for Tranquil Fast are:

| Question | Answer |
|---|---|
| Cartoon or Fantasy Violence | None |
| Realistic Violence | None |
| Sexual Content or Nudity | None |
| Profanity or Crude Humor | None |
| Alcohol, Tobacco, or Drug Use or References | None |
| Mature/Suggestive Themes | None |
| Horror/Fear Themes | None |
| Medical/Treatment Information | **None** (the app is wellness-only, all medical claims are stripped; if asked about "infrequent/mild", say None) |
| Gambling and Contests | None |
| Unrestricted Web Access | **None** (Learn-tab links open in Safari — Safari hand-off does not count as in-app unrestricted web access per Apple's interpretation; if asked, the answer is None) |
| User-Generated Content | None |
| Sharing of User Location | None |

Result: **4+**.

### H. Support URL
```
[INSERT SUPPORT URL]
```
Acceptable forms: a Notion contact page, a GitHub repo README with email, or a domain. Must return 200 OK.

### I. Privacy Policy URL
```
[INSERT PRIVACY POLICY URL]
```
From §6.

### J. Marketing URL
```
[OPTIONAL — leave blank for v1.0]
```
Add only if you have a public landing page. Skipping is fine.

### K. App Privacy labels — see dedicated section §8 below

### L. App Review Information note — see dedicated section §9 below

---

## 8. App Privacy Label Click-by-Click Instructions

In App Store Connect: **My Apps → Tranquil Fast → App Privacy** → click **Get Started** (or **Edit** if you've started before).

### Step 1 — "Data Used to Track You"
- Click **No, we do not collect data from this app that is used to track the user**

### Step 2 — "Data Collected"
- Click **Yes** (because we do receive crash diagnostics and process Apple Health weight data locally)

### Step 3 — declare each data type. Apple groups by category. Click into each and answer:

**Health & Fitness → Health**
- Is this data linked to the user's identity? → **No**
- Is this data used for tracking purposes? → **No**
- What is the purpose of collecting this data? → check **App Functionality**
- (No other purposes checked)

**Diagnostics → Crash Data**
- Is this data linked to the user's identity? → **No**
- Is this data used for tracking purposes? → **No**
- What is the purpose? → check **App Functionality**

**Diagnostics → Other Diagnostic Data**
- Is this data linked to the user's identity? → **No**
- Is this data used for tracking purposes? → **No**
- What is the purpose? → check **App Functionality**

### Step 4 — Save and publish

Click **Save** and then **Publish** when prompted.

### Explicitly DO NOT declare any of the following for v1.0:

| Category | Why we do NOT declare |
|---|---|
| Contact Info → Name / Email / Phone / Address | userName stays on-device; never transmitted |
| Identifiers → User ID / Device ID | No RevenueCat init in v1.0 (SPEC-17); no analytics; Sentry's installation UUID is anonymous and not cross-app |
| Purchases → Purchase History | No active purchases in v1.0 (SPEC-17) |
| Usage Data → Product Interaction | Sentry user interaction tracing disabled (SPEC-16); no analytics |
| Usage Data → Advertising Data | No ads, no ad SDKs |
| Location | App does not request location |
| Browsing History | App does not collect |
| Search History | Search bar in Learn tab is local-only, not transmitted |
| Financial Info | None |
| Sensitive Info | None |
| Contacts | None |
| Photos or Videos | None |
| Audio Data | None |
| Customer Support | None routed through identifying tools |
| Other Data Types | None |

If App Store Connect asks "Did you forget anything?" — answer **No**. The audit work in SPEC-16/17/18/19/20 confirms this is accurate.

---

## 9. App Review Information Note

In App Store Connect: **App Information → App Review Information → Notes**. Paste exactly:

```
Hello Apple Reviewer,

Tranquil Fast is a free intermittent fasting timer and weight tracker. No login or account is required; the app works fully on first launch.

Quick testing notes:
• Walk through the 4-screen onboarding flow.
• From the Timer tab, tap Start Fast on any plan to begin a fast.
• Visit the Progress tab to see weight tracking. Tap "Add Weight" to log an entry.
• Visit the Learn tab to see curated content. All cards open in Safari (no embedded WebView).
• Visit the Settings tab to toggle dark mode and notifications.

Implementation notes for review:
• In-app purchases: NONE in v1.0. The RevenueCat SDK is bundled but disabled at runtime via a build-time feature flag (EXPO_PUBLIC_ENABLE_REVENUECAT). It does not initialize, contact RevenueCat servers, or generate identifiers. The paywall route is deregistered and the file is renamed to a non-route private module.
• HealthKit: requests Weight permission only (read and write). Permission is requested via a user-initiated "Connect Apple Health" button with a visible Skip option. Users can use every feature without granting HealthKit access. No HealthKit data is transmitted off-device.
• Notifications: local-only scheduled milestone reminders at 12, 16, 18, and 20 hours of fasting. No remote push, no APNs token, no Expo push token, no backend. Permission is requested only when the user starts their first fast with notifications enabled.
• Crash diagnostics (Sentry): hosted in Sentry's EU region. Payloads contain device model, iOS version, app version, and sanitized stack traces. A defense-in-depth redactor strips weight, goal, fasting, name, and Apple Health values before transmission. Sentry's performance tracing, user interaction tracing, and auto session tracking are disabled.
• Learn tab links: 12 external links to recipes (Allrecipes, Love and Lemons), articles (Healthline, Mayo Clinic), and product pages (Amazon, iHerb, Hydro Flask). All open in Safari via Linking.openURL — no in-app browser. We have no affiliate or commercial relationships with any of these merchants.
• No ads, no third-party tracking SDKs, no data selling.

Thank you for reviewing.
```

### Contact info fields

- **First name:** Rodrigo
- **Last name:** Andara
- **Phone:** [INSERT YOUR PHONE]
- **Email:** rodrigo.andara@gmail.com (or a dedicated support address)

### Demo account
- **Sign-in required?** No → skip the demo credentials section entirely.

---

## 10. Screenshot Checklist

Apple requires screenshots at minimum **2 device sizes**:
- 6.9" Display (iPhone 16 Pro Max) — 1320 × 2868 px
- 6.5" Display (iPhone 14 Plus / 11 Pro Max) — 1242 × 2688 px

Upload 5-10 per size. First 3 are shown in search results — they do 80% of the conversion work.

### Capture command (per simulator)
```bash
xcrun simctl boot "iPhone 16 Pro Max"
open -a Simulator
# (Navigate the app to the target screen)
xcrun simctl io booted screenshot ~/Desktop/tf-shot1-iphone16promax.png
```
Repeat for `iPhone 11 Pro Max` for the 6.5" size.

### The 6 recommended screenshots

| # | Screen to capture | Overlay headline | Supporting text | Risk notes |
|---|---|---|---|---|
| 1 | Timer tab, mid-fast (about 4 hours elapsed, ring partially filled) | **Start your first fast in 30 seconds.** | A calm timer that respects your pace. | None |
| 2 | Plan selection (onboarding screen showing 16:8 / 18:6 / 20:4 / OMAD / Custom cards) | **From beginner to OMAD.** | Pick a rhythm that fits your life. | Use "rhythm", not "fat-burning protocol" |
| 3 | Progress tab with weight chart showing ~4 entries + goal reference line | **Track your progress, gently.** | A clear chart — no guilt, no streaks-or-die. | None |
| 4 | Apple Health card on Progress tab (connected state, optionally with "Connect" CTA) | **Syncs with Apple Health, both ways.** | Your weight stays on your device. | Mention "stays on device" to reinforce privacy positioning |
| 5 | Learn tab showing the disclaimer + a few cards (mix of recipe + article) | **Curated wellness reading.** | Recipes, science-backed articles, and tools — links open in Safari. | None |
| 6 | Settings tab with the "Premium coming soon" card and dark mode toggle | **No ads. No tracking. No data selling.** | Your data stays on your device. Core features are free. | Use "Core features are free" — preserves v1.1 paywall framing |

### Overlay design

- Add headline text overlays in Figma, Canva, or AppMockUp.com (free tier sufficient).
- Keep overlay headline ~5-8 words, large, top of the screen.
- Supporting text optional; ~10 words max.
- Match the app's color palette (purple/violet primary `#7C3AED`, neutral grays for backgrounds).
- Do not crop status bar — Apple wants the real device frame.

### Forbidden in screenshot text

Same monetization-safe + medical-claim-free rules as App Store description:
- ❌ "Free forever", "no subscriptions ever", "always free"
- ❌ "Burn fat", "fat-burning", "autophagy", "metabolic"
- ❌ "Lose X pounds", "guaranteed results", any specific weight-loss claim
- ❌ "Treat", "cure", "diagnose", "therapeutic"
- ✅ "Core features are free", "No ads, no tracking", "Privacy-first"

---

## 11. App Metadata Copy

Already covered in §7 (Description, Subtitle, Promotional Text, Keywords). Restating consolidated for one-place reference:

- **Name:** `Tranquil Fast`
- **Subtitle:** `Mindful intermittent fasting`
- **Promotional text:** see §7C
- **Description:** see §7D
- **Keywords:** see §7E
- **Primary category:** Health & Fitness
- **Secondary category:** Lifestyle
- **Age rating:** 4+

---

## 12. Monetization-Safe Final Wording Scan

Run this command before submitting:

```bash
cd /Users/rodrigoandara/Projects/rork-tranquil-fast-coach/expo && grep -rn -iE "free forever|no subscriptions ever|never pay|all features free|fat-burning|fat burning|autophagy|maximum benefits|therapeutic|diagnose|treat|cure|insulin|diabetes|metabolic|guaranteed" app/ components/ utils/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "specs/\|SPEC-\|// SPEC\|// .*forbidden\|// .*No fat\|// .*No health\|// .*no metabolic"
```

**Expected result (verified at SPEC-21 drafting time):** empty. The only matches in the codebase are inside SPEC-20's own forbidden-terms comment block.

### Additional checks against the metadata text you will paste into App Store Connect

Before pasting into ASC, do a final mental scan of §7C (promotional text), §7D (description), and §10 (screenshot overlays) for any of these strings. If you spot one, soften it:

- "Free forever" → "Core features are free"
- "No subscriptions ever" → "Optional premium features may be introduced later"
- "Burns fat" / "Fat-burning" → "Supports your fasting routine"
- "Lose weight fast" → "Track your weight trend over time"
- "Treats / cures / diagnoses" → "Educational tool" or "Wellness companion"

Any flag = stop and revise before pasting.

---

## 13. Final Submission Steps

After everything in §3 through §12 is green:

- [ ] In App Store Connect → **App Information → Version 1.0** → in the **Build** section, click **+** → select the TestFlight-processed build from §4
- [ ] Fill in **What's New in This Version** (only required if not the first version — for 1.0 you can write: "First release. Welcome to Tranquil Fast — the gentlest way to start intermittent fasting.")
- [ ] Confirm all metadata fields in §7 are filled
- [ ] Confirm screenshots in §10 are uploaded for both device sizes
- [ ] Confirm App Privacy labels per §8 are complete and published
- [ ] Confirm App Review Information per §9 is filled
- [ ] Confirm Privacy Policy URL and Support URL per §6/§7 return 200 OK
- [ ] Click **Add for Review**
- [ ] On the next screen, answer:
  - **Export Compliance:** "No" — does not use encryption beyond Apple's standard (already declared via `ITSAppUsesNonExemptEncryption: false` in `app.json`)
  - **Content Rights:** "No" — does not contain third-party content (the Learn-tab links are not embedded content; they open in Safari)
  - **Advertising Identifier (IDFA):** "No" — app does not use IDFA
- [ ] Click **Submit to App Review**

You'll receive an email confirming submission within a minute. Status in ASC will move to **Waiting For Review** → **In Review** → **Pending Developer Release** (or directly **Ready for Sale** if you chose automatic release).

Typical review time: 24-48 hours, sometimes same-day.

---

## 14. Post-Submission Monitoring Checklist

While waiting for the review verdict:

- [ ] Bookmark the ASC status page; check every 12 hours
- [ ] Open Sentry dashboard, filter to the v1.0 `dist` number — confirm zero events (or, if events appear, no `weight`/`currentWeight`/`startWeight`/`goalWeight`/`userName` keys)
- [ ] Sit on email: Apple will email if the review status changes or if a reviewer leaves a note

### If you get **"Metadata Rejected"** — most common reasons for fasting/wellness apps in 2025-2026, and template responses

**1. HealthKit scope question** — "Why does your app need HealthKit access?"
> Tranquil Fast requests Apple HealthKit Weight permission only (read and write). The permission is requested via a user-initiated Connect Apple Health button on the Settings tab and during onboarding. Users can use every feature of the app, including manual weight entry, without granting HealthKit access. No HealthKit data is transmitted off-device. See the NSHealthShareUsageDescription and NSHealthUpdateUsageDescription in Info.plist for user-facing language.

**2. RevenueCat bundled-but-disabled question** — "We see react-native-purchases in your binary but no in-app purchases declared."
> Tranquil Fast v1.0 ships as a free app with no in-app purchases. The RevenueCat SDK is bundled in the binary for v1.1 reactivation but is disabled at runtime via the EXPO_PUBLIC_ENABLE_REVENUECAT feature flag (not set in production EAS env). The SDK does not initialize, does not call Purchases.configure, does not generate any identifiers, and does not contact RevenueCat servers. The paywall screen file is renamed to a non-route private module and the Stack.Screen registration is removed, so the route is unreachable. No purchase flow exists in v1.0.

**3. Privacy label question** — "Your privacy label declares X but we observed Y."
> Tranquil Fast's privacy labels declare exactly three entries under "Data Not Linked to You": Health & Fitness → Health (App Functionality, for HealthKit weight values read into app memory), Diagnostics → Crash Data (App Functionality, for Sentry crash reports), and Diagnostics → Other Diagnostic Data (App Functionality, for sanitized error metadata). A defense-in-depth redactor in app/_layout.tsx strips sensitive keys (weight, goalWeight, currentWeight, startWeight, userName, fasting history) from any outgoing Sentry payload. We do not collect or transmit any other data. Please let us know which observed transmission concerns you and we will investigate.

**4. External links question** — "Why does your app link to external commercial sites?"
> The Learn tab includes 12 curated links to recipes, educational articles, and product pages. All links open in Safari via standard Linking.openURL hand-off — no embedded WebView. We have no affiliate or commercial relationships with any of these merchants; the links are editorial picks. A wellness disclaimer at the top of the Learn tab reminds users that the content is educational, not medical advice. Each card shows an "Opens in Safari" indicator before tap.

**5. Notification capability question** — "Why does your app request notification permission?"
> Tranquil Fast sends local scheduled notifications only — milestone reminders when the user reaches 12, 16, 18, or 20 hours of an active fast. The app does not use remote push, does not register for APNs, does not collect Expo push tokens, and does not run a notification backend. Permission is requested via Notifications.requestPermissionsAsync only when the user starts their first fast with notifications enabled. Users can disable notifications at any time from Settings or the active-fast screen, and disabling cancels all already-scheduled notifications.

### If you get **"Binary Rejected"** — actual code issue

- Read the rejection notice carefully (often references a specific guideline number)
- Reproduce the issue on a TestFlight build
- Fix it in a new commit, rebuild, resubmit
- Do NOT silently re-submit the same binary — Apple's automated systems will flag the duplicate

---

## 15. v1.1 Monetization Preparation Notes (non-implementation)

After v1.0 submission is accepted, prepare **SPEC-22: Premium Monetization + RevenueCat Reactivation**. Do not start that work until v1.0 is approved and live.

SPEC-22 will need to cover:

- **What stays free:** core fasting timer, manual weight entry, manual progress chart, Apple Health basic sync, Learn-tab content browsing
- **What becomes premium:** candidates worth considering — extended analytics (weekly/monthly summaries, weight loss rate predictions), additional fasting plans (warrior 22:2, ADF, 5:2), goal-progress projections, advanced reminders (pre-eating-window warnings, hydration nudges), iCloud sync across devices, premium Learn-tab content
- **Subscription products to configure in App Store Connect:**
  - Monthly subscription (e.g., $4.99/month)
  - Annual subscription with intro discount (e.g., $29.99/year = $2.50/month)
  - Lifetime one-time purchase (e.g., $49.99) — strongly recommended for indie wellness apps; converts price-sensitive users
- **Paywall copy:** must include subscription length, auto-renew language, link to ToS, link to Privacy Policy. Apple requires these inline on the paywall.
- **Restore Purchases button:** mandatory on the paywall (App Store Guideline 3.1.1)
- **App Store subscription disclosure:** add to App Store description copy. Example: "Optional premium features available via auto-renewable subscription. Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current period. Manage subscriptions in your App Store account settings."
- **Privacy label updates:** add Identifiers → Device ID, Purchases → Purchase History, possibly Usage Data → Product Interaction. Total privacy label entries grow from 3 to 6.
- **Apple Search Ads readiness:** consider $20-50/day campaign on competitor keywords (`fastic`, `zero`, `intermittent fasting timer`) — strongest ROI channel for indie wellness apps in 2026

SPEC-22 reactivation steps (matches SPEC-17 §10):
1. `git mv app/_paywall.tsx app/paywall.tsx`
2. Restore `<Stack.Screen name="paywall" .../>` in `_layout.tsx`
3. Remove `'/paywall' as any` cast in `PremiumGate.tsx`
4. Set EAS `EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY` (sensitive visibility) with the real key
5. Set EAS `EXPO_PUBLIC_ENABLE_REVENUECAT=true` (plaintext)
6. Wrap chosen premium features in `<PremiumGate>`
7. Wire up the Upgrade entry point in the UI

---

## Final Go / No-Go Checklist

Before clicking **Submit to App Review**, every box below must be ticked:

- [ ] All 5 launch commits (SPEC-16 through SPEC-20) merged to `main` (or live on the build branch)
- [ ] `npx tsc --noEmit` returns 0 errors
- [ ] EAS env: `EXPO_PUBLIC_SENTRY_DSN` present + sensitive visibility; `EXPO_PUBLIC_ENABLE_REVENUECAT` absent
- [ ] EAS production build succeeded (note build number: `__________`)
- [ ] Build installed on physical iPhone via TestFlight; all 19 smoke-test checks in §5 passed
- [ ] Privacy Policy URL hosted and returning 200 OK
- [ ] Support URL hosted and returning 200 OK
- [ ] App Store Connect app listing created with all §7 field values
- [ ] App Privacy labels published per §8 (3 Not-Linked entries; nothing else declared)
- [ ] App Review Information note pasted per §9
- [ ] 6 screenshots × 2 device sizes uploaded per §10
- [ ] Monetization-safe wording scan §12 ran clean
- [ ] Final read-through of description text in §7D — no risky terms slipped in

If every box is ticked, click **Add for Review** → **Submit to App Review**.

If any box is unticked, **stop and fix before submitting.**

---

## Blockers (current state)

**None.** The codebase is App Store submission-ready as of commit `155dd7f` on `sdk-upgrade`. SPEC-21 is pure paperwork; no code changes required.

The only items that could become blockers are external to the codebase:
- Privacy Policy URL not yet hosted (you need to do this — see §6)
- Screenshots not yet generated (you need to do this — see §10)
- App Store Connect app listing not yet created (you need to do this — see §7)
- App Store name "Tranquil Fast" might already be taken (check first; fallback in §7A)

Each of these is a 15-30 minute human task. None require engineering.

## Progress Notes

(To be filled in as you work through the punch list)
