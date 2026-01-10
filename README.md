# NGINE v0.1

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
- **Recovery Mode**: Graceful handling of missed days

### UI/UX
- **Dark Theme**: Calm, modern dark color scheme
- **Smooth Animations**: 60fps animations with react-native-reanimated
- **Haptic Feedback**: Tactile responses for all interactions
- **Optimistic UI**: Instant feedback before backend sync
- **Live Status Indicator**: Shows connection and sync status
- **Offline Support**: Works offline with automatic sync when online

### Monetization
- **Banner Ads**: Non-intrusive banner placement
- **Rewarded Ads**: Watch ads to upload proof photos
- **AdMob Integration**: Ready for production ad serving

### Technical
- **Expo Router**: File-based navigation
- **Zustand State Management**: Global state with realtime updates
- **Supabase Backend**: PostgreSQL with Row Level Security
- **TypeScript**: Full type safety
- **EAS Build**: Production-ready Android builds

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
# Edit .env with your Supabase credentials
```

### Environment Variables

Create `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
EXPO_PUBLIC_ADMOB_APP_ID=your_admob_app_id
EXPO_PUBLIC_ADMOB_BANNER_ID=your_banner_ad_unit_id
```

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

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues:
- Goals not saving
- Blank screens
- Animation issues
- Supabase connection problems

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

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

Private project - All rights reserved

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev)
- Backend powered by [Supabase](https://supabase.com)
- Animations by [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/)
- State management with [Zustand](https://github.com/pmndrs/zustand)

---

**Version**: 0.1.0  
**Last Updated**: January 2026  
**Status**: Production Ready ✅
