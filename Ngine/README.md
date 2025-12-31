# 🚀 NGINE - Resolution Tracker

**A personal execution system that tracks your whole life, not just tasks.**

NGINE helps you build discipline by connecting your identity, aims, and daily actions into a meaningful execution system.

---

## ✨ **WHAT WORKS NOW (REAL-TIME)**

### ✅ **Live Features:**
- **Real Supabase backend** with authentication
- **Live dashboard** showing your identity and progress
- **Real check-ins** that save to database
- **Live status updates** (aligned/drifting/broken/recovering)
- **Integrity meter** calculating your execution score
- **Daily reflections** with insights
- **Real-time sync** across all data

### ✅ **Architecture:**
- React Native + Expo (mobile-first)
- Supabase (Postgres + Auth + Real-time)
- Row Level Security (RLS)
- Anonymous authentication
- TypeScript throughout

---

## 🚀 **GET STARTED (5 MINUTES)**

### **1. Clone & Setup**
```bash
git clone https://github.com/nrbns/Ngine.git
cd Ngine/mobile
npm install
```

### **2. Set Up Supabase**
1. Go to [supabase.com](https://supabase.com) → Create project
2. Get your Project URL & anon key
3. Create `.env` file:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_url_here
   EXPO_PUBLIC_SUPABASE_KEY=your_key_here
   ```
4. Run SQL schema in Supabase SQL Editor:
   ```sql
   -- Copy entire contents of supabase/schema.sql
   ```

### **3. Run the App**
```bash
npx expo start --web
# Or --android / --ios
```

### **4. Test Live Features**
- Complete onboarding
- View dashboard with real data
- Submit check-ins and see live updates

---

## 🎯 **CORE PHILOSOPHY**

NGINE tracks **who you are becoming**, not just what you do.

### **5-Layer System:**
```
PROFILE (Who am I becoming?)
   ↓
AIMS (Where am I going?)
   ↓
RESOLUTIONS (What am I committing to?)
   ↓
DAILY REALITY (What did I do today?)
   ↓
INSIGHTS (What does this mean?)
```

### **Truth Over Dopamine**
- No fake streaks or gamification
- Honest status tracking
- Recovery without guilt
- AI insights when you drift

---

## 📱 **CURRENT USER FLOW**

### **What Works:**
1. **Onboarding** → Welcome + How It Works + Ethics
2. **Dashboard** → Identity + Aims + Today's tasks + Integrity score
3. **Check-in** → Yes/Partial/No + Blocker + Energy
4. **Real-time updates** → Status changes automatically
5. **Integrity tracking** → Overall execution score

### **Coming Soon:**
- Profile management
- Aims creation/editing
- Resolution creation
- Recovery mode
- AI insights
- Push notifications

---

## 🏗️ **TECHNICAL ARCHITECTURE**

### **Frontend:**
- **React Native + Expo** - Cross-platform mobile
- **Expo Router** - File-based navigation
- **TypeScript** - Type safety
- **Real-time subscriptions** - Live UI updates

### **Backend:**
- **Supabase** - PostgreSQL + Auth + Real-time
- **Row Level Security** - Data privacy
- **Edge Functions** - Serverless logic
- **Real-time subscriptions** - Live sync

### **Data Model:**
```sql
users ← user_focus_areas
  ↓
aims ← resolutions ← checkins
  ↓
ai_insights, daily_reflections
```

### **Real-time Features:**
- Live resolution updates
- Live check-in sync
- Live status calculations
- Live integrity scores

---

## 📊 **ROADMAP**

### **✅ Phase 1 (COMPLETE)**
- Core real-time infrastructure
- Dashboard with live data
- Check-in with status updates
- Integrity tracking

### **🚧 Phase 2 (IN PROGRESS)**
- Profile & aims management
- Resolution creation
- Recovery mode
- AI insights integration

### **📅 Phase 3 (NEXT)**
- Push notifications
- Ads integration
- Advanced analytics
- Play Store launch

---

## 🧪 **TESTING STATUS**

### **Working:**
- ✅ Supabase connection
- ✅ Authentication
- ✅ Real-time subscriptions
- ✅ Dashboard data loading
- ✅ Check-in saving
- ✅ Status calculations
- ✅ Integrity meter

### **Ready for Testing:**
- 🔄 Profile screen
- 🔄 Aims management
- 🔄 Resolution creation

---

## 🛠️ **DEVELOPMENT**

### **Prerequisites:**
- Node.js 18+
- Expo CLI
- Supabase account

### **Local Development:**
```bash
cd mobile
npm install
# Set up .env
npx expo start
```

### **Database Setup:**
1. Create Supabase project
2. Run `supabase/schema.sql`
3. Enable anonymous auth
4. Test connection

---

## 🤝 **CONTRIBUTING**

1. Fork the repository
2. Create feature branch
3. Test on real devices
4. Submit pull request

**See `IMPLEMENTATION_CHECKLIST.md` for development roadmap.**

---

## 📄 **DOCUMENTATION**

- **[Execution Plan](EXECUTION_PLAN.md)** - 21-day launch roadmap
- **[Quick Start](QUICK_START.md)** - 30-minute setup guide
- **[Implementation Checklist](IMPLEMENTATION_CHECKLIST.md)** - Current status
- **[Philosophy](NGINE_PHILOSOPHY.md)** - Design principles
- **[Production UI](PRODUCTION_UI.md)** - Screen specifications

---

## 🎉 **WHAT THIS MEANS**

You have a **production-ready foundation** with:
- Real backend with live sync
- Working authentication
- Functional dashboard
- Real check-in system
- Live status updates

**The hard infrastructure work is done. Now it's feature completion and polish.**

---

## 📞 **SUPPORT**

- **Issues:** [GitHub Issues](https://github.com/nrbns/Ngine/issues)
- **Discussions:** [GitHub Discussions](https://github.com/nrbns/Ngine/discussions)

**Let's build NGINE together! 🚀**

---

*NGINE: Track your whole life, not just tasks.*