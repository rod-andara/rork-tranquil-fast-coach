# Monetization decision and future subscription release

Owner decision,18October2026: launch Tranquil Fast free, then introduce optional subscriptions when enough premium features provide clear ongoing value. Do not treat the free launch as a promise that future new features will always be free. No premium scope, launch date, price or billing interval has been selected.

## What remains available

The existing App Store app/bundle can receive a subscription-enabled update. Free download pricing, the18+ rating, the current privacy label, Public distribution, and leaving subscription products unconfigured at launch do not permanently prevent monetization.

RevenueCat integration is retained in `services/revenuecat.ts`; `EXPO_PUBLIC_ENABLE_REVENUECAT === 'true'` controls activation. Paywall code is retained in `dormant/paywall.tsx`, outside Expo Router's active routes. These are preserved foundations, not a tested production billing system. Enabling the flag alone is insufficient to launch subscriptions.

The current published privacy label describes actual Sentry data collection. “Not used for tracking” means no advertising/data-broker tracking under Apple's definition; it does not prohibit subscription purchases. Do not enable tracking simply to sell subscriptions. Assess the enabled payment SDK's actual data types/purposes/linkage, including purchase history and identifiers, before updating labels; do not copy a blanket list or claim payment-card details are collected when only Apple handles them.

## Required before enabling subscriptions

1. Define premium features with ongoing value, retain a clear free tier, and choose products/prices. Avoid misleading existing users about the launch offer. Current copy such as “No subscription is required” describes the present release and must be reviewed before a paid update; do not promise “free forever.”
2. Account Holder reviews/accepts Apple's Paid Applications Agreement; complete required tax and banking setup. This is separate from the Developer Program agreement accepted18October. Do not accept these agreements or enter financial details without the owner's participation/authorization.
3. Create subscription group/products in ASC, localizations, prices and required review metadata. Configure matching RevenueCat products, entitlement/offering and the proper public Apple SDK key. Keep App Store Connect private API credentials out of `EXPO_PUBLIC_*` values and the client binary.
4. Implement/reconnect paywall navigation and feature entitlements. Include clear price/period/renewal/trial terms where applicable, restore purchases, subscription management, and accessible Privacy/Terms links. Gate features using verified entitlements rather than an unverified local Boolean. Review identity/migration and transaction handling for the actual architecture before choosing backend or notification work.
5. Audit activated RevenueCat/current SDK data collection and health-data boundaries. Update the website privacy policy, App Privacy answers, Terms, listing copy and reviewer notes before release. The current free-release disclosures must not be assumed to cover the paid update automatically.
6. Test purchase, cancellation, restoration, renewal, expiration, refunds/revocation, pending purchases and offline access with StoreKit sandbox/TestFlight as applicable. Ensure users' fasting/weight data is preserved and inaccessible billing states do not break the free experience.
7. Submit the new binary and subscription products for Apple review. Apple requires the first subscription to accompany a new app version; verify current submission rules at implementation time. Activate only after the reviewed experience and products are ready.

No subscription activation, payment-product creation, commercial agreement, new SDK network activity, pricing change, or financial setup was performed while recording this decision.

## References checked18October2026

- [Apple: offer auto-renewable subscriptions](https://developer.apple.com/help/app-store-connect/manage-subscriptions/offer-auto-renewable-subscriptions/)
- [Apple: sign and update agreements](https://developer.apple.com/help/app-store-connect/manage-agreements/sign-and-update-agreements/)
- [Apple: App Privacy details and tracking definitions](https://developer.apple.com/app-store/app-privacy-details/)
- [Apple: manage and update App Privacy](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/)

For current free-release gating details, see `specs/SPEC-17-revenuecat-runtime-disablement-v1.md`. Older setup/testing guides contain pre-launch assumptions and illustrative prices; verify against actual SDK/configuration and current vendor documentation before use.
