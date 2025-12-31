# ⚡ NGINE - Quick Start (30 Minutes)

Get NGINE running locally in 30 minutes.

## Prerequisites

- Node.js 18+ installed
- Expo CLI: `npm install -g expo-cli`
- Supabase account (free)

---

## Step 1: Clone & Setup (5 min)

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Create .env file
cp env.example .env
```

---

## Step 2: Supabase Setup (10 min)

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Fill in details
   - Wait 2-3 minutes for setup

2. **Get Credentials**
   - Go to Settings → API
   - Copy "Project URL"
   - Copy "anon public" key

3. **Update .env**
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=paste_your_url_here
   EXPO_PUBLIC_SUPABASE_KEY=paste_your_key_here
   ```

4. **Run Schema**
   - Go to SQL Editor in Supabase
   - Copy entire `supabase/schema.sql`
   - Paste and run
   - Verify tables created

---

## Step 3: Run App (5 min)

```bash
# Start Expo
npm start

# Press 'a' for Android or 'i' for iOS
# Or scan QR code with Expo Go app
```

---

## Step 4: Test Flow (10 min)

1. **Onboarding**
   - Complete 3 screens
   - Should redirect to Profile

2. **Create Profile**
   - Enter name/alias
   - Set identity statement
   - Select focus areas
   - Save

3. **Create Aim**
   - Go to Aims screen
   - Add 1-2 aims
   - Verify they save

4. **Create Resolution**
   - Click "+ New"
   - Link to aim
   - Fill details
   - Save

5. **Check In**
   - Click resolution on dashboard
   - Answer 3 questions
   - Save
   - Verify status updates

---

## ✅ Success Criteria

- ✅ Dashboard loads
- ✅ Profile saves
- ✅ Aims save
- ✅ Resolution creates
- ✅ Check-in works
- ✅ Status updates

---

## 🐛 Common Issues

### "Cannot connect to Supabase"
- Check `.env` file exists
- Verify URL/key are correct
- Check Supabase project is active

### "Table does not exist"
- Run schema.sql again
- Check table names match

### "Navigation error"
- Clear app data
- Restart Expo
- Check route names match files

---

## 🚀 Next Steps

Once local works:
1. Follow `EXECUTION_PLAN.md` for full build
2. Test all features
3. Build for production
4. Submit to stores

**You're running NGINE locally! 🎉**

