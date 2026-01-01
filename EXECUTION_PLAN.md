# 🚀 NGINE - 21-Day Execution Plan

## ⚠️ CRITICAL RULE

**DO NOT ADD FEATURES NOW.**

You have everything you need. Build what exists. Ship it. Then iterate.

---

## 📋 Pre-Build Checklist

Before starting, ensure you have:
- [ ] Expo account (free)
- [ ] Supabase account (free tier works)
- [ ] OpenAI account (optional, for AI insights)
- [ ] AdMob account (optional, for ads)
- [ ] Code editor (VS Code recommended)
- [ ] Node.js installed (v18+)
- [ ] Git installed

**Time needed:** 5 minutes to set up accounts

---

## 📅 DAY-BY-DAY BREAKDOWN

### **DAY 1-2: Foundation Setup**

#### Day 1 Morning (2 hours)
1. **Create Expo Project**
   ```bash
   npx create-expo-app ngine --template blank-typescript
   cd ngine
   ```

2. **Install Dependencies**
   ```bash
   npm install @supabase/supabase-js @react-native-async-storage/async-storage expo-notifications react-native-google-mobile-ads
   npx expo install expo-router
   ```

3. **Set Up Project Structure**
   - Copy all files from `mobile/` directory
   - Ensure folder structure matches:
     ```
     app/
     components/
     logic/
     services/
     constants/
     utils/
     design-system.ts
     ```

#### Day 1 Afternoon (2 hours)
4. **Create Supabase Project**
   - Go to supabase.com
   - Create new project
   - Wait for setup (2-3 minutes)
   - Copy project URL and anon key

5. **Run Database Schema**
   - Open Supabase SQL Editor
   - Copy entire contents of `supabase/schema.sql`
   - Execute (creates all tables, indexes, RLS)

6. **Configure Environment**
   - Create `.env` file in project root:
     ```
     EXPO_PUBLIC_SUPABASE_URL=your_url_here
     EXPO_PUBLIC_SUPABASE_KEY=your_key_here
     ```
   - Install `dotenv` if needed

#### Day 2 (4 hours)
7. **Set Up Authentication**
   - In Supabase Dashboard → Authentication
   - Enable Email/Password (or Anonymous)
   - Test auth flow

8. **Build Life Dashboard (First Screen)**
   - Start with `app/index.tsx`
   - Get it rendering with real data
   - Test loading states
   - Verify navigation works

**Deliverable:** Dashboard loads, shows data from Supabase

---

### **DAY 3-7: Core Features**

#### Day 3 (4 hours)
9. **Profile Screen**
   - Build `app/profile.tsx`
   - Connect to Supabase users table
   - Test save/load
   - Verify focus areas work

10. **Aims Screen**
    - Build `app/aims.tsx`
    - CRUD operations
    - Test linking to profile

**Deliverable:** User can create profile and aims

#### Day 4 (4 hours)
11. **Create Resolution**
    - Build `app/create.tsx`
    - Link to aims (dropdown)
    - Test all form fields
    - Verify save to database

12. **Resolution List**
    - Update dashboard to show resolutions
    - Link to aims
    - Test filtering

**Deliverable:** User can create resolutions linked to aims

#### Day 5 (4 hours)
13. **Daily Check-In**
    - Build `app/checkin.tsx`
    - Three questions (execution, blocker, energy)
    - Test save to checkins table
    - Verify date handling

14. **Check-In Flow**
    - Test navigation from dashboard
    - Verify data saves correctly
    - Test updating existing check-in

**Deliverable:** User can check in daily

#### Day 6 (4 hours)
15. **Status Engine**
    - Implement `logic/statusEngine.ts`
    - Test drift detection
    - Test broken detection
    - Verify status updates on check-in

16. **Integrity Meter**
    - Implement `logic/integrity.ts`
    - Calculate score
    - Display on dashboard
    - Test with various data

**Deliverable:** Status engine works, integrity meter calculates

#### Day 7 (4 hours)
17. **Recovery Mode**
    - Build `app/recovery.tsx`
    - Test recovery start
    - Verify 3-day period
    - Test status change

18. **Polish Core Flow**
    - Test complete user journey
    - Fix any bugs
    - Improve error handling

**Deliverable:** Complete core flow works end-to-end

---

### **DAY 8-14: Intelligence & Polish**

#### Day 8-9 (8 hours)
19. **Daily Reflection**
    - Implement `services/reflection.ts`
    - Rules-based insights first
    - Test generation
    - Cache per day

20. **AI Integration (Optional)**
    - Set up OpenAI API
    - Implement `services/ai.ts`
    - Test insight generation
    - Add rate limiting

**Deliverable:** Daily insights generate (rules or AI)

#### Day 10-11 (8 hours)
21. **UI Polish**
    - Review all screens
    - Fix spacing issues
    - Ensure typography consistent
    - Test on different screen sizes
    - Verify design system usage

22. **Navigation Flow**
    - Test all navigation paths
    - Fix any broken links
    - Add loading states
    - Improve error messages

**Deliverable:** UI is polished and consistent

#### Day 12-13 (8 hours)
23. **Edge Cases**
    - Test empty states
    - Test error states
    - Test offline behavior
    - Test data edge cases

24. **Performance**
    - Optimize queries
    - Add pagination if needed
    - Test with large datasets
    - Profile slow operations

**Deliverable:** App handles edge cases gracefully

#### Day 14 (4 hours)
25. **Final Testing**
    - Complete user flow test
    - Test on real device
    - Fix critical bugs
    - Prepare for build

**Deliverable:** App is ready for production build

---

### **DAY 15-21: Launch**

#### Day 15-16 (8 hours)
26. **Ads Integration (Optional)**
    - Set up AdMob account
    - Add banner ad to dashboard
    - Test rewarded ads
    - Verify ad placement

27. **Notifications**
    - Test push notifications
    - Schedule daily reminders
    - Test on device
    - Handle permissions

**Deliverable:** Ads and notifications work

#### Day 17-18 (8 hours)
28. **Build for Production**
    ```bash
    # Install EAS CLI
    npm install -g eas-cli
    
    # Configure
    eas build:configure
    
    # Build Android
    eas build --platform android
    
    # Build iOS (if needed)
    eas build --platform ios
    ```

29. **Test Production Builds**
    - Install APK/IPA on device
    - Test all features
    - Fix any build-specific issues

**Deliverable:** Production builds ready

#### Day 19-20 (8 hours)
30. **Store Listings**
    - Write app description
    - Create screenshots
    - Design app icon
    - Prepare store assets

31. **Submit to Stores**
    - Google Play Console
    - App Store Connect (if iOS)
    - Fill out all required info
    - Submit for review

**Deliverable:** App submitted for review

#### Day 21 (4 hours)
32. **Launch Prep**
    - Monitor review status
    - Prepare launch announcement
    - Set up analytics (optional)
    - Plan post-launch support

**Deliverable:** App launches! 🎉

---

## 🎯 KEY MILESTONES

- **Day 2:** Dashboard works with real data
- **Day 4:** User can create resolutions
- **Day 5:** Daily check-in works
- **Day 7:** Complete core flow works
- **Day 14:** App is polished and tested
- **Day 18:** Production builds ready
- **Day 21:** App launches

---

## ⚠️ COMMON PITFALLS TO AVOID

### ❌ Don't Do This:
- Add new features during build
- Skip testing
- Over-engineer solutions
- Perfect before shipping
- Wait for "perfect" design

### ✅ Do This Instead:
- Build what exists
- Test as you go
- Keep it simple
- Ship, then iterate
- Use existing design system

---

## 🐛 Troubleshooting

### Supabase Connection Issues
```bash
# Check .env file exists
# Verify URL and key are correct
# Test connection in Supabase dashboard
```

### Build Errors
```bash
# Clear cache
npm start -- --clear

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Navigation Issues
```bash
# Check _layout.tsx has all screens
# Verify route names match file names
# Clear app data and retry
```

---

## 📊 Success Metrics

After launch, track:
- Daily Active Users (DAU)
- Check-in completion rate
- Resolution success rate
- Integrity score trends
- Retention (D1, D7, D30)

---

## 🎉 Post-Launch (Week 1-2)

1. **Monitor**
   - Watch error logs
   - Read user reviews
   - Track key metrics

2. **Fix**
   - Address critical bugs
   - Respond to feedback
   - Improve onboarding if needed

3. **Iterate**
   - Plan v1.1 based on data
   - Don't add features yet
   - Focus on stability

---

## ✅ Final Checklist

Before launching:
- [ ] All core features work
- [ ] Tested on real device
- [ ] No critical bugs
- [ ] Store listings complete
- [ ] Privacy policy ready
- [ ] Support email set up
- [ ] Analytics configured (optional)

---

## 🚀 YOU'RE READY

You have everything you need:
- ✅ Complete UI (production-grade)
- ✅ Real backend (scalable)
- ✅ Rules engine (deterministic)
- ✅ AI integration (optional)
- ✅ Clear execution plan

**Now execute. Day 1 starts now.**

---

## 💡 Remember

> "Perfect is the enemy of done."

Ship in 21 days. Then improve based on real user feedback.

**NGINE is ready. Build it. Ship it. 🚀**

