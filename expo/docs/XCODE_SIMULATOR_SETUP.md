# Setting Up iOS Simulator - First Time

You just installed Xcode! Here's how to install and run iOS Simulators.

---

## 🎯 Quick Setup (5 minutes)

### Option A: Install Simulator from Xcode (Recommended)

1. **Open Xcode** (if not already open)
   ```bash
   open -a Xcode
   ```

2. **Go to Xcode menu** → **Settings** (or **Preferences** in older versions)

3. **Click "Platforms" tab** (or "Components" in older versions)

4. **You'll see a list of iOS versions:**
   ```
   ☐ iOS 17.5
   ☐ iOS 17.4
   ☐ iOS 17.2
   ☐ iOS 16.4
   ```

5. **Click the download icon** next to **iOS 17.5** (or latest available)
   - This will download the iOS Simulator runtime (~6-8 GB)
   - Takes 5-15 minutes depending on your internet speed

6. **Wait for download to complete** (progress bar shows in Xcode)

---

### Option B: Accept Xcode License & Install Command Line Tools

If you see license agreement prompts:

1. **Run this in terminal:**
   ```bash
   sudo xcodebuild -license accept
   ```

2. **Enter your password when prompted**

3. **Install additional components:**
   ```bash
   sudo xcode-select --install
   ```

---

## 📱 After Simulator is Downloaded

### Method 1: Use Expo (Easiest)

Once the simulator runtime is installed:

1. **Go back to your terminal** where Expo is running
2. **Press `i`** (for iOS)
3. **Expo will:**
   - Automatically open Simulator
   - Boot an iPhone device
   - Install your app
   - Launch it

### Method 2: Open Simulator Manually

1. **Open Simulator app:**
   ```bash
   open -a Simulator
   ```

2. **In Simulator menu:**
   - **File** → **Open Simulator** → Choose **iPhone 15 Pro** (or any iPhone)

3. **Wait for device to boot** (shows Apple logo, then home screen)

4. **Go back to Expo terminal** and press `i`

---

## ✅ Verify Simulator is Ready

**Run this command to check installed simulators:**
```bash
xcrun simctl list devices available | grep iPhone
```

**You should see output like:**
```
iPhone 15 (UUID) (Shutdown)
iPhone 15 Pro (UUID) (Shutdown)
iPhone 15 Pro Max (UUID) (Shutdown)
```

If you see a list of iPhones, **simulators are installed!** ✅

---

## 🚀 Running Your App

Once simulator is ready:

### Step 1: Make sure Expo is running
```bash
# If not already running:
cd /Users/rodrigoandara/Projects/rork-tranquil-fast-coach
npx expo start
```

### Step 2: Press 'i' in terminal
```
› Press i │ open iOS simulator
```

### Step 3: Watch the build process
```
› Opening on iOS...
› Building app...
› Installing app...
› Opening app...
```

### Step 4: App launches!
You should see:
- Tranquil Fast Coach splash screen
- Then the onboarding/home screen
- Check console for RevenueCat initialization logs

---

## 🐛 Troubleshooting

### "No simulators found"
**Solution:** Install iOS runtime from Xcode → Settings → Platforms

### "Unable to boot device"
**Solution:**
```bash
# Reset simulators
xcrun simctl shutdown all
xcrun simctl erase all
```

Then try again.

### Xcode says "Additional Components Required"
**Solution:** Click "Install" and wait for components to download

### Simulator is very slow
**Solution:**
- Close other apps to free RAM
- Simulator needs at least 8GB RAM
- Use iPhone SE (smaller, faster) instead of Pro Max

### "App failed to install"
**Solution:**
```bash
# Clean build and try again
npx expo start -c
# Then press 'i'
```

---

## 📊 What Happens Next

Once simulator runs your app:

1. **Watch console logs:**
   ```
   [App] Initializing RevenueCat...
   [RevenueCat] Initialized successfully
   ```

2. **Navigate to Settings** → **Upgrade to Premium**

3. **Test the purchase flow** with Test Store

4. **Check that offerings load** from RevenueCat

---

## 💡 Tips

- **First launch is slowest** - subsequent launches are faster
- **Simulator uses your Mac's keyboard** - no need for on-screen keyboard
- **Copy/paste works** - Command+C and Command+V work in simulator
- **Shake gesture:** Hardware → Shake in Simulator menu
- **Home button:** Hardware → Home, or `Cmd+Shift+H`
- **Screenshot:** `Cmd+S` saves to Desktop

---

## 🎯 Alternative: Skip Simulator, Use Physical Device

If simulator is slow or you have an iPhone:

1. **Install Expo Go app** from App Store on your iPhone
2. **Scan the QR code** shown in Expo terminal
3. **App runs on your physical device** (faster than simulator!)

**Note:** RevenueCat Test Store works in simulator only. For real device testing, you'll need:
- Real products in App Store Connect
- Sandbox Apple ID for testing

---

## ✅ Ready Checklist

Before testing RevenueCat:

- [ ] Xcode installed
- [ ] iOS Simulator runtime downloaded (iOS 17.x)
- [ ] Simulator app opens successfully
- [ ] Can see list of iPhone devices
- [ ] Expo server running (`npx expo start`)
- [ ] Pressed 'i' to open app in simulator
- [ ] App launches in simulator
- [ ] Console shows RevenueCat initialization

Once all checked → **You're ready to test RevenueCat!** 🎉

---

## 📞 Next Steps

After simulator is set up:

1. **Test RevenueCat** - Follow `REVENUECAT_TESTING_GUIDE.md`
2. **Test purchase flow** - Settings → Upgrade to Premium
3. **Verify logs** - Check console for RevenueCat messages
4. **Report back** - Let me know if everything works!

---

**Current Status:**
- ✅ Xcode: Installed
- ⏳ iOS Simulator Runtime: Needs installation
- ✅ Expo Server: Running
- ✅ RevenueCat: Configured
- ⏳ Ready to Test: Waiting for simulator

**Next:** Install iOS runtime from Xcode → Settings → Platforms
