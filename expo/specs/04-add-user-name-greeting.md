# SPEC-04: Add User Name to Greeting

**Status:** pending
**Priority:** P1 (should fix)
**Estimated Effort:** medium (30-90 min)

## Problem
Home screen displays generic "Welcome Back!" instead of a personalized greeting. Users expect a personal touch.

## Root Cause
No `userName` field exists in the data model. The greeting at `app/(tabs)/home.tsx:82-84` is hardcoded. The onboarding flow (welcome -> track-succeed -> choose-plan) never collects a name.

## Exact Fix

### File 1: `expo/store/fastStore.ts`

**Add to `FastState` interface** (after `isPremium: boolean;` around line 33):
```typescript
userName: string;
```

**Add action to interface** (after `setPremium: (value: boolean) => void;` around line 44):
```typescript
setUserName: (name: string) => void;
```

**Add default value** in the `create` call (after `isPremium: false,` around line 59):
```typescript
userName: '',
```

**Add action implementation** (after `setPremium` action, around line 182):
```typescript
setUserName: (name: string) => {
  set({ userName: name });
  get().saveToStorage();
},
```

**Add to `saveToStorage`** (in the `toSave` object, after `isPremium: state.isPremium,` around line 230):
```typescript
userName: state.userName,
```

### File 2: `expo/app/(tabs)/home.tsx`

**Line 16**, add `userName` to the destructured store:
```typescript
const { currentFast, selectedPlan, startFast, endFast, fastHistory, isDarkMode, userName } = useFastStore();
```

**Line 82-84**, change the greeting:
```typescript
<Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
  {userName ? `Welcome, ${userName}!` : 'Welcome Back!'}
</Text>
```

### File 3: `expo/app/onboarding/welcome.tsx`

Add a name input to the welcome screen. This is the lightest-touch approach.

**Add imports** at the top:
```typescript
import { TextInput } from 'react-native';
import { useFastStore } from '@/store/fastStore';
```

**Add state and store** inside `WelcomeScreen` function (after the animation refs):
```typescript
const [name, setName] = React.useState('');
const { setUserName } = useFastStore();
```

**Add TextInput** inside the `BlurView` (after the subtitle Text, around line 47):
```typescript
<TextInput
  style={styles.nameInput}
  placeholder="Your name (optional)"
  placeholderTextColor="rgba(255, 255, 255, 0.5)"
  value={name}
  onChangeText={setName}
  autoCapitalize="words"
  autoCorrect={false}
  returnKeyType="done"
/>
```

**Update Continue button** to save name (line 71):
```typescript
onPress={() => {
  if (name.trim()) {
    setUserName(name.trim());
  }
  router.push('/onboarding/track-succeed');
}}
```

**Add style** for the input (in the styles object):
```typescript
nameInput: {
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.3)',
  paddingVertical: 14,
  paddingHorizontal: 16,
  fontSize: 16,
  color: '#FFFFFF',
  marginTop: 20,
  textAlign: 'center',
},
```

### File 4: `expo/app/(tabs)/settings.tsx` (optional enhancement)

Add a "Name" setting row so users can change their name after onboarding. This is optional -- implement only if the above changes take less than 20 minutes.

## Files to Read Before Starting
1. `expo/store/fastStore.ts` (understand saveToStorage/loadFromStorage pattern)
2. `expo/app/(tabs)/home.tsx` (find the greeting)
3. `expo/app/onboarding/welcome.tsx` (understand the screen structure)

## Files to Modify
- `expo/store/fastStore.ts`
- `expo/app/(tabs)/home.tsx`
- `expo/app/onboarding/welcome.tsx`
- (Optional) `expo/app/(tabs)/settings.tsx`

## Verification Steps
1. `npx tsc --noEmit` passes
2. Clear AsyncStorage (or delete app data) to trigger onboarding
3. On welcome screen, enter a name (e.g., "Rodrigo") and tap Continue
4. Complete onboarding, reach home screen
5. Verify greeting shows "Welcome, Rodrigo!"
6. Kill app, relaunch -- name should persist
7. Go through onboarding again without entering a name
8. Verify greeting falls back to "Welcome Back!"

## Rollback Plan
```bash
git checkout -- expo/store/fastStore.ts expo/app/(tabs)/home.tsx expo/app/onboarding/welcome.tsx
```

## Notes
- The `loadFromStorage` method uses `set({ ...data, hasHydrated: true })` which spreads all stored fields. If `userName` doesn't exist in old storage (existing users), it will be `undefined`. The default `''` from the create call won't apply because the spread overwrites it. To handle this, the greeting already uses a truthy check (`userName ? ... : ...`), which treats both `''` and `undefined` as falsy. So existing users will see "Welcome Back!" without a migration.
- Do NOT add a `ProfileCard` or profile screen. Keep it minimal.
