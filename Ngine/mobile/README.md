# 🚀 NGINE - Execution-Ready Implementation

**Complete, working, copy-paste-ready NGINE app.**

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required:
- `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_KEY` - Your Supabase anon key
- `EXPO_PUBLIC_OPENAI_KEY` - OpenAI API key (for AI insights)
- `EXPO_PUBLIC_ADMOB_BANNER_ID` - AdMob banner ad unit ID
- `EXPO_PUBLIC_ADMOB_REWARDED_ID` - AdMob rewarded ad unit ID

### 3. Set Up Supabase Database

Run the SQL schema in `../supabase/schema.sql` in your Supabase SQL Editor.

### 4. Run the App

```bash
npm start
```

Then press `a` for Android or `i` for iOS.

## 📁 Project Structure

```
mobile/
├── app/
│   ├── index.tsx          # Dashboard
│   ├── create.tsx         # Create Resolution
│   ├── checkin.tsx        # Daily Check-in (NO ADS)
│   ├── recovery.tsx       # Recovery Mode (NO ADS)
│   ├── summary.tsx        # End Summary (rewarded ad)
│   └── _layout.tsx        # Navigation setup
│
├── components/
│   ├── ResolutionCard.tsx
│   ├── StatusBadge.tsx
│   └── PrimaryButton.tsx
│
├── logic/
│   ├── statusEngine.ts    # Rules engine (NO AI)
│   └── probability.ts     # Success probability
│
├── services/
│   ├── supabase.ts        # Supabase client
│   ├── ai.ts              # AI integration
│   └── ads.ts             # AdMob integration
│
├── constants/
│   └── blockers.ts        # Common blockers
│
└── utils/
    └── notifications.ts   # Push notifications
```

## 🎯 Core Features

### ✅ Dashboard (`app/index.tsx`)
- View all resolutions
- See status and success probability
- Quick access to check-in

### ✅ Create Resolution (`app/create.tsx`)
- Title, why, duration, MDD, support style
- Saves to Supabase

### ✅ Daily Check-in (`app/checkin.tsx`)
- **NO ADS** - Focus on execution
- Done/Partial/No
- Blocker selection
- Energy level (1-5)
- Auto-updates status via rules engine

### ✅ Recovery Mode (`app/recovery.tsx`)
- **NO ADS** - Focus on recovery
- 3-day micro plan
- Gentle reset

### ✅ Summary (`app/summary.tsx`)
- Outcome calculation
- Stats display
- Optional rewarded ad for AI insight

## 🔧 Rules Engine

Located in `logic/statusEngine.ts`:

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

- **Show**: Dashboard, Summary
- **Never show**: Check-in, Recovery, Failure messages
- Uses AdMob (test IDs in dev mode)

## 🔔 Notifications

- Daily reminder at 9 PM
- Drift alerts (once)
- Recovery reminders (gentle)

## 🗄️ Database Schema

Simple two-table design:

- `resolutions` - Resolution data
- `checkins` - Daily check-ins

See `supabase/schema.sql` for full schema.

## 🚀 Deployment

### Android Play Store

1. Build APK/AAB:
```bash
eas build --platform android
```

2. Submit to Play Store

### iOS App Store

1. Build IPA:
```bash
eas build --platform ios
```

2. Submit to App Store

## 📝 Notes

- Uses Expo Router for navigation
- Supabase for backend (free tier works)
- OpenAI for AI (pay per use)
- AdMob for monetization
- Local-first with sync

## 🐛 Troubleshooting

**Supabase connection issues:**
- Check your `.env` file
- Verify RLS policies are set up
- Check Supabase dashboard for errors

**AI not working:**
- Verify OpenAI API key
- Check API quota
- Check network connection

**Ads not showing:**
- Use test IDs in development
- Verify AdMob account setup
- Check ad unit IDs

## 📚 Next Steps

1. Set up Supabase project
2. Run database schema
3. Configure environment variables
4. Test locally
5. Build and deploy

**You're ready to ship! 🚀**

