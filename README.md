# NGINE v0.1

[![CI](https://github.com/nrbns/Ngine/actions/workflows/ci.yml/badge.svg)](https://github.com/nrbns/Ngine/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Daily habit tracking app with real-time sync, clean UI, and monetization.**

A production-ready mobile app for tracking daily resolutions with instant sync across devices, beautiful animations, and AdMob integration.

## ✨ Features

### Core Functionality
- **Daily Check-Ins**: Track your progress with Done/Partial/Missed options
- **Energy Tracking**: Rate your energy level (1-5) for each check-in
- **Blocker Notes**: Optional field to note what blocked you
- **Real-Time Sync**: Instant updates across all devices via Supabase Realtime
- **Integrity Dots**: Visual representation of your last 5 days
- **Progress Metrics**: Track days showed up and resets overcome
- **Recovery Mode**: Graceful handling of missed days with comeback messages
- **Auto-Missed Check-Ins**: Automatically marks missed days after 9 PM
- **Resolution Completion Tracking**: Automatically completes resolutions after duration
- **AI-Powered Motivation**: Context-aware motivational messages based on your progress
- **Onboarding Flow**: Smooth first-time user experience with guided setup

### UI/UX
- **Dark Theme**: Calm, modern dark color scheme with subtle gradients
- **Smooth Animations**: 60fps animations with react-native-reanimated and staggered entrances
- **Haptic Feedback**: Tactile responses for all interactions
- **Optimistic UI**: Instant feedback before backend sync
- **Live Status Indicator**: Shows connection and sync status in real-time
- **Offline Support**: Works offline with automatic sync when online
- **Shimmer Loading States**: Beautiful loading skeletons for better perceived performance
- **Empty States**: Helpful, visually appealing empty states throughout the app
- **Enhanced Visual Hierarchy**: Improved spacing, shadows, and typography

### Monetization
- **Banner Ads**: Non-intrusive banner placement
- **Rewarded Ads**: Watch ads to upload proof photos
- **AdMob Integration**: Ready for production ad serving

### Technical
- **Expo Router**: File-based navigation with modal presentations
- **Zustand State Management**: Global state with realtime updates
- **Supabase Backend**: PostgreSQL with Row Level Security (RLS)
- **TypeScript**: Full type safety across the codebase
- **EAS Build**: Production-ready Android builds with Play Store submission
- **Design Tokens**: Centralized design system (colors, spacing, typography, shadows)
- **Realtime Subscriptions**: Efficient filtered subscriptions for instant updates
- **Daily Automation**: Automated daily checks for completion and missed check-ins

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI
- Supabase account (free tier works)

### Installation

```bash
# Clone repository
git clone https://github.com/nrbns/Ngine.git
cd Ngine

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your actual credentials (see .env.example for details)
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `EXPO_PUBLIC_SUPABASE_URL` - Get from Supabase Dashboard → Settings → API
- `EXPO_PUBLIC_SUPABASE_KEY` - Get from Supabase Dashboard → Settings → API (anon/public key)
- `EXPO_PUBLIC_ADMOB_APP_ID` - Optional, for ads (use test IDs during development)
- `EXPO_PUBLIC_ADMOB_BANNER_ID` - Optional, for banner ads (use test IDs during development)

**Note**: Never commit `.env` file to git. It's already in `.gitignore`.

### Database Setup

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `database-schema.sql`
3. Paste and run in SQL Editor
4. Enable Anonymous authentication in Supabase Dashboard

### Run Development

```bash
# Start Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

## 📱 Build for Production

### Android APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build production APK
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

### iOS (Future)

```bash
eas build --platform ios --profile production
```

## 🏗️ Architecture

### State Management
- **Zustand Store** (`lib/store.ts`): Global state for resolutions, check-ins, proofs
- **Realtime Hook** (`lib/useRealtime.ts`): Efficient Supabase subscriptions
- **Offline Detection** (`lib/offline.ts`): Network status monitoring

### Screens
- **Today** (`app/(tabs)/index.tsx`): Main check-in screen
- **Progress** (`app/(tabs)/profile.tsx`): Stats and integrity visualization
- **Check-In** (`app/checkin.tsx`): Energy and blocker input
- **Create Goal** (`app/create-goal.tsx`): New resolution creation
- **Gallery** (`app/gallery.tsx`): Proof photos
- **Recovery** (`app/recovery.tsx`): Reset after missed days

### Components
- **Animated Components**: Identity text, status badges, cards
- **Tactile Buttons**: Haptic feedback buttons
- **Realtime Indicator**: Connection status display
- **Integrity Dots**: Visual progress representation

## 🔄 Real-Time Sync

NGINE uses Supabase Realtime for instant updates:

- **Filtered Subscriptions**: Only relevant data is synced
- **Incremental Updates**: No full reloads needed
- **Optimistic UI**: Updates appear instantly
- **Connection Status**: Visual indicator shows sync state
- **Offline Queue**: Changes sync when connection restored

### How It Works

1. User action → Optimistic UI update
2. Backend sync → Supabase insert/update
3. Realtime broadcast → All subscribed clients receive update
4. Zustand store updates → Components re-render automatically

## 📊 Database Schema

### Tables
- `profiles`: User identity and preferences
- `resolutions`: Goals/resolutions with status
- `checkins`: Daily check-ins with execution, energy, blocker
- `goal_proofs`: Photo proofs for achievements

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Anonymous authentication supported

## 🎨 Design System

### Colors
- Background: `#0E0F13` (Near-black)
- Card: `#16181D` (Dark gray)
- Primary: `#6C6FF5` (Purple)
- Success: `#4ADE80` (Green)
- Warning: `#FACC15` (Yellow)
- Danger: `#FB7185` (Pink)

### Typography
- Greeting: 32px, bold
- Goal Title: 24px, bold
- Body: 16px, regular
- Labels: 14px, semibold

### Spacing
- Screen padding: 20px
- Card padding: 24px
- Button height: 48px
- Chip size: 56px

## 🔔 Notifications

Daily check-in reminders are scheduled automatically:
- Default time: 9:00 AM
- Configurable via `lib/notifications.ts`
- Requires notification permissions

## 🐛 Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions to common issues:

### Quick Fixes

**Blank Screen After Installation:**
- Clear Metro cache: `npx expo start --clear`
- Verify `.env` file exists and has correct values
- Check browser console (F12) for error messages

**Goals Not Saving:**
- Ensure Supabase RLS policies are set up (see `database-schema.sql`)
- Enable Anonymous authentication in Supabase Dashboard
- Verify environment variables are correct

**AdMob Errors:**
- Use test ad IDs during development (included in `.env.example`)
- Check AdMob account status and app configuration
- Ads only work on physical devices, not simulators

**Supabase Connection Issues:**
- Verify `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_KEY` in `.env`
- Check Supabase project status in Dashboard
- Ensure RLS policies allow anonymous access

For more detailed troubleshooting, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

## 📝 Roadmap

### v0.2 (Planned)
- [ ] Multiple active goals
- [ ] Goal categories/tags
- [ ] Export data (CSV/JSON)
- [ ] Custom notification times
- [ ] Streak milestones
- [ ] Social sharing

### v0.3 (Future)
- [ ] AI insights and recommendations
- [ ] Habit patterns analysis
- [ ] Integration with health apps
- [ ] Widget support
- [ ] Dark/Light theme toggle


## 🤝 Contributing

Contributions welcome! 

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit with clear messages (`git commit -m 'Add: amazing feature'`)
5. Push to your branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev)
- Backend powered by [Supabase](https://supabase.com)
- Animations by [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/)
- State management with [Zustand](https://github.com/pmndrs/zustand)

---

**Version**: 0.1.0  
**Last Updated**: January 2026  
**Status**: Production Ready ✅
