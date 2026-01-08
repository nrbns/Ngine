# NGINE v0.1

Daily habit tracking app with real-time sync and monetization.

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
node setup-env.js

# Start development
npm start
```

## Build for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Login and configure
eas login
eas build:configure

# Build APK
eas build --platform android --profile production
```

## Environment Setup

Create `.env` with your API keys:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_key
EXPO_PUBLIC_ADMOB_APP_ID=your_admob_app_id
EXPO_PUBLIC_ADMOB_BANNER_ID=your_banner_ad_id
```

## Database

Run `database-schema.sql` in Supabase SQL editor.

## Features

- Daily habit tracking
- Real-time data sync
- Banner and rewarded ads
- Clean mobile UI
- Play Store ready
