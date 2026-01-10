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

## Still Having Issues?

1. Check browser console (F12) for specific errors
2. Verify Supabase dashboard shows tables exist
3. Test Supabase connection in browser console:
   ```javascript
   // In browser console
   console.log(process.env.EXPO_PUBLIC_SUPABASE_URL)
   ```


