# NGINE Troubleshooting Guide

## Goals Not Saving

### Issue: Goals are not being saved to Supabase

**Possible Causes:**

1. **Supabase Not Configured**
   - Check if `.env` file exists
   - Verify `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_KEY` are set
   - Should NOT be `https://placeholder.supabase.co`

2. **Database Schema Not Set Up**
   - Run `database-schema.sql` in Supabase SQL Editor
   - Ensure all tables are created: `profiles`, `resolutions`, `checkins`, `goal_proofs`

3. **RLS Policies Blocking**
   - Check Supabase Dashboard → Authentication → Policies
   - Ensure policies allow:
     - `INSERT` on `resolutions` table
     - `SELECT` on `resolutions` table
   - Policy should check: `auth.uid() = user_id`

4. **Anonymous Auth Not Enabled**
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable "Anonymous" provider

### How to Fix:

1. **Set up Supabase:**
   ```bash
   # Create .env file
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_KEY=your-anon-key
   ```

2. **Run Database Schema:**
   - Copy contents of `database-schema.sql`
   - Paste in Supabase SQL Editor
   - Click "Run"

3. **Enable Anonymous Auth:**
   - Supabase Dashboard → Authentication → Providers
   - Toggle "Anonymous" to ON

4. **Check Console:**
   - Open browser DevTools (F12)
   - Check Console tab for error messages
   - Look for specific error codes:
     - `42501` = Permission denied (RLS issue)
     - `PGRST116` = Table not found
     - `23503` = Foreign key error

## App Not Running Perfectly

### Common Issues:

1. **Blank Screen**
   - Clear Metro cache: `npx expo start --clear`
   - Check browser console for errors
   - Verify all dependencies installed: `npm install`

2. **Animations Not Working**
   - Ensure `babel.config.js` includes `react-native-reanimated/plugin`
   - Restart Metro bundler after changes

3. **Haptics Not Working**
   - Haptics only work on native platforms (iOS/Android)
   - Web platform will silently fail (no error)

4. **Real-time Updates Not Working**
   - Check Supabase Realtime is enabled
   - Verify `.env` has correct Supabase URL
   - Check browser console for subscription errors

### Quick Fixes:

```bash
# Clear cache and restart
npx expo start --clear

# Reinstall dependencies
rm -rf node_modules
npm install

# Check for errors
npm run start
# Then check browser console (F12)
```

## Error Codes Reference

- `42501` - Permission denied (check RLS policies)
- `PGRST116` - No rows found (normal for empty state)
- `23503` - Foreign key violation (user doesn't exist)
- `23505` - Unique constraint violation (duplicate check-in)

## AdMob Issues

### Issue: Ads not showing / AdMob errors

**Possible Causes:**

1. **Test IDs Not Used During Development**
   - Always use test ad IDs during development
   - Test IDs are provided in `.env.example`
   - Real ad IDs only work in production builds

2. **AdMob Account Not Set Up**
   - Create an AdMob account at https://apps.admob.com
   - Create an app and get your App ID
   - Create ad units (Banner, Rewarded) and get ad unit IDs

3. **Simulator vs Physical Device**
   - Ads may not work properly on simulators/emulators
   - Test on physical devices for accurate behavior

**How to Fix:**

1. **Use Test IDs** (included in `.env.example`):
   ```env
   EXPO_PUBLIC_ADMOB_APP_ID=ca-app-pub-3940256099942544~3347511713
   EXPO_PUBLIC_ADMOB_BANNER_ID=ca-app-pub-3940256099942544/6300978111
   ```

2. **Verify Configuration:**
   - Check `lib/ads.tsx` and `lib/ads.web.tsx` are properly configured
   - Verify environment variables are loaded: `console.log(process.env.EXPO_PUBLIC_ADMOB_APP_ID)`

3. **Check AdMob Dashboard:**
   - Ensure app is approved and active
   - Verify ad units are active and not paused

## Realtime Subscription Issues

### Issue: Changes not syncing across devices

**Possible Causes:**

1. **Realtime Not Enabled in Supabase**
   - Go to Supabase Dashboard → Database → Replication
   - Enable replication for tables: `resolutions`, `checkins`, `goal_proofs`

2. **Subscription Cleanup**
   - Check `lib/useRealtime.ts` properly unsubscribes on unmount
   - Multiple subscriptions can cause performance issues

**How to Fix:**

1. **Enable Realtime in Supabase:**
   - Supabase Dashboard → Database → Replication
   - Enable for each table that needs real-time updates

2. **Check Subscription Code:**
   ```typescript
   // Ensure cleanup in useEffect
   useEffect(() => {
     const channel = supabase.channel('channel-name')
     // ... subscribe logic
     
     return () => {
       channel.unsubscribe() // Important!
     }
   }, [])
   ```

## Expo SDK Version Conflicts

### Issue: Build errors or dependency conflicts

**Possible Causes:**
- Expo SDK version mismatch
- Native module compatibility issues
- Metro bundler cache issues

**How to Fix:**

```bash
# Clear all caches
npx expo start --clear

# Reinstall dependencies
rm -rf node_modules
rm package-lock.json
npm install

# For EAS builds, check eas.json configuration
# Ensure SDK version matches package.json
```

## Common Pitfalls

### 1. Forgetting to Enable Anonymous Auth
- **Symptom**: App loads but can't create goals
- **Fix**: Supabase Dashboard → Authentication → Providers → Enable "Anonymous"

### 2. RLS Policies Too Restrictive
- **Symptom**: Can't read/write data
- **Fix**: Check `database-schema.sql` includes correct RLS policies
- **Test**: Try with RLS disabled temporarily to isolate issue

### 3. Environment Variables Not Loading
- **Symptom**: Using placeholder values
- **Fix**: 
  - Ensure `.env` file exists in root directory
  - Restart Metro bundler after changing `.env`
  - Variables must start with `EXPO_PUBLIC_` for Expo

### 4. Metro Bundler Cache Issues
- **Symptom**: Changes not reflecting, weird errors
- **Fix**: `npx expo start --clear` (clears cache)

### 5. TypeScript Errors After Updates
- **Symptom**: Type errors in IDE/console
- **Fix**: 
  ```bash
  npx tsc --noEmit  # Check for type errors
  # Or restart TypeScript server in IDE
  ```

## Still Having Issues?

1. **Check browser console** (F12) for specific error messages
2. **Verify Supabase dashboard** shows tables exist and RLS policies are set
3. **Test environment variables** in browser console:
   ```javascript
   // In browser console
   console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL)
   console.log('Supabase Key:', process.env.EXPO_PUBLIC_SUPABASE_KEY?.substring(0, 20) + '...')
   ```
4. **Check Supabase Logs:**
   - Supabase Dashboard → Logs → API Logs
   - Look for failed requests and error codes
5. **Open an Issue:**
   - Include error messages from console
   - Include relevant code snippets
   - Include steps to reproduce
   - Check [existing issues](https://github.com/nrbns/Ngine/issues) first


