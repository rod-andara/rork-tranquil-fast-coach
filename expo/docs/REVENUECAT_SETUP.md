# RevenueCat Setup Guide - TranquilFast Coach

This guide walks you through setting up RevenueCat for in-app subscriptions in TranquilFast Coach.

## ✅ Already Completed

- ✅ RevenueCat package installed (`react-native-purchases`)
- ✅ Service file created (`services/revenuecat.ts`)
- ✅ Paywall UI implemented (`app/paywall.tsx`)
- ✅ App initialization updated (`app/_layout.tsx`)
- ✅ Plugin configured in `app.json`

## 🔧 Required Setup Steps

### Step 1: Create RevenueCat Account

1. Go to [https://app.revenuecat.com/signup](https://app.revenuecat.com/signup)
2. Create a free account (free for up to $10k MRR)
3. Create a new project: "TranquilFast Coach"

### Step 2: Configure iOS App in RevenueCat

1. In RevenueCat dashboard, go to **Projects → TranquilFast Coach**
2. Click **Apps** → **+ New**
3. Select **iOS**
4. Fill in details:
   - **App name:** Tranquil Fast Coach
   - **Bundle ID:** `com.tranquilfastcoach.app` (must match `app.json`)
   - **App Store Connect API Key:** (will configure in Step 4)

5. **Copy your API Key** - it looks like `appl_XXXXXXXXXXXXX`

### Step 3: Create Environment Variable

Create a `.env` file in the project root (already in `.gitignore`):

```bash
# Copy from .env.example
cp .env.example .env
```

Edit `.env` and add your RevenueCat API key:

```bash
EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY=appl_YOUR_ACTUAL_API_KEY_HERE
```

**Important:** Never commit `.env` to git!

### Step 4: Update app.json with Real API Key

Edit `app.json` line 101:

```json
{
  "react-native-purchases": {
    "iosAppStoreConnectApiKey": "appl_YOUR_ACTUAL_API_KEY_HERE"
  }
}
```

Or use environment variable (recommended):

```json
{
  "react-native-purchases": {
    "iosAppStoreConnectApiKey": "${EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY}"
  }
}
```

### Step 5: Create Subscription Products in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Navigate to **My Apps** → **TranquilFast Coach** → **Subscriptions**
3. Click **+ Add Subscription Group**
   - **Reference Name:** Premium Membership
   - **Group Name:** Premium

4. Click **+ Create Subscription**
   - **Product ID:** `com.tranquilfastcoach.premium.monthly`
   - **Reference Name:** Monthly Premium
   - **Subscription Duration:** 1 Month
   - **Price:** $9.99 (or your preferred price)

5. Create additional subscription tiers (optional):
   - **Product ID:** `com.tranquilfastcoach.premium.annual`
   - **Reference Name:** Annual Premium
   - **Subscription Duration:** 1 Year
   - **Price:** $79.99 (save ~33%)

### Step 6: Configure Products in RevenueCat

1. In RevenueCat dashboard, go to **Products**
2. Click **+ New**
3. Add products:
   - **Product ID:** `com.tranquilfastcoach.premium.monthly`
   - **Type:** Subscription
   - **Store:** App Store

4. Repeat for annual plan (if created)

### Step 7: Create Offering in RevenueCat

1. Go to **Offerings** → **+ New Offering**
2. **Offering ID:** `default` (this is what the app looks for)
3. **Description:** Default premium offering
4. **Add Packages:**
   - **Package ID:** `$rc_monthly`
   - **Product:** `com.tranquilfastcoach.premium.monthly`
   - **Position:** 1

5. (Optional) Add annual package:
   - **Package ID:** `$rc_annual`
   - **Product:** `com.tranquilfastcoach.premium.annual`
   - **Position:** 2

6. **Set as Current Offering** ✅

### Step 8: Create Entitlement

1. Go to **Entitlements** → **+ New Entitlement**
2. **Entitlement ID:** `premium` (must match code in `services/revenuecat.ts`)
3. **Description:** Premium features access
4. **Attach Products:**
   - Select `com.tranquilfastcoach.premium.monthly`
   - Select `com.tranquilfastcoach.premium.annual` (if created)

### Step 9: Connect App Store Connect

1. In RevenueCat, go to **Apps** → **TranquilFast Coach (iOS)**
2. Click **App Store Connect Integration**
3. Follow instructions to:
   - Create an API key in App Store Connect
   - Upload the `.p8` file to RevenueCat
   - Enter Issuer ID and Key ID

This enables RevenueCat to validate receipts and sync subscription status.

### Step 10: Test in Sandbox Mode

1. Create a Sandbox Apple ID in App Store Connect
   - Go to **Users and Access** → **Sandbox Testers**
   - Click **+** to add a new tester
   - Use a unique email (can be fake)

2. Build and install on a device/simulator:
   ```bash
   npx expo prebuild --clean
   eas build --profile development --platform ios
   ```

3. Sign out of your real Apple ID on the device
   - Settings → App Store → Sign Out

4. Run the app and test purchase:
   - Tap **Upgrade to Premium** in Settings
   - Select a plan and tap Subscribe
   - Sign in with your Sandbox Apple ID
   - Complete the purchase (you won't be charged)

5. Verify in RevenueCat dashboard:
   - Go to **Customers** → find your test user
   - Should show active subscription

### Step 11: Test Restore Purchases

1. Delete and reinstall the app
2. Open app → Settings → Upgrade to Premium
3. Tap **Restore Purchases**
4. Should show "Purchases Restored!" alert
5. Premium features should now be unlocked

## 📱 Testing Checklist

- [ ] RevenueCat initializes successfully (check console logs)
- [ ] Paywall loads subscription options
- [ ] Can select different subscription tiers
- [ ] Purchase flow works in sandbox
- [ ] Restore purchases works
- [ ] Premium status persists after app restart
- [ ] Premium features are gated properly (if implemented)
- [ ] Subscription status syncs from RevenueCat

## 🚀 Production Deployment

Before submitting to App Store:

1. **Update API Keys:**
   - Ensure production RevenueCat API key is in `.env`
   - Update `app.json` with correct key

2. **Test with TestFlight:**
   - Upload build to TestFlight
   - Test purchase flow with real Apple ID
   - Verify receipt validation works

3. **Submit for Review:**
   - App Store requires testing IAP before approval
   - Provide test credentials for sandbox Apple ID
   - Explain premium features in App Review notes

## 🔒 Security Best Practices

1. **Never commit API keys to git**
   - Use `.env` file (already in `.gitignore`)
   - Or use EAS Secrets: `eas secret:create --name REVENUECAT_API_KEY`

2. **Validate on server side**
   - RevenueCat handles receipt validation
   - Don't trust client-side subscription checks alone

3. **Handle edge cases:**
   - Subscription expires
   - Refund issued
   - Subscription cancelled
   - Family sharing

## 🐛 Troubleshooting

### Issue: "No offerings available"

**Solution:**
- Check RevenueCat dashboard → Offerings → ensure "default" offering exists
- Verify offering is marked as "Current"
- Check console logs for API errors

### Issue: Purchase fails with "Product not found"

**Solution:**
- Verify Product IDs match exactly in:
  - App Store Connect
  - RevenueCat Products
  - RevenueCat Offerings
- Ensure products are in "Ready to Submit" state in App Store Connect

### Issue: "User is not premium after purchase"

**Solution:**
- Check entitlement ID is exactly `premium` in RevenueCat
- Verify products are attached to the `premium` entitlement
- Check console logs for errors

### Issue: RevenueCat initialization fails

**Solution:**
- Verify API key format: should start with `appl_`
- Check API key is correct in `.env`
- Ensure `app.json` plugin configuration is correct
- Run `npx expo prebuild --clean` after changing config

## 📚 Additional Resources

- [RevenueCat Documentation](https://docs.revenuecat.com/)
- [RevenueCat React Native SDK](https://docs.revenuecat.com/docs/reactnative)
- [App Store Connect Guide](https://developer.apple.com/app-store-connect/)
- [Subscription Best Practices](https://docs.revenuecat.com/docs/subscription-guidance)

## 💰 Pricing Recommendations

Based on competitor analysis:

- **Monthly:** $9.99 - $14.99
- **Annual:** $79.99 - $99.99 (save 30-40%)
- **Lifetime:** $199.99 - $299.99 (optional)

Consider offering:
- **7-day free trial** for monthly plan (increases conversions)
- **Intro pricing:** First month at $4.99, then $9.99/month
- **Special launch price** for early adopters

## 🎯 Next Steps

Once RevenueCat is configured:

1. Test thoroughly in sandbox
2. Implement feature gating (if needed)
3. Add premium-only features
4. Design upsell prompts
5. Track conversion metrics in RevenueCat analytics
6. Submit to App Store with IAP configured

---

**Need Help?**
- RevenueCat Support: [https://app.revenuecat.com/support](https://app.revenuecat.com/support)
- Discord Community: [https://discord.gg/revenuecat](https://discord.gg/revenuecat)
