# 🚀 NGINE - Complete Setup Guide

## ✅ What You Have

A **complete, working, execution-ready** NGINE app with:
- ✅ All UI screens (Dashboard, Create, Check-in, Recovery, Summary)
- ✅ Rules engine (no AI, pure logic)
- ✅ AI integration (controlled)
- ✅ Ads integration (AdMob)
- ✅ Push notifications
- ✅ Supabase backend schema
- ✅ Clean, maintainable code

## 🚀 Quick Start (5 Steps)

### Step 1: Install Dependencies

```bash
cd mobile
npm install
```

### Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a project
2. Copy your project URL and anon key
3. Run the SQL schema from `supabase/schema.sql` in Supabase SQL Editor

### Step 3: Configure Environment

Create `mobile/.env` file:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
EXPO_PUBLIC_OPENAI_KEY=your_openai_key  # Optional for AI
EXPO_PUBLIC_ADMOB_BANNER_ID=ca-app-pub-xxx  # Optional for ads
EXPO_PUBLIC_ADMOB_REWARDED_ID=ca-app-pub-xxx  # Optional for ads
```

### Step 4: Run the App

```bash
cd mobile
npm start
```

Press `a` for Android or `i` for iOS.

### Step 5: Test

1. Create a resolution
2. Do a daily check-in
3. See status update automatically
4. Test recovery mode

## 📁 Project Structure

```
mobile/
├── app/                    # Screens (Expo Router)
│   ├── index.tsx          # Dashboard
│   ├── create.tsx         # Create Resolution
│   ├── checkin.tsx        # Daily Check-in (NO ADS)
│   ├── recovery.tsx       # Recovery Mode (NO ADS)
│   ├── summary.tsx        # End Summary
│   └── _layout.tsx        # Navigation
│
├── components/            # Reusable components
│   ├── ResolutionCard.tsx
│   ├── StatusBadge.tsx
│   └── PrimaryButton.tsx
│
├── logic/                 # Core business logic
│   ├── statusEngine.ts    # Rules engine (NO AI)
│   └── probability.ts     # Success probability
│
├── services/              # External services
│   ├── supabase.ts        # Database client
│   ├── ai.ts              # OpenAI integration
│   └── ads.ts             # AdMob integration
│
├── constants/
│   └── blockers.ts        # Common blockers
│
└── utils/
    └── notifications.ts   # Push notifications
```

## 🎯 Core Features

### Dashboard (`app/index.tsx`)
- View all resolutions
- See status badges (🟢🟡🔴🔵)
- Success probability
- Quick check-in access

### Create Resolution (`app/create.tsx`)
- Title, why, duration, MDD, support style
- Saves to Supabase

### Daily Check-in (`app/checkin.tsx`)
- **NO ADS** - Focus on execution
- Done/Partial/No
- Blocker selection
- Energy level (1-5)
- Auto-updates status via rules engine

### Recovery Mode (`app/recovery.tsx`)
- **NO ADS** - Focus on recovery
- 3-day micro plan
- Gentle reset

### Summary (`app/summary.tsx`)
- Outcome calculation
- Stats display
- Optional rewarded ad for AI insight

## 🔧 Rules Engine

Located in `logic/statusEngine.ts`:

**Status Calculation:**
- **Broken**: 3 misses in last 5 days
- **Drifting**: 2 consecutive fails OR low energy (≤2) for 2 days
- **Aligned**: Everything else

**No AI** - Pure logic, fast and reliable.

## 🤖 AI Integration

Located in `services/ai.ts`:

- Triggered ONLY when status = drifting/broken
- Uses GPT-4o-mini (cheap)
- Max 80 tokens
- One reason, one action

## 📱 Ads Integration

Located in `services/ads.ts`:

**Show ads:**
- ✅ Dashboard (banner)
- ✅ Summary (rewarded)

**Never show ads:**
- ❌ Check-in screen
- ❌ Recovery mode
- ❌ Failure messages

Uses AdMob (test IDs in dev mode).

## 🔔 Notifications

- Daily reminder at 9 PM
- Drift alerts (once)
- Recovery reminders (gentle)

## 🗄️ Database Schema

Simple two-table design:

- `resolutions` - Resolution data
- `checkins` - Daily check-ins

See `supabase/schema.sql` for full schema with RLS policies.

## 🚀 Deployment

### Android Play Store

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Configure:
```bash
eas build:configure
```

3. Build:
```bash
eas build --platform android
```

4. Submit to Play Store

### iOS App Store

1. Configure:
```bash
eas build:configure
```

2. Build:
```bash
eas build --platform ios
```

3. Submit to App Store

## 🐛 Troubleshooting

### Supabase Connection Issues
- Check `.env` file exists and has correct values
- Verify RLS policies are set up
- Check Supabase dashboard for errors

### AI Not Working
- Verify OpenAI API key in `.env`
- Check API quota
- Check network connection

### Ads Not Showing
- Use test IDs in development (automatic)
- Verify AdMob account setup
- Check ad unit IDs in `.env`

### Navigation Issues
- Make sure Expo Router is installed
- Check `app/_layout.tsx` exists
- Restart dev server

## 📝 Environment Variables

Required:
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_KEY` - Supabase anon key

Optional:
- `EXPO_PUBLIC_OPENAI_KEY` - For AI insights
- `EXPO_PUBLIC_ADMOB_BANNER_ID` - For banner ads
- `EXPO_PUBLIC_ADMOB_REWARDED_ID` - For rewarded ads

## ✅ Checklist

Before launching:

- [ ] Supabase project created
- [ ] Database schema run
- [ ] Environment variables set
- [ ] Tested locally
- [ ] Ads configured (if using)
- [ ] AI configured (if using)
- [ ] Notifications tested
- [ ] Build tested
- [ ] Play Store/App Store accounts ready

## 🎉 You're Ready!

This is a **complete, production-ready** implementation. Follow the steps above and you'll have NGINE running in minutes.

**No more planning. Time to execute! 🚀**

