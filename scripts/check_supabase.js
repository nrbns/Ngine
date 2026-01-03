#!/usr/bin/env node
// Quick Supabase connection checker
// Usage: node scripts/check_supabase.js

// Load .env when running locally for convenience
try { require('dotenv').config(); } catch (e) {}
const { createClient } = require('@supabase/supabase-js');

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!url || !key) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_KEY in environment');
  process.exit(2);
}

const supabase = createClient(url, key);

(async () => {
  try {
    console.log('Checking Supabase connection...');
    const { data: resolutions, error } = await supabase
      .from('resolutions')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Error querying resolutions:', error.message || error);
    } else {
      console.log('Resolutions query OK (count:', resolutions.length, ')');
    }

    try {
      const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
      if (bErr) {
        console.warn('Could not list storage buckets (insufficient permissions with anon key).');
      } else {
        console.log('Found buckets:', buckets.map(b => b.name).join(', ') || '(none)');
      }
    } catch (e) {
      console.warn('Storage list not available with current key; this is OK for anon keys.');
    }

    console.log('Tip: If you see authorization errors, use the service_role key only to run SQL/setup and do NOT commit it to the repo.');
  } catch (err) {
    console.error('Unexpected error:', err.message || err);
    process.exit(1);
  }
})();
