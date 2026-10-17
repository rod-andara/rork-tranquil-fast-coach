# Tranquil Fast external link verification

Date: 17 October 2026, approximately 22:49–23:01 Europe/Zurich. Device: user's real iPhone via iPhone Mirroring, installed TestFlight build 106 per the user's task and the earlier TestFlight identity check. Device model and iOS version were not independently established in this run.

## Method and interpretation

Every named Learn card was located and tapped in the app. All, Recipes, Articles and Products filters and the search field were used. All 11 cards produced no browser transition and no alert. Each destination was then typed into Safari on the same iPhone, in a separate test tab; none of those primary destination checks used a desktop browser. Privacy, Terms and Support were tested with both the requested extensionless URLs and the app-source .html equivalents. The Support action was retested after manual Safari use and still failed.

Status below classifies the destination/content or native action, not successful app URL handoff. No Learn-card handoff and none of the three Settings web-link handoffs passed in the mirrored session. Working manual URLs rule out a dead destination in those cases, but do not prove whether the app, its installed build configuration or iPhone Mirroring causes the handoff failures. A physical tap outside Mirroring or device logs is needed to establish that cause. No assertion that Mirroring definitely blocks URLs is made.

No sign-in, purchase, message, review or personal-data submission was performed. Optional cookies were rejected or necessary-only selected where possible. Existing user Safari tabs were not overwritten; a new test tab was used. Health, fasting records and app settings were not changed during this link audit.

## Results

| # | Location | Card/Button title | Opens in app? | Opens in Safari manually? | Final page title | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Learn / Recipes | Mediterranean Quinoa Breakfast Bowl | No; no alert or transition | Yes | High-Protein Quinoa Breakfast Bowl | OK | Readable recipe. Destination is not titled Mediterranean; card's 25g protein claim was not verified. |
| 2 | Learn / Recipes | Salmon Avocado Power Bowl | No; no alert or transition | Yes | Salmon Avocado Bowl | OK | Readable mobile recipe. Small cookie banner does not block the title/content. |
| 3 | Learn / Recipes | Complete Nutrition Buddha Bowl | No; no alert or transition | Yes | Best Buddha Bowl | OK | Readable mobile recipe with Jump to Recipe. No blocking wall observed. Does not independently validate the card's complete-nutrition claim. |
| 4 | Learn / Articles | The Complete Guide to Intermittent Fasting | No; no alert or transition | Site loads, content blocked | Not visible behind Healthline consent panel | Blocked | Full-screen We Care About Your Privacy panel; Reject Non-essential did not dismiss it in the test. Linked URL is a benefits article, not necessarily a complete methods guide. |
| 5 | Learn / Articles | Essential Electrolytes During Fasting | No; no alert or transition | Site loads, content blocked | Not fully visible behind Healthline consent panel | Blocked | Same persistent consent panel. Some electrolyte text visible underneath; final article title/content not verified on phone. |
| 6 | Learn / Articles | What to Eat When Breaking Your Fast | No; no alert or transition | Yes | Nutrition basics, under Nutrition and healthy eating | Wrong content | General nutrition page, rather than specific guidance on breaking a fast. Reject additional cookies dismissed the initial panel. Readable mobile content. |
| 7 | Learn / Articles | Intermittent Fasting for Beginners | No; no alert or transition | Yes, but error page | Page Not Found | Broken | Exact visible text: The page you are trying to reach is not available on our site. |
| 8 | Learn / Products | Enzymedica Fasting Today Drink Mix | No; no alert or transition | Yes | Fasting Today®, Intermittent Fasting Drink Mix, Tropical Pineapple, 8.75 oz (248 g) | OK | Redirected to Swiss iHerb, ch.iherb.com. Decline All dismissed consent. Product readable; current page shows different size, rating and localized price from static app/URL text. |
| 9 | Learn / Articles | Best Glass Food Storage Containers | No; no alert or transition | Yes | The 11 Best Food Storage Containers We Tested for Leftovers, Meal Prep, and a More Organized Pantry | Wrong content | Broader guide explicitly covers glass AND plastic. Useful content but not a glass-only guide. Readable with an advertising strip. |
| 10 | Learn / Products | The Complete Guide to Fasting by Dr. Jason Fung | No; no alert or transition | Yes | The Complete Guide to Fasting: Heal Your Body Through Intermittent, Alternate-Day, and Extended Fasting | OK | Correct book on Amazon; readable without sign-in. Shipping-to-Switzerland notice is nonblocking. Page rating differs from app's static 5/5. |
| 11 | Learn / Products | Hydro Flask Water Bottle with Time Markers | No; no alert or transition | Yes | 32 oz Wide Mouth Bottle | Wrong content | Standard insulated bottle; no time markers shown in product images/details. Necessary-only consent, region prompt and marketing popup were dismissible. Price shown $44.95 vs app $24.95. |
| 12 | Settings | Privacy Policy | No; alert E1 | Yes, both URL forms | Privacy Policy | OK | Readable phone layout; .html equivalent also works. App handoff failed. |
| 13 | Settings | Terms of Use | No; alert E1 | Yes, both URL forms | Terms of Use | OK | Readable phone layout; .html equivalent also works. App handoff failed. |
| 14 | Settings | Support | No; alert E1 | Yes, both URL forms | Support | OK | Readable with support@tranquilfast.app. Retapping app Support after opening Safari still produced E1. |
| 15 | Settings | Help & Support | No; alert E2 | Safari mailto handoff launches Mail, then stops | Welcome to Mail / Add Account | Blocked | Apple Mail is not configured; no account setup attempted. App fallback address is support@tranquilfastcoach.com, unlike website support@tranquilfast.app. Mail delivery not verified. |
| 16 | Settings | Share with Friends | Yes; native share sheet | Not applicable | Native iOS share sheet | OK | AirDrop, Messages, Mail and other choices appeared. Dismissed without selecting a recipient or sending anything. Current local source has promotional text without an App Store URL; exact full shared payload was not extracted from the binary. |
| 17 | Settings | Rate App | No store/review sheet; alert E3 | Not applicable | Rate App alert | Blocked | Fallback is consistent with TestFlight restrictions; not evidence production review requests will fail. No rating submitted. |

### Exact alert text

- **E1 — Link Unavailable:** “We couldn't open that page right now. Please try again in a moment.”
- **E2 — Error Opening Email:** “Please contact us at support@tranquilfastcoach.com”
- **E3 — Rate App:** “Thank you for your support! Please rate us on the App Store.”

## Broken or mismatched items

1. The installed app's URL handoff failed systematically in Mirroring. Investigate separately from destination health. Do not declare a successful app flow merely because Safari loads the URL manually.
2. The Mayo beginner-fasting URL returns a human-readable Page Not Found page.
3. The breaking-fast card opens general Nutrition basics. Rename the card or choose a directly relevant source.
4. Hydro Flask's time-marker/hourly-reminder description does not match the standard bottle page. Rename the card and remove that claim, or find and verify a genuine time-marker product.
5. The People guide covers mixed container materials; remove Glass from the card title unless changing to a glass-specific source.
6. Healthline's consent panel blocked both article checks in this session. These are blocked, not established dead links.
7. Help's email domain differs from the website's. Confirm the monitored mailbox and align the app fallback, mailto and website.
8. Static product prices/ratings are stale. Prefer omitting them, or specify currency, source and verification date with a maintenance process.

## Checked replacements

### Replace dead beginner-fasting URL

Mayo Clinic — **Intermittent fasting: What are the benefits?**

https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/expert-answers/intermittent-fasting/faq-20441303

Verified by opening this exact clean URL in Safari on the same iPhone. Correct title and article content visible, readable without sign-in. An advertising block appeared below the opening text; this was not a paywall. Retitle the card to accurately describe this overview rather than promising a complete beginner protocol.

### Optional alternative to consent-blocked electrolyte article

NIH National Library of Medicine, MedlinePlus — **Fluid and Electrolyte Balance**

https://medlineplus.gov/fluidandelectrolytebalance.html

Verified by opening this exact URL in Safari on the same iPhone. Correct title, explanatory text and readable mobile layout; no consent or login wall appeared. Retitle the card Electrolytes and fluid balance; this is general education, not a claim that fasting requires supplements.

For the Nutrition basics, People and Hydro Flask mismatches, renaming the existing card is a safer immediate correction than substituting an untested destination. No additional replacement is presented as checked without a browser visit.

## Other flows and coverage

- Recipes, Articles and Products filters worked; search found Beginners, Containers, Fung and Hydro. All was also used, including direct taps on the Salmon and Buddha cards there.
- All 11 named Learn cards were found and tapped; no additional card was identified. A final full scroll-to-end pass was interrupted by a Mac lock. After unlocking, scrolling the Learn FlatList remained unreliable through Mirroring, although Settings scrolling worked. Absence of additional cards is therefore not independently certified by a complete end-to-end list scan. Local content source contains 11 entries, but it is not treated as an independent attestation of the installed binary.
- Found additional Settings actions Rate App and Share with Friends; tested as above.
- Fasting Plan, notification/theme/unit settings and Erase All Data are not external-link actions and were not activated for this audit.
- Manual Safari mailto test opened unconfigured Apple Mail. No account added or message sent.

## Development follow-up

The local Learn handler awaits Haptics.impactAsync before trying Linking.openURL. A haptics rejection or unresolved promise could prevent navigation and bypass the later link-error alert. This is a code-supported candidate explanation for Learn's silent behavior, not a demonstrated root cause in build 106. Make optional haptics nonblocking/failure-tolerant and handle the entire navigation attempt explicitly. Settings' direct URL failure should be investigated separately with an ordinary physical tap outside Mirroring or value-free native error diagnostics.

An existing uncommitted modification to app/(tabs)/learn.tsx was observed during the audit; it was not created, modified, reverted or staged by this testing task. No code changes, commits, builds or deployments were performed.

Final state: app left on Learn, All filter selected, search empty. The temporary Safari test tab remains available with the MedlinePlus alternative. No existing Safari tab was replaced. Optional consent choices were changed on the tested third-party sites; no sign-in, message, purchase or app-record edit occurred.
