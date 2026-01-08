#!/usr/bin/env node

/**
 * NGINE Environment Setup
 * Creates .env file for Expo upload
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 NGINE Environment Setup for Expo Upload')
console.log('===========================================')

const envContent = `# NGINE Environment Variables for Expo

# Supabase Configuration (Required)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key

# OpenAI API Key (Optional)
EXPO_PUBLIC_OPENAI_KEY=your_openai_api_key

# AdMob Configuration (Optional)
EXPO_PUBLIC_ADMOB_APP_ID=your_admob_app_id
EXPO_PUBLIC_ADMOB_BANNER_ID=your_banner_ad_unit_id
EXPO_PUBLIC_ADMOB_REWARDED_ID=your_rewarded_ad_unit_id
`

const envPath = path.join(__dirname, '.env')

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent)
  console.log('✅ Created .env file')
} else {
  console.log('✅ .env file already exists')
}

console.log('')
console.log('📝 Edit .env with your actual API keys:')
console.log('• Supabase: Get from supabase.com → Project → Settings → API')
console.log('• AdMob: Get from admob.google.com → Apps → Ad units')
console.log('')
console.log('🚀 Ready for: eas build --platform android --profile production')
