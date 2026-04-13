# App Store Submission Checklist

## Prerequisites
- [ ] All SPEC-01 through SPEC-07 completed (or consciously deferred)
- [ ] RevenueCat dashboard fully configured with production keys
- [ ] Privacy policy and Terms of Service URLs live and accessible

---

## 1. Technical Requirements

### App Metadata (app.json)
- [ ] `version` updated to release version (e.g., "1.0.0")
- [ ] `ios.buildNumber` set (EAS auto-increments in production profile)
- [ ] `ios.bundleIdentifier` is `com.tranquilfastcoach.app`
- [ ] `ios.infoPlist.ITSAppUsesNonExemptEncryption` is `false` (already set)
- [ ] App icon at `assets/images/icon.png` is 1024x1024, no transparency, no rounded corners

### Permissions Audit
The app currently declares these permissions. Remove any that aren't used:

- [ ] **NSHealthShareUsageDescription** / **NSHealthUpdateUsageDescription** -- KEEP (HealthKit weight sync)
- [ ] **NSLocationWhenInUseUsageDescription** -- REMOVE. Says "location-based fasting reminders" but no location feature exists. Also remove `expo-location` dependency. This WILL cause App Review rejection.
- [ ] **NSCameraUsageDescription** -- REMOVE unless camera feature is planned. No current code uses the camera.
- [ ] **NSPhotoLibraryUsageDescription** -- REMOVE unless photo feature is planned. No current code accesses photos.

### Code Cleanup
- [ ] Remove or gate all `console.log` statements behind `__DEV__` (there are many debug logs in fastStore.ts, appleHealth.ts, WeightChart.tsx)
- [ ] Remove debug logging from WeightChart.tsx `chartData` memo
- [ ] Verify no test/stub API keys in committed code (check `.env` is gitignored)
- [ ] Run `npx tsc --noEmit` -- 0 errors
- [ ] Run `npx expo-doctor` -- no critical warnings

### Performance
- [ ] No memory leaks (RevenueCat WARN log level is set -- verify in `revenuecat.ts`)
- [ ] Sentry `tracesSampleRate` is 0.1 for production (already set in `_layout.tsx:28`)
- [ ] `maxBreadcrumbs` is 50 (already set)

---

## 2. RevenueCat Production Setup

### Dashboard Configuration
- [ ] Create production project in RevenueCat (or switch from sandbox)
- [ ] Production API key generated (format: `appl_XXXXX`)
- [ ] API key stored in EAS Secrets: `eas secret:create --name EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY`

### App Store Connect Products
- [ ] Subscription group "Premium" created
- [ ] At least one product created (e.g., `com.tranquilfastcoach.premium.annual`)
- [ ] Products in "Ready to Submit" state
- [ ] Products attached to `premium` entitlement in RevenueCat

### Offering
- [ ] "default" offering created in RevenueCat
- [ ] Offering marked as "Current"
- [ ] Packages added (monthly and/or annual)

### Testing
- [ ] Sandbox purchase works on physical device
- [ ] Restore purchases works after app reinstall
- [ ] Premium status persists after app restart
- [ ] Paywall loads offerings correctly

---

## 3. Legal Requirements

### Privacy Policy (REQUIRED for HealthKit apps)
- [ ] Privacy policy URL created and hosted
- [ ] Must disclose: HealthKit data collection (weight), how it's used, that it's not sold
- [ ] Must mention: data stored locally on device, optional sync via Apple Health
- [ ] URL added to App Store Connect metadata

### Terms of Service
- [ ] Terms of service URL created and hosted
- [ ] Must include: subscription terms, auto-renewal disclosure, cancellation policy
- [ ] URL added to App Store Connect metadata

### App Store Connect Privacy Questionnaire
- [ ] Health & Fitness data type selected (HealthKit weight data)
- [ ] "Data Not Linked to You" if no user accounts exist (Supabase is stub)
- [ ] "Data Not Used to Track You"

---

## 4. App Review Compliance

### Subscription Requirements (Apple Guidelines 3.1.2)
- [x] Restore Purchases button visible on paywall (`paywall.tsx` has it)
- [x] Auto-renewal disclosure present (`paywall.tsx` lines 313-316)
- [ ] Subscription price displayed before purchase (from RevenueCat offerings)
- [ ] Free trial terms clearly stated (if offering trials)

### HealthKit Requirements (Apple Guidelines 27.1-27.5)
- [ ] HealthKit usage description strings are accurate and specific
- [ ] Only requested health data types that are actually used (weight read/write)
- [ ] Health data is not used for advertising or marketing
- [ ] Health data is not sold to third parties
- [ ] App functions without HealthKit (graceful degradation -- already works)

### General
- [ ] App doesn't crash on launch
- [ ] All features accessible without sign-in (app has no auth)
- [ ] No placeholder content (check Learn tab, user name)
- [ ] No "beta" or "test" labels visible
- [ ] Minimum iOS 15.1 (already set in app.json)

---

## 5. Build and Submit

### Production Build
```bash
# Set production environment variables via EAS Secrets first
eas secret:create --name EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY --value "appl_YOUR_PROD_KEY"
eas secret:create --name EXPO_PUBLIC_SENTRY_DSN --value "your_production_dsn"

# Build for production
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### App Store Connect
- [ ] Screenshots uploaded (6.7" iPhone 15 Pro Max, 6.1" iPhone 15 Pro minimum)
- [ ] App description written
- [ ] Keywords set
- [ ] Category: Health & Fitness
- [ ] Age rating completed
- [ ] App Review notes with sandbox test account credentials

---

## 6. Post-Submission

- [ ] Monitor App Store Connect for review status
- [ ] Respond to any reviewer questions within 24 hours
- [ ] Common rejection reasons for fasting apps:
  - Health claims without disclaimers
  - Missing HealthKit privacy disclosures
  - Subscription terms not clear enough
  - Unused permission declarations (location, camera)
