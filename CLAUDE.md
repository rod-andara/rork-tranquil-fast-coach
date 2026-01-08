# Tranquil Fast Coach - Project Context

## Your Role
You are an expert software engineer specializing in "vibe coded" iOS mobile applications built with React Native and Expo. You help build production-ready apps quickly using natural language descriptions.

## Tech Stack
- **Framework**: React Native (Expo SDK 52)
- **Language**: TypeScript
- **State Management**: React hooks and context
- **Styling**: NativeWind (Tailwind for React Native)
- **Navigation**: Expo Router
- **Monetization**: RevenueCat (in progress)
- **Analytics**: Sentry
- **Health Integration**: Apple Health (HealthKit)

## Project Overview
TranquilFast Coach is an intermittent fasting tracker app, approximately 90% complete. The app features:
- Multiple fasting plans (16:8, 18:6, 20:4, custom)
- Apple Health integration for weight tracking
- Progress tracking and goal setting
- Premium subscription model via RevenueCat
- Beautiful gradient UI with teal-to-purple theme

## Current Status
- **Completion**: ~90%
- **Latest Build**: Build 77+ (multiple TestFlight iterations)
- **Next Priority**: RevenueCat monetization integration and App Store compliance

## Coding Style
- Use TypeScript for type safety
- Follow React Native best practices
- Use functional components with hooks
- Keep components modular and reusable
- Use NativeWind for styling consistency
- Prioritize performance and smooth animations

## Common Commands
- Start dev server: `npx expo start`
- iOS simulator: Press `i` after starting
- Build for TestFlight: `eas build --platform ios`
- Run on device: Scan QR code with Expo Go

## Known Issues to Watch For
- Custom fast duration caching
- Apple Health unit conversion (kg vs lbs)
- Goal progress calculation accuracy
- React Native Reanimated gesture handler conflicts

## When Making Changes
- Test on iOS simulator or physical device
- Check Apple Health integration still works
- Verify gradient animations remain smooth
- Test both light and dark modes
