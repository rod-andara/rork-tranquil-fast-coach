# RevenueCat Testing Guide - Test Store Mode

This guide walks you through testing your RevenueCat integration with Test Store in iOS Simulator.

## ✅ Your Current Setup

```
✅ Test Store API Key: test_XmbuaqfMa0zNhGONEeWrnjwfJKr
✅ Product ID: premium_monthly ($4.99/month)
✅ Entitlement: premium
✅ Offering: default
✅ Package: $rc_monthly
```

---

## 🧪 RevenueCat Test Store Mode

**What is Test Store?**
- RevenueCat's built-in testing environment
- Works in iOS Simulator WITHOUT needing App Store Connect
- Free test purchases (no real money)
- No Apple ID required
- Perfect for development

**How it works:**
- RevenueCat detects `test_` API key
- Automatically uses Test Store
- Simulates purchase flows
- No actual App Store transactions

---

## 📋 Pre-Testing Checklist

Before starting the app:

- ✅ `.env` file exists with Test Store API key
- ✅ `app.json` updated with Test Store API key
- ✅ Product created in RevenueCat (premium_monthly)
- ✅ Entitlement created (premium)
- ✅ Offering created (default) with $rc_monthly package
- ✅ No previous builds cached

---

## 🚀 Step-by-Step Testing

### Step 1: Clean Start

```bash
# Clean any cached builds
rm -rf ios android

# Start fresh development server
npx expo start -c
```

**Press `i` to open iOS Simulator**

---

### Step 2: Watch for Initialization Logs

When the app starts, you should see these console logs in order:

```
[App] Initializing RevenueCat...
[RevenueCat] Initializing...
[RevenueCat] Initialized successfully
[RevenueCat] Subscription status: Free
```

**✅ SUCCESS INDICATORS:**
- "Initialized successfully" appears
- No errors about API keys
- Status shows "Free" initially

**❌ ERROR INDICATORS:**
- "Initialization failed"
- "API key invalid"
- "Platform not supported"

If you see errors, check:
1. `.env` file exists and has correct key
2. No typos in API key
3. Restart Metro bundler: `npx expo start -c`

---

### Step 3: Navigate to Paywall

1. **Open Settings tab** (bottom navigation)
2. **Tap "Upgrade to Premium"** card at the top

You should see:
```
[Paywall] Loading offerings...
[RevenueCat] Fetching offerings...
[RevenueCat] Current offering: default
[RevenueCat] Available packages: 1
```

**✅ PAYWALL LOADS:**
- Purple gradient hero section
- "Upgrade to Premium" title
- List of premium features
- Subscription plan card showing "$4.99/month"
- "Subscribe for $4.99/month" button
- "Restore Purchases" link at bottom

**❌ IF PAYWALL DOESN'T LOAD:**

You'll see an alert: "No Offerings Available"

**Troubleshooting:**
1. Check RevenueCat dashboard:
   - Go to Offerings → "default" offering exists?
   - Is it marked as "Current"? ✅
   - Does it have packages attached?

2. Check console for errors:
   ```
   [RevenueCat] Failed to get offerings: [error details]
   ```

3. Verify offering configuration:
   - Offering ID must be exactly `default`
   - Must have at least one package
   - Package must be linked to a product

---

### Step 4: Test Purchase Flow

**Click "Subscribe for $4.99/month"**

Expected flow:

```
[RevenueCat] Purchasing package: $rc_monthly
```

**In Test Store mode, you'll see a native iOS alert:**

```
┌─────────────────────────────────┐
│  Confirm Your In-App Purchase   │
│                                  │
│  Do you want to buy one          │
│  "Monthly Premium" for $4.99?    │
│                                  │
│  [Environment: Xcode.StoreKit]   │
│                                  │
│        [Cancel]    [Buy]         │
└─────────────────────────────────┘
```

**Key Detail:** Notice "Environment: Xcode.StoreKit" - this confirms Test Store mode!

**Click "Buy"** (no charge in test mode)

After purchase:
```
[RevenueCat] Purchase successful! User is now premium
[App] Subscription status: Premium
```

**✅ SUCCESS:**
- Alert: "Welcome to Premium! 🎉"
- Redirects to Home screen
- Settings should now show premium status

**❌ IF PURCHASE FAILS:**

Console will show:
```
[RevenueCat] Purchase failed: [error message]
```

Common issues:
- **"Product not found"**: Product ID mismatch
- **"User cancelled"**: You clicked Cancel (not an error)
- **"Network error"**: Check internet connection

---

### Step 5: Verify Premium Status

After successful purchase:

1. **Check console logs:**
   ```
   [App] Subscription status: Premium
   ```

2. **Restart the app:**
   - Close and reopen from simulator home
   - Watch initialization logs
   - Should see: `[RevenueCat] Subscription status: Premium`

3. **Premium persists** ✅

---

### Step 6: Test Restore Purchases

**Simulate new device:**

```bash
# Stop app
# Clear app data from simulator
# Settings → Apps → TranquilFast Coach → Delete App
# Re-run app from Xcode/Expo
```

**Navigate to Paywall:**
1. Settings → Upgrade to Premium
2. **Click "Restore Purchases"**

Expected logs:
```
[RevenueCat] Restoring purchases...
[RevenueCat] Purchases restored! User is premium
```

**✅ SUCCESS:**
- Alert: "Purchases Restored! 🎉"
- Redirects to Home screen
- Premium status active

**❌ IF RESTORE FAILS:**
- Alert: "No Purchases Found"
- This is normal if no purchases exist
- In Test Store, purchases are device-specific

---

## 📊 Expected Console Output (Complete Flow)

### Successful Test Session:

```
# App Start
[App] Initializing RevenueCat...
[RevenueCat] Initializing...
[RevenueCat] Initialized successfully
[App] Subscription status: Free

# User taps Settings
[Settings] Rendering settings screen

# User taps Upgrade to Premium
[Paywall] Loading offerings...
[RevenueCat] Fetching offerings...
[RevenueCat] Current offering: default
[RevenueCat] Available packages: 1

# User selects plan and clicks Subscribe
[RevenueCat] Purchasing package: $rc_monthly
[RevenueCat] Purchase successful! User is now premium
[App] Subscription status: Premium

# App restart
[App] Initializing RevenueCat...
[RevenueCat] Initialized successfully
[App] Subscription status: Premium ✅
```

---

## 🐛 Troubleshooting Common Issues

### Issue 1: "No Offerings Available"

**Symptoms:**
- Paywall shows error alert immediately
- Console: `[RevenueCat] No offerings available`

**Solution:**
1. Open RevenueCat dashboard
2. Go to **Offerings** → Check "default" offering exists
3. Click "default" → Verify packages are attached
4. Ensure offering is marked as **"Current"** ✅

### Issue 2: Purchase Button Does Nothing

**Symptoms:**
- Click "Subscribe" → nothing happens
- No logs in console

**Solution:**
1. Check console for errors
2. Verify iOS Simulator is iOS 15.1+
3. Ensure package is selected (should be auto-selected)
4. Try restarting Metro bundler: `npx expo start -c`

### Issue 3: "Product Not Found"

**Symptoms:**
- Purchase fails with product error
- Console: `Product ID not found: premium_monthly`

**Solution:**
1. Verify Product ID in RevenueCat dashboard
2. Must exactly match: `premium_monthly`
3. Check product is attached to offering
4. Rebuild app: `npx expo prebuild --clean`

### Issue 4: Initialization Fails

**Symptoms:**
- Console: `[RevenueCat] Initialization failed`
- App doesn't detect Test Store

**Solution:**
1. Check `.env` file exists in project root
2. Verify API key starts with `test_`
3. Restart Metro: `npx expo start -c`
4. Check Platform.OS returns 'ios' (not 'web')

### Issue 5: Premium Status Doesn't Persist

**Symptoms:**
- Purchase succeeds
- After restart, status is "Free"

**Solution:**
1. Check AsyncStorage permissions
2. Verify `fastStore.ts` saves premium status
3. Check console for storage errors
4. Test in fresh simulator reset

---

## 🧪 Test Scenarios

### Scenario 1: New User Journey
1. ✅ Open app (fresh install)
2. ✅ Navigate to Settings → Upgrade to Premium
3. ✅ See subscription options
4. ✅ Purchase subscription
5. ✅ Verify premium status
6. ✅ Restart app → status persists

### Scenario 2: Restore Purchases
1. ✅ Purchase subscription
2. ✅ Delete app from simulator
3. ✅ Reinstall app
4. ✅ Settings → Upgrade to Premium → Restore
5. ✅ Premium status restored

### Scenario 3: User Cancels Purchase
1. ✅ Navigate to paywall
2. ✅ Click Subscribe
3. ✅ Click "Cancel" in purchase dialog
4. ✅ No error alert shown
5. ✅ User remains on paywall

### Scenario 4: Already Premium User
1. ✅ User has active subscription
2. ✅ Navigate to Settings → Upgrade to Premium
3. ✅ Alert: "Already Premium!"
4. ✅ Redirects to Home screen

---

## 📱 Simulator Testing Tips

### Best Practices:
1. **Clean builds:** Always start with `npx expo start -c`
2. **Watch logs:** Keep console visible
3. **Test flows:** Go through each scenario
4. **Fresh starts:** Reset simulator between tests
5. **Dark mode:** Test in both light/dark modes

### Keyboard Shortcuts (Simulator):
- `⌘ + K` - Toggle software keyboard
- `⌘ + Shift + H` - Home button
- `⌘ + Shift + H + H` - App switcher
- `Device → Erase All Content and Settings` - Reset simulator

---

## 🎯 Success Criteria

Your RevenueCat integration is working if:

✅ App initializes RevenueCat without errors
✅ Paywall loads subscription options from RevenueCat
✅ Can see "$4.99/month" pricing
✅ Purchase dialog shows "Environment: Xcode.StoreKit"
✅ Purchase completes successfully
✅ Premium status is set to true
✅ Premium status persists after app restart
✅ Restore purchases works
✅ Already-premium users see "Already Premium" alert

If all checkboxes pass → **Integration is working! 🎉**

---

## 🚀 Next Steps After Testing

Once Test Store testing passes:

### 1. **Clean Up Test Data**
```bash
# Test Store purchases are local-only
# Just delete app from simulator
# Or reset simulator
```

### 2. **Prepare for Production**
- Create real products in App Store Connect
- Update RevenueCat with production API key
- Create production offering
- Test with Sandbox Apple ID

### 3. **Production Checklist**
- [ ] Real products in App Store Connect
- [ ] Production RevenueCat API key in `.env`
- [ ] Update `app.json` with production key
- [ ] Test with Sandbox Apple ID
- [ ] TestFlight beta testing
- [ ] Submit for App Store review

---

## 📞 Getting Help

**If you're stuck:**

1. **Check console logs** - most issues show error messages
2. **Review RevenueCat dashboard** - verify configuration
3. **Restart everything** - Metro bundler, simulator, Xcode
4. **Read error messages** - they're usually specific

**Common Error Messages & Fixes:**

| Error | Fix |
|-------|-----|
| "API key invalid" | Check `.env` file, restart Metro |
| "No offerings available" | Verify "default" offering exists |
| "Product not found" | Check Product ID matches exactly |
| "Initialization failed" | Verify platform is iOS, not web |

---

## 🎉 What to Expect in Test Store

**Test Store Mode Features:**
- ✅ Instant purchases (no delay)
- ✅ No real money charged
- ✅ No Apple ID required
- ✅ Works offline
- ✅ Purchase dialog shows "Xcode.StoreKit"
- ✅ Can purchase unlimited times

**Limitations:**
- ⚠️ Purchases are device-specific (not synced)
- ⚠️ No receipt validation (simulated)
- ⚠️ Subscriptions don't auto-renew
- ⚠️ Can't test Family Sharing

**For production testing, you'll need:**
- Real products in App Store Connect
- Sandbox Apple ID
- TestFlight build

---

## 🏁 Ready to Test!

Your setup is complete. Follow these steps:

```bash
# 1. Start development server
npx expo start -c

# 2. Open iOS Simulator
# Press 'i' in terminal

# 3. Watch console for initialization logs

# 4. Navigate to Settings → Upgrade to Premium

# 5. Test purchase flow

# 6. Verify premium status persists
```

**Look for console logs matching the patterns in this guide.**

Good luck! 🚀

---

**Questions?** Check the troubleshooting section or review console logs for specific error messages.
