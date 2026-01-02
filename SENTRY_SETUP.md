# Sentry Integration Complete ✓

## What Was Done

### 1. Installed Sentry SDK
- `@sentry/react-native` - Core Sentry SDK
- `sentry-expo` - Expo integration

### 2. Configured Sentry
- **Location**: `app/_layout.tsx`
- **DSN**: Connected to your Sentry project
- **Features Enabled**:
  - Error tracking (100% of errors captured)
  - Session tracking (30s intervals)
  - Environment detection (dev vs production)

### 3. Added Apple Health Tracking
- **Location**: `utils/appleHealth.ts`
- **What's Tracked**:
  - HealthKit initialization errors with full context
  - Permission request failures
  - Weight data fetch errors
  - Sync failures with import/export counts
  - All errors include platform, permissions, and operation details

### 4. Added Learn Page Image Tracking
- **Location**: `app/(tabs)/learn.tsx`
- **What's Tracked**:
  - Recipe image loading failures
  - Product image loading failures
  - Each error includes the image URL and title for debugging

## How to Use Sentry

### Step 1: Build & Deploy
```bash
# Create a new build with Sentry
eas build --platform ios --profile preview

# Upload to TestFlight
```

### Step 2: View Logs on Any Device
1. Go to **sentry.io** on your phone/PC/tablet
2. Log in to your account
3. Click on your project: **rork-tranquil-fast-coach**
4. You'll see:
   - **Issues** tab: All errors with full stack traces
   - **Performance** tab: App performance metrics
   - **Releases** tab: Track errors by build version

### Step 3: Debug Apple Health
When Apple Health fails, you'll see in Sentry:
- Exact error message
- Platform details (iOS version, device)
- What permissions were requested
- Full breadcrumb trail of what happened before the error
- Callback response details

### Step 4: Debug Learn Page Images
When images fail to load, you'll see:
- Which image URL failed
- Recipe/Product title
- Error details from expo-image

## What You'll See in Sentry

### For Apple Health Errors:
```
HealthKit init failed: [error message]

Context:
- Platform: ios
- Error Type: string
- Permissions: {read: ['Weight'], write: ['Weight']}
- Module Type: object
- Has Constants: object
- Has Init Method: function

Breadcrumbs:
1. initHealthKit called
2. Platform check passed
3. Requesting HealthKit permissions
4. ERROR: Cannot grant permissions
```

### For Image Errors:
```
Recipe image failed to load: Mediterranean Quinoa Breakfast Bowl

Context:
- URL: https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400
- Title: Mediterranean Quinoa Breakfast Bowl
- Error: [expo-image error details]
```

## Troubleshooting

### If you don't see errors in Sentry:
1. Make sure you rebuilt the app with `eas build`
2. Check that you're testing on TestFlight (not local dev)
3. Wait 1-2 minutes for errors to appear
4. Verify your DSN in `app/_layout.tsx`

### If Apple Health still doesn't work:
1. Open Sentry dashboard
2. Look for errors tagged with `feature:apple_health`
3. Check the full context and breadcrumbs
4. Share the error details and we can fix it

## Files Modified
- `app/_layout.tsx` - Added Sentry initialization
- `app.json` - Added Sentry plugin configuration
- `utils/appleHealth.ts` - Added error tracking to all HealthKit operations
- `app/(tabs)/learn.tsx` - Added image error tracking
- `package.json` - Added Sentry dependencies

## Next Steps
1. Run `eas build --platform ios --profile preview`
2. Upload to TestFlight
3. Test Apple Health connection
4. Check Sentry dashboard for errors
5. Send me screenshots/links to any errors you see

## Pro Tips
- Filter errors by tags: `feature:apple_health` or `feature:learn_page`
- Set up email alerts for new errors (Settings → Alerts)
- Use breadcrumbs to see the sequence of events before an error
- Sentry works in production too - keeps tracking after App Store release
